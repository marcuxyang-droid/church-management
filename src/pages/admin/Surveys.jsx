import { useEffect, useMemo, useState } from 'react';
import { api } from '../../utils/api';
import Modal from '../../components/Modal';

const columns = [
    { key: 'title', label: '問卷標題' },
    { key: 'status', label: '狀態' },
    { key: 'created_at', label: '建立日期' },
];

export default function Surveys() {
    const [surveys, setSurveys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'draft',
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchSurveys();
    }, []);

    const fetchSurveys = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await api.getSurveys({ status: statusFilter !== 'all' ? statusFilter : undefined });
            setSurveys(data.surveys || []);
        } catch (err) {
            setError(err.message || '無法取得問卷資料');
        } finally {
            setLoading(false);
        }
    };

    const filteredSurveys = useMemo(() => {
        if (!search.trim()) return surveys;
        const keyword = search.trim().toLowerCase();
        return surveys.filter((survey) =>
            [survey.title, survey.description]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(keyword)),
        );
    }, [surveys, search]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            await api.createSurvey(formData);
            setIsModalOpen(false);
            setFormData({ title: '', description: '', status: 'draft' });
            fetchSurveys();
        } catch (err) {
            setError(err.message || '建立問卷失敗');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-4xl font-bold">問卷管理</h1>
                    <p className="text-text-secondary mt-2">
                        目前共有 {surveys.length} 份問卷
                    </p>
                </div>
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <input
                        type="search"
                        placeholder="搜尋問卷標題"
                        className="input max-w-md"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                        className="input"
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            fetchSurveys();
                        }}
                    >
                        <option value="all">全部狀態</option>
                        <option value="draft">草稿</option>
                        <option value="published">已發布</option>
                        <option value="closed">已關閉</option>
                    </select>
                    <button className="btn btn-outline" onClick={fetchSurveys} disabled={loading}>
                        重新整理
                    </button>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>新增問卷</button>
                </div>
            </div>

            <div className="card overflow-x-auto">
                {error && (
                    <div className="text-error mb-4">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center gap-3 text-text-secondary">
                        <span className="spinner" />
                        載入中...
                    </div>
                ) : filteredSurveys.length === 0 ? (
                    <p className="text-text-secondary">沒有符合條件的問卷</p>
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
                            {filteredSurveys.map((survey) => (
                                <tr
                                    key={survey.id}
                                    className="border-b border-border last:border-b-0 hover:bg-bg-tertiary/50"
                                >
                                    {columns.map((column) => (
                                        <td key={column.key} className="py-3 pr-4">
                                            {formatCell(survey[column.key], column.key)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="新增問卷">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">問卷標題 *</label>
                        <input
                            type="text"
                            className="input w-full"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">問卷描述</label>
                        <textarea
                            className="input w-full"
                            rows="4"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">狀態</label>
                        <select
                            className="input w-full"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="draft">草稿</option>
                            <option value="published">已發布</option>
                            <option value="closed">已關閉</option>
                        </select>
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
                            {submitting ? '建立中...' : '建立問卷'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

function formatCell(value, key) {
    if (!value) return '-';
    if (key === 'created_at') {
        return new Date(value).toLocaleDateString('zh-TW');
    }
    if (key === 'status') {
        const map = {
            draft: '草稿',
            published: '已發布',
            closed: '已關閉',
        };
        return map[value] || value;
    }
    return value;
}
