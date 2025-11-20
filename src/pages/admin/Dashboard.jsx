export default function Dashboard() {
    return (
        <div>
            <h1 className="text-4xl font-bold mb-8">儀表板</h1>

            <div className="grid grid-4 mb-8">
                <div className="card">
                    <div className="text-text-tertiary mb-2">總會友數</div>
                    <div className="text-3xl font-bold">-</div>
                </div>
                <div className="card">
                    <div className="text-text-tertiary mb-2">本月奉獻</div>
                    <div className="text-3xl font-bold">-</div>
                </div>
                <div className="card">
                    <div className="text-text-tertiary mb-2">即將活動</div>
                    <div className="text-3xl font-bold">-</div>
                </div>
                <div className="card">
                    <div className="text-text-tertiary mb-2">小組數量</div>
                    <div className="text-3xl font-bold">-</div>
                </div>
            </div>

            <div className="card">
                <h2 className="text-2xl font-bold mb-4">快速開始</h2>
                <p className="text-text-secondary">
                    歡迎使用教會管理系統！請從左側選單開始使用各項功能。
                </p>
            </div>
        </div>
    );
}
