import { useState } from 'react';

export default function Newcomer() {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        message: '',
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Submit to API
        console.log('Form data:', formData);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="min-h-screen gradient-primary flex items-center justify-center p-4">
                <div className="glass-card max-w-md text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-3xl font-bold mb-4">感謝您的登記！</h2>
                    <p className="text-text-secondary mb-6">
                        我們已收到您的資料，將有專人與您聯繫。
                        期待在教會見到您！
                    </p>
                    <a href="/" className="btn btn-primary">
                        返回首頁
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen gradient-primary py-16">
            <div className="container-narrow">
                <div className="glass-card">
                    <h1 className="text-4xl font-bold text-center mb-4">歡迎新朋友！</h1>
                    <p className="text-center text-text-secondary mb-8">
                        很高興認識您！請留下您的聯絡資訊，我們將與您保持聯繫
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
                            ></textarea>
                        </div>

                        <button type="submit" className="btn btn-primary w-full">
                            送出
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
