import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            login: (user, token) => {
                set({ user, token, isAuthenticated: true });
                localStorage.setItem('token', token);
            },

            logout: () => {
                set({ user: null, token: null, isAuthenticated: false });
                localStorage.removeItem('token');
            },

            updateUser: (userData) => {
                set({ user: { ...get().user, ...userData } });
            },

            hasPermission: (permission) => {
                const { user } = get();
                if (!user) return false;

                if (user.role === 'admin') return true;

                if (Array.isArray(user.permissions) && user.permissions.length > 0) {
                    return user.permissions.includes(permission);
                }

                const legacyPermissions = {
                    pastor: ['members', 'offerings', 'events', 'courses', 'cellgroups', 'volunteers', 'finance', 'media', 'surveys', 'settings:read'],
                    leader: ['members', 'events', 'courses', 'cellgroups', 'volunteers', 'media'],
                    staff: ['members', 'events', 'courses', 'media'],
                    volunteer: ['events'],
                    readonly: [],
                };

                if (permission.includes(':')) {
                    const fallback = {
                        pastor: ['settings:read'],
                        leader: [],
                        staff: [],
                        volunteer: [],
                        readonly: [],
                    };
                    return (fallback[user.role] || []).includes(permission);
                }

                const permissions = legacyPermissions[user.role] || [];
                return permissions.includes(permission);
            },

            hasRole: (minRole) => {
                const { user } = get();
                if (!user) return false;

                const roleLevels = {
                    readonly: 1,
                    volunteer: 2,
                    staff: 3,
                    leader: 4,
                    pastor: 5,
                    admin: 6,
                };

                const userLevel = roleLevels[user.role] || 0;
                const minLevel = roleLevels[minRole] || 0;

                return userLevel >= minLevel;
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);
