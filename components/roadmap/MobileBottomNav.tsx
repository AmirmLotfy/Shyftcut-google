
import React from 'react';
import { ArrowLeftIcon, ArrowRightIcon } from '../icons';

interface MobileBottomNavProps {
    onPrev: () => void;
    onNext: () => void;
    isPrevDisabled: boolean;
    isNextDisabled: boolean;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onPrev, onNext, isPrevDisabled, isNextDisabled }) => {
    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200/80 p-3 flex justify-between items-center shadow-lg">
            <button
                onClick={onPrev}
                disabled={isPrevDisabled}
                className="flex items-center justify-center p-3 rounded-xl text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                aria-label="Previous Milestone"
            >
                <ArrowLeftIcon className="w-6 h-6" />
                <span className="ml-2 font-semibold">Prev</span>
            </button>
            <button
                onClick={onNext}
                disabled={isNextDisabled}
                className="flex items-center justify-center p-3 rounded-xl text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                aria-label="Next Milestone"
            >
                <span className="mr-2 font-semibold">Next</span>
                <ArrowRightIcon className="w-6 h-6" />
            </button>
        </div>
    );
};

export default MobileBottomNav;