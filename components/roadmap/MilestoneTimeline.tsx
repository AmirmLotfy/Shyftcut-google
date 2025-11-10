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
        <div className="mt-4">
            <ul className="relative ml-3">
                {/* Vertical line */}
                 <motion.div 
                    className="absolute left-[3px] top-4 h-full w-0.5 bg-slate-200"
                    style={{height: `calc(100% - 2rem)`}}
                 />
                {milestones.map((milestone, index) => {
                    const isCompleted = completionStatus.get(milestone.id) || false;
                    const isSelected = selectedMilestoneId === milestone.id;
                    const isUnlocked = index === 0 || completionStatus.get(milestones[index - 1].id) || false;
                    const prevCompleted = index > 0 && completionStatus.get(milestones[index-1].id);

                    return (
                        <li key={milestone.id} className="mb-6 ml-6 relative">
                             {prevCompleted && <motion.div layoutId={`line-${index-1}`} className="absolute -left-[14px] top-[-2rem] h-full w-0.5 bg-primary" />}
                            <motion.span 
                                className={`absolute -left-[27px] flex items-center justify-center w-8 h-8 rounded-full ring-4 ring-white
                                ${isCompleted ? 'bg-green-500' : (isSelected ? 'bg-primary' : (isUnlocked ? 'bg-slate-300' : 'bg-slate-200'))}`}
                                 animate={isSelected ? { scale: 1.1 } : { scale: 1 }}
                            >
                                {isCompleted && <CheckCircleIcon className="w-8 h-8 text-white" />}
                                {isSelected && <div className="absolute inset-0 rounded-full border-2 border-primary animate-pulse-glow"/>}
                            </motion.span>
                            <button
                                onClick={() => onSelectMilestone(milestone.id)}
                                disabled={!isUnlocked && !isCompleted}
                                className={`text-left w-full p-2 rounded-md transition-colors ${isSelected ? 'bg-primary-50' : 'hover:bg-slate-100'} ${(!isUnlocked && !isCompleted) ? 'cursor-not-allowed opacity-60' : ''}`}
                            >
                                <p className={`text-sm font-semibold ${isSelected ? 'text-primary' : 'text-slate-500'}`}>Week {milestone.week}</p>
                                <h4 className={`font-bold ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>{milestone.title}</h4>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default MilestoneTimeline;