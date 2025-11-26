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
            const data = await api.getSettings();
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

