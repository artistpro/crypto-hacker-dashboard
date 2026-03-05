import React, { useRef, useEffect, useState } from 'react';

interface AsciiConverterProps {
    imageSrc: string;
    style?: 'classic' | 'braille' | 'blocks';
    colorMode?: 'matrix' | 'amber' | 'full';
    fxNoise?: number; // 0 to 1
    fxScanlines?: boolean;
    className?: string;
}

const AsciiConverter: React.FC<AsciiConverterProps> = ({
    imageSrc,
    style = 'classic',
    colorMode = 'matrix',
    fxNoise = 0.3,
    fxScanlines = true,
    className
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // ASCII Character Sets
    const CHAR_SETS = {
        classic: '@%#*+=-:. '.split(''),
        braille: '⠿⠽⠻⠟⠯⠧⠇⠃⠁ '.split(''),
        blocks: '█▓▒░ '.split('')
    };

    const COLORS = {
        matrix: { text: '#00ff00', bg: '#000000' },
        amber: { text: '#ffb000', bg: '#000000' },
        full: { text: 'inherit', bg: '#000000' }
    };

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    useEffect(() => {
        if (!canvasRef.current || dimensions.width === 0 || dimensions.height === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageSrc;

        let animationFrameId: number;

        img.onload = () => {
            const render = (time: number) => {
                const charSet = CHAR_SETS[style];
                const fontSize = 10;
                const cols = Math.floor(dimensions.width / (fontSize * 0.6));
                const rows = Math.floor(dimensions.height / fontSize);

                // Offscreen canvas to process the image downscaled
                const offCanvas = document.createElement('canvas');
                offCanvas.width = cols;
                offCanvas.height = rows;
                const offCtx = offCanvas.getContext('2d');
                if (!offCtx) return;

                offCtx.drawImage(img, 0, 0, cols, rows);
                const imageData = offCtx.getImageData(0, 0, cols, rows).data;

                // Clear main canvas
                ctx.fillStyle = COLORS[colorMode === 'full' ? 'matrix' : colorMode].bg;
                ctx.fillRect(0, 0, dimensions.width, dimensions.height);

                ctx.font = `${fontSize}px monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                for (let y = 0; y < rows; y++) {
                    for (let x = 0; x < cols; x++) {
                        const i = (y * cols + x) * 4;
                        const r = imageData[i];
                        const g = imageData[i + 1];
                        const b = imageData[i + 2];

                        // Grayscale conversion
                        let avg = (r + g + b) / 3;

                        // Add Noise FX
                        if (fxNoise > 0) {
                            const noise = (Math.random() - 0.5) * 50 * fxNoise;
                            const timeNoise = Math.sin(time * 0.005 + x * 0.1 + y * 0.1) * 20 * fxNoise;
                            avg = Math.max(0, Math.min(255, avg + noise + timeNoise));
                        }

                        const charIndex = Math.floor((avg / 255) * (charSet.length - 1));
                        const char = charSet[charSet.length - 1 - charIndex];

                        if (colorMode === 'full') {
                            ctx.fillStyle = `rgb(${r},${g},${b})`;
                        } else {
                            ctx.fillStyle = COLORS[colorMode].text;
                        }

                        // Render character
                        ctx.fillText(
                            char,
                            x * (fontSize * 0.6) + (fontSize * 0.3),
                            y * fontSize + (fontSize * 0.5)
                        );
                    }
                }

                animationFrameId = requestAnimationFrame(render);
            };

            animationFrameId = requestAnimationFrame(render);
        };

        return () => cancelAnimationFrame(animationFrameId);
    }, [imageSrc, dimensions, style, colorMode, fxNoise, fxScanlines]);

    return (
        <div
            ref={containerRef}
            className={`ascii-container ${className}`}
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                background: '#000',
                overflow: 'hidden'
            }}
        >
            <canvas
                ref={canvasRef}
                width={dimensions.width}
                height={dimensions.height}
                style={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    filter: fxScanlines ? 'contrast(1.2) brightness(1.1)' : 'none'
                }}
            />
            {fxScanlines && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
                    backgroundSize: '100% 4px, 3px 100%',
                    pointerEvents: 'none',
                    zIndex: 2
                }} />
            )}
        </div>
    );
};

export default AsciiConverter;
