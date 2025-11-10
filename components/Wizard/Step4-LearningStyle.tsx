import React from 'react';
import { motion } from 'framer-motion';
import { LEARNING_STYLES_OPTIONS } from '../../constants/wizardOptions';
import Button from '../Button';
import { ArrowLeftIcon, ArrowRightIcon } from '../icons';
import { UserPreferences } from '../../types';

interface StepProps {
    formData: UserPreferences;
    handleLearningStyleChange: (styleId: string) => void;
    handleNext: () => void;
    handleBack: () => void;
}

const Step4LearningStyle: React.FC<StepProps> = ({ formData, handleLearningStyleChange, handleNext, handleBack }) => {
    const isSelected = (styleName: string) => formData.learningStyles.includes(styleName);

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1">How do you learn best?</h2>
            <p className="text-slate-500 mb-6">Select all that apply. This helps us find the right resources for you.</p>
            
            <div className="flex flex-wrap gap-3">
                {LEARNING_STYLES_OPTIONS.map(style => (
                    <motion.button 
                        key={style.id}
                        onClick={() => handleLearningStyleChange(style.name)}
                        className={`flex items-center p-2 pl-3 pr-4 border-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                            ${isSelected(style.name) 
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-primary-300'
                            }`
                        }
                        aria-pressed={isSelected(style.name)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {style.icon}
                        <span className="font-semibold text-sm ml-1">{style.name}</span>
                    </motion.button>
                ))}
            </div>
            
            <div className="mt-6 text-sm text-slate-500">
                <p><strong>Examples:</strong></p>
                <ul className="list-disc list-inside">
                    {LEARNING_STYLES_OPTIONS
                        .filter(style => isSelected(style.name))
                        .map(style => <li key={style.id}>{style.name}: {style.example}</li>)
                    }
                    {formData.learningStyles.length === 0 && <li>Select a style to see examples.</li>}
                </ul>
            </div>

            <div className="mt-8 flex justify-between items-center">
                <Button variant="outline" onClick={handleBack}>
                    <ArrowLeftIcon className="w-5 h-5 mr-2" /> Back
                </Button>
                <Button onClick={handleNext} disabled={formData.learningStyles.length === 0}>
                    Next <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Button>
            </div>
        </div>
    );
};

export default Step4LearningStyle;