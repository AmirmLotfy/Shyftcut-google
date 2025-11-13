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
                        className={`flex items-center p-3 pl-4 pr-5 border-2 rounded-full transition-all duration-300 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50
                            ${isSelected(style.name) 
                                ? 'bg-gradient-to-r from-primary to-primary-600 text-white border-primary/40 shadow-lg shadow-primary/30'
                                : 'glass-card border-white/30 text-slate-700 hover:border-primary/30 hover:shadow-md'
                            }`
                        }
                        aria-pressed={isSelected(style.name)}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span className="text-lg">{style.icon}</span>
                        <span className={`font-bold text-sm ml-2 ${isSelected(style.name) ? 'text-white' : 'text-gray-900'}`}>{style.name}</span>
                    </motion.button>
                ))}
            </div>
            
            {formData.learningStyles.length > 0 && (
                <motion.div 
                    className="mt-6 glass-card p-4 rounded-xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <p className="font-bold text-gray-900 mb-2">Examples:</p>
                    <ul className="space-y-1 text-sm text-slate-600">
                        {LEARNING_STYLES_OPTIONS
                            .filter(style => isSelected(style.name))
                            .map(style => (
                                <li key={style.id} className="flex items-start">
                                    <span className="text-primary mr-2">•</span>
                                    <span><strong className="text-gray-900">{style.name}:</strong> {style.example}</span>
                                </li>
                            ))
                        }
                    </ul>
                </motion.div>
            )}

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