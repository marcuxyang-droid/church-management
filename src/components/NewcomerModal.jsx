import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSettingsStore } from '../store/settings';

export default function NewcomerModal({ isOpen, onClose }) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        message: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const settings = useSettingsStore((state) => state.settings);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // TODO: 调用API提交表单
        console.log('Form data:', formData);
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setFormData({ name: '', phone: '', email: '', message: '' });
            onClose();
        }, 2000);
    };

    useEffect(() => {
        if (!isOpen) return;
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen]);

    if (!isOpen || typeof document === 'undefined') return null;

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>
                {submitted ? (
                    <div className="text-center py-8">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-3xl font-bold mb-3">感謝您的登記！</h2>
                        <p className="text-text-secondary">
                            我們已收到您的資料，將有專人與您聯繫。期待在教會見到您！
                        </p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold mb-4">新朋友登記</h2>
                        <p className="text-text-secondary mb-6">
                            很高興認識您！留下資料讓我們更貼近地服事您，也協助您連結小組與聚會。
                        </p>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">姓名 *</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">電話 *</label>
                                <input
                                    type="tel"
                                    className="input"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">電子郵件</label>
                                <input
                                    type="email"
                                    className="input"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">想對我們說的話</label>
                                <textarea
                                    className="input"
                                    rows="4"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-sm mt-6">
                                <button type="button" className="btn btn-outline flex-1" onClick={onClose}>
                                    取消
                                </button>
                                <button type="submit" className="btn btn-primary flex-1">
                                    送出
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>,
        document.body,
    );
}

