import React from 'react';
import { Link } from 'react-router-dom';
import { Roadmap, Milestone } from '../../types';
import { Logo, ArrowLeftIcon } from '../icons';
import MilestoneTimeline from './MilestoneTimeline';

interface RoadmapSidebarProps {
    roadmap: Roadmap;
    milestones: Milestone[];
    selectedMilestoneId: string | null;
    onSelectMilestone: (id: string) => void;
    completionStatus: Map<string, boolean>;
}

const RoadmapSidebar: React.FC<RoadmapSidebarProps> = ({ roadmap, milestones, selectedMilestoneId, onSelectMilestone, completionStatus }) => {
    return (
        <aside className="w-80 bg-white border-r border-gray-100 flex-col hidden lg:flex">
            <div className="h-24 flex items-center px-8 flex-shrink-0">
                 <Link to="/dashboard">
                    <Logo className="h-9 w-auto text-slate-900" />
                </Link>
            </div>
            
            <div className="flex-shrink-0 px-8 pb-6">
                <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 mb-4 group">
                    <ArrowLeftIcon className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                    All Roadmaps
                </Link>
                <h2 className="text-xl font-bold text-slate-800">{roadmap.title}</h2>
                <div className="mt-2 flex items-center space-x-2">
                     <span className="bg-primary-50 text-primary-700 px-2 py-1 text-xs font-medium rounded-md">{roadmap.track}</span>
                     <span className="bg-gray-100 text-gray-700 px-2 py-1 text-xs font-medium rounded-md">{roadmap.level}</span>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-8 py-4">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Milestones</h3>
                <MilestoneTimeline 
                    milestones={milestones}
                    selectedMilestoneId={selectedMilestoneId}
                    onSelectMilestone={onSelectMilestone}
                    completionStatus={completionStatus}
                />
            </nav>
        </aside>
    );
};

export default RoadmapSidebar;