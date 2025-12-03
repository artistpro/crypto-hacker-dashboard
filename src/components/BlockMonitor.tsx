import React, { useEffect, useState, useRef } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { Box, Volume2, VolumeX } from 'lucide-react';

interface BlockData {
    id: number;
    height: number;
    time: string; // "YYYY-MM-DD HH:MM:SS" (UTC)
    hash: string;
}

const BlockMonitor: React.FC = () => {
    const [block, setBlock] = useState<BlockData | null>(null);
    const [timeSinceLast, setTimeSinceLast] = useState<string>('CALCULATING...');
    const [estTime, setEstTime] = useState<string>('');
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [flash, setFlash] = useState(false);
    const lastBlockHeight = useRef<number>(0);

    // 1. Listen for Sound Setting from Firebase
    useEffect(() => {
        const soundRef = ref(db, 'settings/soundEnabled');
        const unsubscribe = onValue(soundRef, (snapshot) => {
            const val = snapshot.val();
            if (val !== null) {
                setSoundEnabled(val);
            }
        });
        return () => unsubscribe();
    }, []);

    // 2. Poll Blockchair API (Blocks Endpoint)
    const fetchBlockData = async () => {
        try {
            const response = await fetch('https://api.blockchair.com/bitcoin-cash/blocks?limit=1');
            if (!response.ok) throw new Error('Blockchair API failed');

            const json = await response.json();
            const latest = json.data[0]; // First item is latest block

            if (latest) {
                setBlock(latest);

                // Check for new block
                if (lastBlockHeight.current !== 0 && latest.id > lastBlockHeight.current) {
                    triggerAlert();
                }
                lastBlockHeight.current = latest.id;
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

        // Parse Block Time (UTC)
        // Blockchair format: "2023-10-27 10:00:00" -> Treat as UTC
        const blockDate = new Date(block.time.replace(' ', 'T') + 'Z');
        const blockTimestamp = blockDate.getTime();

        // Format as EST
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

        if (soundEnabled) {
            playBeep();
        }
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
        } catch (e) {
            console.error("Audio play failed", e);
        }
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
                        HEIGHT: {block.id.toLocaleString()}
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
