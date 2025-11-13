

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from './Confetti';
import Button from './Button';
import { ArrowPathIcon, SparklesIcon, CpuChipIcon, UserGroupIcon, CopyIcon, CheckIcon } from './icons';

// --- Sub-components for better structure ---

const Square: React.FC<{ value: 'X' | 'O' | null; onClick: () => void; isWinning: boolean; }> = ({ value, onClick, isWinning }) => (
    <button
        className={`w-full h-full rounded-lg flex items-center justify-center relative transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 focus:ring-primary ${
            isWinning ? 'bg-primary/20' : 'bg-white hover:bg-slate-50'
        }`}
        onClick={onClick}
        aria-label={`Square ${value || 'empty'}`}
    >
        <AnimatePresence>
            {value && (
                <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className={`text-4xl sm:text-5xl font-bold select-none ${
                        value === 'X' ? 'text-primary' : 'text-secondary'
                    }`}
                >
                    {value}
                </motion.span>
            )}
        </AnimatePresence>
    </button>
);

const GameStatus: React.FC<{ status: string; winner: 'X' | 'O' | null }> = ({ status, winner }) => (
    <p className={`text-center text-sm font-bold h-6 transition-colors duration-300 ${
        winner === 'X' ? 'text-green-600' : winner === 'O' ? 'text-red-600' : 'text-slate-600'
    }`}>
        {status}
    </p>
);

const Scoreboard: React.FC<{ scores: { player: number; ai: number } }> = ({ scores }) => (
    <div className="flex justify-between items-center text-base font-bold text-slate-700 bg-white/60 backdrop-blur-sm border border-white/30 p-2.5 rounded-xl">
        <div className="text-center w-1/2">
            <span className="text-xs font-semibold text-primary">You (X)</span>
            <span className="block text-2xl">{scores.player}</span>
        </div>
        <div className="w-px h-8 bg-slate-300/50" />
        <div className="text-center w-1/2">
            <span className="text-xs font-semibold text-secondary">AI (O)</span>
            <span className="block text-2xl">{scores.ai}</span>
        </div>
    </div>
);

const GameOverOverlay: React.FC<{ winner: 'X' | 'O' | null; isDraw: boolean; onReset: () => void; }> = ({ winner, isDraw, onReset }) => {
    const [copySuccess, setCopySuccess] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText('AI-CHAMPION').then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    // Special message for when the player wins
    if (winner === 'X') {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-100/70 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-20 p-4"
            >
                <Confetti />
                <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
                    className="text-center p-8 bg-white rounded-xl shadow-2xl ring-1 ring-slate-200"
                >
                    <SparklesIcon className="w-16 h-16 mx-auto text-green-500" />
                    <h3 className="text-3xl font-bold text-slate-900 mt-4">You Beat the AI!</h3>
                    <p className="mt-2 text-slate-600">As a reward for your strategic genius, enjoy <br/> <strong className="text-primary">50% off your first 3 months</strong> of Shyftcut Pro!</p>
                    <div className="mt-6 text-center">
                        <p className="text-sm font-medium text-slate-500">Your Discount Code:</p>
                        <div className="mt-1 flex items-center justify-center gap-2 p-2 border-2 border-dashed border-primary-300 bg-primary-50 rounded-lg">
                            <span className="text-2xl font-bold font-mono text-primary tracking-wider">AI-CHAMPION</span>
                            <Button variant="ghost" size="sm" onClick={handleCopy} className="!p-2 h-auto">
                                {copySuccess ? <CheckIcon className="w-5 h-5 text-green-500" /> : <CopyIcon className="w-5 h-5" />}
                            </Button>
                        </div>
                    </div>
                    <Button onClick={onReset} className="mt-6" size="lg">
                        Play Again
                    </Button>
                </motion.div>
            </motion.div>
        );
    }
    
    // Default messages for AI win or draw
    let message = '';
    let IconComponent: React.FC<React.SVGProps<SVGSVGElement>> | null = null;
    let iconColorClass = '';

    if (winner === 'O') {
        message = 'Better Luck Next Time!';
        IconComponent = CpuChipIcon;
        iconColorClass = 'text-red-500';
    } else if (isDraw) {
        message = "It's a Draw!";
        IconComponent = UserGroupIcon;
        iconColorClass = 'text-slate-500';
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-100/70 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-20 p-4"
        >
            <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
                className="text-center p-8 bg-white rounded-xl shadow-2xl ring-1 ring-slate-200"
            >
                {IconComponent && <IconComponent className={`w-16 h-16 mx-auto ${iconColorClass}`} />}
                <h3 className="text-3xl font-bold text-slate-900 mt-4">{message}</h3>
                <Button onClick={onReset} className="mt-6" size="lg">
                    Play Again
                </Button>
            </motion.div>
        </motion.div>
    );
};

// --- Helper Functions ---

const calculateWinner = (squares: ('X' | 'O' | null)[]) => {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6],
    ];
    for (const line of lines) {
        const [a, b, c] = line;
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return { winner: squares[a], line };
        }
    }
    return { winner: null, line: null };
};

