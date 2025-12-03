import { useEffect, useState } from 'react';

interface CoinData {
    rank: number;
    quotes: {
        USD: {
            price: number;
            market_cap: number;
            volume_24h: number;
            percent_change_24h: number;
            ath_price: number;
        }
    };
    circulating_supply: number;
    total_supply: number;
    max_supply: number;
}

const InfoPanel: React.FC = () => {
    const [data, setData] = useState<CoinData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Using CoinPaprika API (No API Key needed, very reliable)
                const response = await fetch('https://api.coinpaprika.com/v1/tickers/bch-bitcoin-cash');
                if (!response.ok) throw new Error('API Error');

                const json = await response.json();
                setData(json);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="flicker">INITIALIZING DATA STREAM...</div>;
    if (!data) return <div className="text-red-500">CONNECTION ERROR (RETRYING...)</div>;

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    const formatNumber = (val: number) => new Intl.NumberFormat('en-US').format(val);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="info-row">
                <span className="label">RANK (PAPRIKA):</span>
                <span className="value">#{data.rank}</span>
            </div>
            <div className="info-row">
                <span className="label">MARKET CAP:</span>
                <span className="value">{formatCurrency(data.quotes.USD.market_cap)}</span>
            </div>
            <div className="info-row">
                <span className="label">24H VOLUME:</span>
                <span className="value">{formatCurrency(data.quotes.USD.volume_24h)}</span>
            </div>
            <div className="info-row">
                <span className="label">CIRCULATING:</span>
                <span className="value">{formatNumber(data.circulating_supply || data.total_supply)} BCH</span>
            </div>
            <div className="info-row">
                <span className="label">MAX SUPPLY:</span>
                <span className="value">{formatNumber(data.max_supply)} BCH</span>
            </div>
            <div className="info-row">
                <span className="label">ALL TIME HIGH:</span>
                <span className="value">{formatCurrency(data.quotes.USD.ath_price)}</span>
            </div>

            <style>{`
        .info-row {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px dashed #003300;
          padding: 0.5rem 0;
        }
        .label {
          color: #0f0;
          opacity: 0.8;
        }
        .value {
          color: #fff;
          text-shadow: 0 0 5px #0f0;
        }
      `}</style>
        </div>
    );
};

export default InfoPanel;
