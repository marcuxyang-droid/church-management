import { useEffect, useMemo, useState } from 'react';
import { api } from '../../utils/api';
import Modal from '../../components/Modal';

const columns = [
    { key: 'name', label: '姓名' },
    { key: 'gender', label: '性別' },
    { key: 'phone', label: '電話' },
    { key: 'email', label: '電子郵件' },
    { key: 'faith_status', label: '信仰狀態' },
    { key: 'tags', label: '標籤' },
    { key: 'cell_group_id', label: '小組' },
    { key: 'join_date', label: '加入日期' },
];

export default function Members() {
    const [members, setMembers] = useState([]);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        gender: '',
        birthday: '',
        phone: '',
        email: '',
        address: '',
        join_date: new Date().toISOString().split('T')[0],
        baptism_date: '',
        faith_status: 'newcomer',
        cell_group_id: '',
        tags: '',
        health_notes: '',
    });
    const [selectedTags, setSelectedTags] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchMembers();
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            const data = await api.getTags();
            setTags(data.tags || []);
        } catch (err) {
            console.error('Failed to fetch tags:', err);
        }
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const submitData = {
                ...formData,
                tags: selectedTags.join(','),
            };
            await api.createMember(submitData);
            setIsModalOpen(false);
            setFormData({
                name: '',
                gender: '',
                birthday: '',
                phone: '',
                email: '',
                address: '',
                join_date: new Date().toISOString().split('T')[0],
                baptism_date: '',
                faith_status: 'newcomer',
                cell_group_id: '',
                tags: '',
                health_notes: '',
            });
            setSelectedTags([]);
            fetchMembers();
        } catch (err) {
            setError(err.message || '建立會友失敗');
        } finally {
            setSubmitting(false);
        }
    };

    const handleApplyAutoTags = async (memberId) => {
        try {
            await api.applyAutoTags(memberId);
            fetchMembers();
        } catch (err) {
            setError(err.message || '自動貼標失敗');
        }
    };

    const getMemberTags = (member) => {
        if (!member.tags) return [];
        return member.tags.split(',').filter(Boolean);
    };

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
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>新增會友</button>
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
                                            {column.key === 'tags' ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {getMemberTags(member).map(tagId => {
                                                        const tag = tags.find(t => t.id === tagId);
                                                        if (!tag) return null;
                                                        return (
                                                            <span
                                                                key={tagId}
                                                                className="px-2 py-1 text-xs rounded"
                                                                style={{
                                                                    backgroundColor: tag.color + '20',
                                                                    color: tag.color,
                                                                    border: `1px solid ${tag.color}40`,
                                                                }}
                                                            >
                                                                {tag.name}
                                                            </span>
                                                        );
                                                    })}
                                                    <button
                                                        className="text-xs text-blue-600 hover:text-blue-800 ml-1"
                                                        onClick={() => handleApplyAutoTags(member.id)}
                                                        title="自動貼標"
                                                    >
                                                        +自動
                                                    </button>
                                                </div>
                                            ) : (
                                                formatCell(member[column.key], column.key)
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="新增會友">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">姓名 *</label>
                        <input
                            type="text"
                            className="input w-full"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">性別</label>
                            <select
                                className="input w-full"
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            >
                                <option value="">請選擇</option>
                                <option value="male">男</option>
                                <option value="female">女</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">生日</label>
                            <input
                                type="date"
                                className="input w-full"
                                value={formData.birthday}
                                onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">電話</label>
                            <input
                                type="tel"
                                className="input w-full"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">電子郵件</label>
                            <input
                                type="email"
                                className="input w-full"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">地址</label>
                        <input
                            type="text"
                            className="input w-full"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">加入日期</label>
                            <input
                                type="date"
                                className="input w-full"
                                value={formData.join_date}
                                onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">受洗日期</label>
                            <input
                                type="date"
                                className="input w-full"
                                value={formData.baptism_date}
                                onChange={(e) => setFormData({ ...formData, baptism_date: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">信仰狀態</label>
                            <select
                                className="input w-full"
                                value={formData.faith_status}
                                onChange={(e) => setFormData({ ...formData, faith_status: e.target.value })}
                            >
                                <option value="newcomer">新朋友</option>
                                <option value="seeker">慕道友</option>
                                <option value="baptized">受洗者</option>
                                <option value="transferred">轉會</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">小組 ID</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={formData.cell_group_id}
                                onChange={(e) => setFormData({ ...formData, cell_group_id: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">標籤</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {tags.map(tag => (
                                <label
                                    key={tag.id}
                                    className="flex items-center gap-2 px-3 py-1 rounded cursor-pointer border"
                                    style={{
                                        backgroundColor: selectedTags.includes(tag.id) ? tag.color + '20' : 'transparent',
                                        borderColor: tag.color + '40',
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedTags.includes(tag.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedTags([...selectedTags, tag.id]);
                                            } else {
                                                setSelectedTags(selectedTags.filter(id => id !== tag.id));
                                            }
                                        }}
                                        className="sr-only"
                                    />
                                    <div
                                        className="w-3 h-3 rounded"
                                        style={{ backgroundColor: tag.color }}
                                    />
                                    <span className="text-sm">{tag.name}</span>
                                </label>
                            ))}
                        </div>
                        {tags.length === 0 && (
                            <p className="text-sm text-gray-500">請先到「標籤管理」頁面創建標籤</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">健康備註</label>
                        <textarea
                            className="input w-full"
                            rows="3"
                            value={formData.health_notes}
                            onChange={(e) => setFormData({ ...formData, health_notes: e.target.value })}
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
                            {submitting ? '建立中...' : '建立會友'}
                        </button>
                    </div>
                </form>
            </Modal>
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
