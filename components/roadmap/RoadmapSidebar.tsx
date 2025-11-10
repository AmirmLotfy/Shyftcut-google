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
        <aside className="w-80 bg-white/60 backdrop-blur-lg border-r border-slate-200/80 flex-col hidden lg:flex">
            <div className="h-20 flex items-center px-6 border-b border-slate-200/80 flex-shrink-0">
                <Logo className="h-8 w-auto text-slate-900" />
            </div>
            
            <div className="flex-shrink-0 p-6">
                <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 mb-4">
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back to All Roadmaps
                </Link>
                <h2 className="text-xl font-bold text-slate-800">{roadmap.title}</h2>
                <div className="mt-2 flex items-center space-x-2">
                     <span className="bg-primary-100 text-primary-700 px-2 py-1 text-xs font-medium rounded-full">{roadmap.track}</span>
                     <span className="bg-slate-100 text-slate-700 px-2 py-1 text-xs font-medium rounded-full">{roadmap.level}</span>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-6 py-4">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Milestones</h3>
                <MilestoneTimeline 
                    milestones={milestones}
                    selectedMilestoneId={selectedMilestoneId}
                    onSelectMilestone={onSelectMilestone}
                    completionStatus={completionStatus}
                />
            </nav>
            
            <div className="p-6 border-t border-slate-200/80">
                <button className="w-full text-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50">
                    Roadmap Settings
                </button>
            </div>
        </aside>
    );
};

export default RoadmapSidebar;