import { useEffect, useMemo, useState } from 'react';
import { api } from '../../utils/api';
import Modal from '../../components/Modal';

const columns = [
    { key: 'title', label: '標題' },
    { key: 'type', label: '類型' },
    { key: 'speaker', label: '講員' },
    { key: 'date', label: '日期' },
    { key: 'tags', label: '標籤' },
];

export default function Media() {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        type: 'video',
        url: '',
        thumbnail_url: '',
        date: new Date().toISOString().split('T')[0],
        speaker: '',
        tags: '',
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchMedia();
    }, []);

    const fetchMedia = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {};
            if (typeFilter !== 'all') params.type = typeFilter;
            const data = await api.getMedia(params);
            setMedia(data.media || []);
        } catch (err) {
            setError(err.message || '無法取得媒體資料');
        } finally {
            setLoading(false);
        }
    };

    const filteredMedia = useMemo(() => {
        if (!search.trim()) return media;
        const keyword = search.trim().toLowerCase();
        return media.filter((item) =>
            [item.title, item.speaker, item.tags]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(keyword)),
        );
    }, [media, search]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            await api.createMedia(formData);
            setIsModalOpen(false);
            setFormData({
                title: '',
                type: 'video',
                url: '',
                thumbnail_url: '',
                date: new Date().toISOString().split('T')[0],
                speaker: '',
                tags: '',
            });
            fetchMedia();
        } catch (err) {
            setError(err.message || '建立媒體失敗');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-4xl font-bold">媒體庫</h1>
                    <p className="text-text-secondary mt-2">
                        目前共有 {media.length} 個媒體
                    </p>
                </div>
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <input
                        type="search"
                        placeholder="搜尋標題、講員或標籤"
                        className="input max-w-md"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                        className="input"
                        value={typeFilter}
                        onChange={(e) => {
                            setTypeFilter(e.target.value);
                            fetchMedia();
                        }}
                    >
                        <option value="all">全部類型</option>
                        <option value="video">影片</option>
                        <option value="audio">音訊</option>
                        <option value="document">文件</option>
                        <option value="image">圖片</option>
                    </select>
                    <button className="btn btn-outline" onClick={fetchMedia} disabled={loading}>
                        重新整理
                    </button>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>新增媒體</button>
                </div>
            </div>

            <div className="card overflow-x-auto">
                {error && (
                    <div className="text-error mb-4">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center gap-3 text-text-secondary">
                        <span className="spinner" />
                        載入中...
                    </div>
                ) : filteredMedia.length === 0 ? (
                    <p className="text-text-secondary">沒有符合條件的媒體</p>
                ) : (
                    <table className="min-w-full">
                        <thead>
                            <tr className="text-left text-text-secondary text-sm border-b border-border">
                                {columns.map((column) => (
                                    <th key={column.key} className="py-3 pr-4 font-medium">
                                        {column.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMedia.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-b border-border last:border-b-0 hover:bg-bg-tertiary/50"
                                >
                                    {columns.map((column) => (
                                        <td key={column.key} className="py-3 pr-4">
                                            {formatCell(item[column.key], column.key)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="新增媒體">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">標題 *</label>
                        <input
                            type="text"
                            className="input w-full"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">類型 *</label>
                            <select
                                className="input w-full"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                required
                            >
                                <option value="video">影片</option>
                                <option value="audio">音訊</option>
                                <option value="document">文件</option>
                                <option value="image">圖片</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
                            <input
                                type="date"
                                className="input w-full"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL *</label>
                        <input
                            type="url"
                            className="input w-full"
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">縮圖 URL</label>
                        <input
                            type="url"
                            className="input w-full"
                            value={formData.thumbnail_url}
                            onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">講員</label>
                            <input
                                type="text"
                                className="input w-full"
                                value={formData.speaker}
                                onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">標籤</label>
                            <input
                                type="text"
                                className="input w-full"
                                placeholder="用逗號分隔"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => setIsModalOpen(false)}
                            disabled={submitting}
                        >
                            取消
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? '建立中...' : '建立媒體'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

function formatCell(value, key) {
    if (!value) return '-';
    if (key === 'date') {
        return new Date(value).toLocaleDateString('zh-TW');
    }
    if (key === 'type') {
        const map = {
            video: '影片',
            audio: '音訊',
            document: '文件',
            image: '圖片',
        };
        return map[value] || value;
    }
    return value;
}
