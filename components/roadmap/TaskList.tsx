import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../../types';
import { CheckIcon, PlayIcon } from '../icons';

interface TaskListProps {
    tasks: Task[];
    onToggle: (taskId: string, completed: boolean) => void;
    onStartFocus: (task: Task) => void;
}

const TaskItem: React.FC<{ task: Task; onToggle: (completed: boolean) => void; onStartFocus: (task: Task) => void; }> = ({ task, onToggle, onStartFocus }) => {
    const [isChecked, setIsChecked] = useState(task.completed);

    const handleToggle = () => {
        const newCheckedState = !isChecked;
        setIsChecked(newCheckedState);
        onToggle(newCheckedState);
    };

    return (
        <motion.li 
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex items-center p-4 rounded-xl backdrop-blur-sm bg-white/60 border border-white/30 transition-all duration-300 hover:bg-white/80 hover:border-primary/20 hover:shadow-md group"
        >
            <div 
                className="flex items-center flex-grow cursor-pointer"
                onClick={handleToggle}
                role="checkbox"
                aria-checked={isChecked}
                tabIndex={0}
                onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && handleToggle()}
            >
                <motion.div 
                    className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center mr-4 flex-shrink-0 transition-all duration-300 ${
                        isChecked 
                            ? 'bg-gradient-to-br from-primary to-primary-600 border-primary shadow-lg shadow-primary/30' 
                            : 'bg-white/80 border-slate-300/50 backdrop-blur-sm'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <AnimatePresence>
                    {isChecked && (
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                        >
                            <CheckIcon className="w-5 h-5 text-white" />
                        </motion.div>
                    )}
                    </AnimatePresence>
                </motion.div>
                <span className={`relative text-slate-800 font-medium transition-all duration-300 ${isChecked ? 'text-slate-500 line-through' : ''}`}>
                    {task.title}
                </span>
            </div>
            <div className="ml-auto pl-3">
                {!isChecked && (
                    <motion.button 
                        onClick={(e) => { e.stopPropagation(); onStartFocus(task); }} 
                        className="p-2 rounded-lg backdrop-blur-sm bg-primary/10 text-primary opacity-0 group-hover:opacity-100 hover:bg-primary/20 border border-primary/20 transition-all"
                        aria-label={`Focus on ${task.title}`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <PlayIcon className="w-5 h-5" />
                    </motion.button>
                )}
            </div>
        </motion.li>
    );
};


const TaskList: React.FC<TaskListProps> = ({ tasks, onToggle, onStartFocus }) => {
    return (
        <ul className="space-y-2">
            {tasks.map(task => (
                <TaskItem key={task.id} task={task} onToggle={(completed) => onToggle(task.id, completed)} onStartFocus={onStartFocus} />
            ))}
        </ul>
    );
};

export default TaskList;
