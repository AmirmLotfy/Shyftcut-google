import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { Question } from '../types';
import { authenticatedFetch } from '../services/api';

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
            const resultData = await authenticatedFetch('/api/gradeAnswer', user, {
                method: 'POST',
                body: JSON.stringify({ question, userAnswer }),
            });

            return resultData as GradingResult;

        } catch (e: any) {
            console.error("Error calling gradeAnswer API:", e);
            setError(e.message || "Could not grade answer automatically.");
            return null;
        } finally {
            setIsGrading(false);
        }
    }, [user]);

    return { isGrading, error, gradeAnswer };
};
