
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
        <div className={`block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ${isArchived ? 'opacity-60' : ''}`}>
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-4">
                        <h3 className="text-xl font-bold text-gray-800">{roadmap.title}</h3>
                        {isArchived && <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Archived</span>}
                    </div>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-medium">{roadmap.track}</span>
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">{roadmap.level}</span>
                    </div>
                </div>
                {!isArchived && <ArrowRightIcon className="w-5 h-5 text-gray-400" />}
            </div>
            <p className="text-gray-600 mt-4 line-clamp-2">{roadmap.description}</p>
            {isArchived && (
                 <div className="mt-4 pt-4 border-t border-gray-200 text-right">
                    <Button variant="outline" size="sm" onClick={() => onStatusUpdate(roadmap.id, 'in-progress')}>
                        Unarchive
                    </Button>
                </div>
            )}
        </div>
    );

    return isArchived ? (
        <div>{cardContent}</div>
    ) : (
        <Link to={`/app/roadmap/${roadmap.id}`}>
            {cardContent}
        </Link>
    );
};

export default RoadmapCard;