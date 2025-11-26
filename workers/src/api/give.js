import { SheetsService } from '../services/sheets.js';
import { v4 as uuidv4 } from 'uuid';

const GIVE_METHOD_HEADERS = ['id', 'title', 'details', 'status', 'order', 'updated_at'];
const GIVE_IMPACT_HEADERS = ['id', 'label', 'value', 'description', 'status', 'order', 'updated_at'];
const GIVE_CONFIG_HEADERS = [
    'hero_title',
    'hero_description',
    'cta_label',
    'cta_url',
    'info_title',
    'info_description',
    'notes',
    'updated_at',
    'updated_by',
];

const DEFAULT_CONFIG = {
    hero_title: '線上奉獻',
    hero_description: '感謝您以奉獻回應呼召。每一份支持都成為福音工作的助力，也延伸到城市與列國。',
    cta_label: '立刻奉獻',
    cta_url: '',
    info_title: '奉獻說明',
    info_description:
        '您的奉獻將用於福音傳揚、門徒裝備、社區關懷，以及宣教差派。若需要奉獻收據，請於轉帳後聯繫教會辦公室。',
    notes: '若您有特別指定用途，請在備註註明。需要奉獻諮詢或安排大型奉獻，也歡迎與財務同工聯繫。',
};

const DEFAULT_METHODS = [
    {
        title: '銀行轉帳',
        details: '銀行：XXX銀行\n分行：信義分行\n帳號：123-456-789012\n戶名：Blessing Haven 教會',
        order: 1,
    },
    {
        title: '線上刷卡',
        details: '支援 Visa / Master / JCB\n可設定定期定額\n資料全程加密安全',
        order: 2,
    },
    {
        title: '現場奉獻',
        details: '主日聚會可使用奉獻袋\n或至 Welcome Bar 刷卡奉獻',
        order: 3,
    },
];

const DEFAULT_IMPACTS = [
    { label: '社區關懷資源', value: '45%', description: '', order: 1 },
    { label: '宣教與差派', value: '25%', description: '', order: 2 },
    { label: '裝備與建堂', value: '20%', description: '', order: 3 },
    { label: '日常行政運作', value: '10%', description: '', order: 4 },
];

async function ensureSheet(sheets, name, headers, defaults = []) {
    let existingHeaders = [];
    try {
        existingHeaders = await sheets.getHeaders(name);
    } catch (error) {
        existingHeaders = [];
    }

    if (!existingHeaders || existingHeaders.length === 0) {
        await sheets.createSheet(name, headers);
        existingHeaders = [...headers];
        const now = new Date().toISOString();
        for (const [index, def] of defaults.entries()) {
            const record = {
                id: uuidv4(),
                status: 'published',
                order: def.order ?? index + 1,
                updated_at: now,
                ...def,
            };
            await sheets.append(name, existingHeaders.map((header) => record[header] ?? ''));
        }
    }

    return existingHeaders;
}

async function ensureConfig(sheets) {
    const headers = await ensureSheet(sheets, 'Give_Config', GIVE_CONFIG_HEADERS);
    const rows = await sheets.read('Give_Config');
    if (rows.length === 0) {
        const now = new Date().toISOString();
        const record = {
            ...DEFAULT_CONFIG,
            updated_at: now,
            updated_by: 'system',
        };
        await sheets.append('Give_Config', headers.map((header) => record[header] ?? ''));
        return record;
    }
    return rows[0];
}

