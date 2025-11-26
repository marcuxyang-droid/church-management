import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function NewsDetailModal({ isOpen, onClose, newsItem }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen || !newsItem || typeof document === 'undefined') return null;

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-content--large" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>
                <div className="space-y-6">
                    {newsItem.image_url && (
                        <div
                            className="w-full rounded-lg overflow-hidden"
                            style={{
                                height: '300px',
                                backgroundImage: `url(${newsItem.image_url})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                        />
                    )}
                    <div>
                        {newsItem.badge && (
                            <span className="landing-news__badge mb-3 inline-block">{newsItem.badge}</span>
                        )}
                        <h2 className="text-3xl font-bold mb-4">{newsItem.title}</h2>
                        {newsItem.description && (
                            <p className="text-lg text-text-secondary mb-4">{newsItem.description}</p>
                        )}
                        {newsItem.content && (
                            <div 
                                className="prose prose-lg max-w-none text-text-secondary"
                                dangerouslySetInnerHTML={{ __html: newsItem.content.replace(/\n/g, '<br />') }}
                            />
                        )}
                        {newsItem.variant === 'info' && (
                            <div className="mt-6 p-4 bg-bg-secondary rounded-lg">
                                {newsItem.icon && <div className="text-4xl mb-2">{newsItem.icon}</div>}
                                {(newsItem.schedule_label || newsItem.schedule_time) && (
                                    <div className="landing-news__chip mb-2">
                                        {newsItem.schedule_label && <span>{newsItem.schedule_label}</span>}
                                        {newsItem.schedule_time && <span>{newsItem.schedule_time}</span>}
                                    </div>
                                )}
                                {newsItem.note && <p className="landing-news__note">{newsItem.note}</p>}
                            </div>
                        )}
                        {newsItem.action_link && (
                            <div className="mt-6">
                                <a
                                    href={newsItem.action_link}
                                    className="btn btn-primary"
                                    target={newsItem.action_link.startsWith('http') ? '_blank' : '_self'}
                                    rel={newsItem.action_link.startsWith('http') ? 'noopener noreferrer' : undefined}
                                >
                                    {newsItem.action_label || '了解更多'}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body,
    );
}

