import { SheetsService } from '../services/sheets.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Media Library API endpoints
 */

export async function getMedia(c) {
    try {
        const { type, search, speaker } = c.req.query();
        const sheets = new SheetsService(c.env);
        let media = await sheets.read('Media_Library');

        if (type) {
            media = media.filter(m => m.type === type);
        }

        if (speaker) {
            media = media.filter(m => m.speaker && m.speaker.includes(speaker));
        }

        if (search) {
            const searchLower = search.toLowerCase();
            media = media.filter(m =>
                m.title.toLowerCase().includes(searchLower) ||
                (m.speaker && m.speaker.toLowerCase().includes(searchLower)) ||
                (m.tags && m.tags.toLowerCase().includes(searchLower))
            );
        }

        media.sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at));

        return c.json({
            media,
            total: media.length,
        });
    } catch (error) {
        console.error('Get media error:', error);
        return c.json({ error: '獲取媒體列表失敗' }, 500);
    }
}

export async function getMediaItem(c) {
    try {
        const { id } = c.req.param();
        const sheets = new SheetsService(c.env);
        const item = await sheets.findById('Media_Library', id);

        if (!item) {
            return c.json({ error: '媒體不存在' }, 404);
        }

        return c.json({ media: item });
    } catch (error) {
        console.error('Get media item error:', error);
        return c.json({ error: '獲取媒體失敗' }, 500);
    }
}

export async function createMedia(c) {
    try {
        const data = await c.req.json();
        const sheets = new SheetsService(c.env);

        const media = {
            id: uuidv4(),
            title: data.title,
            type: data.type || 'video',
            url: data.url || '',
            thumbnail_url: data.thumbnail_url || '',
            date: data.date || new Date().toISOString().split('T')[0],
            speaker: data.speaker || '',
            tags: data.tags || '',
            created_at: new Date().toISOString(),
        };

        await sheets.append('Media_Library', Object.values(media));

        return c.json({
            message: '媒體建立成功',
            media,
        });
    } catch (error) {
        console.error('Create media error:', error);
        return c.json({ error: '建立媒體失敗' }, 500);
    }
}

export async function updateMedia(c) {
    try {
        const { id } = c.req.param();
        const data = await c.req.json();

        const sheets = new SheetsService(c.env);
        const media = await sheets.findById('Media_Library', id);

        if (!media) {
            return c.json({ error: '媒體不存在' }, 404);
        }

        const updatedMedia = {
            ...media,
            ...data,
        };

        const mediaList = await sheets.read('Media_Library');
        const rowIndex = mediaList.findIndex(m => m.id === id);
        await sheets.update('Media_Library', rowIndex, Object.values(updatedMedia));

        return c.json({
            message: '媒體更新成功',
            media: updatedMedia,
        });
    } catch (error) {
        console.error('Update media error:', error);
        return c.json({ error: '更新媒體失敗' }, 500);
    }
}

export async function deleteMedia(c) {
    try {
        const { id } = c.req.param();
        const sheets = new SheetsService(c.env);
        await sheets.delete('Media_Library', id);
        return c.json({ message: '媒體刪除成功' });
    } catch (error) {
        console.error('Delete media error:', error);
        return c.json({ error: '刪除媒體失敗' }, 500);
    }
}