const findBestMove = (currentSquares: ('X' | 'O' | null)[]) => {
    // 1. Check for a winning move for AI ('O')
    for (let i = 0; i < 9; i++) {
        if (!currentSquares[i]) {
            const tempSquares = [...currentSquares];
            tempSquares[i] = 'O';
            if (calculateWinner(tempSquares).winner === 'O') return i;
        }
    }
    // 2. Check to block player's ('X') winning move
    for (let i = 0; i < 9; i++) {
        if (!currentSquares[i]) {
            const tempSquares = [...currentSquares];
            tempSquares[i] = 'X';
            if (calculateWinner(tempSquares).winner === 'X') return i;
        }
    }
    // 3. Take the center if available
    if (!currentSquares[4]) return 4;
    // 4. Take a random corner
    const corners = [0, 2, 6, 8].filter(i => !currentSquares[i]);
    if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];
    // 5. Take a random side
    const sides = [1, 3, 5, 7].filter(i => !currentSquares[i]);
    if (sides.length > 0) return sides[Math.floor(Math.random() * sides.length)];
    
    return null; // Should not be reached in a normal game
};

// --- Main Game Component ---

const TicTacToe: React.FC = () => {
    const [squares, setSquares] = useState<('X' | 'O' | null)[]>(Array(9).fill(null));
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [winnerInfo, setWinnerInfo] = useState<{ winner: 'X' | 'O' | null, line: number[] | null }>({ winner: null, line: null });
    const [isDraw, setIsDraw] = useState(false);
    const [scores, setScores] = useState({ player: 0, ai: 0 });

    useEffect(() => {
        try {
            const savedScores = localStorage.getItem('shyftcut_tictactoe_scores');
            if (savedScores) setScores(JSON.parse(savedScores));
        } catch (error) {
            console.error("Could not parse scores from localStorage", error);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('shyftcut_tictactoe_scores', JSON.stringify(scores));
    }, [scores]);

    const makeAIMove = useCallback((currentSquares: ('X' | 'O' | null)[]) => {
        const bestMove = findBestMove(currentSquares);
        if (bestMove !== null) {
            const nextSquares = [...currentSquares];
            nextSquares[bestMove] = 'O';
            setSquares(nextSquares);
            setIsPlayerTurn(true);
        }
    }, []);

    useEffect(() => {
        const { winner, line } = calculateWinner(squares);
        const isBoardFull = squares.every(Boolean);

        if (winner) {
            setWinnerInfo({ winner, line });
            setScores(prev => ({
                player: winner === 'X' ? prev.player + 1 : prev.player,
                ai: winner === 'O' ? prev.ai + 1 : prev.ai,
            }));
        } else if (isBoardFull) {
            setIsDraw(true);
        } else if (!isPlayerTurn) {
            const timeoutId = setTimeout(() => makeAIMove(squares), 600);
            return () => clearTimeout(timeoutId);
        }
    }, [squares, isPlayerTurn, makeAIMove]);

    const handleClick = (i: number) => {
        if (winnerInfo.winner || isDraw || !isPlayerTurn || squares[i]) return;
        const nextSquares = [...squares];
        nextSquares[i] = 'X';
        setSquares(nextSquares);
        setIsPlayerTurn(false);
    };

    const handleReset = () => {
        setSquares(Array(9).fill(null));
        setIsPlayerTurn(true);
        setWinnerInfo({ winner: null, line: null });
        setIsDraw(false);
    };

    let status;
    if (winnerInfo.winner) status = winnerInfo.winner === 'X' ? "You win!" : "AI wins!";
    else if (isDraw) status = "It's a Draw!";
    else status = isPlayerTurn ? "Your turn" : "AI is thinking...";
    
    const isGameOver = !!winnerInfo.winner || isDraw;

    return (
        <div className="w-full max-w-xs mx-auto p-3 sm:p-4 glass-card rounded-2xl shadow-xl">
            <Scoreboard scores={scores} />
            
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-3 p-2 pl-2.5 bg-primary/10 border-l-2 border-primary rounded-lg"
            >
                <div className="flex items-start">
                    <SparklesIcon className="w-4 h-4 text-primary mr-1.5 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-xs text-gray-900">AI Challenge: Win 50% Off!</h4>
                        <p className="text-xs text-slate-700 mt-0.5">
                            Beat our AI to get <strong className="font-semibold text-primary">50% off</strong> 3 months of Pro.
                        </p>
                    </div>
                </div>
            </motion.div>

            <div className="my-2">
                <GameStatus status={status} winner={winnerInfo.winner} />
            </div>

            <div className="relative w-full max-w-[340px] mx-auto bg-slate-100 p-1.5 rounded-xl" style={{ height: '280px' }}>
                 <div className="grid grid-cols-3 grid-rows-3 gap-1.5 w-full h-full">
                    {squares.map((square, i) => (
                        <Square
                            key={i}
                            value={square}
                            onClick={() => handleClick(i)}
                            isWinning={winnerInfo.line?.includes(i) ?? false}
                        />
                    ))}
                </div>
                <AnimatePresence>
                    {isGameOver && (
                        <GameOverOverlay winner={winnerInfo.winner} isDraw={isDraw} onReset={handleReset} />
                    )}
                </AnimatePresence>
            </div>
            
            <div className="mt-2 flex justify-center">
                <Button variant="ghost" onClick={handleReset} size="sm" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                    <ArrowPathIcon className="w-4 h-4 mr-1.5" /> Reset
                </Button>
            </div>
        </div>
    );
};

export default TicTacToe;