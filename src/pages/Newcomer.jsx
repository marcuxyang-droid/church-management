import { useState } from 'react';

const steps = [
    { title: '歡迎接待', detail: '主日服務台會有接待同工協助您認識教會。' },
    { title: '小組連結', detail: '我們會根據您的地區與需求推薦合適的小組。' },
    { title: '跟進關懷', detail: '專人與您聯繫，陪伴您走進信仰與教會生活。' },
];

const highlights = [
    { label: '聚會時間', value: '每週日 10:00' },
    { label: '地址', value: '台北市信義區 XX 路' },
    { label: '聯絡電話', value: '02-1234-5678' },
];

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
        console.log('Form data:', formData);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="section-contrast min-h-screen flex items-center">
                <div className="container">
                    <div className="card max-w-xl mx-auto text-center">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-3xl font-bold mb-3">感謝您的登記！</h2>
                        <p className="text-text-secondary mb-6">
                            我們已收到您的資料，將有專人與您聯繫。期待在教會見到您！
                        </p>
                        <a href="/" className="btn btn-primary">
                            返回首頁
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="section">
            <div className="container grid grid-2 gap-lg items-start">
                <div>
                    <h1 className="text-4xl font-bold mb-4">新朋友登記</h1>
                    <p className="text-text-secondary mb-6">
                        很高興認識您！留下資料讓我們更貼近地服事您，也協助您連結小組與聚會。
                    </p>
                    <div className="space-y-4 mb-8">
                        {steps.map((step) => (
                            <div key={step.title} className="card">
                                <h3 className="text-xl font-bold">{step.title}</h3>
                                <p className="text-text-secondary mt-2">{step.detail}</p>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-3 gap-md">
                        {highlights.map((item) => (
                            <div key={item.label} className="stat-card">
                                <div className="stat-card__value" style={{ fontSize: '1.5rem' }}>
                                    {item.value}
                                </div>
                                <p className="text-text-tertiary text-sm">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h2 className="text-2xl font-bold mb-4">留下你的資訊</h2>
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
                        <button type="submit" className="btn btn-primary w-full">
                            送出
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
