import React from 'react';
import { motion } from 'framer-motion';
import { WEEKLY_HOURS_OPTIONS } from '../../constants/wizardOptions';
import Button from '../Button';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from '../icons';
import { UserPreferences } from '../../types';

interface StepProps {
    formData: UserPreferences;
    updateFormData: (data: Partial<UserPreferences>) => void;
    handleNext: () => void;
    handleBack: () => void;
}

const Step3WeeklyHours: React.FC<StepProps> = ({ formData, updateFormData, handleNext, handleBack }) => {
    
    const handleSelect = (hours: number) => {
        updateFormData({ weeklyHours: hours });
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1">How many hours can you commit per week?</h2>
            <p className="text-slate-500 mb-6">Be realistic! Consistency is key to success.</p>
            
            <div className="space-y-4">
                {WEEKLY_HOURS_OPTIONS.map(option => (
                    <motion.button 
                        key={option.hours}
                        onClick={() => handleSelect(option.hours)}
                        className={`relative w-full text-left p-4 border-2 rounded-lg flex items-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                            ${formData.weeklyHours === option.hours
                                ? 'bg-primary-50 border-primary shadow-md'
                                : 'bg-white border-slate-200 hover:border-primary-300'
                            }`
                        }
                         aria-pressed={formData.weeklyHours === option.hours}
                         whileHover={{ scale: 1.02 }}
                         whileTap={{ scale: 0.98 }}
                    >
                         {formData.weeklyHours === option.hours && (
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-2 right-2 bg-primary text-white rounded-full p-0.5"
                            >
                                <CheckIcon className="h-4 w-4" />
                            </motion.div>
                        )}
                        <div className="flex-shrink-0 mr-4 text-primary">{option.icon}</div>
                        <div>
                            <h3 className="font-semibold text-slate-800">{option.hours} hours / week <span className="text-sm font-normal text-slate-500">({option.label})</span></h3>
                            <p className="text-sm text-slate-500">{option.impact}</p>
                        </div>
                    </motion.button>
                ))}
            </div>

            <div className="mt-8 flex justify-between items-center">
                <Button variant="outline" onClick={handleBack}>
                    <ArrowLeftIcon className="w-5 h-5 mr-2" /> Back
                </Button>
                <Button onClick={handleNext} disabled={!formData.weeklyHours}>
                    Next <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Button>
            </div>
        </div>
    );
};

export default Step3WeeklyHours;