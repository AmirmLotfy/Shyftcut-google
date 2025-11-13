import React from 'react';
import { motion } from 'framer-motion';
import Button from '../Button';
import { ArrowLeftIcon, ArrowRightIcon, PencilIcon } from '../icons';
import { UserPreferences } from '../../types';
import GenerationLoader from '../GenerationLoader';

interface StepProps {
    formData: UserPreferences;
    name: string;
    setName: (name: string) => void;
    goToStep: (step: number) => void;
    handleSubmit: () => void;
    handleBack: () => void;
    loading: boolean;
    error: string | null;
}

const ReviewItem: React.FC<{ label: string; value: string; onEdit: () => void }> = ({ label, value, onEdit }) => (
    <div className="flex items-start justify-between py-4 first:pt-0 last:pb-0">
        <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{label}</p>
            <p className="text-base font-bold text-gray-900 truncate">{value || 'Not selected'}</p>
        </div>
        <motion.button 
            onClick={onEdit} 
            className="ml-4 text-primary hover:text-primary-700 p-2 rounded-lg transition-all backdrop-blur-sm bg-white/40 hover:bg-primary/10 border border-transparent hover:border-primary/20 flex-shrink-0" 
            aria-label={`Edit ${label}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
        >
            <PencilIcon className="h-5 w-5" />
        </motion.button>
    </div>
);


const Step6Review: React.FC<StepProps> = ({ formData, name, setName, goToStep, handleSubmit, handleBack, loading, error }) => {
    
    if (loading || error) {
        return <GenerationLoader error={error} />;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Review your selections</h2>
            <p className="text-slate-500 mb-6">One last look before we generate your personalized roadmap.</p>

            <div className="glass-card p-6 space-y-4 divide-y divide-white/20">
                <ReviewItem label="Career Track" value={formData.careerTrack} onEdit={() => goToStep(1)} />
                <ReviewItem label="Experience Level" value={formData.experienceLevel} onEdit={() => goToStep(2)} />
                <ReviewItem label="Weekly Commitment" value={`${formData.weeklyHours} hours`} onEdit={() => goToStep(3)} />
                <ReviewItem label="Learning Styles" value={formData.learningStyles.join(', ')} onEdit={() => goToStep(4)} />
                <ReviewItem label="Resource Preference" value={formData.resourcePreference} onEdit={() => goToStep(5)} />
            </div>

            <div className="mt-6">
                <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                  Confirm your name
                </label>
                <div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="glass-input block w-full px-4 py-2.5 placeholder-slate-400 focus:outline-none sm:text-sm"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
              
            <div className="mt-8 flex justify-between items-center">
                <Button variant="outline" onClick={handleBack} disabled={loading}>
                    <ArrowLeftIcon className="w-5 h-5 mr-2" /> Back
                </Button>
                <Button onClick={handleSubmit} disabled={loading || !name} className="animate-pulse-glow">
                    Create My Roadmap <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Button>
            </div>
        </div>
    );
};

export default Step6Review;