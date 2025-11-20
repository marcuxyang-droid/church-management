import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-primary text-white shadow-lg sticky top-0 z-50">
            <div className="container">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                            <span className="text-primary text-xl font-bold">⛪</span>
                        </div>
                        <span className="text-xl font-bold">教會管理系統</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/about" className="hover:text-primary-light transition">關於我們</Link>
                        <Link to="/events" className="hover:text-primary-light transition">活動訊息</Link>
                        <Link to="/sermons" className="hover:text-primary-light transition">主日訊息</Link>
                        <Link to="/give" className="hover:text-primary-light transition">線上奉獻</Link>
                        <Link to="/newcomer" className="hover:text-primary-light transition">新朋友</Link>
                        <Link to="/login" className="btn btn-secondary btn-sm">登入</Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden py-4 border-t border-primary-light">
                        <div className="flex flex-col gap-4">
                            <Link to="/about" className="hover:text-primary-light transition">關於我們</Link>
                            <Link to="/events" className="hover:text-primary-light transition">活動訊息</Link>
                            <Link to="/sermons" className="hover:text-primary-light transition">主日訊息</Link>
                            <Link to="/give" className="hover:text-primary-light transition">線上奉獻</Link>
                            <Link to="/newcomer" className="hover:text-primary-light transition">新朋友</Link>
                            <Link to="/login" className="btn btn-secondary btn-sm">登入</Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
