import React, { useEffect, useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface TradeData {
    time: number;
    price: number;
}

const CryptoChart: React.FC = () => {
    const [data, setData] = useState<TradeData[]>([]);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        wsRef.current = new WebSocket('wss://stream.binance.com:9443/ws/bchusdt@trade');

        wsRef.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            const trade = {
                time: message.T,
                price: parseFloat(message.p),
            };

            setData(prev => {
                const newData = [...prev, trade];
                if (newData.length > 50) return newData.slice(newData.length - 50);
                return newData;
            });
        };

        return () => {
            wsRef.current?.close();
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
            {data.length > 0 && (
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
            )}
        </div>
    );
};

export default CryptoChart;
