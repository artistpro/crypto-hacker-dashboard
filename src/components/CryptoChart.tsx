import { useEffect, useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface TradeData {
    time: number;
    price: number;
}

const CryptoChart: React.FC = () => {
    const [data, setData] = useState<TradeData[]>([]);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        // 1. Fetch initial data (History) - Try CoinCap, fallback to CoinGecko
        const fetchInitialData = async () => {
            try {
                // Try CoinCap first
                const response = await fetch('https://api.coincap.io/v2/assets/bitcoin-cash/history?interval=m1');
                if (!response.ok) throw new Error('CoinCap API failed');

                const json = await response.json();
                const formattedData = json.data.slice(-50).map((t: any) => ({
                    time: t.time,
                    price: parseFloat(t.priceUsd)
                }));
                setData(formattedData);
            } catch (error) {
                console.warn("CoinCap history failed, trying fallback...", error);

                try {
                    // Fallback: Get simple current price from CoinGecko to start the line
                    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin-cash&vs_currencies=usd');
                    const json = await response.json();
                    const price = json['bitcoin-cash'].usd;

                    // Create a single starting point
                    setData([{
                        time: Date.now(),
                        price: price
                    }]);
                } catch (err2) {
                    console.error("All initial data fetches failed. Waiting for WebSocket.", err2);
                }
            }
        };

        fetchInitialData();

        // 2. Robust WebSocket Connection with Auto-Reconnect (CoinCap)
        let ws: WebSocket | null = null;
        let reconnectTimeout: ReturnType<typeof setTimeout>;

        const connectWebSocket = () => {
            if (ws) {
                ws.close();
            }

            // CoinCap Prices WS
            ws = new WebSocket('wss://ws.coincap.io/prices?assets=bitcoin-cash');
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('✅ CryptoChart WebSocket Connected (CoinCap)');
            };

            ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                // CoinCap sends: { "bitcoin-cash": "450.23" }

                if (message['bitcoin-cash']) {
                    const trade = {
                        time: Date.now(),
                        price: parseFloat(message['bitcoin-cash']),
                    };

                    setData(prev => {
                        const newData = [...prev, trade];
                        if (newData.length > 50) return newData.slice(newData.length - 50);
                        return newData;
                    });
                }
            };

            ws.onclose = () => {
                console.log('⚠️ CryptoChart WebSocket Closed. Reconnecting in 3s...');
                reconnectTimeout = setTimeout(connectWebSocket, 3000);
            };

            ws.onerror = (err) => {
                console.error('❌ CryptoChart WebSocket Error:', err);
                ws?.close(); // Trigger onclose to reconnect
            };
        };

        connectWebSocket();

        // Cleanup
        return () => {
            if (ws) ws.close();
            clearTimeout(reconnectTimeout);
        };
    }, []);

    return (
        <div style={{ width: '100%', height: '100%', minHeight: '300px', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid stroke="#003300" strokeDasharray="3 3" />
                    <XAxis
                        dataKey="time"
                        hide={true}
                        domain={['auto', 'auto']}
                    />
                    <YAxis
                        domain={['auto', 'auto']}
                        stroke="#0f0"
                        tick={{ fill: '#0f0', fontSize: 12, fontFamily: 'Courier New' }}
                        width={60}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#000', border: '1px solid #0f0', color: '#0f0' }}
                        itemStyle={{ color: '#0f0' }}
                        labelStyle={{ color: '#0f0', marginBottom: '0.5rem' }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                        labelFormatter={(label: number) => new Date(label).toLocaleTimeString()}
                    />
                    <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#0f0"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>

            {/* Current Price Overlay */}
            {data.length > 0 ? (
                <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    textAlign: 'right',
                    zIndex: 10,
                    pointerEvents: 'none'
                }}>
                    <div style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: '#fff',
                        textShadow: '0 0 10px #0f0'
                    }}>
                        ${data[data.length - 1].price.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#0f0', opacity: 0.8 }}>CURRENT PRICE</div>
                </div>
            ) : (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#0f0',
                    fontFamily: 'Courier New',
                    textAlign: 'center'
                }}>
                    <div className="flicker">ESTABLISHING UPLINK...</div>
                </div>
            )}
        </div>
    );
};

export default CryptoChart;
