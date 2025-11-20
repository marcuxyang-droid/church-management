import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function AdminLayout() {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f2f4f8' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <header
                    style={{
                        padding: '1.5rem 2rem',
                        borderBottom: '1px solid #e5e9f2',
                        background: '#fff',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                    }}
                >
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>控制台</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>管理會友、奉獻與所有教會活動</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn btn-outline">快速建立活動</button>
                        <button className="btn btn-primary">新增會員</button>
                    </div>
                </header>
                <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
