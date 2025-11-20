export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-text-primary text-white" style={{ padding: '3rem 0' }}>
            <div className="container">
                <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
                    {/* About */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">教會管理系統</h3>
                        <p className="text-text-tertiary">
                            致力於幫助教會更有效地管理會友、活動、課程與小組，
                            讓教會專注於最重要的事工。
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold mb-4">快速連結</h4>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ marginBottom: '0.5rem' }}><a href="/about" className="text-text-tertiary">關於我們</a></li>
                            <li style={{ marginBottom: '0.5rem' }}><a href="/events" className="text-text-tertiary">活動訊息</a></li>
                            <li style={{ marginBottom: '0.5rem' }}><a href="/sermons" className="text-text-tertiary">主日訊息</a></li>
                            <li style={{ marginBottom: '0.5rem' }}><a href="/give" className="text-text-tertiary">線上奉獻</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-lg font-bold mb-4">聯絡我們</h4>
                        <ul style={{ listStyle: 'none', padding: 0 }} className="text-text-tertiary">
                            <li style={{ marginBottom: '0.5rem' }}>📍 台灣台北市</li>
                            <li style={{ marginBottom: '0.5rem' }}>📞 +886-XXX-XXXXXX</li>
                            <li style={{ marginBottom: '0.5rem' }}>✉️ info@church.com</li>
                        </ul>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid var(--text-secondary)', paddingTop: '2rem', textAlign: 'center' }} className="text-text-tertiary">
                    <p>&copy; {currentYear} 教會管理系統. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
