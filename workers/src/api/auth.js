import { SheetsService } from '../services/sheets.js';
import { hashPassword, verifyPassword, generateToken } from '../utils/crypto.js';
import { Validator } from '../utils/validation.js';
import { v4 as uuidv4 } from 'uuid';

function parsePermissions(value) {
    if (!value) return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

async function getRolePermissions(sheets, roleName) {
    if (!roleName) return [];
    try {
        const roles = await sheets.find('Roles', { name: roleName });
        if (roles.length === 0) return [];
        return roles[0].permissions ? JSON.parse(roles[0].permissions) : [];
    } catch (error) {
        console.error('Get role permissions error:', error);
        return [];
    }
}

async function updateUserRow(sheets, users, user) {
    const headers = await sheets.getHeaders('Users');
    const rowIndex = users.findIndex((u) => u.id === user.id);
    await sheets.update('Users', rowIndex, headers.map((header) => user[header] ?? ''));
}

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

        if (user.status && user.status !== 'active') {
            return c.json({ error: '帳號已停用或尚未啟用' }, 403);
        }

        // Determine permissions
        const customPermissions = parsePermissions(user.permissions);
        const rolePermissions = await getRolePermissions(sheets, user.role);
        const effectivePermissions = customPermissions.length > 0 ? customPermissions : rolePermissions;

        // Update last login
        const allUsers = await sheets.read('Users');
        const currentUser = allUsers.find((u) => u.id === user.id);
        currentUser.last_login = new Date().toISOString();
        await updateUserRow(sheets, allUsers, currentUser);

        // Generate JWT token (30 minutes expiration)
        const token = await generateToken({
            user_id: user.id,
            member_id: user.member_id,
            email: user.email,
            role: user.role,
            permissions: effectivePermissions,
            must_change_password: user.must_change_password === 'true',
        }, c.env.JWT_SECRET, 1800); // 30 分鐘 = 1800 秒

        return c.json({
            token,
            user: {
                id: user.id,
                member_id: user.member_id,
                email: user.email,
                role: user.role,
                permissions: effectivePermissions,
                must_change_password: user.must_change_password === 'true',
                email_verified: user.email_verified === 'true',
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
        const now = new Date().toISOString();
        const newUser = {
            id: uuidv4(),
            member_id,
            email,
            password_hash,
            role,
            permissions: '[]',
            line_user_id: '',
            last_login: '',
            created_at: now,
            must_change_password: 'false',
            email_verified: 'true',
            verification_token: '',
            verification_sent_at: '',
            status: 'active',
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
                permissions: parsePermissions(userData.permissions),
                must_change_password: userData.must_change_password === 'true',
                email_verified: userData.email_verified === 'true',
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
        const users = await sheets.read('Users');
        const currentUser = users.find((u) => u.id === user.user_id);
        currentUser.password_hash = newPasswordHash;
        currentUser.must_change_password = 'false';
        await updateUserRow(sheets, users, currentUser);

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

        // Generate new token (30 minutes expiration)
        const token = await generateToken({
            user_id: user.user_id,
            member_id: user.member_id,
            email: user.email,
            role: user.role,
            permissions: user.permissions || [],
            must_change_password: user.must_change_password,
        }, c.env.JWT_SECRET, 1800); // 30 分鐘 = 1800 秒

        return c.json({ token });
    } catch (error) {
        console.error('Refresh token error:', error);
        return c.json({ error: '刷新令牌失敗' }, 500);
    }
}

export async function verifyEmail(c) {
    try {
        const { token } = c.req.param();
        if (!token) {
            return c.json({ error: '缺少驗證碼' }, 400);
        }

        const sheets = new SheetsService(c.env);
        const users = await sheets.read('Users');
        const user = users.find((u) => u.verification_token === token);

        if (!user) {
            return c.json({ error: '驗證碼無效或已過期' }, 400);
        }

        user.email_verified = 'true';
        user.verification_token = '';
        user.verification_sent_at = new Date().toISOString();
        await updateUserRow(sheets, users, user);

        return c.json({ message: 'Email 驗證成功' });
    } catch (error) {
        console.error('Verify email error:', error);
        return c.json({ error: '驗證失敗' }, 500);
    }
}
