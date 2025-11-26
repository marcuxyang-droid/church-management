import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { adminMenu } from '../config/adminMenu';

export default function Sidebar() {
    const location = useLocation();
    const { user, logout, hasPermission } = useAuthStore();

    return (
        <aside className="sidebar">
            <div className="sidebar__logo">
                <Link to="/" className="sidebar__logo-link">
                    <div className="sidebar__logo-mark">⛪</div>
                    <div>
                        <p className="sidebar__logo-title">管理後台</p>
                        <p className="sidebar__logo-subtitle">Blessing Haven</p>
                    </div>
                </Link>
            </div>

            <nav className="sidebar__nav">
                {adminMenu.map((item) => {
                    if (item.permission && !hasPermission(item.permission)) return null;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`sidebar__nav-link ${isActive ? 'sidebar__nav-link--active' : ''}`}
                        >
                            <span className="sidebar__nav-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <button
                className="sidebar__logout"
                onClick={() => {
                    logout();
                    window.location.href = '/';
                }}
            >
                <span>登出</span>
            </button>
        </aside>
    );
}

function translateRole(role) {
    switch (role) {
        case 'admin':
            return '系統管理員';
        case 'pastor':
            return '牧師';
        case 'leader':
            return '小組長';
        case 'staff':
            return '同工';
        case 'volunteer':
            return '志工';
        default:
            return '唯讀';
    }
}
