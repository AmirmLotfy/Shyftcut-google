import { useState, useCallback } from 'react';
import { gradeAnswerFromGemini } from '../services/geminiService';

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
            const result = await gradeAnswerFromGemini(userAnswer, expectedAnswer);
            return result as GradingResult;
        } catch (e: any) {
            console.error("Error calling grading service:", e);
            setError(e.message || "Could not grade answer automatically.");
            return null;
        } finally {
            setIsGrading(false);
        }
    }, []);

    return { isGrading, error, gradeShortAnswer };
};
