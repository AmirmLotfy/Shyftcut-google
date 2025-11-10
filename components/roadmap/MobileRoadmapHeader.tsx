import React from 'react';
import { Link } from 'react-router-dom';
import { Roadmap, Milestone } from '../../types';
import { ArrowLeftIcon } from '../icons';

interface MobileRoadmapHeaderProps {
    roadmap: Roadmap;
    milestones: Milestone[];
    selectedMilestoneId: string | null;
    onSelectMilestone: (id: string) => void;
}

const MobileRoadmapHeader: React.FC<MobileRoadmapHeaderProps> = ({
    roadmap,
    milestones,
    selectedMilestoneId,
    onSelectMilestone
}) => {
    return (
        <div className="lg:hidden p-3 border-b border-slate-200 bg-white/80 backdrop-blur-lg flex items-center sticky top-0 z-10 space-x-2">
            <Link to="/dashboard" className="p-2 rounded-md hover:bg-slate-100 flex-shrink-0">
                <ArrowLeftIcon className="w-5 h-5 text-slate-600" />
            </Link>
            <div className="flex-1 min-w-0">
                 <h1 className="font-bold text-slate-800 truncate text-sm">{roadmap.title}</h1>
                 <select
                    value={selectedMilestoneId || ''}
                    onChange={(e) => onSelectMilestone(e.target.value)}
                    className="w-full mt-1 block pl-3 pr-10 py-1.5 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                    {milestones.map((milestone) => (
                        <option key={milestone.id} value={milestone.id}>
                            Week {milestone.week}: {milestone.title}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default MobileRoadmapHeader;
