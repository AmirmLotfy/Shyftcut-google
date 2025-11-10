import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from './Confetti';
import Button from './Button';

interface SquareProps {
  value: 'X' | 'O' | null;
  onSquareClick: () => void;
}

// Square Component
const Square: React.FC<SquareProps> = ({ value, onSquareClick }) => {
  return (
    <motion.button
      className={`w-full h-full bg-transparent flex items-center justify-center text-5xl sm:text-6xl font-bold transition-colors duration-300 relative z-10
        ${value === 'X' ? 'text-primary' : 'text-secondary'}
        hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg
      `}
      onClick={onSquareClick}
      aria-label={`Square ${value || 'empty'}`}
      whileTap={{ scale: 0.9 }}
    >
      <AnimatePresence>
        {value && (
          <motion.div
            className="flex items-center justify-center"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {value}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

// Helper function to calculate winner and winning line
const calculateWinner = (squares: ('X' | 'O' | null)[]) => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  return { winner: null, line: null };
};

// Main Game Component
const TicTacToe: React.FC = () => {
  const [squares, setSquares] = useState<('X' | 'O' | null)[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState<'X' | 'O' | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const [scores, setScores] = useState({ player: 0, ai: 0 });

  useEffect(() => {
    try {
      const savedScores = localStorage.getItem('ticTacToeScores');
      if (savedScores) setScores(JSON.parse(savedScores));
    } catch (error) {
      console.error("Could not parse scores from localStorage", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ticTacToeScores', JSON.stringify(scores));
  }, [scores]);

  const findBestMove = (currentSquares: ('X' | 'O' | null)[]) => {
    const moves = [
      { for: 'O', type: 'win' }, // 1. AI wins
      { for: 'X', type: 'block' }, // 2. Block player
    ];

    for (const move of moves) {
      for (let i = 0; i < 9; i++) {
        if (!currentSquares[i]) {
          const tempSquares = [...currentSquares];
          tempSquares[i] = move.for as 'X' | 'O';
          if (calculateWinner(tempSquares).winner === move.for) return i;
        }
      }
    }

    if (!currentSquares[4]) return 4; // 3. Take center
    const corners = [0, 2, 6, 8].filter(i => !currentSquares[i]);
    if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)]; // 4. Take corner
    const sides = [1, 3, 5, 7].filter(i => !currentSquares[i]);
    if (sides.length > 0) return sides[Math.floor(Math.random() * sides.length)]; // 5. Take side
    return null;
  };

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
    const { winner: gameWinner, line } = calculateWinner(squares);
    const isBoardFull = squares.every(Boolean);

    if (gameWinner) {
      setWinner(gameWinner);
      setWinningLine(line);
      setScores(prev => ({
        ...prev,
        player: gameWinner === 'X' ? prev.player + 1 : prev.player,
        ai: gameWinner === 'O' ? prev.ai + 1 : prev.ai,
      }));
    } else if (isBoardFull) {
      setIsDraw(true);
    } else if (!isPlayerTurn) {
      const timeoutId = setTimeout(() => makeAIMove(squares), 600);
      return () => clearTimeout(timeoutId);
    }
  }, [squares, isPlayerTurn, makeAIMove]);

  const handleClick = (i: number) => {
    if (winner || isDraw || !isPlayerTurn || squares[i]) return;
    const nextSquares = [...squares];
    nextSquares[i] = 'X';
    setSquares(nextSquares);
    setIsPlayerTurn(false);
  };

  const handleReset = () => {
    setSquares(Array(9).fill(null));
    setIsPlayerTurn(true);
    setWinner(null);
    setWinningLine(null);
    setIsDraw(false);
    setCopySuccess('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText('WINNER50').then(() => {
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
    }, () => setCopySuccess('Failed!'));
  };

  let status;
  if (winner) status = winner === 'X' ? "You win!" : "AI wins!";
  else if (isDraw) status = "It's a Draw!";
  else status = isPlayerTurn ? "Your turn (X)" : "AI is thinking...";

  const lineStyleMap: { [key: string]: string } = {
    '0,1,2': 'top-[16.66%] left-0',
    '3,4,5': 'top-1/2 left-0 -translate-y-1/2',
    '6,7,8': 'top-[83.33%] left-0 -translate-y-1/2',
    '0,3,6': 'left-[16.66%] top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90',
    '1,4,7': 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90',
    '2,5,8': 'left-[83.33%] top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90',
    '0,4,8': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 w-[125%]',
    '2,4,6': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 w-[125%]',
  };
  const lineKey = winningLine ? winningLine.join(',') : '';
  const lineClasses = lineStyleMap[lineKey] || '';

  return (
    <div className="relative w-full max-w-sm mx-auto p-4 sm:p-6 bg-slate-100/50 backdrop-blur-2xl rounded-3xl shadow-2xl ring-1 ring-white/20">
      <AnimatePresence>
        {winner === 'X' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center rounded-3xl z-30 p-4"
          >
            <Confetti />
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="text-center p-6 bg-white rounded-xl shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-green-600">You Won! 🎉</h3>
              <p className="mt-2 text-slate-600">Here's a 50% discount for your victory:</p>
              <div className="my-4 p-3 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg">
                <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  WINNER50
                </p>
              </div>
              <Button onClick={handleCopy}>{copySuccess || 'Copy Code'}</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center mb-4">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-800">Play against AI</h3>
        <p className="mt-1 text-sm sm:text-base text-secondary font-semibold">Win and get 50% OFF!</p>
        <div className="flex justify-between items-center my-3 text-xl font-bold text-slate-700 bg-white/40 p-2 rounded-lg">
            <div className="text-center w-1/2">
                <span className="text-sm font-medium text-slate-600">You</span>
                <span className="block text-2xl text-primary">{scores.player}</span>
            </div>
            <div className="w-px h-8 bg-slate-300" />
            <div className="text-center w-1/2">
                <span className="text-sm font-medium text-slate-600">AI</span>
                <span className="block text-2xl text-secondary">{scores.ai}</span>
            </div>
        </div>
        <p className={`mt-2 text-base sm:text-lg font-semibold h-7 transition-colors ${
          winner === 'X' ? 'text-green-600' : winner === 'O' ? 'text-secondary' : 'text-slate-600'
        }`}>
          {status}
        </p>
      </div>
      <div className="relative w-full aspect-square max-w-[300px] sm:max-w-[350px] mx-auto bg-white/60 backdrop-blur-sm rounded-xl shadow-lg">
        {/* Grid lines overlay */}
        <div className="absolute top-0 left-1/3 w-0.5 h-full bg-slate-300/70 -translate-x-1/2" />
        <div className="absolute top-0 left-2/3 w-0.5 h-full bg-slate-300/70 -translate-x-1/2" />
        <div className="absolute left-0 top-1/3 h-0.5 w-full bg-slate-300/70 -translate-y-1/2" />
        <div className="absolute left-0 top-2/3 h-0.5 w-full bg-slate-300/70 -translate-y-1/2" />

        <div className="grid grid-cols-3 w-full h-full">
          {squares.map((square, i) => (
            <Square key={i} value={square} onSquareClick={() => handleClick(i)} />
          ))}
        </div>
        <AnimatePresence>
          {winningLine && (
            <motion.div
              className={`absolute bg-slate-800/80 rounded-full h-1.5 sm:h-2 w-full origin-center z-20 ${lineClasses}`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          )}
        </AnimatePresence>
      </div>
      <div className="mt-6 flex justify-center">
        <motion.button
          onClick={handleReset}
          className="px-8 py-3 bg-slate-700 text-white font-semibold rounded-lg shadow-md hover:bg-slate-800 transition-colors text-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {winner || isDraw ? 'Play Again' : 'Reset Game'}
        </motion.button>
      </div>
    </div>
  );
};

export default TicTacToe;