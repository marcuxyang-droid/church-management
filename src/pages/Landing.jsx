import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../utils/api';
import { useSettingsStore } from '../store/settings';
import NewcomerModal from '../components/NewcomerModal';
import NewsDetailModal from '../components/NewsDetailModal';

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
    const [news, setNews] = useState([]);
    const [loadingNews, setLoadingNews] = useState(true);
    const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
    const [showNewcomerModal, setShowNewcomerModal] = useState(false);
    const [showNewsModal, setShowNewsModal] = useState(false);
    const [selectedNews, setSelectedNews] = useState(null);
    const settings = useSettingsStore((state) => state.settings);
    const fetchSettings = useSettingsStore((state) => state.fetchSettings);

    useEffect(() => {
        async function fetchEvents() {
            try {
                const data = await api.getEvents({ upcoming: 'true', status: 'published' });
                setEvents((data.events || []).sort((a, b) => new Date(a.start_date) - new Date(b.start_date)));
            } finally {
                setLoadingEvents(false);
            }
        }
        fetchEvents();
    }, []);

    useEffect(() => {
        async function fetchNews() {
            try {
                setLoadingNews(true);
                const data = await api.getNews({ status: 'published' });
                const publishedNews = (data.news || []).filter(item => item.status === 'published');
                setNews(publishedNews.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)));
            } catch (err) {
                console.error('Failed to fetch news:', err);
                setNews([]);
            } finally {
                setLoadingNews(false);
            }
        }
        fetchNews();
    }, []);

    useEffect(() => {
        if (!settings) {
            fetchSettings();
        }
    }, [settings, fetchSettings]);

    useEffect(() => {
        console.log('[Landing] showNewcomerModal changed:', showNewcomerModal);
    }, [showNewcomerModal]);

    useEffect(() => {
        console.log('[Landing] showNewsModal changed:', showNewsModal, 'selectedNews:', selectedNews);
    }, [showNewsModal, selectedNews]);

    const handleOpenNewcomerModal = () => {
        console.log('[Landing] handleOpenNewcomerModal');
        setShowNewcomerModal(true);
    };

    const handleOpenNewsModal = (item) => {
        console.log('[Landing] handleOpenNewsModal item:', item?.id);
        setSelectedNews(item);
        setShowNewsModal(true);
    };

    const highlightEvents = useMemo(() => events.slice(0, 3), [events]);
    const heroArcImage = settings?.hero_arc_image_url || '/FL1.png';

    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="landing-hero" id="hero">
                {/* 背景和遮罩图片容器 - 确保左右对齐一致 */}
                <div className="landing-hero__images">
                    <div 
                        className="landing-hero__bg"
                        style={{
                            backgroundImage: settings?.hero_bg_url ? `url(${settings.hero_bg_url})` : 'linear-gradient(180deg, #87CEEB 0%, #4682B4 100%)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    ></div>
                    {heroArcImage && (
                        <img 
                            src={heroArcImage} 
                            alt="" 
                            className="landing-hero__arc-image"
                        />
                    )}
                </div>
                <div className="container">
                    <div className="landing-hero__inner">
                        <h1 className="landing-hero__heading">
                            <span className="landing-hero__heading-main">{settings?.hero_heading_main || '盼望每個人都能在這裡'}</span>
                            <span className="landing-hero__heading-accent">{settings?.hero_heading_accent || '被愛、被建立、被差派'}</span>
                        </h1>
                        <div className="landing-hero__actions">
                            <button 
                                type="button"
                                className="landing-hero__btn landing-hero__btn--primary"
                                onClick={handleOpenNewcomerModal}
                            >
                                {settings?.hero_button_text || `加入${settings?.church_name || 'Blessing Haven'}`}
                            </button>
                        </div>
                        <a href="#content" className="landing-hero__explore">
                            <div className="landing-hero__explore-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 5v14M5 12l7 7 7-7"/>
                                </svg>
                            </div>
                            <span className="landing-hero__explore-text">探索更多</span>
                        </a>
                    </div>
                </div>
            </section>

            {/* News Highlight Section */}
            <section className="landing-news" id="content">
                <div className="container">
                    <div className="landing-news__header">
                        <div>
                            <p className="landing-news__eyebrow">Church Updates</p>
                            <h2 className="landing-news__title">最新消息</h2>
                            <p className="landing-news__subtitle">掌握教會動態，找到與你生命節奏之間的共鳴</p>
                        </div>
                        {news.length > 0 && (
                            <Link to="/news" className="landing-news__more">
                                更多消息
                            </Link>
                        )}
                    </div>
                    {loadingNews ? (
                        <div className="text-center py-8 text-text-tertiary">載入中...</div>
                    ) : news.length === 0 ? (
                        <div className="text-center py-8 text-text-tertiary">尚無最新消息</div>
                    ) : (
                        <>
                            {/* Desktop: Show 3 items */}
                            <div className="landing-news__grid landing-news__grid--desktop">
                                {news.slice(0, 3).map((item) => (
                                    <article key={item.id} className="landing-news__card landing-news__card--image">
                                        {item.image_url && (
                                            <div
                                                className="landing-news__media"
                                                style={{ backgroundImage: `url(${item.image_url})` }}
                                                role="img"
                                                aria-label={item.title}
                                            >
                                                {item.pill && <span className="landing-news__pill">{item.pill}</span>}
                                            </div>
                                        )}
                                        <div className="landing-news__content">
                                            {item.badge && <span className="landing-news__badge">{item.badge}</span>}
                                            <h3 className="landing-news__card-title">{item.title}</h3>
                                            <div className="landing-news__actions">
                                                <button
                                                    type="button"
                                                    className="landing-news__link"
                                                    onClick={() => handleOpenNewsModal(item)}
                                                >
                                                    查看詳情
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                            {/* Mobile: Show 1 item with navigation */}
                            <div className="landing-news__mobile">
                                {news.length > 0 && (
                                    <article className="landing-news__card landing-news__card--image">
                                        {news[currentNewsIndex]?.image_url && (
                                            <div
                                                className="landing-news__media"
                                                style={{ backgroundImage: `url(${news[currentNewsIndex].image_url})` }}
                                                role="img"
                                                aria-label={news[currentNewsIndex].title}
                                            >
                                                {news[currentNewsIndex].pill && <span className="landing-news__pill">{news[currentNewsIndex].pill}</span>}
                                            </div>
                                        )}
                                        <div className="landing-news__content">
                                            {news[currentNewsIndex]?.badge && <span className="landing-news__badge">{news[currentNewsIndex].badge}</span>}
                                            <h3 className="landing-news__card-title">{news[currentNewsIndex]?.title}</h3>
                                            <div className="landing-news__actions">
                                                <button
                                                    type="button"
                                                    className="landing-news__link"
                                                    onClick={() => handleOpenNewsModal(news[currentNewsIndex])}
                                                >
                                                    查看詳情
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                )}
                                {news.length > 1 && (
                                    <div className="landing-news__mobile-nav">
                                        <button
                                            className="landing-news__nav-btn"
                                            onClick={() => setCurrentNewsIndex((prev) => (prev > 0 ? prev - 1 : news.length - 1))}
                                            aria-label="上一則"
                                        >
                                            ‹
                                        </button>
                                        <div className="landing-news__nav-dots">
                                            {news.slice(0, Math.min(news.length, 5)).map((_, index) => (
                                                <button
                                                    key={index}
                                                    className={`landing-news__nav-dot ${index === currentNewsIndex ? 'landing-news__nav-dot--active' : ''}`}
                                                    onClick={() => setCurrentNewsIndex(index)}
                                                    aria-label={`第 ${index + 1} 則消息`}
                                                />
                                            ))}
                                        </div>
                                        <button
                                            className="landing-news__nav-btn"
                                            onClick={() => setCurrentNewsIndex((prev) => (prev < news.length - 1 ? prev + 1 : 0))}
                                            aria-label="下一則"
                                        >
                                            ›
                                        </button>
                                    </div>
                                )}
                            </div>
                            {news.length > 3 && (
                                <div className="text-center mt-8">
                                    <Link to="/news" className="btn btn-outline">
                                        查看更多消息
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
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
                            <button
                                type="button"
                                className="landing-cta__btn landing-cta__btn--primary"
                                onClick={handleOpenNewcomerModal}
                            >
                                新朋友登記
                            </button>
                            <Link to="/give" className="landing-cta__btn landing-cta__btn--secondary">
                                支持教會
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <NewcomerModal
                isOpen={showNewcomerModal}
                onClose={() => setShowNewcomerModal(false)}
            />
            <NewsDetailModal
                isOpen={showNewsModal}
                onClose={() => {
                    setShowNewsModal(false);
                    setSelectedNews(null);
                }}
                newsItem={selectedNews}
            />
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
