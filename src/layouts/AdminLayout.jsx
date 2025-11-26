import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuthStore } from '../store/auth';
import { adminMenu } from '../config/adminMenu';

function translateRole(role) {
    const roleMap = {
        admin: '系統管理員',
        pastor: '牧師',
        leader: '小組長',
        staff: '同工',
        volunteer: '志工',
        readonly: '唯讀',
    };
    return roleMap[role] || role;
}

export default function AdminLayout() {
    const { user, hasPermission } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const availableMenu = adminMenu.filter((item) => !item.permission || hasPermission(item.permission));

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f2f4f8' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <header
                    style={{
                        padding: '1.5rem 2rem',
                        borderBottom: '1px solid #e5e9f2',
                        background: '#fff',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                    }}
                >
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                        後台控制台
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <select
                            value={availableMenu.find((item) => location.pathname.startsWith(item.path))?.path || ''}
                            onChange={(e) => {
                                if (e.target.value) navigate(e.target.value);
                            }}
                            style={{
                                padding: '0.5rem 1.25rem',
                                borderRadius: '999px',
                                border: '1px solid #d5d9e4',
                                background: '#f8fafc',
                                fontWeight: 600,
                                color: '#1f2937',
                            }}
                        >
                            {availableMenu.map((item) => (
                                <option key={item.path} value={item.path}>{item.label}</option>
                            ))}
                        </select>
                        {user && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                <span>{user.member?.name || user.email}</span>
                                <span style={{ color: 'var(--text-tertiary)' }}>·</span>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '999px',
                                    background: 'var(--bg-secondary)',
                                    color: 'var(--text-primary)',
                                    fontWeight: '500',
                                }}>
                                    {translateRole(user.role)}
                                </span>
                            </div>
                        )}
                    </div>
                </header>
                {user?.must_change_password && (
                    <div style={{ background: '#fff3cd', color: '#664d03', padding: '0.75rem 2rem', fontSize: '0.9rem' }}>
                        您目前使用的是臨時密碼，請前往「個人設定」立即更新密碼，以確保帳號安全。
                    </div>
                )}
                {user && !user.email_verified && (
                    <div style={{ background: '#dbeafe', color: '#1d4ed8', padding: '0.75rem 2rem', fontSize: '0.9rem' }}>
                        尚未完成 Email 驗證，請至信箱點擊驗證連結或請系統管理員重新寄送。
                    </div>
                )}
                <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