function normalizeOrder(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function filterPublic(items, user, status) {
    if (!user) {
        return items.filter((item) => item.status === 'published');
    }
    if (!status || status === 'all') {
        return items.filter((item) => item.status !== 'deleted');
    }
    return items.filter((item) => item.status === status);
}

export async function getGiveContent(c) {
    try {
        const sheets = new SheetsService(c.env);
        const user = c.get('user');
        const status = c.req.query('status');

        const config = await ensureConfig(sheets);

        await ensureSheet(sheets, 'Give_Methods', GIVE_METHOD_HEADERS, DEFAULT_METHODS);
        await ensureSheet(sheets, 'Give_Impacts', GIVE_IMPACT_HEADERS, DEFAULT_IMPACTS);

        let methods = await sheets.read('Give_Methods');
        let impacts = await sheets.read('Give_Impacts');

        methods = filterPublic(methods, user, status).sort(
            (a, b) => normalizeOrder(a.order) - normalizeOrder(b.order),
        );
        impacts = filterPublic(impacts, user, status).sort(
            (a, b) => normalizeOrder(a.order) - normalizeOrder(b.order),
        );

        return c.json({
            config,
            methods,
            impacts,
        });
    } catch (error) {
        console.error('Get give content error:', error);
        return c.json({ error: '取得奉獻資訊失敗' }, 500);
    }
}

export async function updateGiveConfig(c) {
    try {
        const data = await c.req.json();
        const sheets = new SheetsService(c.env);
        const headers = await ensureSheet(sheets, 'Give_Config', GIVE_CONFIG_HEADERS);
        const config = await ensureConfig(sheets);
        const updated = {
            ...config,
            ...data,
            updated_at: new Date().toISOString(),
            updated_by: c.get('user')?.id || 'system',
        };
        await sheets.update('Give_Config', 0, headers.map((header) => updated[header] ?? ''));
        return c.json({ message: '奉獻設定已更新', config: updated });
    } catch (error) {
        console.error('Update give config error:', error);
        return c.json({ error: '更新奉獻設定失敗' }, 500);
    }
}

export async function createGiveMethod(c) {
    try {
        const data = await c.req.json();
        const sheets = new SheetsService(c.env);
        const headers = await ensureSheet(sheets, 'Give_Methods', GIVE_METHOD_HEADERS, DEFAULT_METHODS);
        const now = new Date().toISOString();

        const method = {
            id: uuidv4(),
            title: data.title || '',
            details: Array.isArray(data.details) ? data.details.join('\n') : data.details || '',
            status: data.status || 'published',
            order: data.order !== undefined ? normalizeOrder(data.order) : now,
            updated_at: now,
        };
        await sheets.append('Give_Methods', headers.map((header) => method[header] ?? ''));

        return c.json({ message: '奉獻方式已新增', method }, 201);
    } catch (error) {
        console.error('Create give method error:', error);
        return c.json({ error: '新增奉獻方式失敗' }, 500);
    }
}

export async function updateGiveMethod(c) {
    try {
        const { id } = c.req.param();
        const data = await c.req.json();
        const sheets = new SheetsService(c.env);
        const headers = await ensureSheet(sheets, 'Give_Methods', GIVE_METHOD_HEADERS, DEFAULT_METHODS);
        const methods = await sheets.read('Give_Methods');
        const method = methods.find((item) => item.id === id);

        if (!method) {
            return c.json({ error: '奉獻方式不存在' }, 404);
        }

        const updated = {
            ...method,
            ...data,
            details: data.details
                ? Array.isArray(data.details)
                    ? data.details.join('\n')
                    : data.details
                : method.details,
            order: data.order !== undefined ? normalizeOrder(data.order) : method.order,
            updated_at: new Date().toISOString(),
        };

        const rowIndex = methods.findIndex((item) => item.id === id);
        await sheets.update('Give_Methods', rowIndex, headers.map((header) => updated[header] ?? ''));

        return c.json({ message: '奉獻方式已更新', method: updated });
    } catch (error) {
        console.error('Update give method error:', error);
        return c.json({ error: '更新奉獻方式失敗' }, 500);
    }
}

export async function deleteGiveMethod(c) {
    try {
        const { id } = c.req.param();
        const sheets = new SheetsService(c.env);
        const headers = await ensureSheet(sheets, 'Give_Methods', GIVE_METHOD_HEADERS, DEFAULT_METHODS);
        const methods = await sheets.read('Give_Methods');
        const method = methods.find((item) => item.id === id);

        if (!method) {
            return c.json({ error: '奉獻方式不存在' }, 404);
        }

        const updated = {
            ...method,
            status: 'deleted',
            updated_at: new Date().toISOString(),
        };
        const rowIndex = methods.findIndex((item) => item.id === id);
        await sheets.update('Give_Methods', rowIndex, headers.map((header) => updated[header] ?? ''));

        return c.json({ message: '奉獻方式已刪除' });
    } catch (error) {
        console.error('Delete give method error:', error);
        return c.json({ error: '刪除奉獻方式失敗' }, 500);
    }
}

export async function createGiveImpact(c) {
    try {
        const data = await c.req.json();
        const sheets = new SheetsService(c.env);
        const headers = await ensureSheet(sheets, 'Give_Impacts', GIVE_IMPACT_HEADERS, DEFAULT_IMPACTS);
        const now = new Date().toISOString();

        const impact = {
            id: uuidv4(),
            label: data.label || '',
            value: data.value || '',
            description: data.description || '',
            status: data.status || 'published',
            order: data.order !== undefined ? normalizeOrder(data.order) : now,
            updated_at: now,
        };

        await sheets.append('Give_Impacts', headers.map((header) => impact[header] ?? ''));
        return c.json({ message: '奉獻分配已新增', impact }, 201);
    } catch (error) {
        console.error('Create give impact error:', error);
        return c.json({ error: '新增奉獻分配失敗' }, 500);
    }
}

export async function updateGiveImpact(c) {
    try {
        const { id } = c.req.param();
        const data = await c.req.json();
        const sheets = new SheetsService(c.env);
        const headers = await ensureSheet(sheets, 'Give_Impacts', GIVE_IMPACT_HEADERS, DEFAULT_IMPACTS);
        const impacts = await sheets.read('Give_Impacts');
        const impact = impacts.find((item) => item.id === id);

        if (!impact) {
            return c.json({ error: '奉獻分配不存在' }, 404);
        }

        const updated = {
            ...impact,
            ...data,
            order: data.order !== undefined ? normalizeOrder(data.order) : impact.order,
            updated_at: new Date().toISOString(),
        };

        const rowIndex = impacts.findIndex((item) => item.id === id);
        await sheets.update('Give_Impacts', rowIndex, headers.map((header) => updated[header] ?? ''));
        return c.json({ message: '奉獻分配已更新', impact: updated });
    } catch (error) {
        console.error('Update give impact error:', error);
        return c.json({ error: '更新奉獻分配失敗' }, 500);
    }
}

export async function deleteGiveImpact(c) {
    try {
        const { id } = c.req.param();
        const sheets = new SheetsService(c.env);
        const headers = await ensureSheet(sheets, 'Give_Impacts', GIVE_IMPACT_HEADERS, DEFAULT_IMPACTS);
        const impacts = await sheets.read('Give_Impacts');
        const impact = impacts.find((item) => item.id === id);

        if (!impact) {
            return c.json({ error: '奉獻分配不存在' }, 404);
        }

        const updated = {
            ...impact,
            status: 'deleted',
            updated_at: new Date().toISOString(),
        };
        const rowIndex = impacts.findIndex((item) => item.id === id);
        await sheets.update('Give_Impacts', rowIndex, headers.map((header) => updated[header] ?? ''));
        return c.json({ message: '奉獻分配已刪除' });
    } catch (error) {
        console.error('Delete give impact error:', error);
        return c.json({ error: '刪除奉獻分配失敗' }, 500);
    }
}


