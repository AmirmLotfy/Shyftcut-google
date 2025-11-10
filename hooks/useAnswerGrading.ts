import { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";

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
            if (!process.env.API_KEY) {
                throw new Error("Gemini API key is not configured.");
            }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const gradingSchema = {
                type: Type.OBJECT,
                properties: {
                    correct: { type: Type.BOOLEAN },
                    similarity: { type: Type.NUMBER },
                    explanation: { type: Type.STRING },
                },
                required: ["correct", "similarity", "explanation"],
            };

            const prompt = `
              Please evaluate the user's answer for a quiz question based on semantic similarity.
              Expected Answer: "${expectedAnswer}"
              User's Answer: "${userAnswer}"
              A similarity score of 0.75 or higher should be considered correct.
              Return a JSON object with your evaluation.
            `;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: gradingSchema,
                },
            });
            
            const result = JSON.parse(response.text);
            return result as GradingResult;
        } catch (e: any) {
            console.error("Error calling Gemini for grading:", e);
            setError(e.message || "Could not grade answer automatically.");
            return null;
        } finally {
            setIsGrading(false);
        }
    }, []);

    return { isGrading, error, gradeShortAnswer };
};