import { SheetsService } from '../services/sheets.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Volunteers API endpoints
 */

export async function getVolunteers(c) {
    try {
        const { team, status, search } = c.req.query();
        const sheets = new SheetsService(c.env);
        let volunteers = await sheets.read('Volunteers');

        if (team) {
            volunteers = volunteers.filter(v => v.team === team);
        }

        if (status) {
            volunteers = volunteers.filter(v => v.status === status);
        }

        if (search) {
            const searchLower = search.toLowerCase();
            // Note: This is a simplified search - in production, you'd want to join with Members table
            volunteers = volunteers.filter(v =>
                (v.team && v.team.toLowerCase().includes(searchLower)) ||
                (v.role && v.role.toLowerCase().includes(searchLower))
            );
        }

        return c.json({
            volunteers,
            total: volunteers.length,
        });
    } catch (error) {
        console.error('Get volunteers error:', error);
        return c.json({ error: '獲取志工列表失敗' }, 500);
    }
}

export async function getVolunteer(c) {
    try {
        const { id } = c.req.param();
        const sheets = new SheetsService(c.env);
        const volunteer = await sheets.findById('Volunteers', id);

        if (!volunteer) {
            return c.json({ error: '志工不存在' }, 404);
        }

        return c.json({ volunteer });
    } catch (error) {
        console.error('Get volunteer error:', error);
        return c.json({ error: '獲取志工失敗' }, 500);
    }
}

export async function createVolunteer(c) {
    try {
        const data = await c.req.json();
        const sheets = new SheetsService(c.env);

        // Verify member exists
        const member = await sheets.findById('Members', data.member_id);
        if (!member) {
            return c.json({ error: '會員不存在' }, 400);
        }

        const volunteer = {
            id: uuidv4(),
            member_id: data.member_id,
            team: data.team,
            role: data.role || '',
            status: data.status || 'active',
            joined_at: new Date().toISOString(),
        };

        await sheets.append('Volunteers', Object.values(volunteer));

        return c.json({
            message: '志工建立成功',
            volunteer,
        });
    } catch (error) {
        console.error('Create volunteer error:', error);
        return c.json({ error: '建立志工失敗' }, 500);
    }
}

export async function updateVolunteer(c) {
    try {
        const { id } = c.req.param();
        const data = await c.req.json();

        const sheets = new SheetsService(c.env);
        const volunteer = await sheets.findById('Volunteers', id);

        if (!volunteer) {
            return c.json({ error: '志工不存在' }, 404);
        }

        const updatedVolunteer = {
            ...volunteer,
            ...data,
        };

        const volunteers = await sheets.read('Volunteers');
        const rowIndex = volunteers.findIndex(v => v.id === id);
        await sheets.update('Volunteers', rowIndex, Object.values(updatedVolunteer));

        return c.json({
            message: '志工更新成功',
            volunteer: updatedVolunteer,
        });
    } catch (error) {
        console.error('Update volunteer error:', error);
        return c.json({ error: '更新志工失敗' }, 500);
    }
}

export async function deleteVolunteer(c) {
    try {
        const { id } = c.req.param();
        const sheets = new SheetsService(c.env);
        await sheets.delete('Volunteers', id);
        return c.json({ message: '志工刪除成功' });
    } catch (error) {
        console.error('Delete volunteer error:', error);
        return c.json({ error: '刪除志工失敗' }, 500);
    }
}

