import { Link } from 'react-router-dom';
import { useState } from 'react';

const links = [
    { path: '/about', label: '關於我們' },
    { path: '/events', label: '活動訊息' },
    { path: '/sermons', label: '主日訊息' },
    { path: '/give', label: '線上奉獻' },
    { path: '/newcomer', label: '新朋友' },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="navbar">
            <div className="container navbar__content">
                <Link to="/" className="navbar__logo">
                    <div className="navbar__logo-mark">⛪</div>
                    <div>
                        <p className="navbar__logo-title">教會管理系統</p>
                        <p className="navbar__logo-subtitle">Blessing Haven</p>
                    </div>
                </Link>

                <div className="navbar__links">
                    {links.map((link) => (
                        <Link key={link.path} to={link.path} className="navbar__link">
                            {link.label}
                        </Link>
                    ))}
                    <Link to="/login" className="btn btn-secondary btn-sm">
                        登入
                    </Link>
                </div>

                <button className="navbar__toggle" onClick={() => setIsOpen(!isOpen)}>
                    <span />
                    <span />
                    <span />
                </button>
            </div>

            {isOpen && (
                <div className="navbar__mobile">
                    {links.map((link) => (
                        <Link key={link.path} to={link.path} className="navbar__mobile-link" onClick={() => setIsOpen(false)}>
                            {link.label}
                        </Link>
                    ))}
                    <Link to="/login" className="btn btn-primary" onClick={() => setIsOpen(false)}>
                        登入
                    </Link>
                </div>
            )}
        </nav>
    );
}
