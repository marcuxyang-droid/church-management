import { SheetsService } from '../services/sheets.js';
import { Validator } from '../utils/validation.js';
import { filterSensitiveFields, canAccessMember } from '../middleware/rbac.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Members API endpoints
 */

/**
 * Get all members
 * GET /api/members
 */
export async function getMembers(c) {
    try {
        const user = c.get('user');
        const { status, faith_status, cell_group_id, search } = c.req.query();

        const sheets = new SheetsService(c.env);
        let members = await sheets.read('Members');

        // Filter by status
        if (status) {
            members = members.filter(m => m.status === status);
        } else {
            // Default: exclude deleted members
            members = members.filter(m => m.status !== 'deleted');
        }

        // Filter by faith status
        if (faith_status) {
            members = members.filter(m => m.faith_status === faith_status);
        }

        // Filter by cell group
        if (cell_group_id) {
            members = members.filter(m => m.cell_group_id === cell_group_id);
        }

        // Search by name, email, or phone
        if (search) {
            const searchLower = search.toLowerCase();
            members = members.filter(m =>
                m.name.toLowerCase().includes(searchLower) ||
                m.email.toLowerCase().includes(searchLower) ||
                m.phone.includes(search)
            );
        }

        // Filter sensitive fields based on user role
        members = members.map(m => filterSensitiveFields(m, user));

        return c.json({
            members,
            total: members.length,
        });
    } catch (error) {
        console.error('Get members error:', error);
        return c.json({ error: '獲取會員列表失敗' }, 500);
    }
}

/**
 * Get single member
 * GET /api/members/:id
 */
export async function getMember(c) {
    try {
        const user = c.get('user');
        const { id } = c.req.param();

        const sheets = new SheetsService(c.env);
        const member = await sheets.findById('Members', id);

        if (!member) {
            return c.json({ error: '會員不存在' }, 404);
        }

        // Check access permissions
        if (!canAccessMember(user, member)) {
            return c.json({ error: '權限不足' }, 403);
        }

        // Filter sensitive fields
        const filteredMember = filterSensitiveFields(member, user);

        return c.json({ member: filteredMember });
    } catch (error) {
        console.error('Get member error:', error);
        return c.json({ error: '獲取會員資訊失敗' }, 500);
    }
}

/**
 * Create new member
 * POST /api/members
 */
export async function createMember(c) {
    try {
        const data = await c.req.json();

        // Validate input
        const validation = Validator.validateMember(data);
        if (!validation.isValid) {
            return c.json({ error: '資料驗證失敗', errors: validation.errors }, 400);
        }

        // Sanitize input
        const sanitized = Validator.sanitizeObject(data);

        const sheets = new SheetsService(c.env);

        // Create member object
        const member = {
            id: uuidv4(),
            name: sanitized.name,
            gender: sanitized.gender || '',
            birthday: sanitized.birthday || '',
            phone: sanitized.phone || '',
            email: sanitized.email || '',
            address: sanitized.address || '',
            join_date: sanitized.join_date || new Date().toISOString().split('T')[0],
            baptism_date: sanitized.baptism_date || '',
            faith_status: sanitized.faith_status || 'newcomer',
            family_id: sanitized.family_id || '',
            cell_group_id: sanitized.cell_group_id || '',
            status: 'active',
            tags: sanitized.tags || '',
            health_notes: sanitized.health_notes || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        await sheets.append('Members', Object.values(member));

        return c.json({
            message: '會員建立成功',
            member: filterSensitiveFields(member, c.get('user')),
        }, 201);
    } catch (error) {
        console.error('Create member error:', error);
        return c.json({ error: '建立會員失敗' }, 500);
    }
}

/**
 * Update member
 * PUT /api/members/:id
 */
export async function updateMember(c) {
    try {
        const user = c.get('user');
        const { id } = c.req.param();
        const data = await c.req.json();

        const sheets = new SheetsService(c.env);
        const member = await sheets.findById('Members', id);

        if (!member) {
            return c.json({ error: '會員不存在' }, 404);
        }

        // Check access permissions
        if (!canAccessMember(user, member)) {
            return c.json({ error: '權限不足' }, 403);
        }

        // Validate input
        const validation = Validator.validateMember(data);
        if (!validation.isValid) {
            return c.json({ error: '資料驗證失敗', errors: validation.errors }, 400);
        }

        // Sanitize input
        const sanitized = Validator.sanitizeObject(data);

        // Update member object
        const updatedMember = {
            ...member,
            ...sanitized,
            id: member.id, // Preserve ID
            created_at: member.created_at, // Preserve creation date
            updated_at: new Date().toISOString(),
        };

        // Find row index and update
        const members = await sheets.read('Members');
        const rowIndex = members.findIndex(m => m.id === id);
        await sheets.update('Members', rowIndex, Object.values(updatedMember));

        return c.json({
            message: '會員更新成功',
            member: filterSensitiveFields(updatedMember, user),
        });
    } catch (error) {
        console.error('Update member error:', error);
        return c.json({ error: '更新會員失敗' }, 500);
    }
}

/**
 * Delete member (soft delete)
 * DELETE /api/members/:id
 */
export async function deleteMember(c) {
    try {
        const { id } = c.req.param();

        const sheets = new SheetsService(c.env);
        await sheets.delete('Members', id);

        return c.json({ message: '會員已刪除' });
    } catch (error) {
        console.error('Delete member error:', error);
        return c.json({ error: '刪除會員失敗' }, 500);
    }
}
