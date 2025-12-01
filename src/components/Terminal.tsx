import React, { useEffect, useState, useRef } from 'react';

const Terminal: React.FC = () => {
    const [lines, setLines] = useState<string[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const commands = [
            "Scanning ports...",
            "Connecting to node 192.168.0.1...",
            "Handshake successful.",
            "Decrypting stream...",
            "Analyzing blockchain...",
            "Fetching mempool...",
            "Validating transaction...",
            "Hash found: 000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f",
            "Updating ledger...",
            "Syncing with peers...",
            "Warning: High volatility detected.",
            "Optimizing route...",
            "Ping: 12ms",
            "Access granted.",
            "Downloading block header...",
        ];

        const interval = setInterval(() => {
            const cmd = commands[Math.floor(Math.random() * commands.length)];
            const timestamp = new Date().toLocaleTimeString();
            setLines(prev => [...prev.slice(-15), `[${timestamp}] ${cmd}`]);
        }, 800);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [lines]);

    return (
        <div ref={containerRef} style={{ height: '100%', overflowY: 'hidden', fontSize: '0.8rem', color: '#0f0' }}>
            {lines.map((line, i) => (
                <div key={i}>{line}</div>
            ))}
            <div className="flicker">_</div>
        </div>
    );
};

export default Terminal;
