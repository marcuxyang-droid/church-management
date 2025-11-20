export default function Footer() {
    const currentYear = new Date().getFullYear();

    const footerLinks = [
        { label: '關於我們', href: '/about' },
        { label: '活動訊息', href: '/events' },
        { label: '主日訊息', href: '/sermons' },
        { label: '線上奉獻', href: '/give' },
    ];

    const contact = [
        '📍 台灣台北市',
        '📞 +886-XXX-XXXXXX',
        '✉️ info@church.com',
    ];

    return (
        <footer className="footer">
            <div className="container">
                <div className="grid grid-3 gap-lg footer__grid">
                    <div>
                        <h3 className="footer__title">教會管理系統</h3>
                        <p className="footer__text">
                            使用一致的色彩與排版，維持視覺整體感，協助教會專注在服事與牧養。
                        </p>
                    </div>
                    <div>
                        <h4 className="footer__subtitle">快速連結</h4>
                        <ul className="footer__list">
                            {footerLinks.map((item) => (
                                <li key={item.href}>
                                    <a href={item.href}>{item.label}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="footer__subtitle">聯絡我們</h4>
                        <ul className="footer__list">
                            {contact.map((text) => (
                                <li key={text}>{text}</li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="footer__divider" />
                <p className="footer__copyright">
                    &copy; {currentYear} 教會管理系統 · Blessing Haven
                </p>
            </div>
        </footer>
    );
}
