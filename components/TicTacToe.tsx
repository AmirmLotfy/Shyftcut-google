import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from './Confetti';
import Button from './Button';
import { ArrowPathIcon, SparklesIcon, CpuChipIcon, UserGroupIcon } from './icons';

// --- Sub-components for better structure ---

const Square: React.FC<{ value: 'X' | 'O' | null; onClick: () => void; isWinning: boolean; }> = ({ value, onClick, isWinning }) => (
    <button
        className={`w-full h-full rounded-lg flex items-center justify-center relative transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 focus:ring-primary ${
            isWinning ? 'bg-primary-100' : 'bg-white hover:bg-slate-100'
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
                    className={`text-6xl lg:text-7xl font-bold select-none ${
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
    <p className={`text-center text-lg font-semibold h-7 transition-colors duration-300 ${
        winner === 'X' ? 'text-green-500' : winner === 'O' ? 'text-red-500' : 'text-slate-500'
    }`}>
        {status}
    </p>
);

const Scoreboard: React.FC<{ scores: { player: number; ai: number } }> = ({ scores }) => (
    <div className="flex justify-between items-center text-xl font-bold text-slate-700 bg-slate-100 p-3 rounded-lg">
        <div className="text-center w-1/2">
            <span className="text-sm font-medium text-primary">You (X)</span>
            <span className="block text-3xl">{scores.player}</span>
        </div>
        <div className="w-px h-10 bg-slate-300" />
        <div className="text-center w-1/2">
            <span className="text-sm font-medium text-secondary">AI (O)</span>
            <span className="block text-3xl">{scores.ai}</span>
        </div>
    </div>
);

const GameOverOverlay: React.FC<{ winner: 'X' | 'O' | null; isDraw: boolean; onReset: () => void; }> = ({ winner, isDraw, onReset }) => {
    let message = '';
    let IconComponent: React.FC<React.SVGProps<SVGSVGElement>> | null = null;
    let iconColorClass = '';

    if (winner === 'X') {
        message = 'Congratulations!';
        IconComponent = SparklesIcon;
        iconColorClass = 'text-green-500';
    } else if (winner === 'O') {
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
            {winner === 'X' && <Confetti />}
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
        <div className="w-full max-w-sm mx-auto p-4 sm:p-6 bg-slate-50 border border-slate-200/80 rounded-2xl shadow-xl">
            <Scoreboard scores={scores} />
            <div className="my-4">
                <GameStatus status={status} winner={winnerInfo.winner} />
            </div>

            <div className="relative w-full aspect-square max-w-[350px] mx-auto bg-slate-200 p-2 sm:p-3 rounded-lg">
                 <div className="grid grid-cols-3 grid-rows-3 gap-2 sm:gap-3 w-full h-full">
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
            
            <div className="mt-6 flex justify-center">
                <Button variant="ghost" onClick={handleReset} className="text-slate-500 hover:text-slate-800 hover:bg-slate-100">
                    <ArrowPathIcon className="w-5 h-5 mr-2" /> Reset Game
                </Button>
            </div>
        </div>
    );
};

export default TicTacToe;
