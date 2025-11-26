import { SheetsService } from '../services/sheets.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get all news items
 * GET /api/news
 */
export async function getNews(c) {
    try {
        const { status } = c.req.query();

        const sheets = new SheetsService(c.env);
        let news = [];
        
        try {
            news = await sheets.read('News');
        } catch (error) {
            console.log('News sheet not found or empty, returning empty array');
            news = [];
        }

        // Filter by status if provided
        if (status) {
            news = news.filter(item => item.status === status);
        }

        // Sort by created_at (newest first)
        news.sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
            const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
            return dateB - dateA;
        });

        return c.json({
            news,
            total: news.length,
        });
    } catch (error) {
        console.error('Get news error:', error);
        return c.json({ error: '獲取消息列表失敗' }, 500);
    }
}

/**
 * Get single news item
 * GET /api/news/:id
 */
export async function getNewsItem(c) {
    try {
        const id = c.req.param('id');
        const sheets = new SheetsService(c.env);
        const news = await sheets.read('News');
        const item = news.find(n => n.id === id);

        if (!item) {
            return c.json({ error: '消息不存在' }, 404);
        }

        return c.json({ news: item });
    } catch (error) {
        console.error('Get news item error:', error);
        return c.json({ error: '獲取消息資訊失敗' }, 500);
    }
}

/**
 * Create new news item
 * POST /api/news
 */
export async function createNews(c) {
    try {
        const user = c.get('user');
        const data = await c.req.json();

        const sheets = new SheetsService(c.env);
        const headers = await sheets.getHeaders('News');

        // Create news object
        const newsItem = {
            id: uuidv4(),
            title: data.title || '',
            description: data.description || '',
            content: data.content || '',
            image_url: data.image_url || '',
            badge: data.badge || '',
            pill: data.pill || '',
            action_label: data.action_label || '',
            action_link: data.action_link || '',
            variant: data.variant || 'image',
            icon: data.icon || '',
            schedule_label: data.schedule_label || '',
            schedule_time: data.schedule_time || '',
            note: data.note || '',
            start_date: data.start_date || '',
            end_date: data.end_date || '',
            status: data.status || 'draft',
            created_by: user?.user_id || user?.email || 'system',
            created_at: new Date().toISOString(),
        };

        const rowValues = headers.map(header => newsItem[header] ?? '');
        await sheets.append('News', rowValues);

        return c.json({
            message: '消息建立成功',
            news: newsItem,
        });
    } catch (error) {
        console.error('Create news error:', error);
        return c.json({ error: '建立消息失敗' }, 500);
    }
}

/**
 * Update news item
 * PUT /api/news/:id
 */
export async function updateNews(c) {
    try {
        const user = c.get('user');
        const id = c.req.param('id');
        const data = await c.req.json();

        const sheets = new SheetsService(c.env);
        const news = await sheets.read('News');
        const headers = await sheets.getHeaders('News');
        const rowIndex = news.findIndex(n => n.id === id);

        if (rowIndex === -1) {
            return c.json({ error: '消息不存在' }, 404);
        }

        const updated = {
            ...news[rowIndex],
            ...data,
            updated_at: new Date().toISOString(),
            updated_by: user?.user_id || user?.email || 'system',
        };

        const rowValues = headers.map(header => updated[header] ?? '');
        await sheets.update('News', rowIndex, rowValues);

        return c.json({
            message: '消息已更新',
            news: updated,
        });
    } catch (error) {
        console.error('Update news error:', error);
        return c.json({ error: '更新消息失敗' }, 500);
    }
}

/**
 * Delete news item
 * DELETE /api/news/:id
 */
export async function deleteNews(c) {
    try {
        const id = c.req.param('id');
        const sheets = new SheetsService(c.env);
        const news = await sheets.read('News');
        const rowIndex = news.findIndex(n => n.id === id);

        if (rowIndex === -1) {
            return c.json({ error: '消息不存在' }, 404);
        }

        const headers = await sheets.getHeaders('News');
        const deleted = {
            ...news[rowIndex],
            status: 'deleted',
            updated_at: new Date().toISOString(),
        };

        const rowValues = headers.map(header => deleted[header] ?? '');
        await sheets.update('News', rowIndex, rowValues);

        return c.json({
            message: '消息已刪除',
        });
    } catch (error) {
        console.error('Delete news error:', error);
        return c.json({ error: '刪除消息失敗' }, 500);
    }
}

