import { SheetsService } from '../services/sheets.js';
import { hashPassword, verifyPassword, generateToken } from '../utils/crypto.js';
import { Validator } from '../utils/validation.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Authentication API endpoints
 */

/**
 * Login with email and password
 * POST /api/auth/login
 */
export async function login(c) {
    try {
        const { email, password } = await c.req.json();

        if (!email || !password) {
            return c.json({ error: '請提供電子郵件和密碼' }, 400);
        }

        if (!Validator.isEmail(email)) {
            return c.json({ error: '電子郵件格式不正確' }, 400);
        }

        const sheets = new SheetsService(c.env);

        // Find user by email
        const users = await sheets.find('Users', { email });

        if (users.length === 0) {
            return c.json({ error: '電子郵件或密碼錯誤' }, 401);
        }

        const user = users[0];

        // Verify password
        const isValid = await verifyPassword(password, user.password_hash);

        if (!isValid) {
            return c.json({ error: '電子郵件或密碼錯誤' }, 401);
        }

        // Update last login
        const userIndex = (await sheets.read('Users')).findIndex(u => u.id === user.id);
        user.last_login = new Date().toISOString();
        await sheets.update('Users', userIndex, Object.values(user));

        // Generate JWT token
        const token = await generateToken({
            user_id: user.id,
            member_id: user.member_id,
            email: user.email,
            role: user.role,
        }, c.env.JWT_SECRET);

        return c.json({
            token,
            user: {
                id: user.id,
                member_id: user.member_id,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return c.json({ error: '登入失敗' }, 500);
    }
}

/**
 * Register new user (admin only)
 * POST /api/auth/register
 */
export async function register(c) {
    try {
        const { email, password, member_id, role = 'readonly' } = await c.req.json();

        // Validation
        if (!email || !password || !member_id) {
            return c.json({ error: '請提供所有必填欄位' }, 400);
        }

        if (!Validator.isEmail(email)) {
            return c.json({ error: '電子郵件格式不正確' }, 400);
        }

        if (password.length < 8) {
            return c.json({ error: '密碼長度至少需要 8 個字元' }, 400);
        }

        const sheets = new SheetsService(c.env);

        // Check if email already exists
        const existingUsers = await sheets.find('Users', { email });
        if (existingUsers.length > 0) {
            return c.json({ error: '此電子郵件已被註冊' }, 400);
        }

        // Check if member exists
        const member = await sheets.findById('Members', member_id);
        if (!member) {
            return c.json({ error: '會員不存在' }, 400);
        }

        // Hash password
        const password_hash = await hashPassword(password);

        // Create user
        const newUser = {
            id: uuidv4(),
            member_id,
            email,
            password_hash,
            role,
            permissions: '{}',
            line_user_id: '',
            last_login: '',
            created_at: new Date().toISOString(),
        };

        await sheets.append('Users', Object.values(newUser));

        return c.json({
            message: '註冊成功',
            user: {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role,
            },
        }, 201);
    } catch (error) {
        console.error('Register error:', error);
        return c.json({ error: '註冊失敗' }, 500);
    }
}

/**
 * Get current user info
 * GET /api/auth/me
 */
export async function getCurrentUser(c) {
    try {
        const user = c.get('user');

        if (!user) {
            return c.json({ error: '未登入' }, 401);
        }

        const sheets = new SheetsService(c.env);
        const userData = await sheets.findById('Users', user.user_id);

        if (!userData) {
            return c.json({ error: '使用者不存在' }, 404);
        }

        // Get member data
        const memberData = await sheets.findById('Members', userData.member_id);

        return c.json({
            user: {
                id: userData.id,
                email: userData.email,
                role: userData.role,
                member_id: userData.member_id,
                member: memberData ? {
                    name: memberData.name,
                    email: memberData.email,
                    phone: memberData.phone,
                } : null,
            },
        });
    } catch (error) {
        console.error('Get current user error:', error);
        return c.json({ error: '獲取使用者資訊失敗' }, 500);
    }
}

/**
 * Change password
 * POST /api/auth/change-password
 */
export async function changePassword(c) {
    try {
        const user = c.get('user');
        const { currentPassword, newPassword } = await c.req.json();

        if (!currentPassword || !newPassword) {
            return c.json({ error: '請提供當前密碼和新密碼' }, 400);
        }

        if (newPassword.length < 8) {
            return c.json({ error: '新密碼長度至少需要 8 個字元' }, 400);
        }

        const sheets = new SheetsService(c.env);
        const userData = await sheets.findById('Users', user.user_id);

        if (!userData) {
            return c.json({ error: '使用者不存在' }, 404);
        }

        // Verify current password
        const isValid = await verifyPassword(currentPassword, userData.password_hash);

        if (!isValid) {
            return c.json({ error: '當前密碼錯誤' }, 401);
        }

        // Hash new password
        const newPasswordHash = await hashPassword(newPassword);

        // Update password
        const userIndex = (await sheets.read('Users')).findIndex(u => u.id === user.user_id);
        userData.password_hash = newPasswordHash;
        await sheets.update('Users', userIndex, Object.values(userData));

        return c.json({ message: '密碼已更新' });
    } catch (error) {
        console.error('Change password error:', error);
        return c.json({ error: '更新密碼失敗' }, 500);
    }
}

/**
 * Refresh token
 * POST /api/auth/refresh
 */
export async function refreshToken(c) {
    try {
        const user = c.get('user');

        if (!user) {
            return c.json({ error: '未登入' }, 401);
        }

        // Generate new token
        const token = await generateToken({
            user_id: user.user_id,
            member_id: user.member_id,
            email: user.email,
            role: user.role,
        }, c.env.JWT_SECRET);

        return c.json({ token });
    } catch (error) {
        console.error('Refresh token error:', error);
        return c.json({ error: '刷新令牌失敗' }, 500);
    }
}
