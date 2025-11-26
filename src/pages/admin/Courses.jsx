import { useEffect, useMemo, useState } from 'react';
import { api } from '../../utils/api';
import Modal from '../../components/Modal';

const columns = [
    { key: 'title', label: '課程名稱' },
    { key: 'instructor', label: '講師' },
    { key: 'start_date', label: '開始日期' },
    { key: 'end_date', label: '結束日期' },
    { key: 'capacity', label: '人數上限' },
    { key: 'status', label: '狀態' },
];

export default function Courses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        instructor: '',
        sessions: '',
        start_date: '',
        end_date: '',
        capacity: '',
        status: 'draft',
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await api.getCourses({ status: statusFilter !== 'all' ? statusFilter : undefined });
            setCourses(data.courses || []);
        } catch (err) {
            setError(err.message || '無法取得課程資料');
        } finally {
            setLoading(false);
        }
    };

    const filteredCourses = useMemo(() => {
        if (!search.trim()) return courses;
        const keyword = search.trim().toLowerCase();
        return courses.filter((course) =>
            [course.title, course.instructor, course.description]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(keyword)),
        );
    }, [courses, search]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            await api.createCourse(formData);
            setIsModalOpen(false);
            setFormData({
                title: '',
                description: '',
                instructor: '',
                sessions: '',
                start_date: '',
                end_date: '',
                capacity: '',
                status: 'draft',
            });
            fetchCourses();
        } catch (err) {
            setError(err.message || '建立課程失敗');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-4xl font-bold">課程管理</h1>
                    <p className="text-text-secondary mt-2">
                        目前共有 {courses.length} 門課程
                    </p>
                </div>
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <input
                        type="search"
                        placeholder="搜尋課程名稱或講師"
                        className="input max-w-md"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                        className="input"
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            fetchCourses();
                        }}
                    >
                        <option value="all">全部狀態</option>
                        <option value="draft">草稿</option>
                        <option value="published">已發布</option>
                        <option value="ongoing">進行中</option>
                        <option value="completed">已完成</option>
                    </select>
                    <button className="btn btn-outline" onClick={fetchCourses} disabled={loading}>
                        重新整理
                    </button>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>新增課程</button>
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
                ) : filteredCourses.length === 0 ? (
                    <p className="text-text-secondary">沒有符合條件的課程</p>
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
                            {filteredCourses.map((course) => (
                                <tr
                                    key={course.id}
                                    className="border-b border-border last:border-b-0 hover:bg-bg-tertiary/50"
                                >
                                    {columns.map((column) => (
                                        <td key={column.key} className="py-3 pr-4">
                                            {formatCell(course[column.key], column.key)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="新增課程">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">課程名稱 *</label>
                        <input
                            type="text"
                            className="input w-full"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">講師</label>
                        <input
                            type="text"
                            className="input w-full"
                            value={formData.instructor}
                            onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">課程描述</label>
                        <textarea
                            className="input w-full"
                            rows="3"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">開始日期</label>
                            <input
                                type="date"
                                className="input w-full"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">結束日期</label>
                            <input
                                type="date"
                                className="input w-full"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">節數</label>
                            <input
                                type="number"
                                className="input w-full"
                                value={formData.sessions}
                                onChange={(e) => setFormData({ ...formData, sessions: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">人數上限</label>
                            <input
                                type="number"
                                className="input w-full"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                            />
                        </div>
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
                            <option value="ongoing">進行中</option>
                            <option value="completed">已完成</option>
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
                            {submitting ? '建立中...' : '建立課程'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

function formatCell(value, key) {
    if (!value) return '-';
    if (key === 'start_date' || key === 'end_date') {
        return new Date(value).toLocaleDateString('zh-TW');
    }
    if (key === 'status') {
        const map = {
            draft: '草稿',
            published: '已發布',
            ongoing: '進行中',
            completed: '已完成',
        };
        return map[value] || value;
    }
    return value;
}
