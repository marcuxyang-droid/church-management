export const adminMenu = [
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
    { path: '/admin/tags', label: '標籤管理', icon: '🏷️', permission: 'members' },
    { path: '/admin/settings', label: '系統設定', icon: '⚙️', permission: 'settings:read' },
    { path: '/admin/access', label: '權限管理', icon: '🔐', permission: 'roles:manage' },
];

