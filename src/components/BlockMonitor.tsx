import React, { useEffect, useState, useRef } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { Box, Volume2, VolumeX } from 'lucide-react';

interface BlockData {
    height: number;
    time: number; // Unix timestamp (seconds)
}

const BlockMonitor: React.FC = () => {
    const [block, setBlock] = useState<BlockData | null>(null);
    const [timeSinceLast, setTimeSinceLast] = useState<string>('CALCULATING...');
    const [estTime, setEstTime] = useState<string>('');
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [flash, setFlash] = useState(false);
    const lastBlockHeight = useRef<number>(0);

    // 1. Listen for Sound Setting
    useEffect(() => {
        const soundRef = ref(db, 'settings/soundEnabled');
        const unsubscribe = onValue(soundRef, (snapshot) => {
            const val = snapshot.val();
            if (val !== null) setSoundEnabled(val);
        });
        return () => unsubscribe();
    }, []);

    // 2. Multi-Source Fetching Strategy
    const fetchBlockData = async () => {
        const now = Date.now();

        // Define sources
        const sources = [
            // Source A: Haskoin
            async () => {
                const res = await fetch(`https://api.blockchain.info/haskoin-store/bch/block/best?t=${now}`);
                if (!res.ok) throw new Error('Haskoin failed');
                const data = await res.json();
                return { height: data.height, time: data.time };
            },
            // Source B: Blockchair (Backup)
            async () => {
                const res = await fetch(`https://api.blockchair.com/bitcoin-cash/blocks?limit=1&t=${now}`);
                if (!res.ok) throw new Error('Blockchair failed');
                const json = await res.json();
                const latest = json.data[0];
                // Blockchair time is "YYYY-MM-DD HH:MM:SS", need to convert to Unix
                const time = new Date(latest.time.replace(' ', 'T') + 'Z').getTime() / 1000;
                return { height: latest.id, time: time };
            }
        ];

        try {
            // Race/All approach: Try all, pick the best (highest height)
            const results = await Promise.allSettled(sources.map(src => src()));

            const validBlocks = results
                .filter((r): r is PromiseFulfilledResult<BlockData> => r.status === 'fulfilled')
                .map(r => r.value);

            const bestBlock = validBlocks.reduce((prev, current) => {
                return (prev && prev.height > current.height) ? prev : current;
            }, null as BlockData | null);

            if (bestBlock) {
                // Update state if we found a block
                setBlock(prev => {
                    // Only update if it's newer or same (to update timer reference)
                    if (!prev || bestBlock!.height >= prev.height) {
                        return bestBlock;
                    }
                    return prev;
                });

                // Check for alert (strictly greater height)
                if (lastBlockHeight.current !== 0 && bestBlock.height > lastBlockHeight.current) {
                    triggerAlert();
                }

                // Update ref if higher
                if (bestBlock.height > lastBlockHeight.current) {
                    lastBlockHeight.current = bestBlock.height;
                }
            }

        } catch (error) {
            console.error("Error fetching block data:", error);
        }
    };

    useEffect(() => {
        fetchBlockData();
        const interval = setInterval(fetchBlockData, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    // 3. Update Timers
    useEffect(() => {
        if (!block) return;

        const blockTimestamp = block.time * 1000;
        const blockDate = new Date(blockTimestamp);

        // Format EST
        const estString = blockDate.toLocaleTimeString('en-US', {
            timeZone: 'America/New_York',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        setEstTime(estString + ' EST');

        const timer = setInterval(() => {
            const now = Date.now();
            const diff = now - blockTimestamp;

            if (diff < 0) {
                setTimeSinceLast('JUST NOW');
            } else {
                const minutes = Math.floor(diff / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);
                setTimeSinceLast(`${minutes}m ${seconds}s`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [block]);

    const triggerAlert = () => {
        setFlash(true);
        setTimeout(() => setFlash(false), 5000);
        if (soundEnabled) playBeep();
    };

    const playBeep = () => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;
            const audioCtx = new AudioContext();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.5);
        } catch (e) { console.error(e); }
    };

    return (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0.5rem',
            background: flash ? '#0f0' : 'transparent',
            transition: 'background 0.5s ease'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: flash ? '#000' : '#0f0' }}>
                    <Box size={20} />
                    <span style={{ fontWeight: 'bold' }}>BLOCK_MONITOR</span>
                </div>
                <div style={{ color: flash ? '#000' : (soundEnabled ? '#0f0' : '#555') }}>
                    {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </div>
            </div>

            {block ? (
                <div style={{ color: flash ? '#000' : '#fff' }}>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>LAST MINED ({estTime}):</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
                        {timeSinceLast}
                    </div>
                    <div style={{ fontSize: '0.7rem', marginTop: '0.2rem', opacity: 0.6 }}>
                        HEIGHT: {block.height.toLocaleString()}
                    </div>
                </div>
            ) : (
                <div className="flicker" style={{ fontSize: '0.8rem', color: '#0f0' }}>
                    CONNECTING TO NODE...
                </div>
            )}
        </div>
    );
};

export default BlockMonitor;
