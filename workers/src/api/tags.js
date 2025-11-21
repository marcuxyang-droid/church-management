import { SheetsService } from '../services/sheets.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Tags API endpoints
 */

export async function getTags(c) {
    try {
        const { category, status } = c.req.query();
        const sheets = new SheetsService(c.env);
        let tags = await sheets.read('Tags');

        if (category) {
            tags = tags.filter(t => t.category === category);
        }

        if (status) {
            tags = tags.filter(t => t.status === status);
        } else {
            tags = tags.filter(t => t.status !== 'deleted');
        }

        tags.sort((a, b) => a.name.localeCompare(b.name));

        return c.json({
            tags,
            total: tags.length,
        });
    } catch (error) {
        console.error('Get tags error:', error);
        return c.json({ error: '獲取標籤列表失敗' }, 500);
    }
}

export async function getTag(c) {
    try {
        const { id } = c.req.param();
        const sheets = new SheetsService(c.env);
        const tag = await sheets.findById('Tags', id);

        if (!tag) {
            return c.json({ error: '標籤不存在' }, 404);
        }

        return c.json({ tag });
    } catch (error) {
        console.error('Get tag error:', error);
        return c.json({ error: '獲取標籤失敗' }, 500);
    }
}

export async function createTag(c) {
    try {
        const data = await c.req.json();
        const sheets = new SheetsService(c.env);

        const tag = {
            id: uuidv4(),
            name: data.name,
            category: data.category || 'general',
            color: data.color || '#3b82f6',
            description: data.description || '',
            status: 'active',
            created_at: new Date().toISOString(),
        };

        await sheets.append('Tags', Object.values(tag));

        return c.json({
            message: '標籤建立成功',
            tag,
        });
    } catch (error) {
        console.error('Create tag error:', error);
        return c.json({ error: '建立標籤失敗' }, 500);
    }
}

export async function updateTag(c) {
    try {
        const { id } = c.req.param();
        const data = await c.req.json();

        const sheets = new SheetsService(c.env);
        const tag = await sheets.findById('Tags', id);

        if (!tag) {
            return c.json({ error: '標籤不存在' }, 404);
        }

        const updatedTag = {
            ...tag,
            ...data,
        };

        const tags = await sheets.read('Tags');
        const rowIndex = tags.findIndex(t => t.id === id);
        await sheets.update('Tags', rowIndex, Object.values(updatedTag));

        return c.json({
            message: '標籤更新成功',
            tag: updatedTag,
        });
    } catch (error) {
        console.error('Update tag error:', error);
        return c.json({ error: '更新標籤失敗' }, 500);
    }
}

export async function deleteTag(c) {
    try {
        const { id } = c.req.param();
        const sheets = new SheetsService(c.env);
        await sheets.delete('Tags', id);
        return c.json({ message: '標籤刪除成功' });
    } catch (error) {
        console.error('Delete tag error:', error);
        return c.json({ error: '刪除標籤失敗' }, 500);
    }
}

/**
 * Get tag rules
 * GET /api/tags/rules
 */
export async function getTagRules(c) {
    try {
        const { status } = c.req.query();
        const sheets = new SheetsService(c.env);
        let rules = await sheets.read('Tag_Rules');

        if (status) {
            rules = rules.filter(r => r.status === status);
        } else {
            rules = rules.filter(r => r.status !== 'deleted');
        }

        rules.sort((a, b) => a.priority - b.priority);

        return c.json({
            rules,
            total: rules.length,
        });
    } catch (error) {
        console.error('Get tag rules error:', error);
        return c.json({ error: '獲取標籤規則失敗' }, 500);
    }
}

/**
 * Create tag rule
 * POST /api/tags/rules
 */
export async function createTagRule(c) {
    try {
        const data = await c.req.json();
        const sheets = new SheetsService(c.env);

        // Verify tag exists
        const tag = await sheets.findById('Tags', data.tag_id);
        if (!tag) {
            return c.json({ error: '標籤不存在' }, 400);
        }

        const rule = {
            id: uuidv4(),
            name: data.name,
            tag_id: data.tag_id,
            condition_type: data.condition_type, // 'field', 'date', 'custom'
            condition_field: data.condition_field || '',
            condition_operator: data.condition_operator || 'equals', // equals, contains, greater_than, less_than
            condition_value: data.condition_value || '',
            priority: data.priority || 0,
            status: data.status || 'active',
            created_at: new Date().toISOString(),
        };

        await sheets.append('Tag_Rules', Object.values(rule));

        return c.json({
            message: '標籤規則建立成功',
            rule,
        });
    } catch (error) {
        console.error('Create tag rule error:', error);
        return c.json({ error: '建立標籤規則失敗' }, 500);
    }
}

