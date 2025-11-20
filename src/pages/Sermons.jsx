const sermons = [
    {
        title: '走進曠野的恩典',
        speaker: '李牧師',
        date: '2025-11-16',
        series: '出埃及記專題',
    },
    {
        title: '祝福城市的人',
        speaker: '王傳道',
        date: '2025-11-09',
        series: '信仰與職場',
    },
    {
        title: '修復關係的勇氣',
        speaker: '張牧師',
        date: '2025-11-02',
        series: '真實關係',
    },
];

export default function Sermons() {
    return (
        <div>
            <section className="section-contrast">
                <div className="container text-center">
                    <h1 className="text-4xl font-bold mb-4">主日訊息</h1>
                    <p className="text-lg opacity-90 max-w-2xl mx-auto">
                        每週與你分享最新信息，也提供小組討論指引與講道筆記下載。
                    </p>
                </div>
            </section>

            <section className="section">
                <div className="container grid grid-3">
                    {sermons.map((sermon) => (
                        <article key={sermon.title} className="card">
                            <p className="badge badge-primary mb-3">
                                {new Date(sermon.date).toLocaleDateString('zh-TW', { dateStyle: 'medium' })}
                            </p>
                            <h3 className="text-2xl font-bold mb-2">{sermon.title}</h3>
                            <p className="text-text-secondary mb-2">講員：{sermon.speaker}</p>
                            <p className="text-text-tertiary text-sm mb-4">{sermon.series}</p>
                            <div className="flex gap-2">
                                <button className="btn btn-primary btn-sm" type="button">
                                    觀看影片
                                </button>
                                <button className="btn btn-secondary btn-sm" type="button">
                                    下載講義
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
}
