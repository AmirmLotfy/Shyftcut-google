import React, { useState, useEffect, useRef } from 'react';
import Button from '../Button';
import { PlayIcon, PauseIcon, ArrowPathIcon, StopIcon } from '../icons';

const WORK_MINUTES = 25;
const BREAK_MINUTES = 5;

interface PomodoroTimerProps {
    onSessionComplete: (minutes: number) => void;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ onSessionComplete }) => {
    const [mode, setMode] = useState<'work' | 'break'>('work');
    const [time, setTime] = useState(WORK_MINUTES * 60);
    const [isActive, setIsActive] = useState(false);
    
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (isActive) {
            intervalRef.current = window.setInterval(() => {
                setTime(prev => prev - 1);
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isActive]);

    useEffect(() => {
        if (time === 0) {
            if (mode === 'work') {
                onSessionComplete(WORK_MINUTES);
                setMode('break');
                setTime(BREAK_MINUTES * 60);
            } else {
                setMode('work');
                setTime(WORK_MINUTES * 60);
            }
            setIsActive(false);
        }
    }, [time, mode, onSessionComplete]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setMode('work');
        setTime(WORK_MINUTES * 60);
    };

    const stopTimer = () => {
        const timeWorked = (WORK_MINUTES * 60 - time) / 60;
        if(mode === 'work' && timeWorked > 1) {
             onSessionComplete(Math.floor(timeWorked));
        }
        resetTimer();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-10">
            <h3 className="text-xl font-bold text-center text-gray-800">Focus Timer</h3>
            <div className={`my-6 text-center p-4 rounded-xl transition-colors duration-300 ${mode === 'work' ? 'bg-primary-50' : 'bg-green-50'}`}>
                <p className={`font-semibold uppercase text-sm tracking-wider ${mode === 'work' ? 'text-primary-700' : 'text-green-700'}`}>
                    {mode === 'work' ? 'Study Session' : 'Break Time'}
                </p>
                <p className="text-6xl font-bold text-gray-900 tracking-tighter">{formatTime(time)}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Button onClick={toggleTimer} variant={isActive ? 'outline' : 'primary'} className="col-span-2 !py-3">
                    {isActive ? <><PauseIcon className="w-5 h-5 mr-2" /> Pause</> : <><PlayIcon className="w-5 h-5 mr-2" /> Start</>}
                </Button>
                <Button onClick={stopTimer} variant="ghost" className="!text-red-500 hover:!bg-red-50">
                    <StopIcon className="w-5 h-5 mr-2" /> Stop
                </Button>
                <Button onClick={resetTimer} variant="ghost">
                    <ArrowPathIcon className="w-5 h-5 mr-2" /> Reset
                </Button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-6">Work for {WORK_MINUTES} min, take a {BREAK_MINUTES} min break.</p>
        </div>
    );
};

export default PomodoroTimer;