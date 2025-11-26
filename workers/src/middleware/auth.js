import { verifyToken } from '../utils/crypto.js';

/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user to request context
 */
export async function authMiddleware(c, next) {
    try {
        const authHeader = c.req.header('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return c.json({ error: '未提供認證令牌' }, 401);
        }

        const token = authHeader.substring(7);
        const payload = await verifyToken(token, c.env.JWT_SECRET);

        // Attach user info to context
        c.set('user', payload);

        await next();
    } catch (error) {
        return c.json({ error: '認證失敗：' + error.message }, 401);
    }
}

/**
 * Optional auth middleware - doesn't fail if no token
 */
export async function optionalAuthMiddleware(c, next) {
    try {
        const authHeader = c.req.header('Authorization');

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const payload = await verifyToken(token, c.env.JWT_SECRET);
            c.set('user', payload);
        }
    } catch (error) {
        // Silently fail for optional auth
        console.log('Optional auth failed:', error.message);
    }

    await next();
}
