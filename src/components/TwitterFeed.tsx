import React, { useEffect, useState, useRef } from 'react';

const TWEET_TEMPLATES = [
    "BCH breaking resistance at $500! 🚀 #BCH",
    "Just bought more Bitcoin Cash. Low fees are king. 👑 #BCH",
    "CryptoMinders analysis was spot on today. 📈 #CryptoMinders",
    "Big moves coming for #BCH this week. Watch the charts.",
    "Why pay $20 in fees when you can pay $0.01? Use #BCH.",
    "New video from #CryptoMinders is a must watch! 🔥",
    "Adoption is happening. St. Maarten is #BCH island.",
    "HODLing #BCH until $1000. Who is with me?",
    "Checking the latest signals from #CryptoMinders...",
    "BCH network hashrate hitting new highs. Secure. 🔒 #BCH",
    "Can't believe the speed of this transaction. #BCH is the future.",
    "Shoutout to #CryptoMinders for the alpha.",
    "Green candles on the 4H chart! 🕯️ #BCH",
    "Remember: Not your keys, not your coins. #BCH",
    "CryptoMinders community is growing fast. 🚀 #CryptoMinders",
    "BCH/USDT looking bullish on the daily. 🐂",
    "Just sent $100 to a friend instantly. Thanks #BCH.",
    "Waiting for the breakout... ⏱️ #CryptoMinders",
    "Smart money is accumulating #BCH right now.",
    "Don't sleep on Bitcoin Cash. The utility is real. #BCH"
];

const USERS = [
    "@BCH_Whale", "@CryptoNerd", "@Satoshi_Disciple", "@GreenCandle",
    "@Block_Master", "@Chain_Vigilante", "@Peer2Peer", "@Freedom_Go",
    "@Minders_Official", "@Trade_Warrior", "@Cash_King", "@Digital_Gold"
];

const TwitterFeed: React.FC = () => {
    const [tweets, setTweets] = useState<string[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initial population
        setTweets([
            `[STREAM_CONNECTED] Monitoring #BCH #CryptoMinders...`,
            `[AUTH_SUCCESS] Twitter API v2.0 Stream`,
            `----------------------------------------`
        ]);

        const interval = setInterval(() => {
            const template = TWEET_TEMPLATES[Math.floor(Math.random() * TWEET_TEMPLATES.length)];
            const user = USERS[Math.floor(Math.random() * USERS.length)];
            const time = new Date().toLocaleTimeString([], { hour12: false });

            const newTweet = `[${time}] ${user}: ${template}`;

            setTweets(prev => {
                const updated = [...prev, newTweet];
                if (updated.length > 20) return updated.slice(updated.length - 20);
                return updated;
            });
        }, 3500); // New tweet every 3.5 seconds

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [tweets]);

    return (
        <div
            ref={containerRef}
            style={{
                height: '100%',
                overflowY: 'hidden',
                fontSize: '0.75rem',
                color: '#0f0',
                fontFamily: 'monospace',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
            }}
        >
            {tweets.map((tweet, i) => (
                <div key={i} style={{ borderBottom: '1px solid rgba(0, 255, 0, 0.1)', paddingBottom: '2px' }}>
                    {tweet}
                </div>
            ))}
            <div className="flicker">_</div>
        </div>
    );
};

export default TwitterFeed;
