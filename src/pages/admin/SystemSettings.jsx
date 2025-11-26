import { useEffect, useState } from 'react';
import imageCompression from 'browser-image-compression';
import { useSettingsStore } from '../../store/settings';
import { api } from '../../utils/api';

const FIELD_CONFIG = [
    { key: 'church_name', label: '教會名稱', placeholder: 'Blessing Haven Church' },
    { key: 'tagline', label: '標語 / Slogan', placeholder: '被愛、被建立、被差派' },
    { key: 'contact_email', label: '聯絡 Email', placeholder: 'info@church.com' },
    { key: 'address', label: '地址', placeholder: '台北市信義區仁愛路 100 號' },
    { key: 'service_times', label: '聚會時間', placeholder: '主日 10:00 | 禱告會 週三 19:30' },
    { key: 'facebook_url', label: 'Facebook 連結', placeholder: 'https://facebook.com/...' },
    { key: 'youtube_url', label: 'YouTube 連結', placeholder: 'https://youtube.com/...' },
];

export default function SystemSettings() {
    const settings = useSettingsStore((state) => state.settings);
    const fetchSettings = useSettingsStore((state) => state.fetchSettings);
    const updateSettingsState = useSettingsStore((state) => state.updateSettingsState);
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
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
            setSuccess('設定已儲存');
        } catch (err) {
            setError(err.message || '儲存失敗');
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setError('');
        setSuccess('');
        try {
            const compressed = await imageCompression(file, {
                maxSizeMB: 1.2,
                initialQuality: 0.7,
                maxWidthOrHeight: 1200,
                useWebWorker: true,
            });
            const response = await api.uploadLogo(compressed);
            const updated = { ...form, logo_url: response.url };
            setForm(updated);
            updateSettingsState({ logo_url: response.url });
            setSuccess('Logo 已更新');
        } catch (err) {
            setError(err.message || '上傳失敗，請確認檔案格式');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">品牌設定</h2>
                    <p className="card-subtitle">更新前台顯示的 Logo 與教會資訊</p>
                </div>
                <div className="grid grid-2 gap-lg">
                    <div>
                        <p className="form-label">教會 Logo</p>
                        <div className="flex items-center gap-lg">
                            <div
                                style={{
                                    width: 120,
                                    height: 120,
                                    borderRadius: '1rem',
                                    background: '#f8fafc',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    border: '1px solid #e2e8f0',
                                }}
                            >
                                {form.logo_url ? (
                                    <img src={form.logo_url} alt="logo" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                                ) : (
                                    <span style={{ fontSize: '2rem' }}>⛪</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-sm">
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                    onChange={handleLogoUpload}
                                    disabled={uploading}
                                />
                                <p className="text-sm text-text-tertiary">
                                    建議使用透明背景 PNG，系統會自動壓縮至 70% 品質。
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="grid gap-md">
                        {FIELD_CONFIG.slice(0, 2).map((field) => (
                            <div key={field.key}>
                                <label className="form-label">{field.label}</label>
                                <input
                                    className="input"
                                    placeholder={field.placeholder}
                                    value={form[field.key] || ''}
                                    onChange={(e) => handleChange(field.key, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">聯絡與聚會資訊</h2>
                    <p className="card-subtitle">這些資訊會顯示在網站底部與關於我們頁面</p>
                </div>
                <div className="grid grid-2 gap-lg">
                    {FIELD_CONFIG.slice(2).map((field) => (
                        <div key={field.key}>
                            <label className="form-label">{field.label}</label>
                            <input
                                className="input"
                                placeholder={field.placeholder}
                                value={form[field.key] || ''}
                                onChange={(e) => handleChange(field.key, e.target.value)}
                            />
                        </div>
                    ))}
                </div>
                {error && <div className="text-error mt-4">{error}</div>}
                {success && <div style={{ color: 'var(--success)', marginTop: '1rem' }}>{success}</div>}
                <div className="flex justify-end mt-6">
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? '儲存中...' : '儲存設定'}
                    </button>
                </div>
            </div>
        </div>
    );
}

