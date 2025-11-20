import { Link } from 'react-router-dom';

export default function Landing() {
    return (
        <div>
            {/* Hero Section */}
            <section className="gradient-primary text-white py-20">
                <div className="container text-center">
                    <h1 className="text-5xl font-bold mb-6 fade-in">
                        歡迎來到我們的教會
                    </h1>
                    <p className="text-xl mb-8 text-primary-light max-w-2xl mx-auto">
                        一個充滿愛與恩典的大家庭，我們致力於傳揚福音、建立生命、服務社區
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link to="/newcomer" className="btn btn-secondary btn-lg">
                            我是新朋友
                        </Link>
                        <Link to="/events" className="btn btn-outline btn-lg" style={{ borderColor: 'white', color: 'white' }}>
                            查看活動
                        </Link>
                    </div>
                </div>
            </section>

            {/* Service Times */}
            <section className="py-16 bg-primary">
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
                            <p className="text-text-secondary">各小組時間不同</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="py-16">
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

            {/* Latest Events */}
            <section className="py-16 bg-secondary">
                <div className="container">
                    <h2 className="text-4xl font-bold text-center mb-12">近期活動</h2>
                    <div className="grid grid-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="card">
                                <div className="h-48 bg-gradient-primary rounded-lg mb-4"></div>
                                <h3 className="text-xl font-bold mb-2">活動標題 {i}</h3>
                                <p className="text-text-secondary mb-4">
                                    活動簡介，這裡會顯示活動的簡短描述...
                                </p>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-text-tertiary">📅 2024-01-01</span>
                                    <Link to="/events" className="btn btn-primary btn-sm">
                                        了解更多
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-8">
                        <Link to="/events" className="btn btn-outline btn-lg">
                            查看所有活動
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
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
