const mission = [
    {
        title: '傳揚福音',
        description: '以清楚、真實的信息分享耶穌，讓更多人認識救恩。',
    },
    {
        title: '建立門徒',
        description: '透過裝備課程與陪伴，讓生命扎根於真理中。',
    },
    {
        title: '影響城市',
        description: '走進社區、職場與家庭，以愛與行動帶出改變。',
    },
];

const milestones = [
    { year: '2010', content: '教會在台北成立，開啟第一堂主日崇拜。' },
    { year: '2015', content: '展開小組系統，建立牧養與門訓文化。' },
    { year: '2019', content: '啟動 Blessing Haven 社區關懷行動。' },
    { year: '2024', content: '導入線上管理系統，串連奉獻、活動與志工。' },
];

const ministries = [
    { icon: '👨‍👩‍👧‍👦', title: '家庭與婚姻', description: '陪伴每個家庭走過各樣季節，建立穩固婚姻。' },
    { icon: '🧒', title: '兒童與青少年', description: '從小扎根信仰，培養敬虔與品格。' },
    { icon: '🎶', title: '敬拜與藝術', description: '發揮恩賜，讓敬拜與創意成為橋梁。' },
    { icon: '🤲', title: '社區關懷', description: '志工關懷、食物銀行、行動醫療等實際行動。' },
];

export default function About() {
    return (
        <div>
            <section className="about-hero">
                <div className="about-hero__content">
                    <div className="container">
                        <div className="about-hero__header">
                            <h1 className="about-hero__title">關於 Blessing Haven</h1>
                            <p className="about-hero__description">
                                我們盼望每個人都能在這裡被愛、被建立、被差派。這裡不只是聚會，更是同行的家。
                            </p>
                        </div>
                        <div className="about-hero__missions">
                            {mission.map((item, index) => (
                                <div key={item.title} className="mission-card" style={{ animationDelay: `${index * 0.1}s` }}>
                                    <h3 className="mission-card__title">{item.title}</h3>
                                    <p className="mission-card__description">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="section section-muted">
                <div className="container">
                    <h2 className="text-3xl font-bold mb-6 text-center">旅程里程碑</h2>
                    <div className="timeline">
                        {milestones.map((item) => (
                            <div key={item.year} className="timeline__item">
                                <div className="timeline__year">{item.year}</div>
                                <div className="card" style={{ flex: 1 }}>
                                    <p className="text-text-secondary">{item.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <h2 className="text-3xl font-bold text-center mb-8">主要事工</h2>
                    <div className="feature-grid">
                        {ministries.map((item) => (
                            <div key={item.title} className="feature-card">
                                <div className="text-3xl">{item.icon}</div>
                                <h3 className="text-xl font-bold mt-4">{item.title}</h3>
                                <p className="text-text-secondary">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section section-muted">
                <div className="container grid grid-2 gap-lg">
                    <div className="card">
                        <h3 className="text-2xl font-bold mb-4">聚會時間</h3>
                        <div className="space-y-4 text-text-secondary">
                            <div>
                                <p className="font-semibold">主日崇拜</p>
                                <p>每週日 上午 10:00 · 教會大堂</p>
                            </div>
                            <div>
                                <p className="font-semibold">禱告會</p>
                                <p>每週三 晚上 7:30 · 祈禱室 / 線上</p>
                            </div>
                            <div>
                                <p className="font-semibold">小組聚會</p>
                                <p>依各小組安排 · 全台多據點</p>
                            </div>
                        </div>
                    </div>
                    <div className="card">
                        <h3 className="text-2xl font-bold mb-4">聯絡與地點</h3>
                        <p className="text-text-secondary mb-4">
                            我們位於台北市中心，鄰近捷運站，歡迎預約參觀或直接參與聚會。
                        </p>
                        <div className="space-y-2 text-text-secondary">
                            <p>📍 台北市信義區 XX 路 XX 號</p>
                            <p>☎️ 02-1234-5678</p>
                            <p>✉️ hello@blessing-haven.club</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
