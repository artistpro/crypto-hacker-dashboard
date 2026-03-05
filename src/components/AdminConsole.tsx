import React, { useState, useEffect, useRef } from 'react';
import { ref, set, onValue } from 'firebase/database';
import { db } from '../firebase';
import AsciiConverter from './AsciiConverter';

const AdminConsole: React.FC = () => {
    const [status, setStatus] = useState('READY');
    const [marqueeInput, setMarqueeInput] = useState('');
    const [soundEnabled, setSoundEnabled] = useState(true);

    // ASCII State
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [asciiStyle, setAsciiStyle] = useState<'classic' | 'braille' | 'blocks'>('classic');
    const [colorMode, setColorMode] = useState<'matrix' | 'amber' | 'full'>('matrix');
    const [fxNoise, setFxNoise] = useState(0.3);
    const [fxScanlines, setFxScanlines] = useState(true);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Load initial settings
        const soundRef = ref(db, 'settings/soundEnabled');
        onValue(soundRef, (snapshot) => {
            const val = snapshot.val();
            if (val !== null) setSoundEnabled(val);
        });

        const asciiRef = ref(db, 'settings/ascii');
        onValue(asciiRef, (snapshot) => {
            const val = snapshot.val();
            if (val) {
                setAsciiStyle(val.style || 'classic');
                setColorMode(val.colorMode || 'matrix');
                setFxNoise(val.fxNoise || 0.3);
                setFxScanlines(val.fxScanlines !== undefined ? val.fxScanlines : true);
                if (val.imageSrc) setImagePreview(val.imageSrc);
            }
        });
    }, []);

    const handleMarqueeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!marqueeInput.trim()) return;
        try {
            await set(ref(db, 'marquee/message'), marqueeInput);
            setStatus('MARQUEE_UPDATED');
            setMarqueeInput('');
            setTimeout(() => setStatus('READY'), 2000);
        } catch (error) {
            console.error(error);
            setStatus('ERROR');
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setImagePreview(base64String);
                saveAsciiSettings(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const saveAsciiSettings = async (imageSrc?: string) => {
        try {
            const settings = {
                style: asciiStyle,
                colorMode,
                fxNoise,
                fxScanlines,
                imageSrc: imageSrc || imagePreview,
                timestamp: Date.now()
            };
            await set(ref(db, 'settings/ascii'), settings);
            setStatus('ASCII_SETTINGS_SAVED');
            setTimeout(() => setStatus('READY'), 2000);
        } catch (error) {
            console.error(error);
            setStatus('ERROR_SAVING_ASCII');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#000',
            color: '#0f0',
            fontFamily: 'monospace',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '2rem',
            overflowY: 'auto'
        }}>
            <div style={{ width: '100%', maxWidth: '800px', border: '1px solid #0f0', padding: '2rem', background: '#000500' }}>
                <h1 className="flicker" style={{ textAlign: 'center', marginBottom: '2rem', textShadow: '0 0 10px #0f0' }}>
                    V2_SYSTEM_OVERRIDE_CONSOLE
                </h1>

                {/* Marquee Section */}
                <section style={{ marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid #003300' }}>
                    <h2 style={{ fontSize: '1rem', color: '#0f0', marginBottom: '1rem' }}>{'>'} BROADCAST_CONTROL</h2>
                    <form onSubmit={handleMarqueeSubmit} style={{ display: 'flex', gap: '1rem' }}>
                        <input
                            type="text"
                            placeholder="ENTER_MESSAGE..."
                            value={marqueeInput}
                            onChange={(e) => setMarqueeInput(e.target.value)}
                            style={{
                                flex: 1,
                                background: '#001100',
                                border: '1px solid #0f0',
                                color: '#0f0',
                                padding: '0.8rem',
                                fontFamily: 'monospace'
                            }}
                        />
                        <button type="submit" style={{ background: '#0f0', color: '#000', border: 'none', padding: '0.8rem 1.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
                            SEND_MARQUEE
                        </button>
                    </form>
                </section>

                {/* ASCII Converter Section */}
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1rem', color: '#0f0', marginBottom: '1rem' }}>{'>'} ASCII_IMAGE_TRANSFORM</h2>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        {/* Controls */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', opacity: 0.7, marginBottom: '0.5rem' }}>UPLOAD_SOURCE_IMAGE:</label>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{ width: '100%', padding: '0.8rem', background: '#002200', color: '#0f0', border: '1px dashed #0f0', cursor: 'pointer' }}
                                >
                                    {imagePreview ? 'CHANGE_IMAGE' : 'SELECT_FILE'}
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', opacity: 0.7, marginBottom: '0.5rem' }}>ART_STYLE:</label>
                                <select
                                    value={asciiStyle}
                                    onChange={(e) => setAsciiStyle(e.target.value as any)}
                                    style={{ width: '100%', padding: '0.8rem', background: '#001100', color: '#0f0', border: '1px solid #0f0' }}
                                >
                                    <option value="classic">CLASSIC_ASCII</option>
                                    <option value="braille">BRAILLE_DENSE</option>
                                    <option value="blocks">BLOCK_ELEMENTS</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', opacity: 0.7, marginBottom: '0.5rem' }}>COLOR_MODE:</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {['matrix', 'amber', 'full'].map(mode => (
                                        <button
                                            key={mode}
                                            onClick={() => setColorMode(mode as any)}
                                            style={{
                                                flex: 1,
                                                padding: '0.5rem',
                                                background: colorMode === mode ? '#0f0' : '#001100',
                                                color: colorMode === mode ? '#000' : '#0f0',
                                                border: '1px solid #0f0',
                                                fontSize: '0.7rem'
                                            }}
                                        >
                                            {mode.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', opacity: 0.7, marginBottom: '0.5rem' }}>NOISE_STRENGTH: {fxNoise.toFixed(2)}</label>
                                <input
                                    type="range" min="0" max="1" step="0.05"
                                    value={fxNoise}
                                    onChange={(e) => setFxNoise(parseFloat(e.target.value))}
                                    style={{ width: '100%', accentColor: '#0f0' }}
                                />
                            </div>

                            <button
                                onClick={() => setFxScanlines(!fxScanlines)}
                                style={{ width: '100%', padding: '0.8rem', background: fxScanlines ? '#0f0' : '#330000', color: fxScanlines ? '#000' : '#f00', border: '1px solid #000', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                SCANLINES: [{fxScanlines ? 'ACTIVE' : 'OFF'}]
                            </button>

                            <button
                                onClick={() => saveAsciiSettings()}
                                style={{ marginTop: '1rem', width: '100%', padding: '1rem', background: '#0f0', color: '#000', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
                            >
                                APPLY_GLOBAL_TRANSFORM
                            </button>
                        </div>

                        {/* Preview */}
                        <div style={{ border: '1px solid #003300', height: '400px', background: '#000' }}>
                            {imagePreview ? (
                                <AsciiConverter
                                    imageSrc={imagePreview}
                                    style={asciiStyle}
                                    colorMode={colorMode}
                                    fxNoise={fxNoise}
                                    fxScanlines={fxScanlines}
                                />
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#333' }}>
                                    NO_PREVIEW_READY
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* System Controls */}
                <div style={{ marginTop: '2rem', borderTop: '1px solid #0f0', paddingTop: '2rem' }}>
                    <button
                        onClick={async () => {
                            const newStatus = !soundEnabled;
                            await set(ref(db, 'settings/soundEnabled'), newStatus);
                            setSoundEnabled(newStatus);
                        }}
                        style={{
                            width: '100%',
                            background: soundEnabled ? '#0f0' : '#220000',
                            color: soundEnabled ? '#000' : '#f00',
                            border: '1px solid #0f0',
                            padding: '1rem',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                        }}
                    >
                        ALERT_AUDIO: [{soundEnabled ? 'ENABLED' : 'DISABLED'}]
                    </button>
                </div>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: '#444' }}>
                    LAST_OPERATION_STATUS: <span style={{ color: '#0f0' }}>[{status}]</span>
                </div>
            </div>

            <div className="scanlines"></div>
        </div>
    );
};

export default AdminConsole;
