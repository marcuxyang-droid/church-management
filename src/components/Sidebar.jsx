import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

export default function Sidebar() {
    const location = useLocation();
    const { user, logout, hasPermission } = useAuthStore();

    const menuItems = [
        { path: '/admin', label: '儀表板', icon: '📊' },
        { path: '/admin/members', label: '會友管理', icon: '👥', permission: 'members' },
        { path: '/admin/offerings', label: '奉獻管理', icon: '💰', permission: 'offerings' },
        { path: '/admin/events', label: '活動管理', icon: '📅', permission: 'events' },
        { path: '/admin/courses', label: '課程管理', icon: '📚', permission: 'courses' },
        { path: '/admin/cellgroups', label: '小組管理', icon: '🏠', permission: 'cellgroups' },
        { path: '/admin/volunteers', label: '志工管理', icon: '🙋', permission: 'volunteers' },
        { path: '/admin/finance', label: '財務管理', icon: '💳', permission: 'finance' },
        { path: '/admin/surveys', label: '問卷管理', icon: '📝', permission: 'surveys' },
        { path: '/admin/media', label: '媒體庫', icon: '🎥', permission: 'media' },
    ];

    return (
        <aside className="w-64 bg-primary text-white" style={{ minHeight: '100vh', padding: '1.5rem' }}>
            {/* Logo */}
            <div className="mb-8">
                <Link to="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                        <span className="text-primary text-xl font-bold">⛪</span>
                    </div>
                    <span className="text-lg font-bold">管理後台</span>
                </Link>
            </div>

            {/* User Info */}
            {user && (
                <div className="mb-8 p-4 bg-primary-dark rounded-lg">
                    <div className="text-sm text-primary-light mb-1">登入身份</div>
                    <div className="font-semibold">{user.member?.name || user.email}</div>
                    <div className="text-xs text-primary-light mt-1">
                        {user.role === 'admin' && '系統管理員'}
                        {user.role === 'pastor' && '牧師'}
                        {user.role === 'leader' && '小組長'}
                        {user.role === 'staff' && '同工'}
                        {user.role === 'volunteer' && '志工'}
                        {user.role === 'readonly' && '唯讀'}
                    </div>
                </div>
            )}

            {/* Menu */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {menuItems.map((item) => {
                    // Check permission if required
                    if (item.permission && !hasPermission(item.permission)) {
                        return null;
                    }

                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive
                                    ? 'bg-white text-primary font-semibold'
                                    : 'hover:bg-primary-dark'
                                }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                <button
                    onClick={() => {
                        logout();
                        window.location.href = '/';
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-dark transition"
                >
                    <span className="text-xl">🚪</span>
                    <span>登出</span>
                </button>
            </div>
        </aside>
    );
}
