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
                        className={`relative w-full text-left p-5 border-2 rounded-xl flex items-center transition-all duration-300 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50
                            ${formData.weeklyHours === option.hours
                                ? 'bg-primary/20 border-primary/40 shadow-lg shadow-primary/20'
                                : 'glass-card border-white/30 hover:border-primary/30 hover:shadow-md'
                            }`
                        }
                         aria-pressed={formData.weeklyHours === option.hours}
                         whileHover={{ scale: 1.02, x: 4 }}
                         whileTap={{ scale: 0.98 }}
                    >
                         {formData.weeklyHours === option.hours && (
                            <motion.div 
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                                className="absolute top-3 right-3 bg-gradient-to-br from-primary to-primary-600 text-white rounded-full p-1.5 shadow-lg shadow-primary/30"
                            >
                                <CheckIcon className="h-4 w-4" />
                            </motion.div>
                        )}
                        <div className="flex-shrink-0 mr-4 text-2xl text-primary">{option.icon}</div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900">{option.hours} hours / week <span className="text-sm font-normal text-slate-600">({option.label})</span></h3>
                            <p className="text-sm text-slate-600 mt-1">{option.impact}</p>
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