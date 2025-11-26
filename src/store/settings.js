import { create } from 'zustand';
import { api } from '../utils/api';

export const useSettingsStore = create((set, get) => ({
    settings: null,
    meta: {},
    loading: false,
    error: null,
    fetchSettings: async () => {
        const { loading } = get();
        if (loading) return;
        set({ loading: true, error: null });
        try {
            // 尝试获取公开设置（前台使用），如果失败则尝试需要认证的设置（后台使用）
            let data;
            try {
                data = await api.getPublicSettings();
            } catch (publicError) {
                // 如果公开端点失败，尝试需要认证的端点（后台）
                data = await api.getSettings();
            }
            set({ settings: data.settings, meta: data.meta || {}, loading: false });
        } catch (error) {
            console.error('Fetch settings error:', error);
            set({ loading: false, error: error.message || '載入失敗' });
        }
    },
    updateSettingsState: (updates) =>
        set((state) => ({
            settings: { ...(state.settings || {}), ...updates },
        })),
}));

