import { useEffect, useMemo, useState } from 'react';
import { api } from '../../utils/api';

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
                    <button className="btn btn-primary">新增媒體</button>
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
