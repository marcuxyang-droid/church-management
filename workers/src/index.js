import { Hono } from 'hono';
import { cors } from 'hono/cors';
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

app.notFound((c) => c.json({ error: 'Not Found' }, 404));

app.onError((err, c) => {
    console.error('API Error:', err);
    return c.json({ error: 'Internal Server Error', message: err.message }, 500);
});

export default app;
