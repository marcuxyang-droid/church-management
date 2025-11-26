import { useEffect, useState } from 'react';
import { useSettingsStore } from '../../store/settings';
import { api } from '../../utils/api';

export default function AboutSettings() {
    const settings = useSettingsStore((state) => state.settings);
    const fetchSettings = useSettingsStore((state) => state.fetchSettings);
    const updateSettingsState = useSettingsStore((state) => state.updateSettingsState);
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!settings) {
            fetchSettings();
        } else {
            setForm(settings);
        }
    }, [settings, fetchSettings]);

    const handleChange = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setSuccess('');
        setError('');
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            await api.updateSettings(form);
            updateSettingsState(form);
            setSuccess('關於我們設定已儲存');
        } catch (err) {
            setError(err.message || '儲存失敗');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">關於我們設定</h1>
                <p className="text-text-secondary">管理關於我們頁面的內容</p>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">關於我們內容</h2>
                    <p className="card-subtitle">設定關於我們頁面顯示的資訊</p>
                </div>
                <div className="grid gap-lg">
                    <div>
                        <label className="form-label">教會簡介</label>
                        <textarea
                            className="input"
                            rows={6}
                            placeholder="輸入教會簡介..."
                            value={form.about_description || ''}
                            onChange={(e) => handleChange('about_description', e.target.value)}
                        />
                    </div>
                    {error && <div className="text-error">{error}</div>}
                    {success && <div style={{ color: 'var(--success)' }}>{success}</div>}
                    <div className="flex justify-end">
                        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                            {saving ? '儲存中...' : '儲存設定'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

