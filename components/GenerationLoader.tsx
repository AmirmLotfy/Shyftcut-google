import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Logo, CheckCircleIcon, XCircleIcon } from './icons';
import Spinner from './Spinner';

const generationSteps = [
    "Parsing your preferences...",
    "Connecting to AI Mentor...",
    "Analyzing career trajectory...",
    "Scouring the web for top resources...",
    "Designing Milestone 1: Foundations...",
    "Crafting practical tasks & projects...",
    "Generating knowledge checks & quizzes...",
    "Assembling your personalized roadmap...",
    "Finalizing and saving...",
];

const GenerationLoader: React.FC<{ error: string | null }> = ({ error }) => {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (error) return; // Stop advancing if there's an error

        if (currentStep < generationSteps.length - 1) {
            const timeoutId = setTimeout(() => {
                setCurrentStep(prev => prev + 1);
            }, 1800); // Duration for each step
            return () => clearTimeout(timeoutId);
        }
    }, [currentStep, error]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center text-center min-h-[400px]">
                <XCircleIcon className="w-16 h-16 text-red-500 mb-4" />
                <h3 className="text-xl font-bold text-slate-800">Generation Failed</h3>
                <p className="text-slate-600 mt-2 max-w-sm">{error}</p>
                <p className="text-sm text-slate-500 mt-4">Please try adjusting your preferences or try again later.</p>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col items-center justify-center text-center min-h-[400px]">
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.8, 1, 0.8],
                }}
                transition={{
                    duration: 2.5,
                    ease: "easeInOut",
                    repeat: Infinity,
                }}
            >
                <Logo className="h-16 w-auto" />
            </motion.div>

            <h2 className="mt-6 text-2xl font-bold text-slate-800">Building Your Future...</h2>

            <div className="w-full max-w-md mt-6">
                <ul className="space-y-3 text-left">
                    {generationSteps.map((step, index) => (
                        <motion.li
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center text-sm"
                        >
                            <div className="w-6 h-6 mr-3 flex items-center justify-center">
                                {index < currentStep ? (
                                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                ) : index === currentStep ? (
                                    <Spinner size="sm" />
                                ) : (
                                    <div className="w-2 h-2 bg-slate-300 rounded-full" />
                                )}
                            </div>
                            <span className={`transition-colors ${index <= currentStep ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                                {step}
                            </span>
                        </motion.li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default GenerationLoader;