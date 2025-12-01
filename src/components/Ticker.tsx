import { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface TickerData {
    s: string; // Symbol
    c: string; // Close price
    p: string; // Price change
    P: string; // Price change percent
}

const SYMBOLS: { [key: string]: string } = {
    BCHUSDT: 'BCH',
    BTCUSDT: 'BTC',
    ETHUSDT: 'ETH',
    XMRUSDT: 'XMR',
    DOGEUSDT: 'DOGE',
    RONINUSDT: 'RONIN'
};

const Ticker: React.FC = () => {
    const [prices, setPrices] = useState<{ [key: string]: TickerData }>({});

    useEffect(() => {
        const streams = Object.keys(SYMBOLS).map(s => `${s.toLowerCase()}@ticker`).join('/');
        const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const ticker = data.data as TickerData;
            setPrices(prev => ({ ...prev, [ticker.s]: ticker }));
        };

        return () => ws.close();
    }, []);

    const renderTickerItems = () => {
        const items = Object.keys(SYMBOLS).map(symbol => {
            const data = prices[symbol];
            if (!data) return null;

            const price = parseFloat(data.c).toFixed(2);
            const change = parseFloat(data.P).toFixed(2);
            const isUp = parseFloat(data.p) >= 0;

            return (
                <div key={symbol} className="ticker-item" style={{ display: 'inline-flex', alignItems: 'center', color: isUp ? '#0f0' : '#ff3333' }}>
                    <span style={{ color: '#fff', marginRight: '0.5rem', textShadow: '0 0 5px #0f0' }}>{SYMBOLS[symbol]}:</span>
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
