import { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const COINGECKO_IDS = [
    'bitcoin',
    'ethereum',
    'bitcoin-cash',
    'monero',
    'dogecoin',
    'ronin'
];

const SYMBOL_MAP: { [key: string]: string } = {
    'bitcoin': 'BTC',
    'ethereum': 'ETH',
    'bitcoin-cash': 'BCH',
    'monero': 'XMR',
    'dogecoin': 'DOGE',
    'ronin': 'RONIN'
};

interface TickerData {
    id: string;
    symbol: string;
    current_price: number;
    price_change_percentage_24h: number;
}

const Ticker: React.FC = () => {
    const [prices, setPrices] = useState<TickerData[]>([]);

    const fetchPrices = async () => {
        try {
            const ids = COINGECKO_IDS.join(',');
            const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=10&page=1&sparkline=false`);

            if (!response.ok) throw new Error('CoinGecko API failed');

            const data = await response.json();
            const formattedData = data.map((coin: any) => ({
                id: coin.id,
                symbol: SYMBOL_MAP[coin.id] || coin.symbol.toUpperCase(),
                current_price: coin.current_price,
                price_change_percentage_24h: coin.price_change_percentage_24h
            }));

            setPrices(formattedData);
        } catch (error) {
            console.error("Error fetching ticker data:", error);
        }
    };

    useEffect(() => {
        fetchPrices(); // Initial fetch
        const interval = setInterval(fetchPrices, 10000); // Poll every 10s

        return () => clearInterval(interval);
    }, []);

    const renderTickerItems = () => {
        const items = prices.map(coin => {
            const isUp = coin.price_change_percentage_24h >= 0;
            return (
                <div key={coin.id} className="ticker-item" style={{ display: 'inline-flex', alignItems: 'center', color: isUp ? '#0f0' : '#ff3333' }}>
                    <span style={{ color: '#fff', marginRight: '0.5rem', textShadow: '0 0 5px #0f0' }}>{coin.symbol}:</span>
                    <span style={{ color: '#fff', fontWeight: '900', letterSpacing: '1px' }}>${coin.current_price.toLocaleString()}</span>
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.9em', opacity: 0.9 }}>
                        {isUp ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                        {coin.price_change_percentage_24h.toFixed(2)}%
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

    return (
        <div className="ticker-container">
            <div className="ticker-content">
                {/* Duplicate items for infinite scroll effect */}
                {renderTickerItems()}
                {renderTickerItems()}
                {renderTickerItems()}
                {renderTickerItems()}
            </div>
        </div>
    );
};

export default Ticker;
