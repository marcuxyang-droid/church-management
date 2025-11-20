export default function Give() {
    return (
        <div className="py-16">
            <div className="container-narrow">
                <h1 className="text-4xl font-bold text-center mb-12">線上奉獻</h1>

                <div className="card mb-8">
                    <h2 className="text-2xl font-bold mb-4">奉獻方式</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <h3 className="font-bold mb-2">銀行轉帳</h3>
                            <p className="text-text-secondary">銀行：XXX銀行</p>
                            <p className="text-text-secondary">帳號：XXXX-XXXX-XXXX</p>
                            <p className="text-text-secondary">戶名：教會名稱</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h2 className="text-2xl font-bold mb-4">奉獻說明</h2>
                    <p className="text-text-secondary mb-4">
                        感謝您願意透過奉獻支持教會的事工。
                        您的奉獻將用於福音傳揚、建造信徒生命、以及服務社區。
                    </p>
                    <p className="text-text-secondary">
                        如需奉獻收據，請在轉帳後聯繫教會辦公室，
                        我們將為您開立收據。
                    </p>
                </div>
            </div>
        </div>
    );
}
