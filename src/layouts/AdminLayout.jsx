import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuthStore } from '../store/auth';
import { adminMenu } from '../config/adminMenu';
import { useSettingsStore } from '../store/settings';

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
    const { user, hasPermission, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const settings = useSettingsStore((state) => state.settings);
    const fetchSettings = useSettingsStore((state) => state.fetchSettings);

    useEffect(() => {
        if (!settings) {
            fetchSettings();
        }
    }, [settings, fetchSettings]);

    const availableMenu = useMemo(
        () => adminMenu.filter((item) => !item.permission || hasPermission(item.permission)),
        [hasPermission],
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f2f4f8' }}>
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div
                className={`sidebar__overlay ${sidebarOpen ? 'sidebar__overlay--visible' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <button
                            className="admin-menu-toggle"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Toggle sidebar"
                        >
                            <span />
                            <span />
                            <span />
                        </button>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                            {settings?.church_name || 'Blessing Haven'} ｜ 管理後台
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {user && (
                            <>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    {user.member?.name || user.email}
                                </div>
                                <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => {
                                        logout();
                                        window.location.href = '/';
                                    }}
                                >
                                    登出
                                </button>
                            </>
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
