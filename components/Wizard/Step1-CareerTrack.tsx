import React from 'react';
import { motion } from 'framer-motion';
import { CAREER_TRACKS_OPTIONS } from '../../constants/wizardOptions';
import Button from '../Button';
import { ArrowRightIcon, CheckIcon } from '../icons';
import { UserPreferences } from '../../types';

interface StepProps {
    formData: UserPreferences;
    updateFormData: (data: Partial<UserPreferences>) => void;
    handleNext: () => void;
}

const Step1CareerTrack: React.FC<StepProps> = ({ formData, updateFormData, handleNext }) => {
    
    const handleSelect = (trackName: string) => {
        updateFormData({ careerTrack: trackName });
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1">What do you want to learn?</h2>
            <p className="text-slate-500 mb-6">Select the career path you're most interested in pursuing.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {CAREER_TRACKS_OPTIONS.map(track => (
                    <motion.button 
                        key={track.id} 
                        onClick={() => handleSelect(track.name)} 
                        className={`relative p-5 border-2 rounded-xl text-center transition-all duration-300 flex flex-col items-center justify-start h-40 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50
                            ${formData.careerTrack === track.name 
                                ? 'bg-primary/20 border-primary/40 shadow-lg shadow-primary/20' 
                                : 'glass-card border-white/30 hover:border-primary/30 hover:shadow-md'
                            }`
                        }
                        aria-pressed={formData.careerTrack === track.name}
                        whileHover={{ scale: 1.05, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        animate={{ opacity: formData.careerTrack && formData.careerTrack !== track.name ? 0.6 : 1 }}
                    >
                        {formData.careerTrack === track.name && (
                            <motion.div 
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                                className="absolute top-3 right-3 bg-gradient-to-br from-primary to-primary-600 text-white rounded-full p-1.5 shadow-lg shadow-primary/30"
                            >
                                <CheckIcon className="h-4 w-4" />
                            </motion.div>
                        )}
                        <div className="text-primary text-3xl mb-2">{track.icon}</div>
                        <h3 className="font-bold text-gray-900 text-sm">{track.name}</h3>
                        <p className="text-xs text-slate-600 mt-1 leading-tight">{track.description}</p>
                    </motion.button>
                ))}
            </div>
            
            <div className="mt-8 flex justify-end">
                <Button onClick={handleNext} disabled={!formData.careerTrack}>
                    Next <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Button>
            </div>
        </div>
    );
};

export default Step1CareerTrack;