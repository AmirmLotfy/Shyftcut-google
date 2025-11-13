import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { UserPreferences } from '../types';
import { GoogleGenAI } from '@google/genai';
import { db } from '../services/firebase';
import { doc, writeBatch, serverTimestamp, collection } from 'firebase/firestore';


export const useGenerateRoadmap = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user, userProfile } = useAuth();

    const generateRoadmap = useCallback(async (preferences: UserPreferences) => {
        setLoading(true);
        setError(null);

        if (!user || !userProfile) {
            const errorMsg = "You must be logged in to create a roadmap.";
            setError(errorMsg);
            setLoading(false);
            throw new Error(errorMsg);
        }

        if (userProfile.subscriptionRole === 'free' && userProfile.lastRoadmapGeneratedAt) {
            const lastGenDate = userProfile.lastRoadmapGeneratedAt.toDate();
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            if (lastGenDate > oneMonthAgo) {
                const errorMsg = "Free tier is limited to one roadmap per month. Please upgrade to Pro for more.";
                setError(errorMsg);
                setLoading(false);
                throw new Error(errorMsg);
            }
        }
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            
            const prompt = `
              You are an expert career transition advisor. Generate a personalized 12-week learning roadmap for a user with the following profile:
              - Career Goal: ${preferences.careerTrack}
              - Experience Level: ${preferences.experienceLevel}
              - Weekly Hours: ${preferences.weeklyHours}
              - Learning Styles: ${preferences.learningStyles.join(", ")}
              - Budget: ${preferences.resourcePreference}

              Your response MUST be a single, valid JSON object. Do not include markdown fences. The structure must be:
              {
                "title": "Roadmap Title", "description": "...", "totalHours": ${preferences.weeklyHours * 12}, "estimatedCompletion": "12 Weeks",
                "milestones": [
                  {
                    "id": "...", "title": "...", "week": 1, "description": "...", "durationHours": ${preferences.weeklyHours * 3},
                    "tasks": [{"id": "...", "title": "..."}], "successCriteria": ["..."],
                    "courses": [{"id": "...", "title": "...", "platform": "...", "url": "https://...", "duration": "...", "cost": "...", "reasoning": "..."}],
                    "quizzes": [{"id": "...", "title": "...", "difficulty": 1, "questions": [{"id": "...", "text": "...", "type": "multiple-choice", "options": ["A", "B", "C", "D"], "correctAnswer": "A", "explanation": "..."}]}]
                  }
                ]
              }
              CRITICAL: The roadmap must cover 12 weeks, split into 4 milestones (starting weeks 1, 4, 7, 10). Use web search to find REAL, valid URLs for courses. IDs must be unique strings. The entire response must ONLY be the raw JSON object.
            `;

            const response = await ai.models.generateContent({
              model: "gemini-2.5-pro",
              contents: prompt,
              config: { tools: [{ googleSearch: {} }] },
            });
    
            const rawJson = response.text.trim();
            const roadmapData = JSON.parse(rawJson);
            const { milestones, ...roadmapDetails } = roadmapData;

            const batch = writeBatch(db);
            const userRef = doc(db, 'users', user.uid);
            const roadmapRef = doc(collection(db, `tracks/${user.uid}/roadmaps`));

            batch.set(roadmapRef, {
                ...roadmapDetails,
                track: preferences.careerTrack,
                level: preferences.experienceLevel,
                status: "in-progress",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            milestones.forEach((milestone: any) => {
                const milestoneRef = doc(roadmapRef, "milestones", milestone.id);
                batch.set(milestoneRef, {
                    ...milestone,
                    tasks: milestone.tasks.map((task: any) => ({ ...task, completed: false })),
                    courses: milestone.courses.map((course: any) => ({ ...course, completed: false })),
                });
            });

            batch.update(userRef, { lastRoadmapGeneratedAt: serverTimestamp() });
            
            await batch.commit();

            return { roadmapId: roadmapRef.id };

        } catch (err: any) {
            console.error("Error generating roadmap:", err);
            const errorMessage = err.message || 'An unknown error occurred while generating the roadmap. Please try again later.';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [user, userProfile]);

    return { generateRoadmap, loading, error };
};
