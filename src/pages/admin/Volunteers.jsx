import { useEffect, useMemo, useState } from 'react';
import { api } from '../../utils/api';

const columns = [
    { key: 'member_id', label: '會友 ID' },
    { key: 'team', label: '團隊' },
    { key: 'role', label: '角色' },
    { key: 'status', label: '狀態' },
    { key: 'joined_at', label: '加入日期' },
];

export default function Volunteers() {
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [teamFilter, setTeamFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchVolunteers();
    }, []);

    const fetchVolunteers = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {};
            if (teamFilter !== 'all') params.team = teamFilter;
            if (statusFilter !== 'all') params.status = statusFilter;
            const data = await api.getVolunteers(params);
            setVolunteers(data.volunteers || []);
        } catch (err) {
            setError(err.message || '無法取得志工資料');
        } finally {
            setLoading(false);
        }
    };

    const filteredVolunteers = useMemo(() => {
        if (!search.trim()) return volunteers;
        const keyword = search.trim().toLowerCase();
        return volunteers.filter((volunteer) =>
            [volunteer.team, volunteer.role, volunteer.member_id]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(keyword)),
        );
    }, [volunteers, search]);

    const teams = useMemo(() => {
        const uniqueTeams = [...new Set(volunteers.map(v => v.team).filter(Boolean))];
        return uniqueTeams;
    }, [volunteers]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-4xl font-bold">志工管理</h1>
                    <p className="text-text-secondary mt-2">
                        目前共有 {volunteers.length} 位志工
                    </p>
                </div>
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <input
                        type="search"
                        placeholder="搜尋團隊或角色"
                        className="input max-w-md"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                        className="input"
                        value={teamFilter}
                        onChange={(e) => {
                            setTeamFilter(e.target.value);
                            fetchVolunteers();
                        }}
                    >
                        <option value="all">全部團隊</option>
                        {teams.map(team => (
                            <option key={team} value={team}>{team}</option>
                        ))}
                    </select>
                    <select
                        className="input"
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            fetchVolunteers();
                        }}
                    >
                        <option value="all">全部狀態</option>
                        <option value="active">進行中</option>
                        <option value="inactive">暫停</option>
                    </select>
                    <button className="btn btn-outline" onClick={fetchVolunteers} disabled={loading}>
                        重新整理
                    </button>
                    <button className="btn btn-primary">新增志工</button>
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
                ) : filteredVolunteers.length === 0 ? (
                    <p className="text-text-secondary">沒有符合條件的志工</p>
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
                            {filteredVolunteers.map((volunteer) => (
                                <tr
                                    key={volunteer.id}
                                    className="border-b border-border last:border-b-0 hover:bg-bg-tertiary/50"
                                >
                                    {columns.map((column) => (
                                        <td key={column.key} className="py-3 pr-4">
                                            {formatCell(volunteer[column.key], column.key)}
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
    if (key === 'joined_at') {
        return new Date(value).toLocaleDateString('zh-TW');
    }
    if (key === 'status') {
        const map = {
            active: '進行中',
            inactive: '暫停',
        };
        return map[value] || value;
    }
    return value;
}
