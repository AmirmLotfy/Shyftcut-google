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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center p-2 rounded-md transition-colors duration-200 hover:bg-slate-100 group"
        >
            <div 
                className="flex items-center flex-grow cursor-pointer"
                onClick={handleToggle}
                role="checkbox"
                aria-checked={isChecked}
                tabIndex={0}
                onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && handleToggle()}
            >
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center mr-4 flex-shrink-0 transition-all duration-200 ${isChecked ? 'bg-primary border-primary' : 'bg-white border-slate-300'}`}>
                    <AnimatePresence>
                    {isChecked && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                        >
                            <CheckIcon className="w-4 h-4 text-white" />
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>
                <span className={`relative text-slate-700 transition-colors ${isChecked ? 'text-slate-500' : ''}`}>
                    {task.title}
                    <motion.div 
                        className="absolute top-1/2 h-0.5 bg-slate-500"
                        initial={{ width: 0 }}
                        animate={{ width: isChecked ? '100%' : 0 }}
                        transition={{ duration: 0.3 }}
                    />
                </span>
            </div>
            <div className="ml-auto pl-2">
                {!isChecked && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onStartFocus(task); }} 
                        className="p-1.5 rounded-full text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-primary-100 hover:text-primary transition-all"
                        aria-label={`Focus on ${task.title}`}
                    >
                        <PlayIcon className="w-5 h-5" />
                    </button>
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
