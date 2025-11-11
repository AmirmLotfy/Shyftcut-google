
import { useState, useCallback } from 'react';
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

    const gradeShortAnswer = useCallback(async (userAnswer: string, expectedAnswer: string): Promise<GradingResult | null> => {
        setIsGrading(true);
        setError(null);
        try {
            const gradeShortAnswerFn = httpsCallable(functions, 'gradeShortAnswer');
            const result: any = await gradeShortAnswerFn({ userAnswer, expectedAnswer });
            return result.data as GradingResult;
        } catch (e: any) {
            console.error("Error calling grading function:", e);
            setError(e.message || "Could not grade answer automatically.");
            return null;
        } finally {
            setIsGrading(false);
        }
    }, []);

    return { isGrading, error, gradeShortAnswer };
};
