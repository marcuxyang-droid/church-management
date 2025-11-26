const methods = [
    {
        title: '銀行轉帳',
        details: ['銀行：XXX銀行', '分行：信義分行', '帳號：123-456-789012', '戶名：Blessing Haven 教會'],
    },
    {
        title: '線上刷卡',
        details: ['支援 Visa / Master / JCB', '可設定定期定額', '資料全程加密安全'],
    },
    {
        title: '現場奉獻',
        details: ['主日聚會可使用奉獻袋', '或至 Welcome Bar 刷卡奉獻'],
    },
];

const impacts = [
    { label: '社區關懷資源', value: '45%' },
    { label: '宣教與差派', value: '25%' },
    { label: '裝備與建堂', value: '20%' },
    { label: '日常行政運作', value: '10%' },
];

export default function Give() {
    return (
        <div>
            <section className="section-contrast">
                <div className="container text-center">
                    <h1 className="text-4xl font-bold mb-4">線上奉獻</h1>
                    <p className="text-lg max-w-2xl mx-auto">
                        感謝您以奉獻回應呼召。每一份支持都成為福音工作的助力，也延伸到城市與列國。
                    </p>
                </div>
            </section>

            <section className="section">
                <div className="container grid grid-3">
                    {methods.map((method) => (
                        <div key={method.title} className="card">
                            <h3 className="text-2xl font-bold mb-4">{method.title}</h3>
                            <ul className="text-text-secondary space-y-2">
                                {method.details.map((line) => (
                                    <li key={line}>{line}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            <section className="section section-muted">
                <div className="container grid grid-2 gap-lg">
                    <div className="card">
                        <h3 className="text-2xl font-bold mb-4">奉獻如何被使用</h3>
                        <div className="space-y-4">
                            {impacts.map((impact) => (
                                <div key={impact.label}>
                                    <div className="flex justify-between text-sm text-text-secondary mb-1">
                                        <span>{impact.label}</span>
                                        <span>{impact.value}</span>
                                    </div>
                                    <div style={{ background: '#eef2ff', borderRadius: '999px', height: '8px' }}>
                                        <div
                                            style={{
                                                width: impact.value,
                                                background: 'var(--primary)',
                                                height: '100%',
                                                borderRadius: '999px',
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="card">
                        <h3 className="text-2xl font-bold mb-4">奉獻說明</h3>
                        <p className="text-text-secondary mb-4">
                            您的奉獻將用於福音傳揚、門徒裝備、社區關懷，以及宣教差派。若需要奉獻收據，請於轉帳後聯繫教會辦公室，我們將協助開立。
                        </p>
                        <p className="text-text-secondary">
                            若您有特別指定用途，請在備註註明。需要奉獻諮詢或安排大型奉獻，也歡迎直接與財務同工聯繫。
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
