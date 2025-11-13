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
        <div 
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-lg z-50 flex items-center justify-center p-4"
            aria-modal="true"
            role="dialog"
        >
            <motion.div 
                initial={{ y: 20, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 20, opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-md relative"
            >
                <button onClick={handleStopAndClose} className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:bg-slate-100 transition-colors" aria-label="Close focus mode">
                    <XIcon className="w-6 h-6" />
                </button>
                <div className="p-8 text-center">
                    <p className={`font-semibold uppercase text-sm tracking-wider ${mode === 'work' ? 'text-primary' : 'text-green-600'}`}>
                        {mode === 'work' ? 'Focus Session' : 'Break Time'}
                    </p>
                    <p className="mt-2 text-lg text-slate-700 font-medium truncate">
                        {mode === 'work' ? task.title : "Time to recharge!"}
                    </p>
                    
                    <div className="my-8 relative w-52 h-52 mx-auto flex items-center justify-center">
                        <svg className="absolute inset-0" viewBox="0 0 100 100">
                           <circle cx="50" cy="50" r="45" className="stroke-slate-200" strokeWidth="10" fill="transparent" />
                           <motion.circle 
                             cx="50" cy="50" r="45" 
                             className={mode === 'work' ? 'stroke-primary' : 'stroke-green-500'}
                             strokeWidth="10" 
                             fill="transparent"
                             strokeLinecap="round"
                             transform="rotate(-90 50 50)"
                             strokeDasharray={2 * Math.PI * 45}
                             initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                             animate={{ strokeDashoffset: (2 * Math.PI * 45) * (1-progress) }}
                             transition={{ duration: 1, ease: 'linear' }}
                           />
                        </svg>
                         <h2 className="text-5xl font-bold text-slate-900 tracking-tight">{formatTime(time)}</h2>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                        <Button 
                            onClick={toggleTimer} 
                            size="lg" 
                            className="w-40 !py-3"
                        >
                            {isActive ? <><PauseIcon className="w-5 h-5 mr-2" /> Pause</> : <><PlayIcon className="w-5 h-5 mr-2" /> Start</>}
                        </Button>
                        <Button 
                            onClick={handleStopAndClose} 
                            variant="ghost"
                            className="!text-slate-500 hover:!bg-slate-100"
                            aria-label="Stop and close"
                        >
                            <StopIcon className="w-6 h-6"/>
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default FocusModeTimer;
