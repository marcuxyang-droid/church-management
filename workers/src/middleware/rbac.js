/**
 * Role-Based Access Control (RBAC) Middleware
 * Checks user permissions based on roles
 */

// Role hierarchy (higher number = more permissions)
const ROLE_LEVELS = {
    'readonly': 1,
    'volunteer': 2,
    'staff': 3,
    'leader': 4,
    'pastor': 5,
    'admin': 6,
};

// Permission definitions
const PERMISSIONS = {
    // Member permissions
    'members:read': ['readonly', 'volunteer', 'staff', 'leader', 'pastor', 'admin'],
    'members:create': ['staff', 'leader', 'pastor', 'admin'],
    'members:update': ['staff', 'leader', 'pastor', 'admin'],
    'members:delete': ['pastor', 'admin'],
    'members:sensitive': ['pastor', 'admin'], // Health info, etc.

    // Offering permissions
    'offerings:read': ['staff', 'leader', 'pastor', 'admin'],
    'offerings:create': ['staff', 'leader', 'pastor', 'admin'],
    'offerings:update': ['pastor', 'admin'],
    'offerings:delete': ['admin'],

    // Event permissions
    'events:read': ['readonly', 'volunteer', 'staff', 'leader', 'pastor', 'admin'],
    'events:create': ['staff', 'leader', 'pastor', 'admin'],
    'events:update': ['staff', 'leader', 'pastor', 'admin'],
    'events:delete': ['leader', 'pastor', 'admin'],
    'events:checkin': ['volunteer', 'staff', 'leader', 'pastor', 'admin'],

    // Course permissions
    'courses:read': ['readonly', 'volunteer', 'staff', 'leader', 'pastor', 'admin'],
    'courses:create': ['leader', 'pastor', 'admin'],
    'courses:update': ['leader', 'pastor', 'admin'],
    'courses:delete': ['pastor', 'admin'],

    // Cell group permissions
    'cellgroups:read': ['readonly', 'volunteer', 'staff', 'leader', 'pastor', 'admin'],
    'cellgroups:create': ['leader', 'pastor', 'admin'],
    'cellgroups:update': ['leader', 'pastor', 'admin'],
    'cellgroups:delete': ['pastor', 'admin'],

    // Volunteer permissions
    'volunteers:read': ['staff', 'leader', 'pastor', 'admin'],
    'volunteers:create': ['staff', 'leader', 'pastor', 'admin'],
    'volunteers:update': ['staff', 'leader', 'pastor', 'admin'],
    'volunteers:delete': ['leader', 'pastor', 'admin'],

    // Finance permissions
    'finance:read': ['pastor', 'admin'],
    'finance:create': ['pastor', 'admin'],
    'finance:update': ['pastor', 'admin'],
    'finance:delete': ['admin'],

    // Media permissions
    'media:read': ['readonly', 'volunteer', 'staff', 'leader', 'pastor', 'admin'],
    'media:create': ['staff', 'leader', 'pastor', 'admin'],
    'media:update': ['staff', 'leader', 'pastor', 'admin'],
    'media:delete': ['leader', 'pastor', 'admin'],

    // Survey permissions
    'surveys:read': ['staff', 'leader', 'pastor', 'admin'],
    'surveys:create': ['staff', 'leader', 'pastor', 'admin'],
    'surveys:update': ['staff', 'leader', 'pastor', 'admin'],
    'surveys:delete': ['leader', 'pastor', 'admin'],

    // System settings & role management
    'settings:read': ['pastor', 'admin'],
    'settings:update': ['admin'],
    'roles:manage': ['admin'],
    'users:invite': ['admin'],
};

/**
 * Check if user has required permission
 * @param {Object} user - User object with role
 * @param {string} permission - Required permission
 * @returns {boolean} True if user has permission
 */
export function hasPermission(user, permission) {
    if (!user || !user.role) {
        return false;
    }

    if (Array.isArray(user.permissions) && user.permissions.length > 0) {
        return user.permissions.includes(permission);
    }

    const allowedRoles = PERMISSIONS[permission];
    if (!allowedRoles) {
        return false;
    }

    return allowedRoles.includes(user.role);
}

/**
 * Check if user has minimum role level
 * @param {Object} user - User object with role
 * @param {string} minRole - Minimum required role
 * @returns {boolean} True if user meets minimum role
 */
export function hasMinRole(user, minRole) {
    if (!user || !user.role) {
        return false;
    }

    const userLevel = ROLE_LEVELS[user.role] || 0;
    const minLevel = ROLE_LEVELS[minRole] || 0;

    return userLevel >= minLevel;
}

/**
 * RBAC middleware factory
 * @param {string} permission - Required permission
 * @returns {Function} Middleware function
 */
export function requirePermission(permission) {
    return async (c, next) => {
        const user = c.get('user');

        if (!user) {
            return c.json({ error: '需要登入' }, 401);
        }

        if (!hasPermission(user, permission)) {
            return c.json({
                error: '權限不足',
                required: permission,
                yourRole: user.role
            }, 403);
        }

        await next();
    };
}

/**
 * Require minimum role middleware factory
 * @param {string} minRole - Minimum required role
 * @returns {Function} Middleware function
 */
export function requireRole(minRole) {
    return async (c, next) => {
        const user = c.get('user');

        if (!user) {
            return c.json({ error: '需要登入' }, 401);
        }

        if (!hasMinRole(user, minRole)) {
            return c.json({
                error: '權限不足',
                required: minRole,
                yourRole: user.role
            }, 403);
        }

        await next();
    };
}

/**
 * Check if user can access specific member data
 * @param {Object} user - Current user
 * @param {Object} member - Target member
 * @returns {boolean} True if access allowed
 */
export function canAccessMember(user, member) {
    // Admins and pastors can access all members
    if (hasMinRole(user, 'pastor')) {
        return true;
    }

    // Users can access their own data
    if (user.member_id === member.id) {
        return true;
    }

    // Cell group leaders can access their group members
    if (user.role === 'leader' && user.cell_group_id === member.cell_group_id) {
        return true;
    }

    return false;
}

/**
 * Filter sensitive fields based on user role
 * @param {Object} data - Data object
 * @param {Object} user - Current user
 * @returns {Object} Filtered data
 */
export function filterSensitiveFields(data, user) {
    const sensitiveFields = ['health_notes', 'password_hash'];

    // Pastors and admins can see all fields
    if (hasMinRole(user, 'pastor')) {
        return data;
    }

    // Filter out sensitive fields for other roles
    const filtered = { ...data };
    sensitiveFields.forEach(field => {
        if (field in filtered) {
            delete filtered[field];
        }
    });

    return filtered;
}
