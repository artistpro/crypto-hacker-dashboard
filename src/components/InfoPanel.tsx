import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface CoinData {
    market_cap_rank: number;
    market_data: {
        current_price: { usd: number };
        market_cap: { usd: number };
        total_volume: { usd: number };
        circulating_supply: number;
        high_24h: { usd: number };
        low_24h: { usd: number };
    };
}

const InfoPanel: React.FC = () => {
    const [data, setData] = useState<CoinData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('https://api.coingecko.com/api/v3/coins/bitcoin-cash');
                setData(response.data);
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
    if (!data) return <div className="text-red-500">CONNECTION ERROR</div>;

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    const formatNumber = (val: number) => new Intl.NumberFormat('en-US').format(val);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="info-row">
                <span className="label">RANK:</span>
                <span className="value">#{data.market_cap_rank}</span>
            </div>
            <div className="info-row">
                <span className="label">MARKET CAP:</span>
                <span className="value">{formatCurrency(data.market_data.market_cap.usd)}</span>
            </div>
            <div className="info-row">
                <span className="label">24H VOLUME:</span>
                <span className="value">{formatCurrency(data.market_data.total_volume.usd)}</span>
            </div>
            <div className="info-row">
                <span className="label">CIRCULATING:</span>
                <span className="value">{formatNumber(data.market_data.circulating_supply)} BCH</span>
            </div>
            <div className="info-row">
                <span className="label">24H HIGH:</span>
                <span className="value">{formatCurrency(data.market_data.high_24h.usd)}</span>
            </div>
            <div className="info-row">
                <span className="label">24H LOW:</span>
                <span className="value">{formatCurrency(data.market_data.low_24h.usd)}</span>
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
