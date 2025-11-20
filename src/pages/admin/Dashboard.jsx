import { useEffect, useState } from 'react';
import { api } from '../../utils/api';

const initialStats = {
    members: 0,
    offerings: 0,
    events: 0,
    upcomingEvents: 0,
};

export default function Dashboard() {
    const [stats, setStats] = useState(initialStats);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadStats();
    }, []);

    async function loadStats() {
        setLoading(true);
        setError('');
        try {
            const [membersRes, offeringsRes, eventsRes] = await Promise.all([
                api.getMembers(),
                api.getOfferings({ start_date: getMonthStart(), end_date: getMonthEnd() }),
                api.getEvents(),
            ]);

            const now = new Date();
            const upcoming = eventsRes.events?.filter((event) => new Date(event.start_date) >= now) || [];

            setStats({
                members: membersRes.total ?? membersRes.members?.length ?? 0,
                offerings: offeringsRes.total ?? 0,
                events: eventsRes.events?.length ?? 0,
                upcomingEvents: upcoming.length,
            });
        } catch (err) {
            setError(err.message || '無法取得儀表板資料');
        } finally {
            setLoading(false);
        }
    }

    const cards = [
        { label: '總會友數', value: stats.members.toLocaleString() },
        { label: '本月奉獻 (NT$)', value: stats.offerings.toLocaleString() },
        { label: '即將活動', value: stats.upcomingEvents },
        { label: '全部活動', value: stats.events },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-4xl font-bold">儀表板</h1>
                <button className="btn btn-outline" onClick={loadStats} disabled={loading}>
                    重新整理
                </button>
            </div>

            {error && (
                <div className="card bg-error/10 border border-error text-error">
                    {error}
                </div>
            )}

            <div className="grid grid-4">
                {cards.map((card) => (
                    <div key={card.label} className="card">
                        <div className="text-text-tertiary mb-2">{card.label}</div>
                        {loading ? (
                            <div className="text-text-tertiary flex items-center gap-2">
                                <span className="spinner" /> 載入中...
                            </div>
                        ) : (
                            <div className="text-3xl font-bold">{card.value}</div>
                        )}
                    </div>
                ))}
            </div>

            <div className="card">
                <h2 className="text-2xl font-bold mb-4">快速開始</h2>
                <ul className="list-disc pl-6 text-text-secondary space-y-2">
                    <li>至「會友管理」維護名單與信仰狀態</li>
                    <li>在「奉獻管理」記錄奉獻並自動寄出收據</li>
                    <li>透過「活動管理」建立活動與 QR Code 報到</li>
                    <li>若需要更多報表，可從 Google Sheet 匯出</li>
                </ul>
            </div>
        </div>
    );
}

function getMonthStart() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

function getMonthEnd() {
    const date = new Date();
    date.setMonth(date.getMonth() + 1, 0);
    return date.toISOString().split('T')[0];
}
