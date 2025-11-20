import { useEffect, useMemo, useState } from 'react';
import { api } from '../../utils/api';

const columns = [
    { key: 'name', label: '姓名' },
    { key: 'gender', label: '性別' },
    { key: 'phone', label: '電話' },
    { key: 'email', label: '電子郵件' },
    { key: 'faith_status', label: '信仰狀態' },
    { key: 'cell_group_id', label: '小組' },
    { key: 'join_date', label: '加入日期' },
];

export default function Members() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await api.getMembers();
            setMembers(data.members || []);
        } catch (err) {
            setError(err.message || '無法取得會友資料');
        } finally {
            setLoading(false);
        }
    };

    const filteredMembers = useMemo(() => {
        if (!search.trim()) return members;
        const keyword = search.trim().toLowerCase();
        return members.filter((member) =>
            [member.name, member.email, member.phone, member.cell_group_id]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(keyword)),
        );
    }, [members, search]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-4xl font-bold">會友管理</h1>
                    <p className="text-text-secondary mt-2">
                        目前共有 {members.length} 位會友
                    </p>
                </div>
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <input
                        type="search"
                        placeholder="搜尋姓名、電話或Email"
                        className="input max-w-md"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button className="btn btn-outline" onClick={fetchMembers} disabled={loading}>
                        重新整理
                    </button>
                    <button className="btn btn-primary">新增會友</button>
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
                ) : filteredMembers.length === 0 ? (
                    <p className="text-text-secondary">沒有符合條件的會友</p>
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
                            {filteredMembers.map((member) => (
                                <tr
                                    key={member.id}
                                    className="border-b border-border last:border-b-0 hover:bg-bg-tertiary/50"
                                >
                                    {columns.map((column) => (
                                        <td key={column.key} className="py-3 pr-4">
                                            {formatCell(member[column.key], column.key)}
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
    if (key === 'join_date') {
        return new Date(value).toLocaleDateString('zh-TW');
    }
    if (key === 'faith_status') {
        const map = {
            newcomer: '新朋友',
            seeker: '慕道友',
            baptized: '受洗者',
            transferred: '轉會',
        };
        return map[value] || value;
    }
    return value;
}
