import { Hono } from 'hono';
import { corsMiddleware } from './middleware/cors.js';
import { authMiddleware, optionalAuthMiddleware } from './middleware/auth.js';
import { requirePermission, requireRole } from './middleware/rbac.js';

import {
    login,
    register,
    getCurrentUser,
    changePassword,
    refreshToken,
} from './api/auth.js';

import {
    getMembers,
    getMember,
    createMember,
    updateMember,
    deleteMember,
} from './api/members.js';

import {
    getOfferings,
    getOffering,
    createOffering,
    updateOffering,
    deleteOffering,
    getMemberOfferings,
} from './api/offerings.js';

import {
    getEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    checkInEvent,
} from './api/events.js';

const app = new Hono();

// Global middleware
app.use('*', corsMiddleware);

// Health check
app.get('/health', (c) =>
    c.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Church Management System API',
        environment: c.env.ENVIRONMENT || 'development',
    }),
);

app.get('/api/test', (c) =>
    c.json({
        message: 'API is working!',
        environment: c.env.ENVIRONMENT || 'development',
        sheetIdConfigured: Boolean(c.env.GOOGLE_SHEET_ID),
    }),
);

// ===== Auth Routes =====
app.post('/api/auth/login', login);
app.post('/api/auth/register', authMiddleware, requireRole('admin'), register);
app.get('/api/auth/me', authMiddleware, getCurrentUser);
app.post('/api/auth/change-password', authMiddleware, changePassword);
app.post('/api/auth/refresh', authMiddleware, refreshToken);

// ===== Member Routes =====
app.get('/api/members', authMiddleware, requirePermission('members:read'), getMembers);
app.get('/api/members/:id', authMiddleware, requirePermission('members:read'), getMember);
app.post('/api/members', authMiddleware, requirePermission('members:create'), createMember);
app.put('/api/members/:id', authMiddleware, requirePermission('members:update'), updateMember);
app.delete('/api/members/:id', authMiddleware, requirePermission('members:delete'), deleteMember);

// ===== Offering Routes =====
app.get('/api/offerings', authMiddleware, requirePermission('offerings:read'), getOfferings);
app.get('/api/offerings/:id', authMiddleware, requirePermission('offerings:read'), getOffering);
app.post('/api/offerings', authMiddleware, requirePermission('offerings:create'), createOffering);
app.put('/api/offerings/:id', authMiddleware, requirePermission('offerings:update'), updateOffering);
app.delete('/api/offerings/:id', authMiddleware, requirePermission('offerings:delete'), deleteOffering);
app.get(
    '/api/offerings/member/:memberId',
    authMiddleware,
    requirePermission('offerings:read'),
    getMemberOfferings,
);

// ===== Event Routes =====
app.get('/api/events', optionalAuthMiddleware, getEvents);
app.get('/api/events/:id', optionalAuthMiddleware, getEvent);
app.post('/api/events', authMiddleware, requirePermission('events:create'), createEvent);
app.put('/api/events/:id', authMiddleware, requirePermission('events:update'), updateEvent);
app.delete('/api/events/:id', authMiddleware, requirePermission('events:delete'), deleteEvent);
app.post('/api/events/:id/register', authMiddleware, registerForEvent);
app.post(
    '/api/events/:id/checkin',
    authMiddleware,
    requirePermission('events:checkin'),
    checkInEvent,
);

app.notFound((c) => c.json({ error: 'Not Found' }, 404));

app.onError((err, c) => {
    console.error('API Error:', err);
    return c.json({ error: 'Internal Server Error', message: err.message }, 500);
});

export default app;
