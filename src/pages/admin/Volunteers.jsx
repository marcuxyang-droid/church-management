import { useEffect, useMemo, useState } from 'react';
import { api } from '../../utils/api';
import Modal from '../../components/Modal';

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        member_id: '',
        team: '',
        role: '',
        status: 'active',
    });
    const [submitting, setSubmitting] = useState(false);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            await api.createVolunteer(formData);
            setIsModalOpen(false);
            setFormData({ member_id: '', team: '', role: '', status: 'active' });
            fetchVolunteers();
        } catch (err) {
            setError(err.message || '建立志工失敗');
        } finally {
            setSubmitting(false);
        }
    };

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
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>新增志工</button>
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

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="新增志工">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">會友 ID *</label>
                        <input
                            type="text"
                            className="input w-full"
                            value={formData.member_id}
                            onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">團隊 *</label>
                            <input
                                type="text"
                                className="input w-full"
                                placeholder="例如：敬拜、招待"
                                value={formData.team}
                                onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
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
                            <option value="active">進行中</option>
                            <option value="inactive">暫停</option>
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
                            {submitting ? '建立中...' : '建立志工'}
                        </button>
                    </div>
                </form>
            </Modal>
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