/**
 * Update tag rule
 * PUT /api/tags/rules/:id
 */
export async function updateTagRule(c) {
    try {
        const { id } = c.req.param();
        const data = await c.req.json();

        const sheets = new SheetsService(c.env);
        const rule = await sheets.findById('Tag_Rules', id);

        if (!rule) {
            return c.json({ error: '標籤規則不存在' }, 404);
        }

        const updatedRule = {
            ...rule,
            ...data,
        };

        const rules = await sheets.read('Tag_Rules');
        const rowIndex = rules.findIndex(r => r.id === id);
        await sheets.update('Tag_Rules', rowIndex, Object.values(updatedRule));

        return c.json({
            message: '標籤規則更新成功',
            rule: updatedRule,
        });
    } catch (error) {
        console.error('Update tag rule error:', error);
        return c.json({ error: '更新標籤規則失敗' }, 500);
    }
}

/**
 * Delete tag rule
 * DELETE /api/tags/rules/:id
 */
export async function deleteTagRule(c) {
    try {
        const { id } = c.req.param();
        const sheets = new SheetsService(c.env);
        await sheets.delete('Tag_Rules', id);
        return c.json({ message: '標籤規則刪除成功' });
    } catch (error) {
        console.error('Delete tag rule error:', error);
        return c.json({ error: '刪除標籤規則失敗' }, 500);
    }
}

/**
 * Apply auto-tagging rules to a member
 * POST /api/tags/apply/:memberId
 */
export async function applyAutoTags(c) {
    try {
        const { memberId } = c.req.param();
        const sheets = new SheetsService(c.env);

        // Get member
        const member = await sheets.findById('Members', memberId);
        if (!member) {
            return c.json({ error: '會員不存在' }, 404);
        }

        // Get active rules
        const rules = await sheets.read('Tag_Rules');
        const activeRules = rules.filter(r => r.status === 'active');
        activeRules.sort((a, b) => a.priority - b.priority);

        // Get all tags
        const tags = await sheets.read('Tags');
        const appliedTags = new Set((member.tags || '').split(',').filter(Boolean));

        // Apply rules
        for (const rule of activeRules) {
            const tag = tags.find(t => t.id === rule.tag_id);
            if (!tag) continue;

            let shouldApply = false;

            switch (rule.condition_type) {
                case 'field':
                    const fieldValue = member[rule.condition_field] || '';
                    switch (rule.condition_operator) {
                        case 'equals':
                            shouldApply = fieldValue === rule.condition_value;
                            break;
                        case 'contains':
                            shouldApply = String(fieldValue).toLowerCase().includes(rule.condition_value.toLowerCase());
                            break;
                        case 'greater_than':
                            shouldApply = Number(fieldValue) > Number(rule.condition_value);
                            break;
                        case 'less_than':
                            shouldApply = Number(fieldValue) < Number(rule.condition_value);
                            break;
                    }
                    break;
                case 'date':
                    const dateField = member[rule.condition_field] || '';
                    if (dateField) {
                        try {
                            const memberDate = new Date(dateField);
                            const now = new Date();
                            const daysDiff = Math.floor((now - memberDate) / (1000 * 60 * 60 * 24));
                            switch (rule.condition_operator) {
                                case 'greater_than':
                                    shouldApply = daysDiff > Number(rule.condition_value);
                                    break;
                                case 'less_than':
                                    shouldApply = daysDiff < Number(rule.condition_value);
                                    break;
                                case 'equals':
                                    shouldApply = daysDiff === Number(rule.condition_value);
                                    break;
                            }
                        } catch (e) {
                            console.error('Date parsing error:', e);
                        }
                    }
                    break;
            }

            if (shouldApply) {
                appliedTags.add(tag.id);
            }
        }

        // Update member tags
        const updatedMember = {
            ...member,
            tags: Array.from(appliedTags).join(','),
            updated_at: new Date().toISOString(),
        };

        const members = await sheets.read('Members');
        const rowIndex = members.findIndex(m => m.id === memberId);
        await sheets.update('Members', rowIndex, Object.values(updatedMember));

        return c.json({
            message: '自動貼標完成',
            appliedTags: Array.from(appliedTags),
        });
    } catch (error) {
        console.error('Apply auto tags error:', error);
        return c.json({ error: '自動貼標失敗' }, 500);
    }
}

