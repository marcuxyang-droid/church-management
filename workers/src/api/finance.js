import { SheetsService } from '../services/sheets.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Finance API endpoints
 */

export async function getFinanceTransactions(c) {
    try {
        const { type, category, start_date, end_date } = c.req.query();
        const sheets = new SheetsService(c.env);
        let transactions = await sheets.read('Finance_Transactions');

        if (type) {
            transactions = transactions.filter(t => t.type === type);
        }

        if (category) {
            transactions = transactions.filter(t => t.category === category);
        }

        if (start_date) {
            transactions = transactions.filter(t => new Date(t.date) >= new Date(start_date));
        }

        if (end_date) {
            transactions = transactions.filter(t => new Date(t.date) <= new Date(end_date));
        }

        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        const total = transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

        return c.json({
            transactions,
            total,
            count: transactions.length,
        });
    } catch (error) {
        console.error('Get finance transactions error:', error);
        return c.json({ error: '獲取財務記錄失敗' }, 500);
    }
}

export async function getFinanceTransaction(c) {
    try {
        const { id } = c.req.param();
        const sheets = new SheetsService(c.env);
        const transaction = await sheets.findById('Finance_Transactions', id);

        if (!transaction) {
            return c.json({ error: '財務記錄不存在' }, 404);
        }

        return c.json({ transaction });
    } catch (error) {
        console.error('Get finance transaction error:', error);
        return c.json({ error: '獲取財務記錄失敗' }, 500);
    }
}

export async function createFinanceTransaction(c) {
    try {
        const data = await c.req.json();
        const user = c.get('user');

        const sheets = new SheetsService(c.env);
        const transaction = {
            id: uuidv4(),
            type: data.type,
            category: data.category || '',
            amount: parseFloat(data.amount),
            date: data.date || new Date().toISOString().split('T')[0],
            description: data.description || '',
            receipt_url: data.receipt_url || '',
            approved_by: data.approved_by || '',
            created_by: user.id,
            created_at: new Date().toISOString(),
        };

        await sheets.append('Finance_Transactions', Object.values(transaction));

        return c.json({
            message: '財務記錄建立成功',
            transaction,
        });
    } catch (error) {
        console.error('Create finance transaction error:', error);
        return c.json({ error: '建立財務記錄失敗' }, 500);
    }
}

export async function updateFinanceTransaction(c) {
    try {
        const { id } = c.req.param();
        const data = await c.req.json();

        const sheets = new SheetsService(c.env);
        const transaction = await sheets.findById('Finance_Transactions', id);

        if (!transaction) {
            return c.json({ error: '財務記錄不存在' }, 404);
        }

        const updatedTransaction = {
            ...transaction,
            ...data,
            amount: data.amount ? parseFloat(data.amount) : transaction.amount,
        };

        const transactions = await sheets.read('Finance_Transactions');
        const rowIndex = transactions.findIndex(t => t.id === id);
        await sheets.update('Finance_Transactions', rowIndex, Object.values(updatedTransaction));

        return c.json({
            message: '財務記錄更新成功',
            transaction: updatedTransaction,
        });
    } catch (error) {
        console.error('Update finance transaction error:', error);
        return c.json({ error: '更新財務記錄失敗' }, 500);
    }
}

export async function deleteFinanceTransaction(c) {
    try {
        const { id } = c.req.param();
        const sheets = new SheetsService(c.env);
        await sheets.delete('Finance_Transactions', id);
        return c.json({ message: '財務記錄刪除成功' });
    } catch (error) {
        console.error('Delete finance transaction error:', error);
        return c.json({ error: '刪除財務記錄失敗' }, 500);
    }
}

