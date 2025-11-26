import { SheetsService } from '../services/sheets.js';
import { v4 as uuidv4 } from 'uuid';

const SERMON_HEADERS = [
    'id',
    'title',
    'speaker',
    'date',
    'series',
    'video_url',
    'description',
    'status',
    'order',
    'created_at',
    'updated_at',
];

const DEFAULT_SERMONS = [
    {
        title: '走進曠野的恩典',
        speaker: '李牧師',
        date: '2025-11-16',
        series: '出埃及記專題',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        description: '',
        order: 1,
    },
    {
        title: '祝福城市的人',
        speaker: '王傳道',
        date: '2025-11-09',
        series: '信仰與職場',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        description: '',
        order: 2,
    },
    {
        title: '修復關係的勇氣',
        speaker: '張牧師',
        date: '2025-11-02',
        series: '真實關係',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        description: '',
        order: 3,
    },
];

async function ensureSermonSheet(sheets) {
    let headers = [];
    try {
        headers = await sheets.getHeaders('Sermons');
    } catch (error) {
        headers = [];
    }

    if (!headers || headers.length === 0) {
        await sheets.createSheet('Sermons', SERMON_HEADERS);
        headers = [...SERMON_HEADERS];
        const now = new Date().toISOString();
        for (const def of DEFAULT_SERMONS) {
            const record = {
                id: uuidv4(),
                status: 'published',
                created_at: now,
                updated_at: now,
                ...def,
            };
            await sheets.append('Sermons', headers.map((header) => record[header] ?? ''));
        }
    }

    return headers;
}

function normalizeOrder(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function filterByStatus(items, status, user) {
    if (!user) {
        return items.filter((item) => item.status === 'published');
    }
    if (!status || status === 'all') {
        return items.filter((item) => item.status !== 'deleted');
    }
    return items.filter((item) => item.status === status);
}

export async function getSermons(c) {
    try {
        const sheets = new SheetsService(c.env);
        const headers = await ensureSermonSheet(sheets);
        const user = c.get('user');
        const status = c.req.query('status');

        let sermons = await sheets.read('Sermons');
        sermons = filterByStatus(sermons, status, user).sort(
            (a, b) => normalizeOrder(a.order) - normalizeOrder(b.order),
        );

        return c.json({ sermons });
    } catch (error) {
        console.error('Get sermons error:', error);
        return c.json({ error: '取得主日訊息失敗' }, 500);
    }
}

export async function createSermon(c) {
    try {
        const data = await c.req.json();
        const sheets = new SheetsService(c.env);
        const headers = await ensureSermonSheet(sheets);
        const now = new Date().toISOString();

        const sermon = {
            id: uuidv4(),
            title: data.title || '',
            speaker: data.speaker || '',
            date: data.date || '',
            series: data.series || '',
            video_url: data.video_url || '',
            description: data.description || '',
            status: data.status || 'draft',
            order: data.order !== undefined ? normalizeOrder(data.order) : now,
            created_at: now,
            updated_at: now,
        };

        await sheets.append('Sermons', headers.map((header) => sermon[header] ?? ''));
        return c.json({ message: '主日訊息已建立', sermon }, 201);
    } catch (error) {
        console.error('Create sermon error:', error);
        return c.json({ error: '建立主日訊息失敗' }, 500);
    }
}

export async function updateSermon(c) {
    try {
        const { id } = c.req.param();
        const data = await c.req.json();
        const sheets = new SheetsService(c.env);
        const headers = await ensureSermonSheet(sheets);
        const sermons = await sheets.read('Sermons');
        const sermon = sermons.find((item) => item.id === id);

        if (!sermon) {
            return c.json({ error: '主日訊息不存在' }, 404);
        }

        const updated = {
            ...sermon,
            ...data,
            order: data.order !== undefined ? normalizeOrder(data.order) : sermon.order,
            updated_at: new Date().toISOString(),
        };

        const rowIndex = sermons.findIndex((item) => item.id === id);
        await sheets.update('Sermons', rowIndex, headers.map((header) => updated[header] ?? ''));
        return c.json({ message: '主日訊息已更新', sermon: updated });
    } catch (error) {
        console.error('Update sermon error:', error);
        return c.json({ error: '更新主日訊息失敗' }, 500);
    }
}

export async function deleteSermon(c) {
    try {
        const { id } = c.req.param();
        const sheets = new SheetsService(c.env);
        const headers = await ensureSermonSheet(sheets);
        const sermons = await sheets.read('Sermons');
        const sermon = sermons.find((item) => item.id === id);

        if (!sermon) {
            return c.json({ error: '主日訊息不存在' }, 404);
        }

        const updated = {
            ...sermon,
            status: 'deleted',
            updated_at: new Date().toISOString(),
        };

        const rowIndex = sermons.findIndex((item) => item.id === id);
        await sheets.update('Sermons', rowIndex, headers.map((header) => updated[header] ?? ''));
        return c.json({ message: '主日訊息已刪除' });
    } catch (error) {
        console.error('Delete sermon error:', error);
        return c.json({ error: '刪除主日訊息失敗' }, 500);
    }
}


