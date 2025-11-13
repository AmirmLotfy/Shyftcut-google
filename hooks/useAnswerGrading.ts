import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { Question } from '../types';
import { functions } from '../services/firebase';
import { httpsCallable } from 'firebase/functions';

interface GradingResult {
    correct: boolean;
    similarity: number;
    explanation: string;
}

export const useAnswerGrading = () => {
    const { user } = useAuth();
    const [isGrading, setIsGrading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const gradeAnswer = useCallback(async (question: Question, userAnswer: string): Promise<GradingResult | null> => {
        if (!user) {
            setError("You must be logged in to grade answers.");
            return null;
        }
        
        setIsGrading(true);
        setError(null);
        try {
            const gradeAnswerFn = httpsCallable(functions, 'gradeAnswer');
            const result = await gradeAnswerFn({ question, userAnswer });
            return result.data as GradingResult;
        } catch (e: any) {
            console.error("Error calling gradeAnswer function:", e);
            setError(e.message || "Could not grade answer automatically.");
            return null;
        } finally {
            setIsGrading(false);
        }
    }, [user]);

    return { isGrading, error, gradeAnswer };
};
