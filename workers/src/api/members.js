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
        const { status, faith_status, cell_group_id, search, ids } = c.req.query();

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

        // Filter by ids
        if (ids) {
            const idList = ids
                .split(',')
                .map((id) => id.trim())
                .filter(Boolean);
            if (idList.length > 0) {
                const idSet = new Set(idList);
                members = members.filter((m) => idSet.has(m.id));
            }
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

        // Format phone number: add ' prefix if starts with 0 (for Google Sheets)
        let formattedPhone = sanitized.phone || '';
        if (formattedPhone && formattedPhone.startsWith('0') && !formattedPhone.startsWith("'")) {
            formattedPhone = "'" + formattedPhone;
        }

        // Create member object
        const member = {
            id: uuidv4(),
            name: sanitized.name,
            gender: sanitized.gender || '',
            birthday: sanitized.birthday || '',
            phone: formattedPhone,
            email: sanitized.email || '',
            address: sanitized.address || '',
            join_date: sanitized.join_date || new Date().toISOString().split('T')[0],
            baptism_date: sanitized.baptism_date || '',
            faith_status: sanitized.faith_status || 'newcomer',
            family_id: sanitized.family_id || '',
            cell_group_id: sanitized.cell_group_id || '',
            district: sanitized.district || '',
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

        // Normalize faith_status BEFORE merging to ensure valid values
        const validStatuses = ['newcomer', 'seeker', 'baptized', 'transferred'];
        
        // Normalize existing member's faith_status if invalid
        let normalizedMember = { ...member };
        if (normalizedMember.faith_status && !validStatuses.includes(normalizedMember.faith_status)) {
            console.warn(`Invalid faith_status in existing member: "${normalizedMember.faith_status}", normalizing to 'newcomer'`);
            normalizedMember.faith_status = 'newcomer';
        }
        if (!normalizedMember.faith_status || normalizedMember.faith_status.trim() === '') {
            normalizedMember.faith_status = 'newcomer';
        }
        
        // Normalize request data's faith_status if invalid
        let normalizedData = { ...data };
        if (normalizedData.faith_status !== undefined) {
            if (!normalizedData.faith_status || normalizedData.faith_status.trim() === '' || !validStatuses.includes(normalizedData.faith_status)) {
                console.warn(`Invalid faith_status in request: "${normalizedData.faith_status}", using existing value: "${normalizedMember.faith_status}"`);
                normalizedData.faith_status = normalizedMember.faith_status;
            }
        }
        
        // Merge with existing member data to ensure all required fields are present
        const mergedData = {
            ...normalizedMember,
            ...normalizedData,
            id: normalizedMember.id, // Preserve ID
            created_at: normalizedMember.created_at, // Preserve creation date
        };
        
        // Ensure required fields have valid defaults
        if (!mergedData.name || mergedData.name.trim() === '') {
            mergedData.name = normalizedMember.name || '';
        }
        
        // Final check: ensure faith_status is always valid
        if (!mergedData.faith_status || !validStatuses.includes(mergedData.faith_status)) {
            mergedData.faith_status = 'newcomer';
        }
        
        console.log('Normalized data:', {
            originalMemberFaithStatus: member.faith_status,
            requestFaithStatus: data.faith_status,
            normalizedMemberFaithStatus: normalizedMember.faith_status,
            normalizedDataFaithStatus: normalizedData.faith_status,
            finalMergedFaithStatus: mergedData.faith_status,
        });

        // Validate input
        const validation = Validator.validateMember(mergedData);
        if (!validation.isValid) {
            console.error('Member validation failed:', validation.errors);
            console.error('Member data:', JSON.stringify(mergedData, null, 2));
            console.error('Request data:', JSON.stringify(data, null, 2));
            return c.json({ error: '資料驗證失敗', errors: validation.errors }, 400);
        }

        // Sanitize input
        const sanitized = Validator.sanitizeObject(mergedData);

        // Update member object
        const updatedMember = {
            ...member,
            ...sanitized,
            id: member.id, // Preserve ID
            created_at: member.created_at, // Preserve creation date
            updated_at: new Date().toISOString(),
        };

        // Get headers to ensure correct field order
        const headers = await sheets.getHeaders('Members');
        const members = await sheets.read('Members');
        const rowIndex = members.findIndex(m => m.id === id);
        
        if (rowIndex === -1) {
            return c.json({ error: '會員不存在' }, 404);
        }
        
        // Build values array in the correct order based on headers
        const values = headers.map(header => {
            // Handle missing fields by providing empty string or existing value
            let value = updatedMember[header] !== undefined ? updatedMember[header] : '';
            // Convert to string and handle null/undefined
            value = value === null || value === undefined ? '' : String(value);
            
            // Format phone number: add ' prefix if starts with 0 (for Google Sheets)
            if (header === 'phone' && value && value.startsWith('0') && !value.startsWith("'")) {
                value = "'" + value;
            }
            
            return value;
        });
        
        console.log('Updating member:', {
            id: updatedMember.id,
            name: updatedMember.name,
            headers: headers,
            headersCount: headers.length,
            valuesCount: values.length,
            values: values,
            tags: updatedMember.tags,
            updatedMemberKeys: Object.keys(updatedMember),
        });
        
        // Verify all headers have corresponding values
        if (values.length !== headers.length) {
            console.error('Mismatch between headers and values:', {
                headersLength: headers.length,
                valuesLength: values.length,
                headers: headers,
                values: values,
            });
            return c.json({ error: '資料格式錯誤：欄位數量不匹配' }, 400);
        }
        
        await sheets.update('Members', rowIndex, values);

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
