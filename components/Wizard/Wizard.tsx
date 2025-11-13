import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useWizardState } from '../../hooks/useWizardState';
import { WIZARD_STEPS } from '../../constants/wizardOptions';

import Step1CareerTrack from './Step1-CareerTrack';
import Step2ExperienceLevel from './Step2-ExperienceLevel';
import Step3WeeklyHours from './Step3-WeeklyHours';
import Step4LearningStyle from './Step4-LearningStyle';
import Step5ResourcePreference from './Step5-ResourcePreference';
import Step6Review from './Step6-Review';
import { XIcon } from '../icons';
import Button from '../Button';

const stepComponents: { [key: number]: React.ComponentType<any> } = {
    1: Step1CareerTrack,
    2: Step2ExperienceLevel,
    3: Step3WeeklyHours,
    4: Step4LearningStyle,
    5: Step5ResourcePreference,
    6: Step6Review,
};

const Wizard: React.FC = () => {
    const wizardState = useWizardState();
    const { step } = wizardState;
    const navigate = useNavigate();

    const CurrentStepComponent = stepComponents[step];
    
    const variants = {
        enter: {
            x: '100%',
            opacity: 0,
        },
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
        },
        exit: {
            zIndex: 0,
            x: '-100%',
            opacity: 0,
        },
    };

    return (
        <div className="min-h-screen gradient-primary py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <motion.div 
                    className="glass-card overflow-hidden relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <motion.button 
                      variant="glass" 
                      onClick={() => navigate('/dashboard')}
                      className="absolute top-4 right-4 z-20 !p-2.5 h-auto backdrop-blur-sm bg-white/60 text-slate-600 hover:bg-white/80 border border-white/30 rounded-full transition-all"
                      aria-label="Close wizard"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <XIcon className="h-5 w-5" />
                    </motion.button>
                    <div className="p-6 sm:p-8 border-b border-white/20">
                        <motion.h1 
                            className="text-2xl sm:text-3xl font-bold text-gray-900"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            Create Your Learning Plan
                        </motion.h1>
                        <motion.p 
                            className="mt-2 text-slate-600"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            Let's personalize your journey in just a few steps.
                        </motion.p>
                        
                        <div className="mt-6" aria-label="Progress">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-semibold text-primary">Step {step} of {WIZARD_STEPS}</p>
                            </div>
                            <div className="glass-card p-1 rounded-full backdrop-blur-sm bg-slate-200/50 border border-white/30 h-3 overflow-hidden">
                                <motion.div
                                    className="bg-gradient-to-r from-primary to-secondary h-full rounded-full shadow-lg"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(step / WIZARD_STEPS) * 100}%` }}
                                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-6 sm:p-8 relative min-h-[450px] overflow-hidden">
                         <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "spring", stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.3 }
                                }}
                            >
                                <CurrentStepComponent {...wizardState} />
                            </motion.div>
                         </AnimatePresence>
                    </div>
                </motion.div>
                 <motion.p 
                    className="text-center text-xs text-slate-500 mt-4 backdrop-blur-sm bg-white/40 px-4 py-2 rounded-lg inline-block border border-white/30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    Your progress is automatically saved.
                </motion.p>
            </div>
        </div>
    );
};

export default Wizard;