

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
        <div className="mb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex items-center gap-6">
                    <div className="flex-shrink-0">
                        <RadialProgress progress={overallProgress} />
                    </div>
                    <div>
                        <p className="text-base font-semibold text-primary">{roadmap.track}</p>
                        <h1 className="text-4xl font-bold text-slate-900">{roadmap.title}</h1>
                         {currentMilestone && (
                            <p className="text-base text-slate-500 mt-2">
                                Current Focus: <span className="font-semibold text-slate-700">{currentMilestone.title}</span>
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex space-x-2 mt-4 sm:mt-0 self-start sm:self-center">
                    <Button variant="ghost" size="sm" aria-label="Share" onClick={onShare}><ShareIcon className="w-6 h-6" /></Button>
                    <Button variant="ghost" size="sm" aria-label="Archive" onClick={onArchive} disabled={isArchiving}>
                        {isArchiving ? <Spinner size="sm"/> : <ArchiveBoxIcon className="w-6 h-6" />}
                    </Button>
                     {/* Settings Dropdown */}
                    <div className="relative" ref={settingsRef}>
                        <Button variant="ghost" size="sm" aria-label="Settings" onClick={() => setIsSettingsOpen(!isSettingsOpen)}>
                            <Cog6ToothIcon className="w-6 h-6" />
                        </Button>
                        <AnimatePresence>
                            {isSettingsOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.15, ease: 'easeOut' }}
                                    className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                                >
                                    <div className="py-1">
                                        <button onClick={() => { onEdit(); setIsSettingsOpen(false); }} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-primary rounded-md transition-colors">
                                            <PencilIcon className="w-4 h-4" /> Edit Roadmap
                                        </button>
                                        <button onClick={() => { onDelete(); setIsSettingsOpen(false); }} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors">
                                            <TrashIcon className="w-4 h-4" /> Delete Roadmap
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoadmapHeader;