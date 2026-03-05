import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import AsciiConverter from './AsciiConverter';

interface HackerGifProps {
    src: string;
    alt?: string;
    caption?: string;
}

const HackerGif: React.FC<HackerGifProps> = ({ src, alt = "System Animation", caption: initialCaption }) => {
    const [asciiSettings, setAsciiSettings] = useState<any>(null);
    const [caption] = useState(initialCaption);

    useEffect(() => {
        const asciiRef = ref(db, 'settings/ascii');
        const unsubscribe = onValue(asciiRef, (snapshot) => {
            const val = snapshot.val();
            if (val) {
                setAsciiSettings(val);
            }
        });
        return () => unsubscribe();
    }, []);

    // Also sync caption with marquee if needed, or keep it static
    // For now, let's just use the initial caption but allow it to be dynamic if Firebase has a general caption

    return (
        <div style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            <div style={{
                flex: 1,
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid #003300'
            }}>
                {asciiSettings && asciiSettings.imageSrc ? (
                    <AsciiConverter
                        imageSrc={asciiSettings.imageSrc}
                        style={asciiSettings.style || 'classic'}
                        colorMode={asciiSettings.colorMode || 'matrix'}
                        fxNoise={asciiSettings.fxNoise !== undefined ? asciiSettings.fxNoise : 0.3}
                        fxScanlines={asciiSettings.fxScanlines !== undefined ? asciiSettings.fxScanlines : true}
                    />
                ) : (
                    <img
                        src={src}
                        alt={alt}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            filter: 'grayscale(100%) sepia(100%) hue-rotate(90deg) saturate(400%) contrast(1.2) brightness(0.8)',
                            opacity: 0.9,
                        }}
                    />
                )}

                {/* Legacy Scanline overlay (only if not using ASCII which has its own) */}
                {(!asciiSettings || !asciiSettings.imageSrc) && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.5) 51%)',
                        backgroundSize: '100% 4px',
                        pointerEvents: 'none'
                    }} />
                )}
            </div>

            {caption && (
                <div style={{
                    marginTop: '0.5rem',
                    fontSize: '0.7rem',
                    color: '#0f0',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    animation: 'flicker 2s infinite'
                }}>
                    {caption}
                </div>
            )}
        </div>
    );
};

export default HackerGif;
