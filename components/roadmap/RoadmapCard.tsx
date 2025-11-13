
import React from 'react';
import { Link } from 'react-router-dom';
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
        <div className={`block bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg border border-gray-200 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col ${isArchived ? 'opacity-70' : ''}`}>
            <div className="flex justify-between items-start flex-grow">
                <div>
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">{roadmap.title}</h3>
                    </div>
                    <div className="mt-2 flex items-center space-x-2 text-sm text-gray-500">
                        <span className="bg-primary-50 text-primary-700 px-2 py-1 rounded-md font-medium text-xs">{roadmap.track}</span>
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md font-medium text-xs">{roadmap.level}</span>
                    </div>
                </div>
                {!isArchived && 
                    <div className="p-2 bg-gray-100 rounded-full group-hover:bg-primary group-hover:text-white transition-colors flex-shrink-0">
                        <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-white" />
                    </div>
                }
            </div>
            <p className="text-gray-600 mt-4 text-sm line-clamp-2 flex-grow">{roadmap.description}</p>
            {isArchived && (
                 <div className="mt-4 pt-4 border-t border-gray-100 text-right">
                    <Button variant="outline" size="sm" onClick={(e) => { e.preventDefault(); onStatusUpdate(roadmap.id, 'in-progress'); }}>
                        Unarchive
                    </Button>
                </div>
            )}
        </div>
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