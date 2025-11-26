import { useEffect, useState } from 'react';
import { useSettingsStore } from '../../store/settings';
import { api } from '../../utils/api';

export default function GiveSettings() {
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
            setSuccess('奉獻設定已儲存');
        } catch (err) {
            setError(err.message || '儲存失敗');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">奉獻設定</h1>
                <p className="text-text-secondary">管理奉獻頁面的設定</p>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">奉獻資訊</h2>
                    <p className="card-subtitle">設定奉獻頁面顯示的資訊</p>
                </div>
                <div className="grid gap-lg">
                    <div>
                        <label className="form-label">奉獻說明</label>
                        <textarea
                            className="input"
                            rows={6}
                            placeholder="輸入奉獻說明..."
                            value={form.give_description || ''}
                            onChange={(e) => handleChange('give_description', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="form-label">銀行帳號</label>
                        <input
                            className="input"
                            placeholder="輸入銀行帳號..."
                            value={form.give_bank_account || ''}
                            onChange={(e) => handleChange('give_bank_account', e.target.value)}
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

