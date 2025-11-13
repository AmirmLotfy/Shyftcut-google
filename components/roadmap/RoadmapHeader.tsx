

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Roadmap, Milestone } from '../../types';
import { Cog6ToothIcon, ShareIcon, ArchiveBoxIcon, PencilIcon, TrashIcon } from '../icons';
import Button from '../Button';
import RadialProgress from './RadialProgress';
import Spinner from '../Spinner';
import { motion, AnimatePresence } from 'framer-motion';

interface RoadmapHeaderProps {
    roadmap: Roadmap;
    milestones: Milestone[];
    completionStatus: Map<string, boolean>;
    onArchive: () => void;
    onShare: () => void;
    onEdit: () => void;
    onDelete: () => void;
    isArchiving: boolean;
}

const RoadmapHeader: React.FC<RoadmapHeaderProps> = ({ roadmap, milestones, completionStatus, onArchive, onShare, onEdit, onDelete, isArchiving }) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const settingsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setIsSettingsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const overallProgress = useMemo(() => {
        if (milestones.length === 0) return 0;
        const completedCount = Array.from(completionStatus.values()).filter(Boolean).length;
        return Math.round((completedCount / milestones.length) * 100);
    }, [milestones, completionStatus]);

    const currentMilestone = useMemo(() => {
        const firstIncomplete = milestones.find(m => !completionStatus.get(m.id));
        return firstIncomplete || milestones[milestones.length - 1];
    }, [milestones, completionStatus]);

    return (
        <motion.div 
            className="mb-10 glass-card p-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex items-center gap-6 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                        <RadialProgress progress={overallProgress} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-base font-semibold text-primary">{roadmap.track}</p>
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 truncate">{roadmap.title}</h1>
                         {currentMilestone && (
                            <p className="text-base text-slate-600 mt-2">
                                Current Focus: <span className="font-semibold text-slate-800">{currentMilestone.title}</span>
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex space-x-2 mt-4 sm:mt-0 self-start sm:self-center flex-shrink-0">
                    <Button variant="glass" size="sm" aria-label="Share" onClick={onShare} className="!p-2.5">
                        <ShareIcon className="w-5 h-5" />
                    </Button>
                    <Button variant="glass" size="sm" aria-label="Archive" onClick={onArchive} disabled={isArchiving} className="!p-2.5">
                        {isArchiving ? <Spinner size="sm"/> : <ArchiveBoxIcon className="w-5 h-5" />}
                    </Button>
                     {/* Settings Dropdown */}
                    <div className="relative" ref={settingsRef}>
                        <Button variant="glass" size="sm" aria-label="Settings" onClick={() => setIsSettingsOpen(!isSettingsOpen)} className="!p-2.5">
                            <Cog6ToothIcon className="w-5 h-5" />
                        </Button>
                        <AnimatePresence>
                            {isSettingsOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.15, ease: 'easeOut' }}
                                    className="absolute right-0 mt-2 w-48 origin-top-right glass-modal py-1 z-10"
                                >
                                    <button onClick={() => { onEdit(); setIsSettingsOpen(false); }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-white/60 hover:text-primary rounded-lg transition-colors">
                                        <PencilIcon className="w-4 h-4" /> Edit Roadmap
                                    </button>
                                    <button onClick={() => { onDelete(); setIsSettingsOpen(false); }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50/60 rounded-lg transition-colors">
                                        <TrashIcon className="w-4 h-4" /> Delete Roadmap
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default RoadmapHeader;