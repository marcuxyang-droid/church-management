import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuthStore } from '../store/auth';

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
    const { user } = useAuthStore();

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
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>控制台</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>管理會友、奉獻與所有教會活動</p>
                    </div>
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
                </header>
                <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
