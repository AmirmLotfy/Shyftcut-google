import { useState, useCallback } from 'react';
import { gradeAnswerFromGemini } from '../services/geminiService';
import { Question } from '../types';

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
            const result = await gradeAnswerFromGemini(question, userAnswer);
            return result as GradingResult;
        } catch (e: any) {
            console.error("Error calling grading service:", e);
            setError(e.message || "Could not grade answer automatically.");
            return null;
        } finally {
            setIsGrading(false);
        }
    }, []);

    return { isGrading, error, gradeAnswer };
};
