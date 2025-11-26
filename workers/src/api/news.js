import { SheetsService } from '../services/sheets.js';
import { Validator } from '../utils/validation.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * News API endpoints
 */

/**
 * Get all news items
 * GET /api/news
 */
export async function getNews(c) {
    try {
        const { status, upcoming, past } = c.req.query();

        const sheets = new SheetsService(c.env);
        let news = [];
        
        try {
            news = await sheets.read('News');
        } catch (error) {
            // If sheet doesn't exist, return empty array
            console.log('News sheet not found or empty, returning empty array');
            news = [];
        }

        // Auto-update news status based on end_date
        const now = new Date();
        const newsToUpdate = [];
        
        for (const item of news) {
            if (item.status === 'published' && item.end_date) {
                const endDate = new Date(item.end_date);
                if (endDate < now) {
                    // News has ended, update status to closed
                    newsToUpdate.push({ ...item, status: 'closed' });
                }
            }
        }

        // Update news that have ended
        if (newsToUpdate.length > 0 && news.length > 0) {
            try {
                const allNews = await sheets.read('News');
                for (const itemToUpdate of newsToUpdate) {
                    const rowIndex = allNews.findIndex(n => n.id === itemToUpdate.id);
                    if (rowIndex !== -1) {
                        const headers = await sheets.getHeaders('News');
                        const values = headers.map(header => {
                            const value = itemToUpdate[header] !== undefined ? itemToUpdate[header] : '';
                            return value === null || value === undefined ? '' : String(value);
                        });
                        await sheets.update('News', rowIndex, values);
                        // Update local news array
                        const newsIndex = news.findIndex(n => n.id === itemToUpdate.id);
                        if (newsIndex !== -1) {
                            news[newsIndex] = itemToUpdate;
                        }
                    }
                }
            } catch (error) {
                console.log('Error updating news status:', error);
                // Continue without updating
            }
        }

        // Filter by status
        if (status) {
            news = news.filter(n => n.status === status);
        } else {
            // Default: only published news for public
            const user = c.get('user');
            if (!user) {
                // For public: only show published news that haven't ended
                news = news.filter(n => {
                    if (n.status !== 'published') return false;
                    if (n.end_date && new Date(n.end_date) < now) return false;
                    return true;
                });
            }
        }

        // Filter by time
        if (upcoming) {
            news = news.filter(n => {
                if (!n.start_date) return false;
                return new Date(n.start_date) >= now;
            });
        }
        if (past) {
            news = news.filter(n => {
                if (!n.end_date) return false;
                return new Date(n.end_date) < now;
            });
        }

        // Sort by start date (newest first)
        news.sort((a, b) => {
            const dateA = a.start_date ? new Date(a.start_date) : new Date(0);
            const dateB = b.start_date ? new Date(b.start_date) : new Date(0);
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
        const { id } = c.req.param();

        const sheets = new SheetsService(c.env);
        let newsItem = null;
        
        try {
            newsItem = await sheets.findById('News', id);
        } catch (error) {
            console.log('News sheet not found or error reading:', error);
        }

        if (!newsItem) {
            return c.json({ error: '消息不存在' }, 404);
        }

        return c.json({
            news: newsItem,
        });
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

        // Validate input
        const validation = Validator.validateNews(data);
        if (!validation.isValid) {
            return c.json({ error: '資料驗證失敗', errors: validation.errors }, 400);
        }

        const sheets = new SheetsService(c.env);

        // Check if News sheet exists, create if not
        try {
            await sheets.read('News');
        } catch (error) {
            // Sheet doesn't exist, create it
            const headers = [
                'id', 'title', 'description', 'content', 'image_url', 'badge', 'pill',
                'action_label', 'action_link', 'variant', 'icon', 'schedule_label',
                'schedule_time', 'note', 'start_date', 'end_date', 'status',
                'created_by', 'created_at'
            ];
            await sheets.createSheet('News', headers);
        }

        // Create news object
        const newsItem = {
            id: uuidv4(),
            title: data.title,
            description: data.description || '',
            content: data.content || '',
            image_url: data.image_url || '',
            badge: data.badge || '',
            pill: data.pill || '',
            action_label: data.action_label || '',
            action_link: data.action_link || '',
            variant: data.variant || 'image', // 'image' or 'info'
            icon: data.icon || '',
            schedule_label: data.schedule_label || '',
            schedule_time: data.schedule_time || '',
            note: data.note || '',
            start_date: data.start_date || '',
            end_date: data.end_date || '',
            status: data.status || 'draft',
            created_by: user.user_id,
            created_at: new Date().toISOString(),
        };

        await sheets.append('News', Object.values(newsItem));

        return c.json({
            message: '消息建立成功',
            news: newsItem,
        }, 201);
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
        const { id } = c.req.param();
        const data = await c.req.json();

        const sheets = new SheetsService(c.env);
        const newsItem = await sheets.findById('News', id);

        if (!newsItem) {
            return c.json({ error: '消息不存在' }, 404);
        }

        // Validate input
        const validation = Validator.validateNews({ ...newsItem, ...data });
        if (!validation.isValid) {
            return c.json({ error: '資料驗證失敗', errors: validation.errors }, 400);
        }

        // Update news object
        const updatedNews = {
            ...newsItem,
            ...data,
            id: newsItem.id, // Preserve ID
            created_by: newsItem.created_by, // Preserve creator
            created_at: newsItem.created_at, // Preserve creation date
        };

        // Find row index and update
        let allNews = [];
        try {
            allNews = await sheets.read('News');
        } catch (error) {
            return c.json({ error: '消息工作表不存在' }, 404);
        }
        
        const rowIndex = allNews.findIndex(n => n.id === id);
        
        if (rowIndex === -1) {
            return c.json({ error: '消息不存在' }, 404);
        }

        const headers = await sheets.getHeaders('News');
        const values = headers.map(header => {
            const value = updatedNews[header] !== undefined ? updatedNews[header] : '';
            return value === null || value === undefined ? '' : String(value);
        });
        
        await sheets.update('News', rowIndex, values);

        return c.json({
            message: '消息更新成功',
            news: updatedNews,
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
        const { id } = c.req.param();

        const sheets = new SheetsService(c.env);
        let newsItem = null;
        
        try {
            newsItem = await sheets.findById('News', id);
        } catch (error) {
            console.log('Error finding news item:', error);
        }

        if (!newsItem) {
            return c.json({ error: '消息不存在' }, 404);
        }

        // Update status to closed
        let allNews = [];
        try {
            allNews = await sheets.read('News');
        } catch (error) {
            return c.json({ error: '消息工作表不存在' }, 404);
        }
        
        const rowIndex = allNews.findIndex(n => n.id === id);
        if (rowIndex === -1) {
            return c.json({ error: '消息不存在' }, 404);
        }
        
        newsItem.status = 'closed';
        
        const headers = await sheets.getHeaders('News');
        const values = headers.map(header => {
            const value = newsItem[header] !== undefined ? newsItem[header] : '';
            return value === null || value === undefined ? '' : String(value);
        });
        
        await sheets.update('News', rowIndex, values);

        return c.json({ message: '消息已刪除' });
    } catch (error) {
        console.error('Delete news error:', error);
        return c.json({ error: '刪除消息失敗' }, 500);
    }
}

