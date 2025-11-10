
import React from 'react';
import { ArrowLeftIcon, ArrowRightIcon } from '../icons';

interface MobileBottomNavProps {
    onPrev: () => void;
    onNext: () => void;
    isPrevDisabled: boolean;
    isNextDisabled: boolean;
    onMarkComplete: () => void;
    isComplete: boolean;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onPrev, onNext, isPrevDisabled, isNextDisabled, onMarkComplete, isComplete }) => {
    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-between items-center shadow-lg">
            <button
                onClick={onPrev}
                disabled={isPrevDisabled}
                className="flex items-center justify-center p-3 rounded-md text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <button 
                onClick={onMarkComplete}
                disabled={isComplete}
                className="flex-1 text-center px-4 py-3 bg-primary text-white font-semibold rounded-md mx-2 disabled:bg-green-500 disabled:cursor-not-allowed transition-colors"
            >
                 {isComplete ? 'Completed' : 'Mark as Complete'}
            </button>
            <button
                onClick={onNext}
                disabled={isNextDisabled}
                className="flex items-center justify-center p-3 rounded-md text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ArrowRightIcon className="w-6 h-6" />
            </button>
        </div>
    );
};

export default MobileBottomNav;
