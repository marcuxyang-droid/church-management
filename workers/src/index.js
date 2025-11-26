import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authMiddleware, optionalAuthMiddleware } from './middleware/auth.js';
import { requirePermission, requireRole } from './middleware/rbac.js';
import { R2Service } from './services/r2.js';

import {
    login,
    register,
    getCurrentUser,
    changePassword,
    refreshToken,
    verifyEmail,
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

import {
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
} from './api/courses.js';

import {
    getCellGroups,
    getCellGroup,
    createCellGroup,
    updateCellGroup,
    deleteCellGroup,
} from './api/cellgroups.js';

import {
    getVolunteers,
    getVolunteer,
    createVolunteer,
    updateVolunteer,
    deleteVolunteer,
} from './api/volunteers.js';

import {
    getFinanceTransactions,
    getFinanceTransaction,
    createFinanceTransaction,
    updateFinanceTransaction,
    deleteFinanceTransaction,
} from './api/finance.js';

import {
    getSurveys,
    getSurvey,
    createSurvey,
    updateSurvey,
    deleteSurvey,
    getSurveyResponses,
} from './api/surveys.js';

import {
    getMedia,
    getMediaItem,
    createMedia,
    updateMedia,
    deleteMedia,
} from './api/media.js';

import {
    getTags,
    getTag,
    createTag,
    updateTag,
    deleteTag,
    getTagRules,
    createTagRule,
    updateTagRule,
    deleteTagRule,
    applyAutoTags,
} from './api/tags.js';

import {
    getSettings,
    getPublicSettings,
    updateSettings,
    uploadLogo,
    uploadHeroImage,
    listUploadedImages,
} from './api/settings.js';

import {
    getNews,
    getNewsItem,
    createNews,
    updateNews,
    deleteNews,
} from './api/news.js';

import {
    getRoles,
    createRole,
    updateRole,
    deleteRole,
} from './api/roles.js';

import {
    getUsers,
    createUser,
    updateUser,
    resendVerification,
} from './api/users.js';

const app = new Hono();

// Global middleware
app.use('*', cors({
    origin: (origin) => origin || '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
}));

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
app.get('/api/auth/verify/:token', verifyEmail);

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

// ===== Course Routes =====
app.get('/api/courses', authMiddleware, requirePermission('courses:read'), getCourses);
app.get('/api/courses/:id', authMiddleware, requirePermission('courses:read'), getCourse);
app.post('/api/courses', authMiddleware, requirePermission('courses:create'), createCourse);
app.put('/api/courses/:id', authMiddleware, requirePermission('courses:update'), updateCourse);
app.delete('/api/courses/:id', authMiddleware, requirePermission('courses:delete'), deleteCourse);

// ===== Cell Group Routes =====
app.get('/api/cellgroups', authMiddleware, requirePermission('cellgroups:read'), getCellGroups);
app.get('/api/cellgroups/:id', authMiddleware, requirePermission('cellgroups:read'), getCellGroup);
app.post('/api/cellgroups', authMiddleware, requirePermission('cellgroups:create'), createCellGroup);
app.put('/api/cellgroups/:id', authMiddleware, requirePermission('cellgroups:update'), updateCellGroup);
app.delete('/api/cellgroups/:id', authMiddleware, requirePermission('cellgroups:delete'), deleteCellGroup);

// ===== Volunteer Routes =====
app.get('/api/volunteers', authMiddleware, requirePermission('volunteers:read'), getVolunteers);
app.get('/api/volunteers/:id', authMiddleware, requirePermission('volunteers:read'), getVolunteer);
app.post('/api/volunteers', authMiddleware, requirePermission('volunteers:create'), createVolunteer);
app.put('/api/volunteers/:id', authMiddleware, requirePermission('volunteers:update'), updateVolunteer);
app.delete('/api/volunteers/:id', authMiddleware, requirePermission('volunteers:delete'), deleteVolunteer);

// ===== Finance Routes =====
app.get('/api/finance', authMiddleware, requirePermission('finance:read'), getFinanceTransactions);
app.get('/api/finance/:id', authMiddleware, requirePermission('finance:read'), getFinanceTransaction);
app.post('/api/finance', authMiddleware, requirePermission('finance:create'), createFinanceTransaction);
app.put('/api/finance/:id', authMiddleware, requirePermission('finance:update'), updateFinanceTransaction);
app.delete('/api/finance/:id', authMiddleware, requirePermission('finance:delete'), deleteFinanceTransaction);

// ===== Survey Routes =====
app.get('/api/surveys', authMiddleware, requirePermission('surveys:read'), getSurveys);
app.get('/api/surveys/:id', authMiddleware, requirePermission('surveys:read'), getSurvey);
app.post('/api/surveys', authMiddleware, requirePermission('surveys:create'), createSurvey);
app.put('/api/surveys/:id', authMiddleware, requirePermission('surveys:update'), updateSurvey);
app.delete('/api/surveys/:id', authMiddleware, requirePermission('surveys:delete'), deleteSurvey);
app.get('/api/surveys/:id/responses', authMiddleware, requirePermission('surveys:read'), getSurveyResponses);
app.get('/api/survey-responses', authMiddleware, requirePermission('surveys:read'), getSurveyResponses);

// ===== Media Routes =====
app.get('/api/media', authMiddleware, requirePermission('media:read'), getMedia);
app.get('/api/media/:id', authMiddleware, requirePermission('media:read'), getMediaItem);
app.post('/api/media', authMiddleware, requirePermission('media:create'), createMedia);
app.put('/api/media/:id', authMiddleware, requirePermission('media:update'), updateMedia);
app.delete('/api/media/:id', authMiddleware, requirePermission('media:delete'), deleteMedia);

// ===== Tags Routes =====
app.get('/api/tags', authMiddleware, requirePermission('members:read'), getTags);
app.get('/api/tags/:id', authMiddleware, requirePermission('members:read'), getTag);
app.post('/api/tags', authMiddleware, requirePermission('members:update'), createTag);
app.put('/api/tags/:id', authMiddleware, requirePermission('members:update'), updateTag);
app.delete('/api/tags/:id', authMiddleware, requirePermission('members:delete'), deleteTag);

// ===== Tag Rules Routes =====
app.get('/api/tags/rules', authMiddleware, requirePermission('members:read'), getTagRules);
app.post('/api/tags/rules', authMiddleware, requirePermission('members:update'), createTagRule);
app.put('/api/tags/rules/:id', authMiddleware, requirePermission('members:update'), updateTagRule);
app.delete('/api/tags/rules/:id', authMiddleware, requirePermission('members:delete'), deleteTagRule);

// ===== Auto-tagging Routes =====
app.post('/api/tags/apply/:memberId', authMiddleware, requirePermission('members:update'), applyAutoTags);

// ===== News Routes =====
app.get('/api/news', optionalAuthMiddleware, getNews); // 公开端点，前台使用
app.get('/api/news/:id', optionalAuthMiddleware, getNewsItem);
app.post('/api/news', authMiddleware, requirePermission('events:create'), createNews);
app.put('/api/news/:id', authMiddleware, requirePermission('events:update'), updateNews);
app.delete('/api/news/:id', authMiddleware, requirePermission('events:delete'), deleteNews);

// ===== Settings Routes =====
app.get('/api/settings/public', getPublicSettings); // 公开端点，前台使用
app.get('/api/settings', authMiddleware, requirePermission('settings:read'), getSettings);
app.put('/api/settings', authMiddleware, requirePermission('settings:update'), updateSettings);
app.post('/api/settings/logo', authMiddleware, requirePermission('settings:update'), uploadLogo);
app.post('/api/settings/hero-image', authMiddleware, requirePermission('settings:update'), uploadHeroImage);
app.get('/api/settings/images', authMiddleware, requirePermission('settings:read'), listUploadedImages);

// Debug route to check Settings sheet structure
app.get('/api/debug/settings-structure', authMiddleware, requirePermission('settings:read'), async (c) => {
    try {
        const { SheetsService } = await import('./services/sheets.js');
        const sheets = new SheetsService(c.env);
        const headers = await sheets.getHeaders('Settings');
        const rows = await sheets.read('Settings');
        return c.json({
            headers,
            rowCount: rows.length,
            sampleRows: rows.slice(0, 5),
            allRows: rows,
        });
    } catch (error) {
        console.error('Debug settings error:', error);
        return c.json({ error: error.message }, 500);
    }
});

// ===== Role Routes =====
app.get('/api/roles', authMiddleware, requirePermission('roles:manage'), getRoles);
app.post('/api/roles', authMiddleware, requirePermission('roles:manage'), createRole);
app.put('/api/roles/:id', authMiddleware, requirePermission('roles:manage'), updateRole);
app.delete('/api/roles/:id', authMiddleware, requirePermission('roles:manage'), deleteRole);

// ===== User Management Routes =====
app.get('/api/users', authMiddleware, requirePermission('roles:manage'), getUsers);
app.post('/api/users', authMiddleware, requirePermission('users:invite'), createUser);
app.put('/api/users/:id', authMiddleware, requirePermission('roles:manage'), updateUser);
app.post('/api/users/:id/resend-verification', authMiddleware, requirePermission('users:invite'), resendVerification);

// ===== Media proxy =====
app.get('/api/uploads/:key{.+}', async (c) => {
    try {
        if (!c.env.MEDIA_BUCKET) {
            return c.json({ error: '未設定媒體倉儲' }, 500);
        }
        // Decode the key to handle URL-encoded paths
        const encodedKey = c.req.param('key');
        const key = decodeURIComponent(encodedKey);
        
        const r2 = new R2Service(c.env.MEDIA_BUCKET);
        const file = await r2.get(key);
        return new Response(file.body, {
            headers: {
                'Content-Type': file.contentType || 'application/octet-stream',
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('Serve upload error:', error);
        return c.json({ error: '檔案不存在' }, 404);
    }
});

app.notFound((c) => c.json({ error: 'Not Found' }, 404));

app.onError((err, c) => {
    console.error('API Error:', err);
    return c.json({ error: 'Internal Server Error', message: err.message }, 500);
});

export default app;
