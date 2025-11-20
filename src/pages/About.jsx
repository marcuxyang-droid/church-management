export default function About() {
    return (
        <div className="py-16">
            <div className="container-narrow">
                <h1 className="text-4xl font-bold text-center mb-12">關於我們</h1>

                <div className="card mb-8">
                    <h2 className="text-2xl font-bold mb-4">我們的使命</h2>
                    <p className="text-text-secondary">
                        我們的使命是傳揚耶穌基督的福音，建立信徒的生命，
                        並透過愛與服務來影響我們的社區。
                    </p>
                </div>

                <div className="card mb-8">
                    <h2 className="text-2xl font-bold mb-4">我們的異象</h2>
                    <p className="text-text-secondary">
                        成為一個充滿愛、恩典與真理的教會，
                        讓每個人都能在這裡找到屬靈的家，經歷神的同在。
                    </p>
                </div>

                <div className="card">
                    <h2 className="text-2xl font-bold mb-4">聚會時間與地點</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <h3 className="font-bold mb-2">主日崇拜</h3>
                            <p className="text-text-secondary">每週日 上午 10:00 - 12:00</p>
                        </div>
                        <div>
                            <h3 className="font-bold mb-2">禱告會</h3>
                            <p className="text-text-secondary">每週三 晚上 7:30 - 9:00</p>
                        </div>
                        <div>
                            <h3 className="font-bold mb-2">地址</h3>
                            <p className="text-text-secondary">台灣台北市</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
