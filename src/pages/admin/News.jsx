import { useEffect, useMemo, useState } from 'react';
import { api } from '../../utils/api';
import Modal from '../../components/Modal';
import imageCompression from 'browser-image-compression';

const statusTheme = {
    draft: 'badge badge-warning',
    published: 'badge badge-success',
    closed: 'badge badge-error',
};

export default function AdminNews() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        content: '',
        image_url: '',
        badge: '',
        pill: '',
        action_label: '',
        action_link: '',
        variant: 'image',
        icon: '',
        schedule_label: '',
        schedule_time: '',
        note: '',
        start_date: '',
        end_date: '',
        status: 'draft',
    });
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [showImageSelector, setShowImageSelector] = useState(false);

    useEffect(() => {
        fetchNews();
        loadUploadedImages();
    }, []);

    async function fetchNews() {
        setLoading(true);
        setError('');
        try {
            const data = await api.getNews();
            setNews(data.news || []);
        } catch (err) {
            setError(err.message || '無法取得消息資料');
        } finally {
            setLoading(false);
        }
    }

    async function loadUploadedImages() {
        try {
            const data = await api.listUploadedImages();
            setUploadedImages(data.images || []);
        } catch (err) {
            console.error('Failed to load images:', err);
        }
    }

    const filteredNews = useMemo(() => {
        if (statusFilter === 'all') return news;
        return news.filter((item) => item.status === statusFilter);
    }, [news, statusFilter]);

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingId(item.id);
            setFormData({
                title: item.title || '',
                description: item.description || '',
                content: item.content || '',
                image_url: item.image_url || '',
                badge: item.badge || '',
                pill: item.pill || '',
                action_label: item.action_label || '',
                action_link: item.action_link || '',
                variant: item.variant || 'image',
                icon: item.icon || '',
                schedule_label: item.schedule_label || '',
                schedule_time: item.schedule_time || '',
                note: item.note || '',
                start_date: item.start_date || '',
                end_date: item.end_date || '',
                status: item.status || 'draft',
            });
        } else {
            setEditingId(null);
            setFormData({
                title: '',
                description: '',
                content: '',
                image_url: '',
                badge: '',
                pill: '',
                action_label: '',
                action_link: '',
                variant: 'image',
                icon: '',
                schedule_label: '',
                schedule_time: '',
                note: '',
                start_date: '',
                end_date: '',
                status: 'draft',
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setError('');
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setError('');
        try {
            const compressed = await imageCompression(file, {
                maxSizeMB: 2,
                initialQuality: 0.7,
                maxWidthOrHeight: 2000,
                useWebWorker: true,
            });
            const formData = new FormData();
            formData.append('file', compressed);
            const response = await api.createMedia(formData);
            setFormData((prev) => ({ ...prev, image_url: response.url }));
            await loadUploadedImages();
        } catch (err) {
            setError(err.message || '上傳失敗，請確認檔案格式');
        } finally {
            setUploading(false);
        }
    };

    const handleSelectImage = (url) => {
        setFormData((prev) => ({ ...prev, image_url: url }));
        setShowImageSelector(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            if (editingId) {
                await api.updateNews(editingId, formData);
            } else {
                await api.createNews(formData);
            }
            handleCloseModal();
            fetchNews();
        } catch (err) {
            setError(err.message || (editingId ? '更新消息失敗' : '建立消息失敗'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('確定要刪除此消息嗎？')) return;
        try {
            await api.deleteNews(id);
            fetchNews();
        } catch (err) {
            setError(err.message || '刪除消息失敗');
        }
    };

    if (loading) {
        return <div className="text-center py-8">載入中...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-4xl font-bold">消息管理</h1>
                    <p className="text-text-secondary mt-2">共 {news.length} 則消息</p>
                </div>
                <div className="flex flex-col gap-3 md:flex-row">
                    <select
                        className="input"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">所有狀態</option>
                        <option value="draft">草稿</option>
                        <option value="published">已發布</option>
                        <option value="closed">已結束</option>
                    </select>
                    <button className="btn btn-outline" onClick={fetchNews} disabled={loading}>
                        重新整理
                    </button>
                    <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                        新增消息
                    </button>
                </div>
            </div>

            {error && <div className="text-error">{error}</div>}

            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">消息列表</h2>
                </div>
                {filteredNews.length === 0 ? (
                    <div className="text-center py-12 text-text-tertiary">
                        <p>尚無消息</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredNews.map((item) => (
                            <div key={item.id} className="p-4 border rounded-lg">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold text-lg">{item.title}</h3>
                                            <span className={statusTheme[item.status] || 'badge'}>
                                                {item.status === 'draft' ? '草稿' : item.status === 'published' ? '已發布' : '已結束'}
                                            </span>
                                        </div>
                                        {item.description && (
                                            <p className="text-sm text-text-secondary mb-2">{item.description}</p>
                                        )}
                                        {item.image_url && (
                                            <img
                                                src={item.image_url}
                                                alt={item.title}
                                                className="w-32 h-20 object-cover rounded mt-2"
                                            />
                                        )}
                                        <div className="flex gap-2 mt-3 text-sm text-text-tertiary">
                                            {item.badge && <span>標籤: {item.badge}</span>}
                                            {item.variant && <span>類型: {item.variant}</span>}
                                            {item.created_at && (
                                                <span>建立: {new Date(item.created_at).toLocaleDateString('zh-TW')}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            className="btn btn-outline btn-sm"
                                            onClick={() => handleOpenModal(item)}
                                        >
                                            編輯
                                        </button>
                                        <button
                                            className="btn btn-outline btn-sm text-error"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            刪除
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? '編輯消息' : '新增消息'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="form-label">標題 *</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="form-label">簡短描述</label>
                        <textarea
                            className="input"
                            rows="2"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="form-label">完整內容</label>
                        <textarea
                            className="input"
                            rows="4"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="form-label">圖片網址</label>
                        <div className="flex flex-col gap-2">
                            <input
                                type="text"
                                className="input"
                                value={formData.image_url}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                placeholder="https://..."
                            />
                            <div className="flex gap-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                    className="input"
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline btn-sm"
                                    onClick={() => setShowImageSelector(!showImageSelector)}
                                >
                                    {showImageSelector ? '取消選擇' : '選擇已上傳圖片'}
                                </button>
                            </div>
                            {showImageSelector && (
                                <div
                                    style={{
                                        maxHeight: '200px',
                                        overflowY: 'auto',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '0.5rem',
                                        padding: '0.5rem',
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                                        gap: '0.5rem',
                                    }}
                                >
                                    {uploadedImages.length === 0 ? (
                                        <p className="text-sm text-text-tertiary" style={{ gridColumn: '1 / -1' }}>
                                            尚無上傳的圖片
                                        </p>
                                    ) : (
                                        uploadedImages.map((img) => (
                                            <div
                                                key={img.url}
                                                onClick={() => handleSelectImage(img.url)}
                                                style={{
                                                    width: '80px',
                                                    height: '80px',
                                                    borderRadius: '0.25rem',
                                                    overflow: 'hidden',
                                                    border:
                                                        formData.image_url === img.url
                                                            ? '2px solid var(--primary)'
                                                            : '1px solid #e2e8f0',
                                                    cursor: 'pointer',
                                                    background: '#f8fafc',
                                                }}
                                            >
                                                <img
                                                    src={img.url}
                                                    alt=""
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                            {formData.image_url && (
                                <img
                                    src={formData.image_url}
                                    alt="預覽"
                                    className="w-32 h-20 object-cover rounded mt-2"
                                />
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">標籤 (Badge)</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.badge}
                                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                                placeholder="最新消息"
                            />
                        </div>
                        <div>
                            <label className="form-label">提示文字 (Pill)</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.pill}
                                onChange={(e) => setFormData({ ...formData, pill: e.target.value })}
                                placeholder="更多好消息請見內頁"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="form-label">類型</label>
                        <select
                            className="input"
                            value={formData.variant}
                            onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                        >
                            <option value="image">圖片</option>
                            <option value="info">資訊</option>
                        </select>
                    </div>

                    {formData.variant === 'info' && (
                        <>
                            <div>
                                <label className="form-label">圖示</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    placeholder="🕊️"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">時間標籤</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.schedule_label}
                                        onChange={(e) => setFormData({ ...formData, schedule_label: e.target.value })}
                                        placeholder="週六"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">時間</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.schedule_time}
                                        onChange={(e) => setFormData({ ...formData, schedule_time: e.target.value })}
                                        placeholder="19:00"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="form-label">備註</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.note}
                                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                    placeholder="台北市內湖區瑞光路 513 號 3F"
                                />
                            </div>
                        </>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">按鈕文字</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.action_label}
                                onChange={(e) => setFormData({ ...formData, action_label: e.target.value })}
                                placeholder="查看詳情"
                            />
                        </div>
                        <div>
                            <label className="form-label">按鈕連結</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.action_link}
                                onChange={(e) => setFormData({ ...formData, action_link: e.target.value })}
                                placeholder="/news/123"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">開始日期</label>
                            <input
                                type="datetime-local"
                                className="input"
                                value={formData.start_date ? formData.start_date.slice(0, 16) : ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, start_date: e.target.value ? new Date(e.target.value).toISOString() : '' })
                                }
                            />
                        </div>
                        <div>
                            <label className="form-label">結束日期</label>
                            <input
                                type="datetime-local"
                                className="input"
                                value={formData.end_date ? formData.end_date.slice(0, 16) : ''}
                                onChange={(e) =>
                                    setFormData({ ...formData, end_date: e.target.value ? new Date(e.target.value).toISOString() : '' })
                                }
                            />
                        </div>
                    </div>

                    <div>
                        <label className="form-label">狀態</label>
                        <select
                            className="input"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="draft">草稿</option>
                            <option value="published">已發布</option>
                            <option value="closed">已結束</option>
                        </select>
                    </div>

                    {error && <div className="text-error">{error}</div>}

                    <div className="flex justify-end gap-2 mt-6">
                        <button type="button" className="btn btn-outline" onClick={handleCloseModal}>
                            取消
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting || uploading}>
                            {submitting ? '儲存中...' : '儲存'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
