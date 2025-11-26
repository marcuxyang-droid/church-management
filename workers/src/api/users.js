import { SheetsService } from '../services/sheets.js';
import { EmailService } from '../services/email.js';
import { hashPassword } from '../utils/crypto.js';
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

function serializeUser(user, headers) {
    return headers.map((header) => user[header] ?? '');
}

function generateTempPassword() {
    const random = crypto.randomUUID().replace(/-/g, '').slice(0, 10);
    return `${random.substring(0, 5)}${random.substring(5, 10).toUpperCase()}`;
}

export async function getUsers(c) {
    try {
        const sheets = new SheetsService(c.env);
        const [users, members, roles] = await Promise.all([
            sheets.read('Users'),
            sheets.read('Members'),
            sheets.read('Roles'),
        ]);

        const memberMap = new Map(members.map((member) => [member.id, member]));
        const roleMap = roles.reduce((acc, role) => {
            acc.set(role.name, role);
            return acc;
        }, new Map());

        const mapped = users.map((user) => ({
            id: user.id,
            email: user.email,
            role: user.role,
            role_id: roleMap.get(user.role)?.id || '',
            must_change_password: user.must_change_password === 'true',
            email_verified: user.email_verified === 'true',
            status: user.status || 'active',
            permissions_override: parsePermissions(user.permissions),
            member: (() => {
                const member = memberMap.get(user.member_id);
                if (!member) return null;
                return {
                    id: member.id,
                    name: member.name,
                    email: member.email,
                    phone: member.phone,
                };
            })(),
        }));

        return c.json({
            users: mapped,
            roles: roles.map((role) => ({
                id: role.id,
                name: role.name,
                is_system_role: role.is_system_role === 'true',
            })),
        });
    } catch (error) {
        console.error('Get users error:', error);
        return c.json({ error: '獲取使用者列表失敗' }, 500);
    }
}

export async function createUser(c) {
    try {
        const { member_id, email, role } = await c.req.json();

        if (!member_id || !email || !role) {
            return c.json({ error: '請提供會員、Email 與角色' }, 400);
        }

        if (!Validator.isEmail(email)) {
            return c.json({ error: '電子郵件格式不正確' }, 400);
        }

        const sheets = new SheetsService(c.env);
        const [members, users, roles] = await Promise.all([
            sheets.read('Members'),
            sheets.read('Users'),
            sheets.read('Roles'),
        ]);

        const member = members.find((m) => m.id === member_id);
        if (!member) {
            return c.json({ error: '找不到對應的會員' }, 400);
        }

        if (users.some((u) => u.email === email)) {
            return c.json({ error: '此 Email 已存在帳號' }, 400);
        }

        if (users.some((u) => u.member_id === member_id)) {
            return c.json({ error: '此會員已經有後台帳號' }, 400);
        }

        const roleDefinition = roles.find((r) => r.name === role || r.id === role);
        if (!roleDefinition) {
            return c.json({ error: '角色不存在' }, 400);
        }

        const tempPassword = generateTempPassword();
        const verificationToken = crypto.randomUUID();
        const hashedPassword = await hashPassword(tempPassword);
        const now = new Date().toISOString();

        const newUser = {
            id: uuidv4(),
            member_id,
            email,
            password_hash: hashedPassword,
            role: roleDefinition.name,
            permissions: '[]',
            line_user_id: '',
            last_login: '',
            created_at: now,
            must_change_password: 'true',
            email_verified: 'false',
            verification_token: verificationToken,
            verification_sent_at: now,
            status: 'active',
        };

        const headers = await sheets.getHeaders('Users');
        await sheets.append('Users', serializeUser(newUser, headers));

        try {
            const emailService = new EmailService(c.env);
            const baseUrl = c.env.APP_BASE_URL || 'https://church-management.pages.dev';
            const verifyUrl = `${baseUrl.replace(/\/$/, '')}/verify?token=${verificationToken}`;
            await emailService.sendUserInvite({
                to: email,
                memberName: member.name,
                tempPassword,
                verifyUrl,
                churchName: (await sheets.read('Settings')).find((s) => s.key === 'church_name')?.value || 'Blessing Haven Church',
            });
        } catch (error) {
            console.error('Send invite email error:', error);
        }

        return c.json({
            message: '帳號已建立並寄送邀請信',
            user: {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role,
            },
        }, 201);
    } catch (error) {
        console.error('Create user error:', error);
        return c.json({ error: '建立帳號失敗' }, 500);
    }
}

export async function updateUser(c) {
    try {
        const { id } = c.req.param();
        const { role, permissions_override = [], status } = await c.req.json();

        const sheets = new SheetsService(c.env);
        const [users, roles] = await Promise.all([
            sheets.read('Users'),
            sheets.read('Roles'),
        ]);

        const user = users.find((u) => u.id === id);
        if (!user) {
            return c.json({ error: '帳號不存在' }, 404);
        }

        if (role) {
            const roleDefinition = roles.find((r) => r.name === role || r.id === role);
            if (!roleDefinition) {
                return c.json({ error: '角色不存在' }, 400);
            }
            user.role = roleDefinition.name;
        }

        if (Array.isArray(permissions_override)) {
            user.permissions = JSON.stringify(permissions_override);
        }

        if (status) {
            user.status = status;
        }

        const headers = await sheets.getHeaders('Users');
        const rowIndex = users.findIndex((u) => u.id === id);
        await sheets.update('Users', rowIndex, serializeUser(user, headers));

        return c.json({ message: '帳號已更新' });
    } catch (error) {
        console.error('Update user error:', error);
        return c.json({ error: '更新帳號失敗' }, 500);
    }
}

export async function resendVerification(c) {
    try {
        const { id } = c.req.param();
        const sheets = new SheetsService(c.env);
        const users = await sheets.read('Users');
        const user = users.find((u) => u.id === id);

        if (!user) {
            return c.json({ error: '帳號不存在' }, 404);
        }

        if (user.email_verified === 'true') {
            return c.json({ error: '此帳號已完成驗證' }, 400);
        }

        const verificationToken = crypto.randomUUID();
        user.verification_token = verificationToken;
        user.verification_sent_at = new Date().toISOString();

        const headers = await sheets.getHeaders('Users');
        const rowIndex = users.findIndex((u) => u.id === id);
        await sheets.update('Users', rowIndex, serializeUser(user, headers));

        try {
            const emailService = new EmailService(c.env);
            const baseUrl = c.env.APP_BASE_URL || 'https://church-management.pages.dev';
            const verifyUrl = `${baseUrl.replace(/\/$/, '')}/verify?token=${verificationToken}`;
            await emailService.sendVerificationEmail({
                to: user.email,
                verifyUrl,
            });
        } catch (error) {
            console.error('Resend verification email error:', error);
        }

        return c.json({ message: '驗證信已重新寄送' });
    } catch (error) {
        console.error('Resend verification error:', error);
        return c.json({ error: '寄送驗證信失敗' }, 500);
    }
}

