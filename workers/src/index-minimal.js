import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// CORS middleware
app.use('*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check
app.get('/health', (c) => {
    return c.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Church Management System API is running'
    });
});

// Test endpoint
app.get('/api/test', (c) => {
    return c.json({
        message: 'API is working!',
        environment: c.env.ENVIRONMENT || 'development',
        sheetId: c.env.GOOGLE_SHEET_ID ? 'configured' : 'not configured'
    });
});

// 404 handler
app.notFound((c) => c.json({ error: 'Not Found' }, 404));

// Error handler
app.onError((err, c) => {
    console.error('Error:', err);
    return c.json({ error: 'Internal Server Error', message: err.message }, 500);
});

export default app;
