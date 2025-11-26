import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { adminMenuGroups } from '../config/adminMenu';
import { useSettingsStore } from '../store/settings';

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
    const location = useLocation();
    const { hasPermission } = useAuthStore();
    const settings = useSettingsStore((state) => state.settings);

    return (
        <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
            <div className="sidebar__header">
                <div className="sidebar__title">{settings?.church_name || 'Blessing Haven'}</div>
                <button className="sidebar__close" onClick={onClose} aria-label="Close menu">
                    ×
                </button>
            </div>

            <nav className="sidebar__nav">
                {adminMenuGroups.map((group, groupIndex) => {
                    const visibleItems = group.items.filter(
                        (item) => !item.permission || hasPermission(item.permission)
                    );
                    
                    if (visibleItems.length === 0) return null;

                    return (
                        <div key={groupIndex} className="sidebar__group">
                            <div className="sidebar__group-title">{group.title}</div>
                            {visibleItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`sidebar__nav-link ${isActive ? 'sidebar__nav-link--active' : ''}`}
                                        onClick={onClose}
                                    >
                                        <span className="sidebar__nav-icon">{item.icon}</span>
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
}
