import { SheetsService } from '../services/sheets.js';
import { v4 as uuidv4 } from 'uuid';

const PERMISSION_CATALOG = [
    {
        group: '會友管理',
        items: [
            { key: 'members:read', label: '檢視會友' },
            { key: 'members:create', label: '新增會友' },
            { key: 'members:update', label: '編輯會友' },
            { key: 'members:delete', label: '刪除會友' },
            { key: 'members:sensitive', label: '檢視敏感資料' },
        ],
    },
    {
        group: '奉獻與財務',
        items: [
            { key: 'offerings:read', label: '檢視奉獻' },
            { key: 'offerings:create', label: '新增奉獻' },
            { key: 'offerings:update', label: '編輯奉獻' },
            { key: 'offerings:delete', label: '刪除奉獻' },
            { key: 'finance:read', label: '檢視財務' },
            { key: 'finance:create', label: '新增財務' },
            { key: 'finance:update', label: '編輯財務' },
            { key: 'finance:delete', label: '刪除財務' },
        ],
    },
    {
        group: '活動與課程',
        items: [
            { key: 'events:read', label: '檢視活動' },
            { key: 'events:create', label: '建立活動' },
            { key: 'events:update', label: '編輯活動' },
            { key: 'events:delete', label: '刪除活動' },
            { key: 'events:checkin', label: '活動報到' },
            { key: 'courses:read', label: '檢視課程' },
            { key: 'courses:create', label: '建立課程' },
            { key: 'courses:update', label: '編輯課程' },
            { key: 'courses:delete', label: '刪除課程' },
        ],
    },
    {
        group: '小組與志工',
        items: [
            { key: 'cellgroups:read', label: '檢視小組' },
            { key: 'cellgroups:create', label: '建立小組' },
            { key: 'cellgroups:update', label: '編輯小組' },
            { key: 'cellgroups:delete', label: '刪除小組' },
            { key: 'volunteers:read', label: '檢視志工' },
            { key: 'volunteers:create', label: '新增志工' },
            { key: 'volunteers:update', label: '編輯志工' },
            { key: 'volunteers:delete', label: '刪除志工' },
        ],
    },
    {
        group: '媒體與問卷',
        items: [
            { key: 'media:read', label: '檢視媒體' },
            { key: 'media:create', label: '新增媒體' },
            { key: 'media:update', label: '編輯媒體' },
            { key: 'media:delete', label: '刪除媒體' },
            { key: 'surveys:read', label: '檢視問卷' },
            { key: 'surveys:create', label: '建立問卷' },
            { key: 'surveys:update', label: '編輯問卷' },
            { key: 'surveys:delete', label: '刪除問卷' },
        ],
    },
    {
        group: '系統設定',
        items: [
            { key: 'settings:read', label: '檢視系統設定' },
            { key: 'settings:update', label: '編輯系統設定' },
            { key: 'roles:manage', label: '管理角色與權限' },
            { key: 'users:invite', label: '邀請/建立後台帳號' },
        ],
    },
];

function validatePermissions(permissions = []) {
    const catalogKeys = new Set(
        PERMISSION_CATALOG.flatMap((group) => group.items.map((item) => item.key)),
    );

    return permissions.filter((permission) => catalogKeys.has(permission));
}

function serializeRole(role, headers) {
    return headers.map((header) => role[header] ?? '');
}

export async function getRoles(c) {
    try {
        const sheets = new SheetsService(c.env);
        const roles = await sheets.read('Roles');
        return c.json({
            roles: roles.map((role) => ({
                ...role,
                permissions: role.permissions ? JSON.parse(role.permissions) : [],
            })),
            permissionCatalog: PERMISSION_CATALOG,
        });
    } catch (error) {
        console.error('Get roles error:', error);
        return c.json({ error: '獲取角色列表失敗' }, 500);
    }
}

export async function createRole(c) {
    try {
        const { name, description = '', permissions = [] } = await c.req.json();

        if (!name || typeof name !== 'string') {
            return c.json({ error: '請提供角色名稱' }, 400);
        }

        const sheets = new SheetsService(c.env);
        const existing = await sheets.read('Roles');
        if (existing.some((role) => role.name === name)) {
            return c.json({ error: '角色名稱已存在' }, 400);
        }

        const normalizedPermissions = validatePermissions(permissions);
        const role = {
            id: uuidv4(),
            name,
            description,
            permissions: JSON.stringify(normalizedPermissions),
            is_system_role: 'false',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const headers = await sheets.getHeaders('Roles');
        await sheets.append('Roles', serializeRole(role, headers));

        return c.json({
            message: '角色已建立',
            role: {
                ...role,
                permissions: normalizedPermissions,
            },
        }, 201);
    } catch (error) {
        console.error('Create role error:', error);
        return c.json({ error: '建立角色失敗' }, 500);
    }
}

export async function updateRole(c) {
    try {
        const { id } = c.req.param();
        const { name, description = '', permissions = [] } = await c.req.json();

        const sheets = new SheetsService(c.env);
        const roles = await sheets.read('Roles');
        const role = roles.find((r) => r.id === id);

        if (!role) {
            return c.json({ error: '角色不存在' }, 404);
        }

        if (role.is_system_role === 'true' && name && name !== role.name) {
            return c.json({ error: '系統預設角色無法變更名稱' }, 400);
        }

        const normalizedPermissions = validatePermissions(permissions);

        const updatedRole = {
            ...role,
            name: name || role.name,
            description,
            permissions: JSON.stringify(normalizedPermissions),
            updated_at: new Date().toISOString(),
        };

        const headers = await sheets.getHeaders('Roles');
        const rowIndex = roles.findIndex((r) => r.id === id);
        await sheets.update('Roles', rowIndex, serializeRole(updatedRole, headers));

        return c.json({
            message: '角色已更新',
            role: {
                ...updatedRole,
                permissions: normalizedPermissions,
            },
        });
    } catch (error) {
        console.error('Update role error:', error);
        return c.json({ error: '更新角色失敗' }, 500);
    }
}

export async function deleteRole(c) {
    try {
        const { id } = c.req.param();
        const sheets = new SheetsService(c.env);
        const roles = await sheets.read('Roles');
        const role = roles.find((r) => r.id === id);

        if (!role) {
            return c.json({ error: '角色不存在' }, 404);
        }

        if (role.is_system_role === 'true') {
            return c.json({ error: '系統預設角色無法刪除' }, 400);
        }

        await sheets.delete('Roles', id);
        return c.json({ message: '角色已刪除' });
    } catch (error) {
        console.error('Delete role error:', error);
        return c.json({ error: '刪除角色失敗' }, 500);
    }
}

