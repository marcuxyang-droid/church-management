import { useEffect, useState } from 'react';
import imageCompression from 'browser-image-compression';
import { useSettingsStore } from '../../store/settings';
import { api } from '../../utils/api';

const BRAND_FIELDS = [
    { key: 'church_name', label: '教會名稱', placeholder: 'Blessing Haven' },
    { key: 'tagline', label: '標語 / Slogan', placeholder: '被愛、被建立、被差派' },
];

const CONTACT_FIELDS = [
    { key: 'contact_email', label: '聯絡 Email', placeholder: 'info@church.com' },
    { key: 'address', label: '地址', placeholder: '台北市信義區仁愛路 100 號' },
    { key: 'service_times', label: '聚會時間', placeholder: '主日 10:00 | 禱告會 週三 19:30' },
    { key: 'facebook_url', label: 'Facebook 連結', placeholder: 'https://facebook.com/...' },
    { key: 'youtube_url', label: 'YouTube 連結', placeholder: 'https://youtube.com/...' },
];

export default function HomeSettings() {
    const settings = useSettingsStore((state) => state.settings);
    const fetchSettings = useSettingsStore((state) => state.fetchSettings);
    const updateSettingsState = useSettingsStore((state) => state.updateSettingsState);
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadingType, setUploadingType] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [uploadedImages, setUploadedImages] = useState([]);
    const [showImageSelector, setShowImageSelector] = useState({ logo: false, heroBg: false, heroArc: false });

    useEffect(() => {
        if (!settings) {
            fetchSettings();
        } else {
            setForm(settings);
        }
    }, [settings, fetchSettings]);

    useEffect(() => {
        loadUploadedImages();
    }, []);

    const loadUploadedImages = async () => {
        try {
            const data = await api.listUploadedImages();
            setUploadedImages(data.images || []);
        } catch (err) {
            console.error('Failed to load images:', err);
        }
    };

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
            setSuccess('首頁設定已儲存');
        } catch (err) {
            setError(err.message || '儲存失敗');
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (event, type) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setUploadingType(type);
        setError('');
        setSuccess('');
        try {
            const compressed = await imageCompression(file, {
                maxSizeMB: type === 'logo' ? 1.2 : 2,
                initialQuality: 0.7,
                maxWidthOrHeight: type === 'logo' ? 1200 : 2000,
                useWebWorker: true,
            });
            let response;
            if (type === 'logo') {
                response = await api.uploadLogo(compressed);
            } else {
                response = await api.uploadHeroImage(compressed, type === 'heroBg' ? 'bg' : 'arc');
            }
            const settingKey = type === 'logo' ? 'logo_url' : type === 'heroBg' ? 'hero_bg_url' : 'hero_arc_image_url';
            const updated = { ...form, [settingKey]: response.url };
            setForm(updated);
            updateSettingsState({ [settingKey]: response.url });
            setSuccess(`${type === 'logo' ? 'Logo' : '圖片'} 已上傳`);
            await loadUploadedImages();
        } catch (err) {
            setError(err.message || '上傳失敗，請確認檔案格式');
        } finally {
            setUploading(false);
            setUploadingType('');
        }
    };

    const handleSelectImage = (url, type) => {
        const settingKey = type === 'logo' ? 'logo_url' : type === 'heroBg' ? 'hero_bg_url' : 'hero_arc_image_url';
        const updated = { ...form, [settingKey]: url };
        setForm(updated);
        setShowImageSelector({ ...showImageSelector, [type]: false });
        setSuccess('圖片已選擇');
    };

    const ImageUploadSection = ({ label, type, previewUrl, settingKey, isLogo = false }) => (
        <div>
            <p className="form-label">{label}</p>
            {isLogo ? (
                // Logo 垂直布局：图片在上，上传控件在下
                <div className="flex flex-col gap-md">
                    <div
                        style={{
                            width: '100%',
                            maxWidth: '200px',
                            aspectRatio: '1',
                            borderRadius: '1rem',
                            background: '#f8fafc',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            border: '1px solid #e2e8f0',
                        }}
                    >
                        {previewUrl ? (
                            <img src={previewUrl} alt={label} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        ) : (
                            <span style={{ fontSize: '2rem' }}>📷</span>
                        )}
                    </div>
                    <div className="flex flex-col gap-sm">
                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/svg+xml"
                            onChange={(e) => handleImageUpload(e, type)}
                            disabled={uploading && uploadingType === type}
                        />
                        <button
                            className="btn btn-outline btn-sm"
                            onClick={() => setShowImageSelector({ ...showImageSelector, [type]: !showImageSelector[type] })}
                            style={{ alignSelf: 'flex-start' }}
                        >
                            {showImageSelector[type] ? '取消選擇' : '選擇已上傳圖片'}
                        </button>
                        {showImageSelector[type] && (
                            <div style={{ 
                                maxHeight: '200px', 
                                overflowY: 'auto', 
                                border: '1px solid #e2e8f0', 
                                borderRadius: '0.5rem',
                                padding: '0.5rem',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                                gap: '0.5rem'
                            }}>
                                {uploadedImages.length === 0 ? (
                                    <p className="text-sm text-text-tertiary" style={{ gridColumn: '1 / -1' }}>尚無上傳的圖片</p>
                                ) : (
                                    uploadedImages.map((img) => (
                                        <div
                                            key={img.url}
                                            onClick={() => handleSelectImage(img.url, type)}
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                                borderRadius: '0.25rem',
                                                overflow: 'hidden',
                                                border: form[settingKey] === img.url ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                                                cursor: 'pointer',
                                                background: '#f8fafc',
                                            }}
                                        >
                                            <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                        <p className="text-sm text-text-tertiary">
                            建議使用透明背景 PNG，系統會自動壓縮至 70% 品質。
                        </p>
                    </div>
                </div>
            ) : (
                // Hero 圖片橫向布局：图片在左，上传控件在右
                <div className="flex items-center gap-lg">
                    <div
                        style={{
                            width: 200,
                            height: 120,
                            borderRadius: '1rem',
                            background: '#f8fafc',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            border: '1px solid #e2e8f0',
                            flexShrink: 0,
                        }}
                    >
                        {previewUrl ? (
                            <img src={previewUrl} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <span style={{ fontSize: '2rem' }}>📷</span>
                        )}
                    </div>
                    <div className="flex flex-col gap-sm" style={{ flex: 1 }}>
                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/svg+xml"
                            onChange={(e) => handleImageUpload(e, type)}
                            disabled={uploading && uploadingType === type}
                        />
                        <button
                            className="btn btn-outline btn-sm"
                            onClick={() => setShowImageSelector({ ...showImageSelector, [type]: !showImageSelector[type] })}
                            style={{ alignSelf: 'flex-start' }}
                        >
                            {showImageSelector[type] ? '取消選擇' : '選擇已上傳圖片'}
                        </button>
                        {showImageSelector[type] && (
                            <div style={{ 
                                maxHeight: '200px', 
                                overflowY: 'auto', 
                                border: '1px solid #e2e8f0', 
                                borderRadius: '0.5rem',
                                padding: '0.5rem',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                                gap: '0.5rem'
                            }}>
                                {uploadedImages.length === 0 ? (
                                    <p className="text-sm text-text-tertiary" style={{ gridColumn: '1 / -1' }}>尚無上傳的圖片</p>
                                ) : (
                                    uploadedImages.map((img) => (
                                        <div
                                            key={img.url}
                                            onClick={() => handleSelectImage(img.url, type)}
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                                borderRadius: '0.25rem',
                                                overflow: 'hidden',
                                                border: form[settingKey] === img.url ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                                                cursor: 'pointer',
                                                background: '#f8fafc',
                                            }}
                                        >
                                            <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                        <p className="text-sm text-text-tertiary">
                            建議使用高品質圖片，系統會自動壓縮。
                        </p>
                    </div>
                </div>
            )}
        </div>
    );

    const previewLogo = form.logo_url || settings?.logo_url || '';
    const previewHeroBg = form.hero_bg_url || settings?.hero_bg_url || '';
    const previewHeroArc = form.hero_arc_image_url || settings?.hero_arc_image_url || '';

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">首頁設定</h1>
                <p className="text-text-secondary">管理前台首頁的顯示內容與設定</p>
            </div>

            {/* 品牌設定 */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">品牌設定</h2>
                    <p className="card-subtitle">更新前台顯示的 Logo 與教會資訊</p>
                </div>
                <div className="grid grid-2 gap-lg">
                    <ImageUploadSection 
                        label="教會 Logo" 
                        type="logo" 
                        previewUrl={previewLogo}
                        settingKey="logo_url"
                        isLogo={true}
                    />
                    <div className="grid gap-md">
                        {BRAND_FIELDS.map((field) => (
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

            {/* Hero Section 設定 */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Hero Section 設定</h2>
                    <p className="card-subtitle">設定首頁 Hero 區塊的文字與圖片</p>
                </div>
                <div className="grid gap-lg">
                    <div className="grid grid-2 gap-md">
                        <div>
                            <label className="form-label">主標題</label>
                            <input
                                className="input"
                                placeholder="盼望每個人都能在這裡"
                                value={form.hero_heading_main || ''}
                                onChange={(e) => handleChange('hero_heading_main', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="form-label">副標題</label>
                            <input
                                className="input"
                                placeholder="被愛、被建立、被差派"
                                value={form.hero_heading_accent || ''}
                                onChange={(e) => handleChange('hero_heading_accent', e.target.value)}
                            />
                        </div>
                    </div>
                    <ImageUploadSection 
                        label="Hero 背景圖片" 
                        type="heroBg" 
                        previewUrl={previewHeroBg}
                        settingKey="hero_bg_url"
                    />
                    <ImageUploadSection 
                        label="Hero 遮罩圖片（圓弧）" 
                        type="heroArc" 
                        previewUrl={previewHeroArc}
                        settingKey="hero_arc_image_url"
                    />
                </div>
            </div>

            {/* 聯絡與聚會資訊 */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">聯絡與聚會資訊</h2>
                    <p className="card-subtitle">這些資訊會顯示在網站底部與關於我們頁面</p>
                </div>
                <div className="grid grid-2 gap-lg">
                    {CONTACT_FIELDS.map((field) => (
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
