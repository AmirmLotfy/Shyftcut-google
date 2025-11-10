import React from 'react';
import { motion } from 'framer-motion';
import { RESOURCE_PREFERENCES_OPTIONS } from '../../constants/wizardOptions';
import Button from '../Button';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from '../icons';
import { UserPreferences } from '../../types';

interface StepProps {
    formData: UserPreferences;
    updateFormData: (data: Partial<UserPreferences>) => void;
    handleNext: () => void;
    handleBack: () => void;
}

const Step5ResourcePreference: React.FC<StepProps> = ({ formData, updateFormData, handleNext, handleBack }) => {

    const handleSelect = (prefName: string) => {
        updateFormData({ resourcePreference: prefName });
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1">What's your preference for learning resources?</h2>
            <p className="text-slate-500 mb-6">This helps us balance cost and quality in our recommendations.</p>
            
            <div className="space-y-4">
                {RESOURCE_PREFERENCES_OPTIONS.map(pref => (
                     <motion.button 
                        key={pref.id}
                        onClick={() => handleSelect(pref.name)}
                        className={`relative w-full text-left p-4 border-2 rounded-lg flex items-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                            ${formData.resourcePreference === pref.name
                                ? 'bg-primary-50 border-primary shadow-md'
                                : 'bg-white border-slate-200 hover:border-primary-300'
                            }`
                        }
                        aria-pressed={formData.resourcePreference === pref.name}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                         {formData.resourcePreference === pref.name && (
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-2 right-2 bg-primary text-white rounded-full p-0.5"
                            >
                                <CheckIcon className="h-4 w-4" />
                            </motion.div>
                        )}
                        <div className="flex-shrink-0 mr-4">
                            {pref.icon}
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-800">{pref.name}</h3>
                            <p className="text-sm text-slate-500">{pref.description}</p>
                            <p className="text-xs text-primary font-medium mt-1">{pref.cost}</p>
                        </div>
                    </motion.button>
                ))}
            </div>

            <div className="mt-8 flex justify-between items-center">
                <Button variant="outline" onClick={handleBack}>
                    <ArrowLeftIcon className="w-5 h-5 mr-2" /> Back
                </Button>
                <Button onClick={handleNext} disabled={!formData.resourcePreference}>
                    Review <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Button>
            </div>
        </div>
    );
};

export default Step5ResourcePreference;