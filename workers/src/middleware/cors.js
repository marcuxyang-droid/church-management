/**
 * CORS Middleware
 * Handles Cross-Origin Resource Sharing
 */

const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://church-management.pages.dev',
    'https://blessing-haven.club',
];

export function corsMiddleware(c, next) {
    const origin = c.req.header('Origin');

    // Check if origin is allowed
    if (origin && (ALLOWED_ORIGINS.includes(origin) || c.env.ENVIRONMENT === 'development')) {
        c.header('Access-Control-Allow-Origin', origin);
        c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        c.header('Access-Control-Allow-Credentials', 'true');
        c.header('Access-Control-Max-Age', '86400');
    }

    // Handle preflight requests
    if (c.req.method === 'OPTIONS') {
        return c.text('', 204);
    }

    return next();
}
