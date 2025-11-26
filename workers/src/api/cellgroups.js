import { SheetsService } from '../services/sheets.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Cell Groups API endpoints
 */

export async function getCellGroups(c) {
    try {
        const { status, search } = c.req.query();
        const sheets = new SheetsService(c.env);
        let groups = await sheets.read('Cell_Groups');

        if (status) {
            groups = groups.filter(g => g.status === status);
        }

        if (search) {
            const searchLower = search.toLowerCase();
            groups = groups.filter(g =>
                g.name.toLowerCase().includes(searchLower)
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
        const group = await sheets.findById('Cell_Groups', id);

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

        const group = {
            id: uuidv4(),
            name: data.name,
            leader_id: data.leader_id || '',
            co_leaders: data.co_leaders || '',
            meeting_time: data.meeting_time || '',
            location: data.location || '',
            status: data.status || 'active',
            created_at: new Date().toISOString(),
        };

        await sheets.append('Cell_Groups', Object.values(group));

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
        const group = await sheets.findById('Cell_Groups', id);

        if (!group) {
            return c.json({ error: '小組不存在' }, 404);
        }

        const updatedGroup = {
            ...group,
            ...data,
        };

        const groups = await sheets.read('Cell_Groups');
        const rowIndex = groups.findIndex(g => g.id === id);
        await sheets.update('Cell_Groups', rowIndex, Object.values(updatedGroup));

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
        await sheets.delete('Cell_Groups', id);
        return c.json({ message: '小組刪除成功' });
    } catch (error) {
        console.error('Delete cell group error:', error);
        return c.json({ error: '刪除小組失敗' }, 500);
    }
}

