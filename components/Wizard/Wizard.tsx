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
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200/80 relative">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => navigate('/dashboard')}
                      className="absolute top-4 right-4 z-20 !p-2 h-auto"
                      aria-label="Close wizard"
                    >
                      <XIcon className="h-6 w-6 text-slate-500" />
                    </Button>
                    <div className="p-6 sm:p-8 border-b border-slate-200">
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Create Your Learning Plan</h1>
                        <p className="mt-1 text-slate-500">Let's personalize your journey in just a few steps.</p>
                        
                        <div className="mt-6" aria-label="Progress">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-primary">Step {step} of {WIZARD_STEPS}</p>
                            </div>
                            <div className="bg-slate-200 rounded-full h-2 mt-2 overflow-hidden">
                                <motion.div
                                    className="bg-primary h-2 rounded-full"
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
                                    opacity: { duration: 0.2 }
                                }}
                            >
                                <CurrentStepComponent {...wizardState} />
                            </motion.div>
                         </AnimatePresence>
                    </div>
                </div>
                 <p className="text-center text-xs text-slate-400 mt-4">Your progress is automatically saved.</p>
            </div>
        </div>
    );
};

export default Wizard;