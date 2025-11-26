// 分組菜單結構
export const adminMenuGroups = [
    {
        title: '管理後台',
        items: [
            { path: '/admin', label: '儀表板', icon: '📊' },
        ],
    },
    {
        title: '人員管理',
        items: [
            { path: '/admin/members', label: '會友管理', icon: '👥', permission: 'members' },
            { path: '/admin/volunteers', label: '同工管理', icon: '🙋', permission: 'volunteers' },
            { path: '/admin/cellgroups', label: '小組管理', icon: '🏠', permission: 'cellgroups' },
            { path: '/admin/tags', label: '標籤管理', icon: '🏷️', permission: 'members' },
        ],
    },
    {
        title: '財務管理',
        items: [
            { path: '/admin/finance', label: '財務管理', icon: '💳', permission: 'finance' },
            { path: '/admin/offerings', label: '奉獻管理', icon: '💰', permission: 'offerings' },
        ],
    },
    {
        title: '活動與課程',
        items: [
            { path: '/admin/events', label: '活動管理', icon: '📅', permission: 'events' },
            { path: '/admin/news', label: '消息管理', icon: '📰', permission: 'events' },
            { path: '/admin/courses', label: '課程管理', icon: '📚', permission: 'courses' },
            { path: '/admin/surveys', label: '問卷管理', icon: '📝', permission: 'surveys' },
        ],
    },
    {
        title: '系統管理',
        items: [
            { path: '/admin/home', label: '首頁設定', icon: '⚙️', permission: 'settings:read' },
            { path: '/admin/about', label: '關於我們設定', icon: '📖', permission: 'settings:read' },
            { path: '/admin/give', label: '奉獻設定', icon: '🎁', permission: 'settings:read' },
            { path: '/admin/access', label: '權限管理', icon: '🔐', permission: 'roles:manage' },
            { path: '/admin/media', label: '媒體庫', icon: '🎥', permission: 'media' },
        ],
    },
];

// 扁平化菜單（用於向後兼容）
export const adminMenu = adminMenuGroups.flatMap((group) => group.items);
