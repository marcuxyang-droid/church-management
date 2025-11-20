import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { api } from '../utils/api';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.login(formData.email, formData.password);
            login(response.user, response.token);
            navigate('/admin');
        } catch (err) {
            setError(err.message || '登入失敗，請檢查您的電子郵件和密碼');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen gradient-primary flex items-center justify-center p-4">
            <div className="glass-card max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-primary text-3xl font-bold">⛪</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">教會管理系統</h1>
                    <p className="text-text-secondary">請登入以繼續</p>
                </div>

                {error && (
                    <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">電子郵件</label>
                        <input
                            type="email"
                            className="input"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">密碼</label>
                        <input
                            type="password"
                            className="input"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                登入中...
                            </>
                        ) : (
                            '登入'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <a href="/" className="text-primary hover:text-primary-dark">
                        返回首頁
                    </a>
                </div>
            </div>
        </div>
    );
}
