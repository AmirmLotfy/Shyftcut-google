import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Roadmap } from '../../types';
import { ArrowRightIcon } from '../icons';
import Button from '../Button';

interface RoadmapCardProps {
    roadmap: Roadmap;
    onStatusUpdate: (roadmapId: string, status: Roadmap['status']) => void;
}

const RoadmapCard: React.FC<RoadmapCardProps> = ({ roadmap, onStatusUpdate }) => {
    const isArchived = roadmap.status === 'archived';

    const cardContent = (
        <motion.div 
            className={`glass-card p-6 h-full flex flex-col ${isArchived ? 'opacity-70' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={!isArchived ? { y: -4 } : {}}
        >
            <div className="flex justify-between items-start flex-grow">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors truncate">{roadmap.title}</h3>
                    </div>
                    <div className="mt-2 flex items-center space-x-2 flex-wrap gap-2">
                        <span className="backdrop-blur-sm bg-primary/20 text-primary-700 px-2.5 py-1 rounded-lg font-semibold text-xs border border-primary/20">{roadmap.track}</span>
                        <span className="backdrop-blur-sm bg-slate-100/80 text-slate-700 px-2.5 py-1 rounded-lg font-semibold text-xs border border-slate-200/50">{roadmap.level}</span>
                    </div>
                </div>
                {!isArchived && 
                    <div className="ml-3 p-2.5 backdrop-blur-sm bg-primary/10 rounded-full group-hover:bg-primary group-hover:text-white transition-all duration-300 flex-shrink-0">
                        <ArrowRightIcon className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
                    </div>
                }
            </div>
            <p className="text-slate-600 mt-4 text-sm line-clamp-2 flex-grow">{roadmap.description}</p>
            {isArchived && (
                 <div className="mt-4 pt-4 border-t border-white/20 text-right">
                    <Button variant="glass-primary" size="sm" onClick={(e) => { e.preventDefault(); onStatusUpdate(roadmap.id, 'in-progress'); }}>
                        Unarchive
                    </Button>
                </div>
            )}
        </motion.div>
    );

    return isArchived ? (
        <div>{cardContent}</div>
    ) : (
        <Link to={`/app/roadmap/${roadmap.id}`} className="group">
            {cardContent}
        </Link>
    );
};

export default RoadmapCard;