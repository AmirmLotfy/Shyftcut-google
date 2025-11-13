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
                        className={`relative w-full text-left p-5 border-2 rounded-xl flex items-center transition-all duration-300 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50
                            ${formData.resourcePreference === pref.name
                                ? 'bg-primary/20 border-primary/40 shadow-lg shadow-primary/20'
                                : 'glass-card border-white/30 hover:border-primary/30 hover:shadow-md'
                            }`
                        }
                        aria-pressed={formData.resourcePreference === pref.name}
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                    >
                         {formData.resourcePreference === pref.name && (
                            <motion.div 
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                                className="absolute top-3 right-3 bg-gradient-to-br from-primary to-primary-600 text-white rounded-full p-1.5 shadow-lg shadow-primary/30"
                            >
                                <CheckIcon className="h-4 w-4" />
                            </motion.div>
                        )}
                        <div className="flex-shrink-0 mr-4 text-2xl text-primary">
                            {pref.icon}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900">{pref.name}</h3>
                            <p className="text-sm text-slate-600 mt-1">{pref.description}</p>
                            <p className="text-xs text-primary font-bold mt-2 px-2 py-1 inline-block backdrop-blur-sm bg-primary/10 rounded-lg border border-primary/20">
                                {pref.cost}
                            </p>
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