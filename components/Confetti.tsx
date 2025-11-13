import React, { useEffect, useRef, useCallback } from 'react';

const Confetti: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const startConfetti = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const pieces: any[] = [];
        const numberOfPieces = 200;
        const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];

        function createPiece() {
            const width = Math.random() * 10 + 5;
            const height = Math.random() * 20 + 10;
            pieces.push({
                x: Math.random() * canvas!.width,
                y: -height,
                width,
                height,
                color: colors[Math.floor(Math.random() * colors.length)],
                angle: Math.random() * Math.PI * 2,
                speed: Math.random() * 3 + 2,
                rotate: Math.random() * 0.1 - 0.05,
            });
        }

        for (let i = 0; i < numberOfPieces; i++) {
            createPiece();
        }

        let animationFrameId: number;

        function draw() {
            ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

            pieces.forEach((p, index) => {
                p.y += p.speed;
                p.angle += p.rotate;

                if (p.y > canvas!.height) {
                    pieces.splice(index, 1);
                    createPiece();
                }

                ctx!.save();
                ctx!.translate(p.x + p.width / 2, p.y + p.height / 2);
                ctx!.rotate(p.angle);
                ctx!.fillStyle = p.color;
                ctx!.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
                ctx!.restore();
            });

            if (pieces.length > 0) {
                 animationFrameId = requestAnimationFrame(draw);
            }
        }

        draw();
        
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    useEffect(() => {
        const cleanup = startConfetti();
        return cleanup;
    }, [startConfetti]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 9999,
            }}
        />
    );
};

export default Confetti;