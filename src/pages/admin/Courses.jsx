import { useEffect, useMemo, useState } from 'react';
import { api } from '../../utils/api';

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
                    <button className="btn btn-primary">新增課程</button>
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
