import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../utils/api';

export default function Landing() {
    const [events, setEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(true);

    useEffect(() => {
        async function fetchEvents() {
            try {
                const data = await api.getEvents({ upcoming: 'true' });
                setEvents((data.events || []).sort((a, b) => new Date(a.start_date) - new Date(b.start_date)));
            } finally {
                setLoadingEvents(false);
            }
        }
        fetchEvents();
    }, []);

    const highlightEvents = useMemo(() => events.slice(0, 3), [events]);

    return (
        <div>
            <section className="hero">
                <div className="container text-center">
                    <p className="hero__eyebrow">Blessing Haven · 教會管理系統</p>
                    <h1 className="text-5xl font-bold mb-6 fade-in hero__title">
                        歡迎來到我們的教會
                    </h1>
                    <p className="text-xl mb-8 max-w-2xl mx-auto hero__subtitle">
                        一個充滿愛與恩典的大家庭，我們致力於傳揚福音、建立生命、服務社區
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link to="/newcomer" className="btn btn-primary btn-lg">
                            我是新朋友
                        </Link>
                        <Link to="/events" className="btn btn-outline btn-lg">
                            查看活動
                        </Link>
                    </div>
                </div>
            </section>

            <section className="section section-muted">
                <div className="container">
                    <div className="grid grid-3">
                        <div className="glass-card text-center">
                            <div className="text-4xl mb-4">🙏</div>
                            <h3 className="text-xl font-bold mb-2">主日崇拜</h3>
                            <p className="text-text-secondary">每週日 上午 10:00</p>
                        </div>
                        <div className="glass-card text-center">
                            <div className="text-4xl mb-4">📖</div>
                            <h3 className="text-xl font-bold mb-2">禱告會</h3>
                            <p className="text-text-secondary">每週三 晚上 7:30</p>
                        </div>
                        <div className="glass-card text-center">
                            <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
                            <h3 className="text-xl font-bold mb-2">小組聚會</h3>
                            <p className="text-text-secondary">依各小組安排</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-4xl font-bold mb-6">關於我們</h2>
                        <p className="text-lg text-text-secondary mb-8">
                            我們是一個充滿活力的教會，致力於幫助每個人認識神、經歷神的愛，
                            並在信仰中成長。無論您是初次來訪或是尋找教會的家，我們都熱烈歡迎您！
                        </p>
                        <Link to="/about" className="btn btn-primary btn-lg">
                            了解更多
                        </Link>
                    </div>
                </div>
            </section>

            <section className="section section-muted">
                <div className="container">
                    <h2 className="text-4xl font-bold text-center mb-12">近期活動</h2>
                    {loadingEvents ? (
                        <div className="text-center text-text-secondary">載入活動中...</div>
                    ) : highlightEvents.length === 0 ? (
                        <p className="text-center text-text-secondary">目前沒有即將舉行的活動。</p>
                    ) : (
                        <div className="grid grid-3">
                            {highlightEvents.map((event) => (
                                <article key={event.id} className="card">
                                    <p className="badge badge-primary mb-3">
                                        {new Date(event.start_date).toLocaleDateString('zh-TW', { dateStyle: 'medium' })}
                                    </p>
                                    <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                                    <p className="text-text-secondary mb-4 line-clamp-3">
                                        {event.description || '歡迎加入我們，一起經歷神的作為。'}
                                    </p>
                                    <div className="flex justify-between items-center text-sm text-text-tertiary">
                                        <span>📍 {event.location || '教會'}</span>
                                        <Link to="/events" className="btn btn-primary btn-sm">
                                            了解更多
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                    <div className="text-center mt-8">
                        <Link to="/events" className="btn btn-outline btn-lg">
                            查看所有活動
                        </Link>
                    </div>
                </div>
            </section>

            <section className="gradient-warm text-white py-16">
                <div className="container text-center">
                    <h2 className="text-4xl font-bold mb-6">加入我們的大家庭</h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto">
                        無論您在人生的哪個階段，我們都歡迎您來到教會，
                        一起經歷神的愛與恩典
                    </p>
                    <Link to="/newcomer" className="btn btn-primary btn-lg">
                        新朋友登記
                    </Link>
                </div>
            </section>
        </div>
    );
}
