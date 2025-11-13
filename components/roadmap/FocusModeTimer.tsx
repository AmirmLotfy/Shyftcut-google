import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Task } from '../../types';
import Button from '../Button';
import { PlayIcon, PauseIcon, ArrowPathIcon, StopIcon, XIcon } from '../icons';

const WORK_MINUTES = 25;
const BREAK_MINUTES = 5;

interface FocusModeTimerProps {
    task: Task;
    onClose: () => void;
    onSessionComplete: (minutes: number) => void;
}

const FocusModeTimer: React.FC<FocusModeTimerProps> = ({ task, onClose, onSessionComplete }) => {
    const [mode, setMode] = useState<'work' | 'break'>('work');
    const [time, setTime] = useState(WORK_MINUTES * 60);
    const [isActive, setIsActive] = useState(false);
    
    const intervalRef = useRef<number | null>(null);

    const totalDuration = useMemo(() => 
        (mode === 'work' ? WORK_MINUTES : BREAK_MINUTES) * 60,
    [mode]);

    const progress = useMemo(() => 
        (totalDuration - time) / totalDuration,
    [time, totalDuration]);

    useEffect(() => {
        if (isActive) {
            intervalRef.current = window.setInterval(() => {
                setTime(prev => prev > 0 ? prev - 1 : 0);
            }, 1000);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive]);

    useEffect(() => {
        if (time === 0) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (mode === 'work') {
                onSessionComplete(WORK_MINUTES);
                setMode('break');
                setTime(BREAK_MINUTES * 60);
            } else {
                setMode('work');
                setTime(WORK_MINUTES * 60);
            }
            setIsActive(false);
            // Optionally play a sound
        }
    }, [time, mode, onSessionComplete]);

    const toggleTimer = () => setIsActive(!isActive);

    const handleStopAndClose = () => {
        const timeWorked = (WORK_MINUTES * 60 - time) / 60;
        if (mode === 'work' && timeWorked >= 1) {
            onSessionComplete(Math.floor(timeWorked));
        }
        onClose();
    };
    
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    return (
        <motion.div 
            className="fixed inset-0 glass-overlay z-50 flex items-center justify-center p-4"
            aria-modal="true"
            role="dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleStopAndClose}
        >
            <motion.div 
                initial={{ y: 20, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 20, opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="glass-modal w-full max-w-md relative"
                onClick={(e) => e.stopPropagation()}
            >
                <motion.button 
                    onClick={handleStopAndClose} 
                    className="absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm bg-white/60 text-slate-600 hover:bg-white/80 border border-white/30 transition-all z-10" 
                    aria-label="Close focus mode"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <XIcon className="w-5 h-5" />
                </motion.button>
                <div className="p-8 sm:p-10 text-center">
                    <motion.p 
                        className={`font-bold uppercase text-xs tracking-widest backdrop-blur-sm inline-block px-4 py-2 rounded-full border ${
                            mode === 'work' 
                                ? 'bg-primary/20 text-primary border-primary/30' 
                                : 'bg-green-100/80 text-green-700 border-green-200/50'
                        }`}
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        key={mode}
                    >
                        {mode === 'work' ? 'Focus Session' : 'Break Time'}
                    </motion.p>
                    <p className="mt-4 text-lg text-slate-800 font-semibold truncate max-w-xs mx-auto">
                        {mode === 'work' ? task.title : "Time to recharge!"}
                    </p>
                    
                    <div className="my-8 relative w-64 h-64 sm:w-72 sm:h-72 mx-auto flex items-center justify-center">
                        <div className={`absolute inset-0 rounded-full blur-2xl opacity-30 ${
                            mode === 'work' ? 'bg-primary' : 'bg-green-500'
                        }`} />
                        <svg className="absolute inset-0 drop-shadow-lg" viewBox="0 0 100 100">
                           <circle 
                               cx="50" 
                               cy="50" 
                               r="45" 
                               className="stroke-white/30 backdrop-blur-sm" 
                               strokeWidth="8" 
                               fill="transparent" 
                           />
                           <motion.circle 
                             cx="50" cy="50" r="45" 
                             className={mode === 'work' 
                                 ? 'stroke-primary drop-shadow-lg' 
                                 : 'stroke-green-500 drop-shadow-lg'}
                             strokeWidth="8" 
                             fill="transparent"
                             strokeLinecap="round"
                             transform="rotate(-90 50 50)"
                             strokeDasharray={2 * Math.PI * 45}
                             initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                             animate={{ strokeDashoffset: (2 * Math.PI * 45) * (1-progress) }}
                             transition={{ duration: 1, ease: 'linear' }}
                           />
                        </svg>
                        <motion.div
                            className="relative z-10"
                            animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                            transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
                        >
                            <h2 className={`text-6xl sm:text-7xl font-bold tracking-tight ${
                                mode === 'work' ? 'text-slate-900' : 'text-green-700'
                            }`}>
                                {formatTime(time)}
                            </h2>
                        </motion.div>
                    </div>

                    <div className="flex items-center justify-center gap-3">
                        <Button 
                            onClick={toggleTimer} 
                            size="lg" 
                            className="w-40 !py-3 shadow-lg"
                            variant={mode === 'work' ? 'primary' : 'secondary'}
                        >
                            {isActive ? (
                                <><PauseIcon className="w-5 h-5 mr-2" /> Pause</>
                            ) : (
                                <><PlayIcon className="w-5 h-5 mr-2" /> Start</>
                            )}
                        </Button>
                        <Button 
                            onClick={handleStopAndClose} 
                            variant="glass"
                            className="!p-3"
                            aria-label="Stop and close"
                        >
                            <StopIcon className="w-6 h-6"/>
                        </Button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default FocusModeTimer;
