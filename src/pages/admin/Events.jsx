import { useEffect, useMemo, useState } from 'react';
import { api } from '../../utils/api';

const statusTheme = {
    draft: 'badge badge-warning',
    published: 'badge badge-success',
    closed: 'badge badge-error',
};

export default function Events() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchEvents();
    }, []);

    async function fetchEvents() {
        setLoading(true);
        setError('');
        try {
            const data = await api.getEvents();
            setEvents(data.events || []);
        } catch (err) {
            setError(err.message || '無法取得活動資料');
        } finally {
            setLoading(false);
        }
    }

    const filteredEvents = useMemo(() => {
        if (statusFilter === 'all') return events;
        return events.filter((event) => event.status === statusFilter);
    }, [events, statusFilter]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-4xl font-bold">活動管理</h1>
                    <p className="text-text-secondary mt-2">共 {events.length} 場活動</p>
                </div>
                <div className="flex flex-col gap-3 md:flex-row">
                    <select
                        className="input"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">所有狀態</option>
                        <option value="draft">草稿</option>
                        <option value="published">已發布</option>
                        <option value="closed">已結束</option>
                    </select>
                    <button className="btn btn-outline" onClick={fetchEvents} disabled={loading}>
                        重新整理
                    </button>
                    <button className="btn btn-primary">新增活動</button>
                </div>
            </div>

            <div className="card overflow-x-auto">
                {error && <div className="text-error mb-4">{error}</div>}
                {loading ? (
                    <div className="flex items-center gap-3 text-text-secondary">
                        <span className="spinner" />
                        載入中...
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <p className="text-text-secondary">目前沒有符合條件的活動</p>
                ) : (
                    <table className="min-w-full">
                        <thead>
                            <tr className="text-left text-text-secondary text-sm border-b border-border">
                                <th className="py-3 pr-4 font-medium">活動名稱</th>
                                <th className="py-3 pr-4 font-medium">時間</th>
                                <th className="py-3 pr-4 font-medium">地點</th>
                                <th className="py-3 pr-4 font-medium">人數上限</th>
                                <th className="py-3 pr-4 font-medium">狀態</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEvents.map((event) => (
                                <tr
                                    key={event.id}
                                    className="border-b border-border last:border-b-0 hover:bg-bg-tertiary/50"
                                >
                                    <td className="py-3 pr-4 font-semibold">{event.title}</td>
                                    <td className="py-3 pr-4">
                                        {formatEventDate(event.start_date, event.end_date)}
                                    </td>
                                    <td className="py-3 pr-4 text-text-secondary">{event.location || '-'}</td>
                                    <td className="py-3 pr-4">{event.capacity || '不限'}</td>
                                    <td className="py-3 pr-4">
                                        <span className={statusTheme[event.status] || 'badge'}>
                                            {translateStatus(event.status)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

function translateStatus(status) {
    switch (status) {
        case 'published':
            return '已發布';
        case 'draft':
            return '草稿';
        case 'closed':
            return '已結束';
        default:
            return status;
        }
}

function formatEventDate(start, end) {
    if (!start) return '-';
    const startDate = new Date(start).toLocaleString('zh-TW', { dateStyle: 'medium', timeStyle: 'short' });
    if (!end) return startDate;
    const endDate = new Date(end).toLocaleString('zh-TW', { dateStyle: 'medium', timeStyle: 'short' });
    return `${startDate} ~ ${endDate}`;
}
