import { useEffect, useMemo, useState } from 'react';
import { api } from '../../utils/api';
import Modal from '../../components/Modal';

const columns = [
    { key: 'date', label: '日期' },
    { key: 'type', label: '類型' },
    { key: 'category', label: '類別' },
    { key: 'amount', label: '金額' },
    { key: 'description', label: '說明' },
    { key: 'created_by', label: '建立人' },
];

export default function Finance() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        type: 'income',
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        receipt_url: '',
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {};
            if (typeFilter !== 'all') params.type = typeFilter;
            const data = await api.getFinanceTransactions(params);
            setTransactions(data.transactions || []);
        } catch (err) {
            setError(err.message || '無法取得財務記錄');
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = useMemo(() => {
        return transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    }, [transactions]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            await api.createFinanceTransaction(formData);
            setIsModalOpen(false);
            setFormData({
                type: 'income',
                category: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                description: '',
                receipt_url: '',
            });
            fetchTransactions();
        } catch (err) {
            setError(err.message || '建立財務記錄失敗');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-4xl font-bold">財務管理</h1>
                    <p className="text-text-secondary mt-2">
                        本次篩選共 {transactions.length} 筆，總計 NT$ {totalAmount.toLocaleString()}
                    </p>
                </div>
                <div className="flex flex-col gap-3 md:flex-row">
                    <select
                        className="input"
                        value={typeFilter}
                        onChange={(e) => {
                            setTypeFilter(e.target.value);
                            fetchTransactions();
                        }}
                    >
                        <option value="all">全部類型</option>
                        <option value="income">收入</option>
                        <option value="expense">支出</option>
                    </select>
                    <button className="btn btn-outline" onClick={fetchTransactions} disabled={loading}>
                        重新整理
                    </button>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>新增財務記錄</button>
                </div>
            </div>

            <div className="card overflow-x-auto">
                {error && <div className="text-error mb-4">{error}</div>}
                {loading ? (
                    <div className="flex items-center gap-3 text-text-secondary">
                        <span className="spinner" />
                        載入中...
                    </div>
                ) : transactions.length === 0 ? (
                    <p className="text-text-secondary">目前沒有財務記錄</p>
                ) : (
                    <table className="min-w-full">
                        <thead>
                            <tr className="text-left text-text-secondary text-sm border-b border-border">
                                {columns.map((column) => (
                                    <th key={column.key} className="py-3 pr-4 font-medium">
                                        {column.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((transaction) => (
                                <tr
                                    key={transaction.id}
                                    className="border-b border-border last:border-b-0 hover:bg-bg-tertiary/50"
                                >
                                    {columns.map((column) => (
                                        <td key={column.key} className="py-3 pr-4">
                                            {formatCell(transaction[column.key], column.key, transaction.type)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="新增財務記錄">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">類型 *</label>
                            <select
                                className="input w-full"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                required
                            >
                                <option value="income">收入</option>
                                <option value="expense">支出</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">類別</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">金額 *</label>
                            <input
                                type="number"
                                className="input w-full"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">日期 *</label>
                            <input
                                type="date"
                                className="input w-full"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">說明</label>
                        <textarea
                            className="input w-full"
                            rows="3"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">收據 URL</label>
                        <input
                            type="url"
                            className="input w-full"
                            value={formData.receipt_url}
                            onChange={(e) => setFormData({ ...formData, receipt_url: e.target.value })}
                        />
                    </div>
                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => setIsModalOpen(false)}
                            disabled={submitting}
                        >
                            取消
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? '建立中...' : '建立記錄'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

function formatCell(value, key, type) {
    if (!value) return '-';
    if (key === 'date') {
        return new Date(value).toLocaleDateString('zh-TW');
    }
    if (key === 'type') {
        const map = {
            income: '收入',
            expense: '支出',
        };
        return map[value] || value;
    }
    if (key === 'amount') {
        const amount = Number(value || 0);
        const colorClass = type === 'expense' ? 'text-error' : 'text-success';
        return <span className={colorClass}>NT$ {amount.toLocaleString()}</span>;
    }
    return value;
}
