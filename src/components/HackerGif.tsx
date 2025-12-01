import React from 'react';

interface HackerGifProps {
    src: string;
    alt?: string;
    caption?: string;
}

const HackerGif: React.FC<HackerGifProps> = ({ src, alt = "System Animation", caption }) => {
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
                <img
                    src={src}
                    alt={alt}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        // This filter chain turns any image into the "Matrix/Hacker" green style
                        filter: 'grayscale(100%) sepia(100%) hue-rotate(90deg) saturate(400%) contrast(1.2) brightness(0.8)',
                        opacity: 0.9,
                    }}
                />

                {/* Scanline overlay for the GIF */}
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
