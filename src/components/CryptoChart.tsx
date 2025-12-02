import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface TradeData {
    time: number;
    price: number;
}

const CryptoChart: React.FC = () => {
    const [data, setData] = useState<TradeData[]>([]);

    const fetchHistory = async () => {
        try {
            // Get last 1 hour of data (approx) from CoinGecko
            // 'days=1' gives hourly data, 'days=0.04' gives minute data approx
            const response = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin-cash/market_chart?vs_currency=usd&days=0.04');
            if (!response.ok) throw new Error('CoinGecko History API failed');

            const json = await response.json();
            const prices = json.prices; // [[timestamp, price], ...]

            const formattedData = prices.slice(-50).map((p: [number, number]) => ({
                time: p[0],
                price: p[1]
            }));

            setData(formattedData);
        } catch (error) {
            console.error("Error fetching history:", error);
            // If history fails, start with empty array, live polling will fill it
        }
    };

    const fetchCurrentPrice = async () => {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin-cash&vs_currencies=usd');
            if (!response.ok) throw new Error('CoinGecko Price API failed');

            const json = await response.json();
            const price = json['bitcoin-cash'].usd;

            const newPoint = {
                time: Date.now(),
                price: price
            };

            setData(prev => {
                const newData = [...prev, newPoint];
                if (newData.length > 50) return newData.slice(newData.length - 50);
                return newData;
            });
        } catch (error) {
            console.error("Error fetching current price:", error);
        }
    };

    useEffect(() => {
        // 1. Load initial history
        fetchHistory();

        // 2. Start polling for live updates
        const interval = setInterval(fetchCurrentPrice, 5000); // Poll every 5s

        return () => clearInterval(interval);
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
