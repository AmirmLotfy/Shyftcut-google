import React from 'react';
import Button from '../Button';
import { ArrowLeftIcon, ArrowRightIcon, PencilIcon } from '../icons';
import { UserPreferences } from '../../types';
import Spinner from '../Spinner';

interface StepProps {
    formData: UserPreferences;
    name: string;
    setName: (name: string) => void;
    goToStep: (step: number) => void;
    handleSubmit: () => void;
    handleBack: () => void;
    loading: boolean;
    error: string | null;
    progressMessage: string;
}

const ReviewItem: React.FC<{ label: string; value: string; onEdit: () => void }> = ({ label, value, onEdit }) => (
    <div className="flex items-start justify-between py-4">
        <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="text-base font-semibold text-slate-800">{value || 'Not selected'}</p>
        </div>
        <button onClick={onEdit} className="text-primary hover:text-primary-700 p-2 rounded-md transition-colors hover:bg-primary-50" aria-label={`Edit ${label}`}>
            <PencilIcon className="h-5 w-5" />
        </button>
    </div>
);


const Step6Review: React.FC<StepProps> = ({ formData, name, setName, goToStep, handleSubmit, handleBack, loading, error, progressMessage }) => {
    
    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Review your selections</h2>
            <p className="text-slate-500 mb-6">One last look before we generate your personalized roadmap.</p>

            <div className="space-y-2 divide-y divide-slate-200 bg-slate-50 rounded-lg p-4 border border-slate-200">
                <ReviewItem label="Career Track" value={formData.careerTrack} onEdit={() => goToStep(1)} />
                <ReviewItem label="Experience Level" value={formData.experienceLevel} onEdit={() => goToStep(2)} />
                <ReviewItem label="Weekly Commitment" value={`${formData.weeklyHours} hours`} onEdit={() => goToStep(3)} />
                <ReviewItem label="Learning Styles" value={formData.learningStyles.join(', ')} onEdit={() => goToStep(4)} />
                <ReviewItem label="Resource Preference" value={formData.resourcePreference} onEdit={() => goToStep(5)} />
            </div>

            <div className="mt-6">
                <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                  Confirm your name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>
              </div>
              
            {error && <p className="text-red-600 text-sm mt-4 text-center">{error}</p>}
            
            <div className="mt-8 flex justify-between items-center">
                <Button variant="outline" onClick={handleBack} disabled={loading}>
                    <ArrowLeftIcon className="w-5 h-5 mr-2" /> Back
                </Button>
                <Button onClick={handleSubmit} disabled={loading || !name} className={!loading && name ? "animate-pulse-glow" : ""}>
                    {loading ? (
                        <>
                            <Spinner size="sm" /> 
                            <span className="ml-2">{progressMessage}</span>
                        </>
                    ) : (
                        <>
                            Create My Roadmap <ArrowRightIcon className="w-5 h-5 ml-2" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};

export default Step6Review;