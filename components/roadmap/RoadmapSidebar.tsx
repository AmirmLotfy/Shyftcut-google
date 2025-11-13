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
        <aside className="glass-sidebar w-80 flex-col hidden lg:flex">
            <div className="h-24 flex items-center px-8 flex-shrink-0 border-b border-white/20">
                 <Link to="/dashboard" className="transition-transform hover:scale-105">
                    <Logo className="h-9 w-auto text-slate-900" />
                </Link>
            </div>
            
            <div className="flex-shrink-0 px-8 pb-6 pt-6 border-b border-white/20">
                <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-primary mb-4 group transition-colors">
                    <ArrowLeftIcon className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                    All Roadmaps
                </Link>
                <h2 className="text-xl font-bold text-slate-900">{roadmap.title}</h2>
                <div className="mt-2 flex items-center space-x-2 flex-wrap gap-2">
                     <span className="backdrop-blur-sm bg-primary/20 text-primary-700 px-2.5 py-1 text-xs font-semibold rounded-lg border border-primary/20">{roadmap.track}</span>
                     <span className="backdrop-blur-sm bg-slate-100/80 text-slate-700 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200/50">{roadmap.level}</span>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-8 py-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Milestones</h3>
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