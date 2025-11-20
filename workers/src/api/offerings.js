import { SheetsService } from '../services/sheets.js';
import { EmailService } from '../services/email.js';
import { Validator } from '../utils/validation.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Offerings API endpoints
 */

/**
 * Get all offerings
 * GET /api/offerings
 */
export async function getOfferings(c) {
    try {
        const { member_id, type, method, start_date, end_date } = c.req.query();

        const sheets = new SheetsService(c.env);
        let offerings = await sheets.read('Offerings');

        // Filter by member
        if (member_id) {
            offerings = offerings.filter(o => o.member_id === member_id);
        }

        // Filter by type
        if (type) {
            offerings = offerings.filter(o => o.type === type);
        }

        // Filter by method
        if (method) {
            offerings = offerings.filter(o => o.method === method);
        }

        // Filter by date range
        if (start_date) {
            offerings = offerings.filter(o => new Date(o.date) >= new Date(start_date));
        }
        if (end_date) {
            offerings = offerings.filter(o => new Date(o.date) <= new Date(end_date));
        }

        // Calculate total
        const total = offerings.reduce((sum, o) => sum + parseFloat(o.amount || 0), 0);

        return c.json({
            offerings,
            total,
            count: offerings.length,
        });
    } catch (error) {
        console.error('Get offerings error:', error);
        return c.json({ error: '獲取奉獻記錄失敗' }, 500);
    }
}

/**
 * Get single offering
 * GET /api/offerings/:id
 */
export async function getOffering(c) {
    try {
        const { id } = c.req.param();

        const sheets = new SheetsService(c.env);
        const offering = await sheets.findById('Offerings', id);

        if (!offering) {
            return c.json({ error: '奉獻記錄不存在' }, 404);
        }

        return c.json({ offering });
    } catch (error) {
        console.error('Get offering error:', error);
        return c.json({ error: '獲取奉獻記錄失敗' }, 500);
    }
}

/**
 * Create new offering
 * POST /api/offerings
 */
export async function createOffering(c) {
    try {
        const data = await c.req.json();

        // Validate input
        const validation = Validator.validateOffering(data);
        if (!validation.isValid) {
            return c.json({ error: '資料驗證失敗', errors: validation.errors }, 400);
        }

        const sheets = new SheetsService(c.env);

        // Verify member exists
        const member = await sheets.findById('Members', data.member_id);
        if (!member) {
            return c.json({ error: '會員不存在' }, 400);
        }

        // Create offering object
        const offering = {
            id: uuidv4(),
            member_id: data.member_id,
            amount: parseFloat(data.amount),
            type: data.type,
            method: data.method,
            transaction_id: data.transaction_id || '',
            date: data.date || new Date().toISOString().split('T')[0],
            receipt_sent: false,
            notes: data.notes || '',
            created_at: new Date().toISOString(),
        };

        await sheets.append('Offerings', Object.values(offering));

        // Send receipt email if member has email
        if (member.email) {
            try {
                const emailService = new EmailService(c.env);
                await emailService.sendOfferingReceipt(offering, member);

                // Update receipt_sent status
                const offerings = await sheets.read('Offerings');
                const rowIndex = offerings.findIndex(o => o.id === offering.id);
                offering.receipt_sent = true;
                await sheets.update('Offerings', rowIndex, Object.values(offering));
            } catch (emailError) {
                console.error('Failed to send receipt email:', emailError);
                // Continue even if email fails
            }
        }

        return c.json({
            message: '奉獻記錄建立成功',
            offering,
        }, 201);
    } catch (error) {
        console.error('Create offering error:', error);
        return c.json({ error: '建立奉獻記錄失敗' }, 500);
    }
}

/**
 * Update offering
 * PUT /api/offerings/:id
 */
export async function updateOffering(c) {
    try {
        const { id } = c.req.param();
        const data = await c.req.json();

        const sheets = new SheetsService(c.env);
        const offering = await sheets.findById('Offerings', id);

        if (!offering) {
            return c.json({ error: '奉獻記錄不存在' }, 404);
        }

        // Validate input
        const validation = Validator.validateOffering({ ...offering, ...data });
        if (!validation.isValid) {
            return c.json({ error: '資料驗證失敗', errors: validation.errors }, 400);
        }

        // Update offering object
        const updatedOffering = {
            ...offering,
            ...data,
            id: offering.id, // Preserve ID
            created_at: offering.created_at, // Preserve creation date
        };

        // Find row index and update
        const offerings = await sheets.read('Offerings');
        const rowIndex = offerings.findIndex(o => o.id === id);
        await sheets.update('Offerings', rowIndex, Object.values(updatedOffering));

        return c.json({
            message: '奉獻記錄更新成功',
            offering: updatedOffering,
        });
    } catch (error) {
        console.error('Update offering error:', error);
        return c.json({ error: '更新奉獻記錄失敗' }, 500);
    }
}

/**
 * Delete offering
 * DELETE /api/offerings/:id
 */
export async function deleteOffering(c) {
    try {
        const { id } = c.req.param();

        const sheets = new SheetsService(c.env);
        const offering = await sheets.findById('Offerings', id);

        if (!offering) {
            return c.json({ error: '奉獻記錄不存在' }, 404);
        }

        // Soft delete by updating status
        const offerings = await sheets.read('Offerings');
        const rowIndex = offerings.findIndex(o => o.id === id);
        offering.notes = `[已刪除] ${offering.notes}`;
        await sheets.update('Offerings', rowIndex, Object.values(offering));

        return c.json({ message: '奉獻記錄已刪除' });
    } catch (error) {
        console.error('Delete offering error:', error);
        return c.json({ error: '刪除奉獻記錄失敗' }, 500);
    }
}

/**
 * Get member's offerings
 * GET /api/offerings/member/:memberId
 */
export async function getMemberOfferings(c) {
    try {
        const { memberId } = c.req.param();
        const { year } = c.req.query();

        const sheets = new SheetsService(c.env);
        let offerings = await sheets.find('Offerings', { member_id: memberId });

        // Filter by year if provided
        if (year) {
            offerings = offerings.filter(o => {
                const offeringYear = new Date(o.date).getFullYear();
                return offeringYear === parseInt(year);
            });
        }

        // Calculate totals by type
        const totals = {
            tithe: 0,
            thanksgiving: 0,
            building: 0,
            special: 0,
            total: 0,
        };

        offerings.forEach(o => {
            const amount = parseFloat(o.amount || 0);
            totals[o.type] = (totals[o.type] || 0) + amount;
            totals.total += amount;
        });

        return c.json({
            offerings,
            totals,
            count: offerings.length,
        });
    } catch (error) {
        console.error('Get member offerings error:', error);
        return c.json({ error: '獲取會員奉獻記錄失敗' }, 500);
    }
}
