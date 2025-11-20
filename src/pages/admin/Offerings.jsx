import { useEffect, useMemo, useState } from 'react';
import { api } from '../../utils/api';

export default function Offerings() {
    const [offerings, setOfferings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchOfferings();
    }, []);

    const fetchOfferings = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await api.getOfferings();
            setOfferings(data.offerings || []);
        } catch (err) {
            setError(err.message || '無法取得奉獻紀錄');
        } finally {
            setLoading(false);
        }
    };

    const filteredOfferings = useMemo(() => {
        if (filter === 'all') return offerings;
        return offerings.filter((item) => item.type === filter);
    }, [offerings, filter]);

    const totalAmount = filteredOfferings.reduce(
        (sum, offering) => sum + Number(offering.amount || 0),
        0,
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-4xl font-bold">奉獻管理</h1>
                    <p className="text-text-secondary mt-2">
                        本次篩選共 {filteredOfferings.length} 筆，總計 NT$ {totalAmount.toLocaleString()}
                    </p>
                </div>
                <div className="flex flex-col gap-3 md:flex-row">
                    <select
                        className="input"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">全部類別</option>
                        <option value="tithe">十一奉獻</option>
                        <option value="thanksgiving">感恩奉獻</option>
                        <option value="building">建堂奉獻</option>
                        <option value="special">特別奉獻</option>
                    </select>
                    <button className="btn btn-outline" onClick={fetchOfferings} disabled={loading}>
                        重新整理
                    </button>
                    <button className="btn btn-primary">新增奉獻記錄</button>
                </div>
            </div>

            <div className="card overflow-x-auto">
                {error && <div className="text-error mb-4">{error}</div>}
                {loading ? (
                    <div className="flex items-center gap-3 text-text-secondary">
                        <span className="spinner" />
                        載入中...
                    </div>
                ) : filteredOfferings.length === 0 ? (
                    <p className="text-text-secondary">目前沒有奉獻記錄</p>
                ) : (
                    <table className="min-w-full">
                        <thead>
                            <tr className="text-left text-text-secondary text-sm border-b border-border">
                                <th className="py-3 pr-4 font-medium">日期</th>
                                <th className="py-3 pr-4 font-medium">奉獻人</th>
                                <th className="py-3 pr-4 font-medium">金額</th>
                                <th className="py-3 pr-4 font-medium">類別</th>
                                <th className="py-3 pr-4 font-medium">方式</th>
                                <th className="py-3 pr-4 font-medium">備註</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOfferings.map((offering) => (
                                <tr
                                    key={offering.id}
                                    className="border-b border-border last:border-b-0 hover:bg-bg-tertiary/50"
                                >
                                    <td className="py-3 pr-4">
                                        {offering.date
                                            ? new Date(offering.date).toLocaleDateString('zh-TW')
                                            : '-'}
                                    </td>
                                    <td className="py-3 pr-4">{offering.member_id || '-'}</td>
                                    <td className="py-3 pr-4 font-semibold">
                                        NT$ {Number(offering.amount || 0).toLocaleString()}
                                    </td>
                                    <td className="py-3 pr-4">{formatOfferingType(offering.type)}</td>
                                    <td className="py-3 pr-4">{formatMethod(offering.method)}</td>
                                    <td className="py-3 pr-4 text-text-secondary">{offering.notes || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

function formatOfferingType(type) {
    const map = {
        tithe: '十一奉獻',
        thanksgiving: '感恩奉獻',
        building: '建堂奉獻',
        special: '特別奉獻',
    };
    return map[type] || type || '-';
}

function formatMethod(method) {
    const map = {
        cash: '現金',
        bank: '銀行轉帳',
        linepay: 'LINE Pay',
        card: '信用卡',
    };
    return map[method] || method || '-';
}
