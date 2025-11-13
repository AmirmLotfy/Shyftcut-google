import { useState, useCallback } from 'react';
import { Question } from '../types';
import { functions } from '../services/firebase';
import { httpsCallable } from 'firebase/functions';

interface GradingResult {
    correct: boolean;
    similarity: number;
    explanation: string;
}

export const useAnswerGrading = () => {
    const [isGrading, setIsGrading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const gradeAnswer = useCallback(async (question: Question, userAnswer: string): Promise<GradingResult | null> => {
        setIsGrading(true);
        setError(null);
        try {
            const gradeAnswerFunction = httpsCallable(functions, 'gradeAnswer');
            const result = await gradeAnswerFunction({ question, userAnswer });
            return result.data as GradingResult;
        } catch (e: any) {
            console.error("Error calling gradeAnswer cloud function:", e);
            setError(e.message || "Could not grade answer automatically.");
            return null;
        } finally {
            setIsGrading(false);
        }
    }, []);

    return { isGrading, error, gradeAnswer };
};
