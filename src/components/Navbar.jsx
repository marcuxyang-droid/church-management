import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const links = [
    { path: '/about', label: '關於我們' },
    { path: '/events', label: '活動訊息' },
    { path: '/sermons', label: '主日訊息' },
    { path: '/give', label: '線上奉獻' },
    { path: '/newcomer', label: '新朋友' },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    return (
        <nav className={`navbar ${isScrolled ? 'navbar--scrolled' : ''}`}>
            <div className="container navbar__content">
                <Link to="/" className="navbar__logo">
                    <div className="navbar__logo-mark">
                        <span className="navbar__logo-icon">⛪</span>
                    </div>
                    <div className="navbar__logo-text">
                        <p className="navbar__logo-title">Blessing Haven</p>
                        <p className="navbar__logo-subtitle">祝福之家</p>
                    </div>
                </Link>

                <div className="navbar__links">
                    {links.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`navbar__link ${isActive ? 'navbar__link--active' : ''}`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                    <Link to="/login" className="btn btn-primary btn-sm navbar__login-btn">
                        登入
                    </Link>
                </div>

                <button
                    className={`navbar__toggle ${isOpen ? 'navbar__toggle--open' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    <span />
                    <span />
                    <span />
                </button>
            </div>

            <div className={`navbar__mobile ${isOpen ? 'navbar__mobile--open' : ''}`}>
                <div className="navbar__mobile-content">
                    {links.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`navbar__mobile-link ${isActive ? 'navbar__mobile-link--active' : ''}`}
                                onClick={() => setIsOpen(false)}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                    <Link to="/login" className="btn btn-primary w-full mt-4" onClick={() => setIsOpen(false)}>
                        登入
                    </Link>
                </div>
            </div>
        </nav>
    );
}
