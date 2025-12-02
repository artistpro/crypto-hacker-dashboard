import { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const COINCAP_IDS: { [key: string]: string } = {
    'bitcoin': 'BTC',
    'ethereum': 'ETH',
    'bitcoin-cash': 'BCH',
    'monero': 'XMR',
    'dogecoin': 'DOGE',
    'ronin': 'RONIN'
};

interface TickerData {
    s: string; // Symbol (BTC)
    c: string; // Current Price
    p: string; // Price Change (calculated or fetched)
    P: string; // Price Change Percent
}

const Ticker: React.FC = () => {
    const [prices, setPrices] = useState<{ [key: string]: TickerData }>({});

    useEffect(() => {
        let ws: WebSocket | null = null;
        let reconnectTimeout: ReturnType<typeof setTimeout>;

        // 1. Fetch Initial Data (Prices + 24h Change) from REST API
        const fetchInitialData = async () => {
            try {
                const ids = Object.keys(COINCAP_IDS).join(',');
                const response = await fetch(`https://api.coincap.io/v2/assets?ids=${ids}`);
                const json = await response.json();

                const initialData: { [key: string]: TickerData } = {};
                json.data.forEach((asset: any) => {
                    initialData[asset.id] = {
                        s: COINCAP_IDS[asset.id],
                        c: parseFloat(asset.priceUsd).toFixed(2),
                        p: '0.00', // CoinCap doesn't give absolute change easily, we focus on %
                        P: parseFloat(asset.changePercent24Hr).toFixed(2)
                    };
                });
                setPrices(initialData);
            } catch (error) {
                console.error("Error fetching initial CoinCap data:", error);
            }
        };

        fetchInitialData();

        // 2. Connect to CoinCap WebSocket for Real-Time Prices
        const connectWebSocket = () => {
            if (ws) ws.close();

            const assets = Object.keys(COINCAP_IDS).join(',');
            ws = new WebSocket(`wss://ws.coincap.io/prices?assets=${assets}`);

            ws.onopen = () => {
                console.log('✅ Ticker WebSocket Connected (CoinCap)');
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                // CoinCap sends: { "bitcoin": "63000.50", "ethereum": "3400.20" }

                setPrices(prev => {
                    const updated = { ...prev };
                    Object.keys(data).forEach(id => {
                        if (updated[id]) {
                            updated[id] = {
                                ...updated[id],
                                c: parseFloat(data[id]).toFixed(2)
                            };
                        }
                    });
                    return updated;
                });
            };

            ws.onclose = () => {
                console.log('⚠️ Ticker WebSocket Closed. Reconnecting in 3s...');
                reconnectTimeout = setTimeout(connectWebSocket, 3000);
            };

            ws.onerror = (err) => {
                console.error('❌ Ticker WebSocket Error:', err);
                ws?.close();
            };
        };

        connectWebSocket();

        return () => {
            if (ws) ws.close();
            clearTimeout(reconnectTimeout);
        };
    }, []);

    const renderTickerItems = () => {
        const items = Object.keys(prices).map(id => {
            const data = prices[id];
            const price = data.c;
            const change = data.P;
            const isUp = parseFloat(change) >= 0;

            return (
                <div key={id} className="ticker-item" style={{ display: 'inline-flex', alignItems: 'center', color: isUp ? '#0f0' : '#ff3333' }}>
                    <span style={{ color: '#fff', marginRight: '0.5rem', textShadow: '0 0 5px #0f0' }}>{data.s}:</span>
                    <span style={{ color: '#fff', fontWeight: '900', letterSpacing: '1px' }}>${price}</span>
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.9em', opacity: 0.9 }}>
                        {isUp ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                        {change}%
                    </span>
                </div>
            );
        });

        // Add the custom text at the end of the list
        items.push(
            <div key="promo" className="ticker-item" style={{ color: '#fff', fontWeight: 'bold', textShadow: '0 0 10px #0f0' }}>
                CRYPTOMINDERS ON YOUTUBE
            </div>
        );

        return items;
    };

    const items = renderTickerItems();

    return (
        <div className="ticker-container">
            <div className="ticker-content">
                {/* Render two sets for seamless infinite scroll (0 to -50%) */}
                <div style={{ display: 'flex' }}>{items}</div>
                <div style={{ display: 'flex' }}>{items}</div>
            </div>
        </div>
    );
};

export default Ticker;
