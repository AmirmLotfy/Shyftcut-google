import React from 'react';
import { motion } from 'framer-motion';
import { Milestone } from '../../types';
import { CheckCircleIcon } from '../icons';

interface MilestoneTimelineProps {
    milestones: Milestone[];
    selectedMilestoneId: string | null;
    onSelectMilestone: (id: string) => void;
    completionStatus: Map<string, boolean>;
}

const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({ milestones, selectedMilestoneId, onSelectMilestone, completionStatus }) => {
    
    return (
        <div className="mt-2">
            <ul className="relative ml-3">
                {/* Vertical line */}
                 <motion.div 
                    className="absolute left-[3px] top-4 h-full w-0.5 backdrop-blur-sm bg-gradient-to-b from-primary/30 via-primary/20 to-transparent"
                    style={{height: `calc(100% - 2rem)`}}
                 />
                {milestones.map((milestone, index) => {
                    const isCompleted = completionStatus.get(milestone.id) || false;
                    const isSelected = selectedMilestoneId === milestone.id;
                    const isUnlocked = index === 0 || completionStatus.get(milestones[index - 1].id) || false;
                    const prevCompleted = index > 0 && completionStatus.get(milestones[index-1].id);

                    return (
                        <li key={milestone.id} className="mb-6 ml-6 relative">
                             {prevCompleted && (
                                <motion.div 
                                    layoutId={`line-${index-1}`} 
                                    className="absolute -left-[14px] top-[-2rem] h-full w-0.5 bg-gradient-to-b from-primary to-primary/50 backdrop-blur-sm"
                                    initial={{ scaleY: 0 }}
                                    animate={{ scaleY: 1 }}
                                    transition={{ duration: 0.5 }}
                                />
                             )}
                            <motion.span 
                                className={`absolute -left-[27px] flex items-center justify-center w-9 h-9 rounded-full ring-4 ring-white/80 backdrop-blur-md
                                ${isCompleted ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/30' : 
                                  (isSelected ? 'bg-gradient-to-br from-primary to-primary-600 shadow-lg shadow-primary/30' : 
                                  (isUnlocked ? 'bg-slate-300/80 backdrop-blur-sm' : 'bg-slate-200/60 backdrop-blur-sm opacity-50'))}`}
                                 animate={isSelected ? { scale: 1.15 } : { scale: 1 }}
                                 transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                            >
                                {isCompleted && <CheckCircleIcon className="w-6 h-6 text-white" />}
                                {isSelected && !isCompleted && (
                                    <div className="absolute inset-0 rounded-full border-2 border-primary/50 animate-pulse-glow"/>
                                )}
                            </motion.span>
                            <motion.button
                                onClick={() => onSelectMilestone(milestone.id)}
                                disabled={!isUnlocked && !isCompleted}
                                className={`text-left w-full p-3 rounded-xl transition-all duration-300 backdrop-blur-sm ${
                                    isSelected 
                                        ? 'bg-primary/20 border border-primary/30 shadow-md' 
                                        : 'hover:bg-white/60 border border-transparent hover:border-slate-200/50 hover:shadow-sm'
                                } ${(!isUnlocked && !isCompleted) ? 'cursor-not-allowed opacity-50' : ''}`}
                                whileHover={isUnlocked || isCompleted ? { x: 4 } : {}}
                                whileTap={isUnlocked || isCompleted ? { scale: 0.98 } : {}}
                            >
                                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isSelected ? 'text-primary' : 'text-slate-500'}`}>
                                    Week {milestone.week}
                                </p>
                                <h4 className={`font-bold text-sm leading-tight ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                                    {milestone.title}
                                </h4>
                            </motion.button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default MilestoneTimeline;