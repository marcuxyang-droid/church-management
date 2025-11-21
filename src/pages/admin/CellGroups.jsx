import { useEffect, useMemo, useState } from 'react';
import { api } from '../../utils/api';

const columns = [
    { key: 'name', label: '小組名稱' },
    { key: 'leader_id', label: '小組長' },
    { key: 'meeting_time', label: '聚會時間' },
    { key: 'location', label: '地點' },
    { key: 'status', label: '狀態' },
];

export default function CellGroups() {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await api.getCellGroups({ status: statusFilter !== 'all' ? statusFilter : undefined });
            setGroups(data.groups || []);
        } catch (err) {
            setError(err.message || '無法取得小組資料');
        } finally {
            setLoading(false);
        }
    };

    const filteredGroups = useMemo(() => {
        if (!search.trim()) return groups;
        const keyword = search.trim().toLowerCase();
        return groups.filter((group) =>
            [group.name, group.location, group.meeting_time]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(keyword)),
        );
    }, [groups, search]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-4xl font-bold">小組管理</h1>
                    <p className="text-text-secondary mt-2">
                        目前共有 {groups.length} 個小組
                    </p>
                </div>
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <input
                        type="search"
                        placeholder="搜尋小組名稱或地點"
                        className="input max-w-md"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                        className="input"
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            fetchGroups();
                        }}
                    >
                        <option value="all">全部狀態</option>
                        <option value="active">進行中</option>
                        <option value="inactive">暫停</option>
                    </select>
                    <button className="btn btn-outline" onClick={fetchGroups} disabled={loading}>
                        重新整理
                    </button>
                    <button className="btn btn-primary">新增小組</button>
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
                ) : filteredGroups.length === 0 ? (
                    <p className="text-text-secondary">沒有符合條件的小組</p>
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
                            {filteredGroups.map((group) => (
                                <tr
                                    key={group.id}
                                    className="border-b border-border last:border-b-0 hover:bg-bg-tertiary/50"
                                >
                                    {columns.map((column) => (
                                        <td key={column.key} className="py-3 pr-4">
                                            {formatCell(group[column.key], column.key)}
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
    if (key === 'status') {
        const map = {
            active: '進行中',
            inactive: '暫停',
        };
        return map[value] || value;
    }
    return value;
}
