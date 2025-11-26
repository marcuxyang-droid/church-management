import { SheetsService } from '../services/sheets.js';
import { v4 as uuidv4 } from 'uuid';

const CELL_GROUP_HEADERS = [
    'id',
    'name',
    'leader_id',
    'co_leaders',
    'meeting_day',
    'meeting_time',
    'location',
    'status',
    'created_at',
    'updated_at',
];

const CELL_GROUP_SHEET_NAMES = ['Cell_Groups', 'Cell Groups'];

async function getCellGroupSheetInfo(sheets) {
    for (const sheetName of CELL_GROUP_SHEET_NAMES) {
        try {
            const headers = await sheets.getHeaders(sheetName);
            if (headers && headers.length > 0) {
                return { sheetName, headers };
            }
        } catch (error) {
            // Sheet not found, try next name
        }
    }

    await sheets.createSheet(CELL_GROUP_SHEET_NAMES[0], CELL_GROUP_HEADERS);
    return { sheetName: CELL_GROUP_SHEET_NAMES[0], headers: [...CELL_GROUP_HEADERS] };
}

/**
 * Cell Groups API endpoints
 */

export async function getCellGroups(c) {
    try {
        const { status, search } = c.req.query();
        const sheets = new SheetsService(c.env);
        const { sheetName } = await getCellGroupSheetInfo(sheets);
        let groups = await sheets.read(sheetName);
        console.log(`[Cell_Groups] fetched rows from "${sheetName}":`, groups.length);

        if (status && status !== 'undefined') {
            groups = groups.filter(g => g.status === status);
        }

        if (search) {
            const searchLower = search.toLowerCase();
            groups = groups.filter(g =>
                (g.name || '').toLowerCase().includes(searchLower)
            );
        }

        return c.json({
            groups,
            total: groups.length,
        });
    } catch (error) {
        console.error('Get cell groups error:', error);
        return c.json({ error: '獲取小組列表失敗' }, 500);
    }
}

export async function getCellGroup(c) {
    try {
        const { id } = c.req.param();
        const sheets = new SheetsService(c.env);
        const { sheetName } = await getCellGroupSheetInfo(sheets);
        const group = await sheets.findById(sheetName, id);

        if (!group) {
            return c.json({ error: '小組不存在' }, 404);
        }

        return c.json({ group });
    } catch (error) {
        console.error('Get cell group error:', error);
        return c.json({ error: '獲取小組失敗' }, 500);
    }
}

export async function createCellGroup(c) {
    try {
        const data = await c.req.json();
        const sheets = new SheetsService(c.env);
        const { sheetName, headers } = await getCellGroupSheetInfo(sheets);

        const group = {
            id: uuidv4(),
            name: data.name,
            leader_id: data.leader_id || '',
            co_leaders: data.co_leaders || '',
            meeting_day: data.meeting_day || '',
            meeting_time: data.meeting_time || '',
            location: data.location || '',
            status: data.status || 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const values = headers.map((header) => group[header] ?? '');
        await sheets.append(sheetName, values);

        return c.json({
            message: '小組建立成功',
            group,
        });
    } catch (error) {
        console.error('Create cell group error:', error);
        return c.json({ error: '建立小組失敗' }, 500);
    }
}

export async function updateCellGroup(c) {
    try {
        const { id } = c.req.param();
        const data = await c.req.json();

        const sheets = new SheetsService(c.env);
        const { sheetName, headers } = await getCellGroupSheetInfo(sheets);
        const group = await sheets.findById(sheetName, id);

        if (!group) {
            return c.json({ error: '小組不存在' }, 404);
        }

        const updatedGroup = {
            ...group,
            ...data,
            updated_at: new Date().toISOString(),
        };

        const groups = await sheets.read(sheetName);
        const rowIndex = groups.findIndex(g => g.id === id);
        const values = headers.map((header) => updatedGroup[header] ?? '');
        await sheets.update(sheetName, rowIndex, values);

        return c.json({
            message: '小組更新成功',
            group: updatedGroup,
        });
    } catch (error) {
        console.error('Update cell group error:', error);
        return c.json({ error: '更新小組失敗' }, 500);
    }
}

export async function deleteCellGroup(c) {
    try {
        const { id } = c.req.param();
        const sheets = new SheetsService(c.env);
        const { sheetName } = await getCellGroupSheetInfo(sheets);
        await sheets.delete(sheetName, id);
        return c.json({ message: '小組刪除成功' });
    } catch (error) {
        console.error('Delete cell group error:', error);
        return c.json({ error: '刪除小組失敗' }, 500);
    }
}

