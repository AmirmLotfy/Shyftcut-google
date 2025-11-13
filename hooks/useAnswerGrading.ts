import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { Question } from '../types';
import { GoogleGenAI, Type } from '@google/genai';


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
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            
            const gradingSchema = {
                type: Type.OBJECT,
                properties: {
                    correct: { type: Type.BOOLEAN },
                    similarity: { type: Type.NUMBER },
                    explanation: { type: Type.STRING },
                },
                required: ["correct", "similarity", "explanation"],
            };
            
            const prompt = question.type === "multiple-choice"
                ? `Evaluate the user's answer for this multiple-choice question. Question: "${question.text}". Options: ${JSON.stringify(question.options)}. Correct Answer: "${question.correctAnswer}". User's Answer: "${userAnswer}". Respond with JSON. "correct" is true/false. "similarity" is 1 or 0. "explanation" is "${question.explanation}", re-iterating the correct answer if the user was wrong.`
                : `Evaluate the user's short-answer based on semantic similarity. Official Answer: "${question.correctAnswer}". User's Answer: "${userAnswer}". Respond with JSON. "correct" is true if similarity is >= 0.75. "similarity" is a float from 0.0 to 1.0. "explanation" should elaborate on "${question.explanation}".`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: { responseMimeType: "application/json", responseSchema: gradingSchema },
            });

            const resultData = JSON.parse(response.text);
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
