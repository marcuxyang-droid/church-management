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
        <div className="landing-page">
            {/* Hero Section */}
            <section className="landing-hero">
                <div className="landing-hero__bg">
                    <div className="landing-hero__overlay"></div>
                </div>
                <div className="container">
                    <div className="landing-hero__inner">
                        <div className="landing-hero__badge">Blessing Haven</div>
                        <h1 className="landing-hero__heading">
                            <span className="landing-hero__heading-main">我們盼望每個人都能在這裡</span>
                            <span className="landing-hero__heading-accent">被愛、被建立、被差派</span>
                        </h1>
                        <p className="landing-hero__text">
                            這裡不只是聚會，更是同行的家。我們致力於傳揚福音、建立生命、服務社區，讓每個人都能在信仰中成長，在愛中被接納。
                        </p>
                        <div className="landing-hero__actions">
                            <Link to="/newcomer" className="landing-hero__btn landing-hero__btn--primary">
                                我是新朋友
                            </Link>
                            <Link to="/events" className="landing-hero__btn landing-hero__btn--secondary">
                                查看活動
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="landing-stats">
                <div className="container">
                    <div className="landing-stats__grid">
                        {stats.map((stat) => (
                            <div key={stat.label} className="landing-stats__item">
                                <div className="landing-stats__value">{stat.value}</div>
                                <div className="landing-stats__label">{stat.label}</div>
                                <div className="landing-stats__detail">{stat.detail}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="landing-features">
                <div className="container">
                    <div className="landing-features__header">
                        <h2 className="landing-features__title">我們的特色</h2>
                        <p className="landing-features__subtitle">在這裡，每個人都能找到屬於自己的位置</p>
                    </div>
                    <div className="landing-features__grid">
                        {features.map((feature) => (
                            <div key={feature.title} className="landing-features__card">
                                <div className="landing-features__icon">{feature.icon}</div>
                                <h3 className="landing-features__card-title">{feature.title}</h3>
                                <p className="landing-features__card-text">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="landing-about">
                <div className="container">
                    <div className="landing-about__content">
                        <h2 className="landing-about__title">關於我們</h2>
                        <p className="landing-about__text">
                            我們是一個充滿活力的教會，致力於幫助每個人認識神、經歷神的愛，並在信仰中成長。無論您是初次來訪或是尋找教會的家，我們都熱烈歡迎您！
                        </p>
                        <Link to="/about" className="landing-about__btn">
                            認識教會
                        </Link>
                    </div>
                </div>
            </section>

            {/* Events Section */}
            <section className="landing-events">
                <div className="container">
                    <div className="landing-events__header">
                        <div className="landing-events__header-content">
                            <h2 className="landing-events__title">近期活動</h2>
                            <p className="landing-events__subtitle">聚焦城市、聚焦生命，每個月都有精彩聚會</p>
                        </div>
                        <Link to="/events" className="landing-events__link">
                            查看更多
                        </Link>
                    </div>

                    {loadingEvents ? (
                        <div className="landing-events__loading">載入活動中...</div>
                    ) : highlightEvents.length === 0 ? (
                        <div className="landing-events__empty">目前沒有即將舉行的活動。</div>
                    ) : (
                        <div className="landing-events__grid">
                            {highlightEvents.map((event) => (
                                <article key={event.id} className="landing-events__card">
                                    <div className="landing-events__card-date">
                                        {new Date(event.start_date).toLocaleDateString('zh-TW', { dateStyle: 'medium' })}
                                    </div>
                                    <h3 className="landing-events__card-title">{event.title}</h3>
                                    <p className="landing-events__card-description">
                                        {event.description || '歡迎加入我們，一起經歷神的作為。'}
                                    </p>
                                    <div className="landing-events__card-info">
                                        <div className="landing-events__card-info-item">
                                            <span className="landing-events__card-info-icon">📍</span>
                                            <span>{event.location || '教會'}</span>
                                        </div>
                                        <div className="landing-events__card-info-item">
                                            <span className="landing-events__card-info-icon">⏱</span>
                                            <span>{formatEventDate(event.start_date, event.end_date)}</span>
                                        </div>
                                    </div>
                                    <Link to="/events" className="landing-events__card-btn">
                                        我要報名
                                    </Link>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="landing-testimonials">
                <div className="container">
                    <div className="landing-testimonials__header">
                        <h2 className="landing-testimonials__title">家人的故事</h2>
                        <p className="landing-testimonials__subtitle">
                            信仰旅程從不孤單，我們一起經歷神的恩典與奇妙
                        </p>
                    </div>
                    <div className="landing-testimonials__grid">
                        {testimonials.map((testimonial) => (
                            <div key={testimonial.author} className="landing-testimonials__card">
                                <p className="landing-testimonials__quote">"{testimonial.quote}"</p>
                                <p className="landing-testimonials__author">{testimonial.author}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="landing-cta">
                <div className="container">
                    <div className="landing-cta__content">
                        <h2 className="landing-cta__title">加入我們的大家庭</h2>
                        <p className="landing-cta__text">
                            無論您在人生的哪個階段，我們都歡迎您來到教會，一起經歷神的愛與恩典。
                        </p>
                        <div className="landing-cta__actions">
                            <Link to="/newcomer" className="landing-cta__btn landing-cta__btn--primary">
                                新朋友登記
                            </Link>
                            <Link to="/give" className="landing-cta__btn landing-cta__btn--secondary">
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
