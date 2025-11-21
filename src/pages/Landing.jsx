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

    useEffect(() => {
        // Scroll reveal animation
        const revealEls = document.querySelectorAll('.reveal');
        const onScroll = () => {
            const triggerBottom = window.innerHeight * 0.9;
            revealEls.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < triggerBottom) {
                    el.classList.add('visible');
                }
            });
        };
        window.addEventListener('scroll', onScroll);
        window.addEventListener('load', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('load', onScroll);
        };
    }, []);

    const highlightEvents = useMemo(() => events.slice(0, 3), [events]);

    return (
        <div className="modern-landing-page">
            {/* Hero Section */}
            <section className="modern-hero">
                <div className="modern-hero-bg-orb">
                    <div className="orb orb-1"></div>
                    <div className="orb orb-2"></div>
                    <div className="orb orb-3"></div>
                </div>
                <div className="modern-hero-content">
                    <div className="modern-hero-right reveal">
                        <div className="modern-preview-card">
                            <div className="modern-preview-inner">
                                <div className="modern-preview-header">
                                    <span>近期活動 · 今日</span>
                                    <div className="modern-preview-badges">
                                        <span className="modern-preview-badge">即將開始</span>
                                        <span className="modern-preview-badge">歡迎參加</span>
                                    </div>
                                </div>
                                {loadingEvents ? (
                                    <div className="modern-preview-loading">載入中...</div>
                                ) : highlightEvents.length > 0 ? (
                                    <>
                                        <div className="modern-preview-metric">
                                            <div className="modern-preview-metric-value">{highlightEvents.length}</div>
                                            <div className="modern-preview-metric-tag">場活動</div>
                                        </div>
                                        <div className="modern-preview-events">
                                            {highlightEvents.slice(0, 3).map((event) => (
                                                <div key={event.id} className="modern-preview-event">
                                                    <div className="modern-preview-event-title">{event.title}</div>
                                                    <div className="modern-preview-event-date">
                                                        {new Date(event.start_date).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="modern-preview-empty">目前沒有活動</div>
                                )}
                                <div className="modern-preview-footer">
                                    <div>
                                        <div>最新活動資訊</div>
                                        <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>即時更新</div>
                                    </div>
                                    <Link to="/events" className="modern-preview-link">查看全部 →</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modern-hero-left reveal">
                        <div className="modern-hero-kicker">
                            <span className="modern-hero-kicker-dot"></span>
                            <span>Blessing Haven</span>
                        </div>
                        <h1 className="modern-hero-title">
                            我們盼望每個人都能在這裡 <span>被愛、被建立、被差派</span>
                        </h1>
                        <p className="modern-hero-subtitle">
                            這裡不只是聚會，更是同行的家。我們致力於傳揚福音、建立生命、服務社區，讓每個人都能在信仰中成長，在愛中被接納。
                        </p>
                        <div className="modern-hero-ctas">
                            <Link to="/newcomer" className="modern-btn-primary">
                                我是新朋友
                                <span>➜</span>
                            </Link>
                            <Link to="/events" className="modern-btn-ghost">
                                查看活動
                            </Link>
                        </div>
                        <div className="modern-hero-meta">
                            <span className="modern-hero-meta-pill">✨ 歡迎新朋友</span>
                            <span>每週主日 10:00 聚會</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="modern-section" id="features">
                <div className="modern-section-header reveal">
                    <div className="modern-section-kicker">我們的特色</div>
                    <h2 className="modern-section-title">在這裡，每個人都能找到屬於自己的位置</h2>
                    <p className="modern-section-subtitle">
                        從主日聚會到小組生活，從成長課程到社區關懷，我們提供多元的服事與成長機會。
                    </p>
                </div>
                <div className="modern-features-grid">
                    {features.map((feature, index) => (
                        <article key={feature.title} className="modern-feature-card reveal" style={{ animationDelay: `${index * 0.1}s` }}>
                            <div className="modern-feature-icon">{feature.icon}</div>
                            <h3 className="modern-feature-title">{feature.title}</h3>
                            <p className="modern-feature-desc">{feature.description}</p>
                        </article>
                    ))}
                </div>
                <div className="modern-stats-row reveal">
                    {stats.map((stat) => (
                        <div key={stat.label} className="modern-stat-item">
                            <div className="modern-stat-value">{stat.value}</div>
                            <div className="modern-stat-label">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="modern-section" id="testimonials">
                <div className="modern-section-header reveal">
                    <div className="modern-section-kicker">家人的故事</div>
                    <h2 className="modern-section-title">信仰旅程從不孤單</h2>
                    <p className="modern-section-subtitle">
                        我們一起經歷神的恩典與奇妙，在愛中彼此扶持成長。
                    </p>
                </div>
                <div className="modern-testimonials">
                    <div className="modern-testimonial-card reveal">
                        <p className="modern-testimonial-quote">
                            「{testimonials[0].quote}」
                        </p>
                        <div className="modern-testimonial-author">
                            <div>
                                <div className="modern-testimonial-name">{testimonials[0].author}</div>
                            </div>
                        </div>
                    </div>
                    <div className="modern-testimonial-list">
                        {testimonials.slice(1).map((testimonial) => (
                            <div key={testimonial.author} className="modern-testimonial-mini reveal">
                                「{testimonial.quote}」— {testimonial.author}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Events Section */}
            {highlightEvents.length > 0 && (
                <section className="modern-section">
                    <div className="modern-section-header reveal">
                        <div className="modern-section-kicker">近期活動</div>
                        <h2 className="modern-section-title">聚焦城市、聚焦生命</h2>
                        <p className="modern-section-subtitle">每個月都有精彩聚會，歡迎您一起參與</p>
                    </div>
                    <div className="modern-events-grid">
                        {highlightEvents.map((event) => (
                            <article key={event.id} className="modern-event-card reveal">
                                <div className="modern-event-date">
                                    {new Date(event.start_date).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })}
                                </div>
                                <h3 className="modern-event-title">{event.title}</h3>
                                <p className="modern-event-description">
                                    {event.description || '歡迎加入我們，一起經歷神的作為。'}
                                </p>
                                <div className="modern-event-info">
                                    <div className="modern-event-info-item">
                                        <span>📍</span> {event.location || '教會'}
                                    </div>
                                    <div className="modern-event-info-item">
                                        <span>⏱</span> {formatEventTime(event.start_date)}
                                    </div>
                                </div>
                                <Link to="/events" className="modern-event-link">
                                    我要報名 →
                                </Link>
                            </article>
                        ))}
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className="modern-section">
                <div className="modern-cta reveal" id="cta">
                    <div>
                        <div className="modern-cta-text-main">加入我們的大家庭</div>
                        <div className="modern-cta-text-sub">
                            無論您在人生的哪個階段，我們都歡迎您來到教會，一起經歷神的愛與恩典。
                        </div>
                    </div>
                    <div className="modern-cta-actions">
                        <Link to="/newcomer" className="modern-btn-primary">
                            新朋友登記
                        </Link>
                        <Link to="/give" className="modern-cta-secondary">
                            支持教會
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

function formatEventTime(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
}
