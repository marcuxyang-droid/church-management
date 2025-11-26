import { SheetsService } from '../services/sheets.js';
import { v4 as uuidv4 } from 'uuid';

const ABOUT_SECTIONS = {
    missions: {
        sheet: 'About_Missions',
        headers: ['id', 'title', 'description', 'status', 'order', 'created_at', 'updated_at'],
        defaults: [
            { title: '傳揚福音', description: '以清楚、真實的信息分享耶穌，讓更多人認識救恩。', order: 1 },
            { title: '建立門徒', description: '透過裝備課程與陪伴，讓生命扎根於真理中。', order: 2 },
            { title: '影響城市', description: '走進社區、職場與家庭，以愛與行動帶出改變。', order: 3 },
        ],
    },
    milestones: {
        sheet: 'About_Milestones',
        headers: ['id', 'year', 'content', 'status', 'order', 'created_at', 'updated_at'],
        defaults: [
            { year: '2010', content: '教會在台北成立，開啟第一堂主日崇拜。', order: 1 },
            { year: '2015', content: '展開小組系統，建立牧養與門訓文化。', order: 2 },
            { year: '2019', content: '啟動 Blessing Haven 社區關懷行動。', order: 3 },
            { year: '2024', content: '導入線上管理系統，串連奉獻、活動與志工。', order: 4 },
        ],
    },
    ministries: {
        sheet: 'About_Ministries',
        headers: ['id', 'icon', 'title', 'description', 'status', 'order', 'created_at', 'updated_at'],
        defaults: [
            { icon: '👨‍👩‍👧‍👦', title: '家庭與婚姻', description: '陪伴每個家庭走過各樣季節，建立穩固婚姻。', order: 1 },
            { icon: '🧒', title: '兒童與青少年', description: '從小扎根信仰，培養敬虔與品格。', order: 2 },
            { icon: '🎶', title: '敬拜與藝術', description: '發揮恩賜，讓敬拜與創意成為橋梁。', order: 3 },
            { icon: '🤲', title: '社區關懷', description: '志工關懷、食物銀行、行動醫療等實際行動。', order: 4 },
        ],
    },
};

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

function sortByOrder(items) {
    return [...items].sort((a, b) => normalizeOrder(a.order) - normalizeOrder(b.order));
}

async function ensureSection(sheets, key) {
    const section = ABOUT_SECTIONS[key];
    if (!section) {
        throw new Error(`Unknown section: ${key}`);
    }

    let headers = [];
    try {
        headers = await sheets.getHeaders(section.sheet);
    } catch (error) {
        headers = [];
    }

    if (!headers || headers.length === 0) {
        await sheets.createSheet(section.sheet, section.headers);
        headers = [...section.headers];
        const now = new Date().toISOString();
        for (const [index, def] of section.defaults.entries()) {
            const record = {
                id: uuidv4(),
                status: 'published',
                order: def.order ?? index + 1,
                created_at: now,
                updated_at: now,
                ...def,
            };
            const row = headers.map((header) => record[header] ?? '');
            await sheets.append(section.sheet, row);
        }
    }

    return { sheet: section.sheet, headers: section.headers };
}

export async function getAboutContent(c) {
    try {
        const sheets = new SheetsService(c.env);
        const user = c.get('user');
        const status = c.req.query('status');

        const result = {};
        for (const key of Object.keys(ABOUT_SECTIONS)) {
            const { sheet } = await ensureSection(sheets, key);
            const rows = await sheets.read(sheet);
            const filtered = filterByStatus(rows, status, user);
            result[key] = sortByOrder(filtered);
        }

        return c.json(result);
    } catch (error) {
        console.error('Get about content error:', error);
        return c.json({ error: '取得關於我們內容失敗' }, 500);
    }
}

export async function createAboutItem(c) {
    try {
        const { section } = c.req.param();
        const body = await c.req.json();
        const sheets = new SheetsService(c.env);
        const { sheet, headers } = await ensureSection(sheets, section);
        const now = new Date().toISOString();

        const record = {
            id: uuidv4(),
            status: body.status || 'published',
            order: body.order !== undefined ? normalizeOrder(body.order) : Date.now(),
            created_at: now,
            updated_at: now,
        };

        if (section === 'missions') {
            record.title = body.title || '';
            record.description = body.description || '';
        } else if (section === 'milestones') {
            record.year = body.year || '';
            record.content = body.content || '';
        } else if (section === 'ministries') {
            record.icon = body.icon || '';
            record.title = body.title || '';
            record.description = body.description || '';
        }

        await sheets.append(sheet, headers.map((header) => record[header] ?? ''));

        return c.json({ message: '已新增內容', item: record }, 201);
    } catch (error) {
        console.error('Create about item error:', error);
        return c.json({ error: '新增失敗' }, 500);
    }
}

export async function updateAboutItem(c) {
    try {
        const { section, id } = c.req.param();
        const body = await c.req.json();
        const sheets = new SheetsService(c.env);
        const { sheet, headers } = await ensureSection(sheets, section);
        const rows = await sheets.read(sheet);
        const item = rows.find((row) => row.id === id);

        if (!item) {
            return c.json({ error: '資料不存在' }, 404);
        }

        const updated = {
            ...item,
            ...body,
            order: body.order !== undefined ? normalizeOrder(body.order) : item.order,
            updated_at: new Date().toISOString(),
        };

        const rowIndex = rows.findIndex((row) => row.id === id);
        await sheets.update(sheet, rowIndex, headers.map((header) => updated[header] ?? ''));

        return c.json({ message: '更新成功', item: updated });
    } catch (error) {
        console.error('Update about item error:', error);
        return c.json({ error: '更新失敗' }, 500);
    }
}

export async function deleteAboutItem(c) {
    try {
        const { section, id } = c.req.param();
        const sheets = new SheetsService(c.env);
        const { sheet, headers } = await ensureSection(sheets, section);
        const rows = await sheets.read(sheet);
        const item = rows.find((row) => row.id === id);

        if (!item) {
            return c.json({ error: '資料不存在' }, 404);
        }

        const updated = {
            ...item,
            status: 'deleted',
            updated_at: new Date().toISOString(),
        };

        const rowIndex = rows.findIndex((row) => row.id === id);
        await sheets.update(sheet, rowIndex, headers.map((header) => updated[header] ?? ''));

        return c.json({ message: '已刪除' });
    } catch (error) {
        console.error('Delete about item error:', error);
        return c.json({ error: '刪除失敗' }, 500);
    }
}


