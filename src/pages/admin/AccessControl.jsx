import { useEffect, useMemo, useState } from 'react';
import { api } from '../../utils/api';
import Modal from '../../components/Modal';
import { useAuthStore } from '../../store/auth';

const STATUS_BADGE = {
    active: 'badge badge-success',
    pending: 'badge badge-warning',
    disabled: 'badge badge-error',
};

export default function AccessControl() {
    const { hasPermission } = useAuthStore();
    const [roles, setRoles] = useState([]);
    const [permissionCatalog, setPermissionCatalog] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoleId, setSelectedRoleId] = useState('');
    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const [newRole, setNewRole] = useState({ name: '', description: '', permissions: [] });
    const [userModalOpen, setUserModalOpen] = useState(false);
    const [memberQuery, setMemberQuery] = useState('');
    const [memberResults, setMemberResults] = useState([]);
    const [inviteForm, setInviteForm] = useState({ member_id: '', email: '', role: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [roleRes, userRes] = await Promise.all([api.getRoles(), api.getUsers()]);
            setRoles(roleRes.roles || []);
            setPermissionCatalog(roleRes.permissionCatalog || []);
            setUsers(userRes.users || []);
            if (!selectedRoleId && roleRes.roles?.length) {
                setSelectedRoleId(roleRes.roles[0].id);
            }
        } finally {
            setLoading(false);
        }
    };

    const selectedRole = useMemo(() => roles.find((role) => role.id === selectedRoleId) || null, [roles, selectedRoleId]);

    const togglePermission = (key) => {
        if (!selectedRole) return;
        setRoles((prev) =>
            prev.map((role) => {
                if (role.id !== selectedRole.id) return role;
                const has = role.permissions?.includes(key);
                return {
                    ...role,
                    permissions: has
                        ? role.permissions.filter((perm) => perm !== key)
                        : [...(role.permissions || []), key],
                };
            }),
        );
    };

    const saveRolePermissions = async () => {
        if (!selectedRole) return;
        setSaving(true);
        try {
            await api.updateRole(selectedRole.id, {
                permissions: selectedRole.permissions || [],
                description: selectedRole.description || '',
            });
            await loadData();
        } finally {
            setSaving(false);
        }
    };

    const handleCreateRole = async () => {
        if (!newRole.name) return;
        setSaving(true);
        try {
            await api.createRole(newRole);
            setRoleModalOpen(false);
            setNewRole({ name: '', description: '', permissions: [] });
            await loadData();
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteRole = async (roleId) => {
        if (!window.confirm('確定要刪除此角色嗎？')) return;
        await api.deleteRole(roleId);
        await loadData();
    };

    const fetchMembers = async (query) => {
        if (!query || query.length < 2) {
            setMemberResults([]);
            return;
        }
        const result = await api.getMembers({ search: query });
        setMemberResults(result.members || []);
    };

    const handleInvite = async () => {
        if (!inviteForm.member_id || !inviteForm.email || !inviteForm.role) return;
        setSaving(true);
        try {
            await api.createUser(inviteForm);
            setInviteForm({ member_id: '', email: '', role: '' });
            setUserModalOpen(false);
            await loadData();
        } finally {
            setSaving(false);
        }
    };

    const handleUserRoleChange = async (userId, role) => {
        await api.updateUser(userId, { role });
        await loadData();
    };

    const handleResendVerification = async (userId) => {
        await api.resendVerification(userId);
    };

    if (loading) {
        return <div className="card">載入中...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">角色與權限</h2>
                    <p className="card-subtitle">調整每個角色可以使用的模組與操作權限</p>
                </div>
                <div className="flex flex-col gap-xl lg:flex-row">
                    <div className="w-full lg:w-1/4">
                        <div className="flex justify-between items-center mb-md">
                            <p className="text-sm text-text-tertiary">角色列表</p>
                            <button className="btn btn-ghost text-sm" onClick={() => setRoleModalOpen(true)} disabled={!hasPermission('roles:manage')}>
                                + 新增角色
                            </button>
                        </div>
                        <div className="flex flex-col gap-sm">
                            {roles.map((role) => (
                                <button
                                    key={role.id}
                                    className={`text-left rounded-lg border px-4 py-3 ${selectedRoleId === role.id ? 'border-primary bg-primary/5' : 'border-border'}`}
                                    onClick={() => setSelectedRoleId(role.id)}
                                >
                                    <div className="font-semibold">{role.name}</div>
                                    <p className="text-sm text-text-tertiary">{role.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="w-full lg:w-3/4">
                        {selectedRole && (
                            <>
                                <div className="flex items-center justify-between mb-lg">
                                    <div>
                                        <h3 className="text-xl font-bold">{selectedRole.name}</h3>
                                        <p className="text-text-tertiary">{selectedRole.description || '暫無描述'}</p>
                                    </div>
                                    {selectedRole.is_system_role !== 'true' && (
                                        <button className="btn btn-outline btn-sm" onClick={() => handleDeleteRole(selectedRole.id)}>
                                            刪除角色
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-lg">
                                    {permissionCatalog.map((group) => (
                                        <div key={group.group}>
                                            <p className="text-sm font-semibold text-text-tertiary mb-sm">{group.group}</p>
                                            <div className="grid grid-2 gap-md">
                                                {group.items.map((item) => (
                                                    <label key={item.key} className="flex items-start gap-sm">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedRole.permissions?.includes(item.key) || false}
                                                            onChange={() => togglePermission(item.key)}
                                                        />
                                                        <span>{item.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-end mt-lg">
                                    <button className="btn btn-primary" onClick={saveRolePermissions} disabled={saving}>
                                        {saving ? '儲存中...' : '儲存權限'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="flex items-center justify-between card-header">
                    <div>
                        <h2 className="card-title">後台帳號管理</h2>
                        <p className="card-subtitle">帳號必須綁定既有會友，並於首次登入強制更改密碼</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setUserModalOpen(true)} disabled={!hasPermission('users:invite')}>
                        + 建立帳號
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="text-left text-sm text-text-tertiary border-b border-border">
                                <th className="py-3 pr-4">會友</th>
                                <th className="py-3 pr-4">Email</th>
                                <th className="py-3 pr-4">角色</th>
                                <th className="py-3 pr-4">狀態</th>
                                <th className="py-3 pr-4">驗證</th>
                                <th className="py-3 pr-4 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b border-border last:border-none">
                                    <td className="py-3 pr-4">
                                        <div className="font-semibold">{user.member?.name || '—'}</div>
                                        <div className="text-sm text-text-tertiary">{user.member?.phone}</div>
                                    </td>
                                    <td className="py-3 pr-4">{user.email}</td>
                                    <td className="py-3 pr-4">
                                        <select
                                            className="input"
                                            value={user.role}
                                            onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                                        >
                                            {roles.map((role) => (
                                                <option key={role.id} value={role.name}>{role.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="py-3 pr-4">
                                        <span className={STATUS_BADGE[user.status] || 'badge'}>
                                            {user.status === 'active' ? '啟用' : user.status === 'disabled' ? '停用' : '待啟用'}
                                        </span>
                                    </td>
                                    <td className="py-3 pr-4">
                                        {user.email_verified ? (
                                            <span className="badge badge-success">已驗證</span>
                                        ) : (
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => handleResendVerification(user.id)}
                                            >
                                                重寄驗證
                                            </button>
                                        )}
                                    </td>
                                    <td className="py-3 pr-4 text-right text-sm text-text-tertiary">
                                        必須於首次登入更改密碼：{user.must_change_password ? '是' : '否'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={roleModalOpen} onClose={() => setRoleModalOpen(false)} title="新增角色">
                <div className="space-y-4">
                    <div>
                        <label className="form-label">角色名稱</label>
                        <input className="input" value={newRole.name} onChange={(e) => setNewRole((prev) => ({ ...prev, name: e.target.value }))} />
                    </div>
                    <div>
                        <label className="form-label">描述</label>
                        <textarea className="input" value={newRole.description} onChange={(e) => setNewRole((prev) => ({ ...prev, description: e.target.value }))} />
                    </div>
                    <div className="flex justify-end gap-3">
                        <button className="btn btn-outline" onClick={() => setRoleModalOpen(false)}>取消</button>
                        <button className="btn btn-primary" onClick={handleCreateRole} disabled={saving}>
                            {saving ? '建立中...' : '新增角色'}
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={userModalOpen} onClose={() => setUserModalOpen(false)} title="建立後台帳號">
                <div className="space-y-4">
                    <div>
                        <label className="form-label">搜尋會員</label>
                        <input
                            className="input"
                            value={memberQuery}
                            onChange={(e) => {
                                setMemberQuery(e.target.value);
                                fetchMembers(e.target.value);
                            }}
                            placeholder="輸入姓名或 Email"
                        />
                        <div className="max-h-48 overflow-y-auto mt-2 border border-border rounded-lg">
                            {memberResults.map((member) => (
                                <button
                                    key={member.id}
                                    className={`w-full text-left px-3 py-2 hover:bg-bg-secondary ${inviteForm.member_id === member.id ? 'bg-bg-secondary' : ''}`}
                                    onClick={() => setInviteForm((prev) => ({ ...prev, member_id: member.id, email: member.email || '' }))}
                                >
                                    <div className="font-semibold">{member.name}</div>
                                    <p className="text-sm text-text-tertiary">{member.email || member.phone}</p>
                                </button>
                            ))}
                            {memberResults.length === 0 && (
                                <p className="text-sm text-text-tertiary px-3 py-2">輸入至少 2 個字搜尋會員</p>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="form-label">登入 Email</label>
                        <input
                            className="input"
                            value={inviteForm.email}
                            onChange={(e) => setInviteForm((prev) => ({ ...prev, email: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="form-label">角色</label>
                        <select
                            className="input"
                            value={inviteForm.role}
                            onChange={(e) => setInviteForm((prev) => ({ ...prev, role: e.target.value }))}
                        >
                            <option value="">請選擇角色</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.name}>{role.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button className="btn btn-outline" onClick={() => setUserModalOpen(false)}>取消</button>
                        <button className="btn btn-primary" onClick={handleInvite} disabled={saving}>
                            {saving ? '建立中...' : '建立帳號'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

