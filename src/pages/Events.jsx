import { useEffect, useMemo, useState } from 'react';
import { api } from '../utils/api';

export default function Events() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadEvents();
    }, []);

    async function loadEvents() {
        setLoading(true);
        setError('');
        try {
            const data = await api.getEvents();
            setEvents(data.events || []);
        } catch (err) {
            setError(err.message || '無法取得活動列表');
        } finally {
            setLoading(false);
        }
    }

    const now = new Date();
    const { upcoming, past } = useMemo(() => {
        const upcomingEvents = [];
        const pastEvents = [];
        events.forEach((event) => {
            if (new Date(event.start_date) >= now) {
                upcomingEvents.push(event);
            } else {
                pastEvents.push(event);
            }
        });
        return {
            upcoming: upcomingEvents.sort(sortByDate),
            past: pastEvents.sort(sortByDateDesc),
        };
    }, [events, now]);

    return (
        <div>
            <section className="section-contrast">
                <div className="container text-center">
                    <p className="hero__eyebrow">Events</p>
                    <h1 className="text-4xl font-bold mb-4">活動訊息</h1>
                    <p className="text-lg opacity-90 max-w-2xl mx-auto">
                        每一場聚會、培訓與特會，都是祝福城市與生命的契機；線上報名、即時掌握。
                    </p>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold">即將舉行</h2>
                        <button className="btn btn-outline" onClick={loadEvents} disabled={loading}>
                            重新整理
                        </button>
                    </div>

                    {error && <div className="card border border-error text-error mb-6">{error}</div>}

                    {loading ? (
                        <div className="text-text-secondary flex items-center gap-3">
                            <span className="spinner" />
                            載入中...
                        </div>
                    ) : upcoming.length === 0 ? (
                        <p className="text-text-secondary">目前沒有即將舉行的活動，歡迎稍後再回來查看。</p>
                    ) : (
                        <div className="grid grid-3">
                            {upcoming.map((event) => (
                                <article key={event.id} className="card">
                                    <p className="badge badge-primary mb-3">
                                        {new Date(event.start_date).toLocaleDateString('zh-TW', { dateStyle: 'medium' })}
                                    </p>
                                    <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                                    <p className="text-text-secondary mb-4 line-clamp-3">{event.description || '歡迎參與這場聚會。'}</p>
                                    <div className="text-sm text-text-secondary space-y-2 mb-6">
                                        <div>📍 {event.location || '教會'}</div>
                                        <div>⏱ {formatEventDate(event.start_date, event.end_date)}</div>
                                        {event.capacity ? <div>👥 上限 {event.capacity} 人</div> : null}
                                    </div>
                                    <a href="/newcomer" className="btn btn-primary w-full">
                                        我要報名
                                    </a>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {past.length > 0 && (
                <section className="section section-muted">
                    <div className="container">
                        <h2 className="text-3xl font-bold mb-6">近期活動回顧</h2>
                        <div className="grid grid-3">
                            {past.slice(0, 3).map((event) => (
                                <article key={event.id} className="card">
                                    <p className="text-text-tertiary text-sm mb-2">
                                        {new Date(event.start_date).toLocaleDateString('zh-TW', { dateStyle: 'medium' })}
                                    </p>
                                    <h3 className="text-lg font-semibold">{event.title}</h3>
                                    <p className="text-text-secondary mt-2 line-clamp-3">{event.description || '感謝所有參與者的支持與代禱。'}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}

function sortByDate(a, b) {
    return new Date(a.start_date) - new Date(b.start_date);
}

function sortByDateDesc(a, b) {
    return new Date(b.start_date) - new Date(a.start_date);
}

function formatEventDate(start, end) {
    if (!start) return '-';
    const startDate = new Date(start).toLocaleString('zh-TW', { dateStyle: 'medium', timeStyle: 'short' });
    if (!end) return startDate;
    const endDate = new Date(end).toLocaleString('zh-TW', { dateStyle: 'medium', timeStyle: 'short' });
    return `${startDate} ~ ${endDate}`;
}
