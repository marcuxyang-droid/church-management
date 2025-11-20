import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../utils/api';

const features = [
    {
        icon: '✨',
        title: '聚焦主日',
        description: '沉浸在敬拜、信息與彼此扶持的主日聚會。',
    },
    {
        icon: '🤝',
        title: '家人般的小組',
        description: '在小組中分享生命、彼此代禱，建立真實關係。',
    },
    {
        icon: '🎓',
        title: '成長課程',
        description: '從基礎信仰到領袖培訓，為你預備屬靈旅程下一步。',
    },
    {
        icon: '🌏',
        title: '關懷社區',
        description: '以實際行動愛鄰舍，參與志工、短宣與關懷活動。',
    },
];

const stats = [
    { label: '固定聚會', value: '7 場', detail: '主日與平日聚會' },
    { label: '小組家庭', value: '24 個', detail: '遍佈雙北社區' },
    { label: '志工夥伴', value: '120+', detail: '同心服事' },
    { label: '差派行動', value: '12 次', detail: '年度短宣與關懷' },
];

const testimonials = [
    {
        quote: '第一次踏進教會時就感受到滿滿的接納，這裡成了我的第二個家。',
        author: 'Iris · 新朋友',
    },
    {
        quote: '在小組裡找到彼此扶持的夥伴，我們一起禱告、一起成長。',
        author: 'Michael · 小組長',
    },
    {
        quote: '參與關懷行動讓我看見更多需要，信仰不再只是口號。',
        author: 'Grace · 志工',
    },
];

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

            <section className="section">
                <div className="container">
                    <div className="stat-grid mb-10">
                        {stats.map((stat) => (
                            <div key={stat.label} className="stat-card">
                                <div className="stat-card__value">{stat.value}</div>
                                <p className="font-semibold">{stat.label}</p>
                                <p className="text-text-tertiary text-sm">{stat.detail}</p>
                            </div>
                        ))}
                    </div>

                    <div className="feature-grid">
                        {features.map((feature) => (
                            <div key={feature.title} className="feature-card">
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-bold">{feature.title}</h3>
                                <p className="text-text-secondary">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section section-muted">
                <div className="container">
                    <div className="max-w-3xl mx-auto text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4">關於我們</h2>
                        <p className="text-lg text-text-secondary">
                            我們是一個充滿活力的教會，致力於幫助每個人認識神、經歷神的愛，並在信仰中成長。無論您是初次來訪或是尋找教會的家，我們都熱烈歡迎您！
                        </p>
                    </div>
                    <div className="text-center">
                        <Link to="/about" className="btn btn-primary btn-lg">
                            認識教會
                        </Link>
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold">近期活動</h2>
                            <p className="text-text-secondary">聚焦城市、聚焦生命，每個月都有精彩聚會</p>
                        </div>
                        <Link to="/events" className="btn btn-outline">
                            查看更多
                        </Link>
                    </div>

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
                                    <div className="text-sm text-text-secondary space-y-2 mb-6">
                                        <div>📍 {event.location || '教會'}</div>
                                        <div>⏱ {formatEventDate(event.start_date, event.end_date)}</div>
                                    </div>
                                    <Link to="/events" className="btn btn-primary w-full">
                                        我要報名
                                    </Link>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section className="section section-muted">
                <div className="container">
                    <div className="max-w-2xl mx-auto text-center mb-10">
                        <h2 className="text-3xl font-bold mb-4">家人的故事</h2>
                        <p className="text-text-secondary">
                            信仰旅程從不孤單，我們一起經歷神的恩典與奇妙
                        </p>
                    </div>
                    <div className="testimonials">
                        {testimonials.map((testimonial) => (
                            <div key={testimonial.author} className="testimonial-card">
                                <p className="text-lg mb-4">“{testimonial.quote}”</p>
                                <p className="text-text-tertiary font-semibold">{testimonial.author}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <div className="cta-banner">
                        <h2 className="text-3xl font-bold mb-4">加入我們的大家庭</h2>
                        <p className="mb-6">
                            無論您在人生的哪個階段，我們都歡迎您來到教會，一起經歷神的愛與恩典。
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/newcomer" className="btn btn-primary btn-lg">
                                新朋友登記
                            </Link>
                            <Link to="/give" className="btn btn-secondary btn-lg">
                                支持教會
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function formatEventDate(start, end) {
    if (!start) return '-';
    const startDate = new Date(start).toLocaleString('zh-TW', { dateStyle: 'medium', timeStyle: 'short' });
    if (!end) return startDate;
    const endDate = new Date(end).toLocaleString('zh-TW', { dateStyle: 'medium', timeStyle: 'short' });
    return `${startDate} ~ ${endDate}`;
}
