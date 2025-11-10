import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './useAuth';
import { useGenerateRoadmap } from './useGenerateRoadmap';
import { UserPreferences } from '../types';
import { initialWizardData } from '../constants/wizardOptions';

const WIZARD_STORAGE_KEY = 'shyftcut_wizard_data';

export const useWizardState = () => {
    const { user, userProfile } = useAuth();
    const navigate = useNavigate();
    const { generateRoadmap, loading: isGenerating, error: generationError, progressMessage } = useGenerateRoadmap();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<UserPreferences>(initialWizardData);
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (generationError) {
            setError(generationError);
        }
    }, [generationError]);

    useEffect(() => {
        const loadInitialData = () => {
            const localData = localStorage.getItem(WIZARD_STORAGE_KEY);
            const parsedLocalData = localData ? JSON.parse(localData) : null;

            if (userProfile) {
                setName(userProfile.name || '');
                if (userProfile.preferences?.careerTrack) {
                    setFormData(userProfile.preferences);
                    localStorage.removeItem(WIZARD_STORAGE_KEY);
                } else if (parsedLocalData) {
                    setFormData(parsedLocalData);
                }
            } else if (parsedLocalData) {
                setFormData(parsedLocalData);
            }
        };
        loadInitialData();
    }, [userProfile]);

    useEffect(() => {
        try {
            localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(formData));
        } catch (e) {
            console.warn('Could not save wizard state to local storage:', e);
        }
    }, [formData]);
    
    const saveToFirestore = useCallback(async (dataToSave: Partial<UserPreferences>) => {
        if (!user) return;
        try {
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                preferences: dataToSave
            }, { merge: true });
        } catch (e) {
            console.error("Failed to auto-save preferences to Firestore:", e);
        }
    }, [user]);

    const handleNext = () => {
        saveToFirestore(formData);
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    const goToStep = (stepNumber: number) => {
        setStep(stepNumber);
    };

    const updateFormData = (data: Partial<UserPreferences>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };
    
    const handleLearningStyleChange = (styleId: string) => {
        setFormData(prev => {
            const newStyles = prev.learningStyles.includes(styleId)
                ? prev.learningStyles.filter(s => s !== styleId)
                : [...prev.learningStyles, styleId];
            return { ...prev, learningStyles: newStyles };
        });
    };

    const handleSubmit = async () => {
        if (!user) {
            setError("You must be logged in to create a roadmap.");
            return;
        }
        
        try {
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                name: name,
                preferences: formData,
                profileComplete: true,
            }, { merge: true });

            const { roadmapId } = await generateRoadmap(formData);
            
            localStorage.removeItem(WIZARD_STORAGE_KEY);
            navigate(`/app/roadmap/${roadmapId}`);

        } catch (err: any) {
            console.error(err);
            // Error is already set by the useGenerateRoadmap hook
        }
    };
    
    return {
        step,
        formData,
        name,
        loading: isGenerating,
        error,
        progressMessage,
        setStep,
        setFormData,
        setName,
        handleNext,
        handleBack,
        goToStep,
        updateFormData,
        handleLearningStyleChange,
        handleSubmit,
    };
};