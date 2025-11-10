
import React, { useMemo } from 'react';
import { Roadmap, Milestone } from '../../types';
import { Cog6ToothIcon, ShareIcon, ArchiveBoxIcon } from '../icons';
import Button from '../Button';
import RadialProgress from './RadialProgress';
import Spinner from '../Spinner';

interface RoadmapHeaderProps {
    roadmap: Roadmap;
    milestones: Milestone[];
    completionStatus: Map<string, boolean>;
    onArchive: () => void;
    isArchiving: boolean;
}

const RoadmapHeader: React.FC<RoadmapHeaderProps> = ({ roadmap, milestones, completionStatus, onArchive, isArchiving }) => {
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex items-start gap-6">
                    <RadialProgress progress={overallProgress} />
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">{roadmap.title}</h1>
                        <p className="mt-1 text-slate-500">Your personalized path to mastering {roadmap.track}.</p>
                         {currentMilestone && (
                            <p className="text-sm text-slate-500 mt-2">
                                Currently on: <span className="font-semibold text-slate-700">Milestone {milestones.indexOf(currentMilestone) + 1} - {currentMilestone.title}</span>
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex space-x-2 mt-4 sm:mt-0 self-start">
                    <Button variant="ghost" size="sm" aria-label="Settings"><Cog6ToothIcon className="w-5 h-5" /></Button>
                    <Button variant="ghost" size="sm" aria-label="Share"><ShareIcon className="w-5 h-5" /></Button>
                    <Button variant="ghost" size="sm" aria-label="Archive" onClick={onArchive} disabled={isArchiving}>
                        {isArchiving ? <Spinner size="sm"/> : <ArchiveBoxIcon className="w-5 h-5" />}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default RoadmapHeader;