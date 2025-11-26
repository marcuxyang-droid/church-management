import { SheetsService } from '../services/sheets.js';
import { v4 as uuidv4 } from 'uuid';

const TESTIMONIAL_SHEET = 'Landing_Testimonials';
const STAT_SHEET = 'Landing_Stats';

const TESTIMONIAL_HEADERS = [
    'id',
    'quote',
    'author',
    'role',
    'status',
    'order',
    'created_by',
    'created_at',
    'updated_at',
];

const STAT_HEADERS = [
    'id',
    'label',
    'value',
    'detail',
    'status',
    'order',
    'created_by',
    'created_at',
    'updated_at',
];

const DEFAULT_TESTIMONIALS = [
    {
        quote: '第一次踏進教會時就感受到滿滿的接納，這裡成了我的第二個家。',
        author: 'Iris',
        role: '新朋友',
        order: 1,
    },
    {
        quote: '在小組裡找到彼此扶持的夥伴，我們一起禱告、一起成長。',
        author: 'Michael',
        role: '小組長',
        order: 2,
    },
    {
        quote: '參與關懷行動讓我看見更多需要，信仰不再只是口號。',
        author: 'Grace',
        role: '志工',
        order: 3,
    },
];

const DEFAULT_STATS = [
    { label: '固定聚會', value: '7 場', detail: '主日與平日聚會', order: 1 },
    { label: '小組家庭', value: '24 個', detail: '遍佈雙北社區', order: 2 },
    { label: '志工夥伴', value: '120+', detail: '同心服事', order: 3 },
    { label: '差派行動', value: '12 次', detail: '年度短宣與關懷', order: 4 },
];

async function ensureSheet(sheets, sheetName, headers) {
    let existingHeaders = [];
    try {
        existingHeaders = await sheets.getHeaders(sheetName);
    } catch (error) {
        existingHeaders = [];
    }

    if (!existingHeaders || existingHeaders.length === 0) {
        await sheets.createSheet(sheetName, headers);
        return [...headers];
    }

    const missingHeaders = headers.filter((header) => !existingHeaders.includes(header));
    if (missingHeaders.length > 0) {
        const updatedHeaders = [...existingHeaders, ...missingHeaders];
        const range = encodeURIComponent(`${sheetName}!A1`);
        await sheets.request(`/values/${range}?valueInputOption=RAW`, {
            method: 'PUT',
            body: JSON.stringify({ values: [updatedHeaders] }),
        });
        if (sheets.headersCache && typeof sheets.headersCache.set === 'function') {
            sheets.headersCache.set(sheetName, updatedHeaders);
        }
        return updatedHeaders;
    }

    return existingHeaders;
}

function serializeRecord(record, headers) {
    return headers.map((header) => {
        const value = record[header];
        return value === undefined || value === null ? '' : String(value);
    });
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

function sortByOrder(items) {
    return [...items].sort((a, b) => normalizeOrder(a.order) - normalizeOrder(b.order));
}

async function seedTestimonials(sheets, headers) {
    const now = new Date().toISOString();
    const seeded = DEFAULT_TESTIMONIALS.map((item, idx) => ({
        id: uuidv4(),
        quote: item.quote,
        author: item.author,
        role: item.role || '',
        status: 'published',
        order: item.order ?? idx + 1,
        created_by: 'system',
        created_at: now,
        updated_at: now,
    }));
    for (const record of seeded) {
        await sheets.append(TESTIMONIAL_SHEET, serializeRecord(record, headers));
    }
    return seeded;
}

async function seedStats(sheets, headers) {
    const now = new Date().toISOString();
    const seeded = DEFAULT_STATS.map((item, idx) => ({
        id: uuidv4(),
        label: item.label,
        value: item.value,
        detail: item.detail || '',
        status: 'published',
        order: item.order ?? idx + 1,
        created_by: 'system',
        created_at: now,
        updated_at: now,
    }));
    for (const record of seeded) {
        await sheets.append(STAT_SHEET, serializeRecord(record, headers));
    }
    return seeded;
}

// ===== Testimonials =====
export async function getTestimonials(c) {
    try {
        const { status } = c.req.query();
        const user = c.get('user');
        const sheets = new SheetsService(c.env);
        const headers = await ensureSheet(sheets, TESTIMONIAL_SHEET, TESTIMONIAL_HEADERS);
        let testimonials = await sheets.read(TESTIMONIAL_SHEET);
        if (testimonials.length === 0) {
            testimonials = await seedTestimonials(sheets, headers);
        }
        testimonials = filterByStatus(testimonials, status, user);
        testimonials = sortByOrder(testimonials);

        return c.json({
            testimonials,
            total: testimonials.length,
        });
    } catch (error) {
        console.error('Get testimonials error:', error);
        return c.json({ error: '取得家人的故事失敗' }, 500);
    }
}

export async function createTestimonial(c) {
    try {
        const data = await c.req.json();
        if (!data.quote || !data.author) {
            return c.json({ error: '請提供引言與作者' }, 400);
        }

        const sheets = new SheetsService(c.env);
        const headers = await ensureSheet(sheets, TESTIMONIAL_SHEET, TESTIMONIAL_HEADERS);
        const existing = await sheets.read(TESTIMONIAL_SHEET);
        const now = new Date().toISOString();
        const user = c.get('user');

        const testimonial = {
            id: uuidv4(),
            quote: data.quote.trim(),
            author: data.author.trim(),
            role: data.role ? data.role.trim() : '',
            status: data.status || 'draft',
            order: data.order !== undefined && data.order !== null
                ? normalizeOrder(data.order)
                : existing.length + 1,
            created_by: user?.id || 'system',
            created_at: now,
            updated_at: now,
        };

        await sheets.append(TESTIMONIAL_SHEET, serializeRecord(testimonial, headers));

        return c.json({
            message: '家人的故事已建立',
            testimonial,
        }, 201);
    } catch (error) {
        console.error('Create testimonial error:', error);
        return c.json({ error: '建立家人的故事失敗' }, 500);
    }
}

export async function updateTestimonial(c) {
    try {
        const { id } = c.req.param();
        const data = await c.req.json();
        const sheets = new SheetsService(c.env);
        const headers = await ensureSheet(sheets, TESTIMONIAL_SHEET, TESTIMONIAL_HEADERS);
        const testimonials = await sheets.read(TESTIMONIAL_SHEET);
        const testimonial = testimonials.find((item) => item.id === id);

        if (!testimonial) {
            return c.json({ error: '家人的故事不存在' }, 404);
        }

        const now = new Date().toISOString();
        const updated = {
            ...testimonial,
            quote: data.quote !== undefined ? data.quote : testimonial.quote,
            author: data.author !== undefined ? data.author : testimonial.author,
            role: data.role !== undefined ? data.role : testimonial.role,
            status: data.status || testimonial.status,
            order: data.order !== undefined ? normalizeOrder(data.order) : testimonial.order,
            updated_at: now,
        };

        const rowIndex = testimonials.findIndex((item) => item.id === id);
        await sheets.update(TESTIMONIAL_SHEET, rowIndex, serializeRecord(updated, headers));

        return c.json({
            message: '家人的故事已更新',
            testimonial: updated,
        });
    } catch (error) {
        console.error('Update testimonial error:', error);
        return c.json({ error: '更新家人的故事失敗' }, 500);
    }
}

export async function deleteTestimonial(c) {
    try {
        const { id } = c.req.param();
        const sheets = new SheetsService(c.env);
        const headers = await ensureSheet(sheets, TESTIMONIAL_SHEET, TESTIMONIAL_HEADERS);
        const testimonials = await sheets.read(TESTIMONIAL_SHEET);
        const testimonial = testimonials.find((item) => item.id === id);

        if (!testimonial) {
            return c.json({ error: '家人的故事不存在' }, 404);
        }

        const updated = {
            ...testimonial,
            status: 'deleted',
            updated_at: new Date().toISOString(),
        };
        const rowIndex = testimonials.findIndex((item) => item.id === id);
        await sheets.update(TESTIMONIAL_SHEET, rowIndex, serializeRecord(updated, headers));

        return c.json({ message: '家人的故事已刪除' });
    } catch (error) {
        console.error('Delete testimonial error:', error);
        return c.json({ error: '刪除家人的故事失敗' }, 500);
    }
}

// ===== Stats =====
export async function getLandingStats(c) {
    try {
        const { status } = c.req.query();
        const user = c.get('user');
        const sheets = new SheetsService(c.env);
        const headers = await ensureSheet(sheets, STAT_SHEET, STAT_HEADERS);
        let stats = await sheets.read(STAT_SHEET);
        if (stats.length === 0) {
            stats = await seedStats(sheets, headers);
        }
        stats = filterByStatus(stats, status, user);
        stats = sortByOrder(stats);

        return c.json({
            stats,
            total: stats.length,
        });
    } catch (error) {
        console.error('Get landing stats error:', error);
        return c.json({ error: '取得核心數據失敗' }, 500);
    }
}

export async function createLandingStat(c) {
    try {
        const data = await c.req.json();
        if (!data.label || !data.value) {
            return c.json({ error: '請提供標題與數值' }, 400);
        }

        const sheets = new SheetsService(c.env);
        const headers = await ensureSheet(sheets, STAT_SHEET, STAT_HEADERS);
        const existing = await sheets.read(STAT_SHEET);
        const now = new Date().toISOString();
        const user = c.get('user');

        const stat = {
            id: uuidv4(),
            label: data.label.trim(),
            value: data.value.trim(),
            detail: data.detail ? data.detail.trim() : '',
            status: data.status || 'published',
            order: data.order !== undefined && data.order !== null
                ? normalizeOrder(data.order)
                : existing.length + 1,
            created_by: user?.id || 'system',
            created_at: now,
            updated_at: now,
        };

        await sheets.append(STAT_SHEET, serializeRecord(stat, headers));

        return c.json({
            message: '核心數據已建立',
            stat,
        }, 201);
    } catch (error) {
        console.error('Create landing stat error:', error);
        return c.json({ error: '建立核心數據失敗' }, 500);
    }
}

export async function updateLandingStat(c) {
    try {
        const { id } = c.req.param();
        const data = await c.req.json();
        const sheets = new SheetsService(c.env);
        const headers = await ensureSheet(sheets, STAT_SHEET, STAT_HEADERS);
        const stats = await sheets.read(STAT_SHEET);
        const stat = stats.find((item) => item.id === id);

        if (!stat) {
            return c.json({ error: '核心數據不存在' }, 404);
        }

        const now = new Date().toISOString();
        const updated = {
            ...stat,
            label: data.label !== undefined ? data.label : stat.label,
            value: data.value !== undefined ? data.value : stat.value,
            detail: data.detail !== undefined ? data.detail : stat.detail,
            status: data.status || stat.status,
            order: data.order !== undefined ? normalizeOrder(data.order) : stat.order,
            updated_at: now,
        };

        const rowIndex = stats.findIndex((item) => item.id === id);
        await sheets.update(STAT_SHEET, rowIndex, serializeRecord(updated, headers));

        return c.json({
            message: '核心數據已更新',
            stat: updated,
        });
    } catch (error) {
        console.error('Update landing stat error:', error);
        return c.json({ error: '更新核心數據失敗' }, 500);
    }
}

export async function deleteLandingStat(c) {
    try {
        const { id } = c.req.param();
        const sheets = new SheetsService(c.env);
        const headers = await ensureSheet(sheets, STAT_SHEET, STAT_HEADERS);
        const stats = await sheets.read(STAT_SHEET);
        const stat = stats.find((item) => item.id === id);

        if (!stat) {
            return c.json({ error: '核心數據不存在' }, 404);
        }

        const updated = {
            ...stat,
            status: 'deleted',
            updated_at: new Date().toISOString(),
        };
        const rowIndex = stats.findIndex((item) => item.id === id);
        await sheets.update(STAT_SHEET, rowIndex, serializeRecord(updated, headers));

        return c.json({ message: '核心數據已刪除' });
    } catch (error) {
        console.error('Delete landing stat error:', error);
        return c.json({ error: '刪除核心數據失敗' }, 500);
    }
}


