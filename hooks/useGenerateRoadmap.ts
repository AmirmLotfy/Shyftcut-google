import { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { db } from '../services/firebase';
import { useAuth } from './useAuth';
import { UserPreferences } from '../types';
import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';

export const useGenerateRoadmap = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progressMessage, setProgressMessage] = useState('Generating...');
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

        // Client-side Rate Limiting for 'free' tier
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

        setProgressMessage('Warming up the AI...');
        
        if (!process.env.API_KEY) {
            const errorMsg = "API key not found. Please ensure it's configured correctly.";
            setError(errorMsg);
            setLoading(false);
            throw new Error(errorMsg);
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const prompt = `
            You are an expert career transition advisor. Generate a personalized 12-week learning roadmap for a user with the following profile:
            - Career Goal: ${preferences.careerTrack}
            - Experience Level: ${preferences.experienceLevel}
            - Weekly Hours: ${preferences.weeklyHours}
            - Learning Styles: ${preferences.learningStyles.join(", ")}
            - Budget: ${preferences.resourcePreference}

            Your response MUST be a single, valid JSON object that adheres to the following structure:
            {
              "title": "Roadmap Title",
              "description": "Roadmap description.",
              "totalHours": 120,
              "estimatedCompletion": "12 Weeks",
              "milestones": [
                {
                  "id": "unique_id_1",
                  "title": "Milestone 1 Title",
                  "week": 1,
                  "description": "Milestone 1 description.",
                  "durationHours": 30,
                  "tasks": [{"id": "t1", "title": "Task 1"}],
                  "successCriteria": ["Criterion 1"],
                  "courses": [{"id": "c1", "title": "Course 1", "platform": "YouTube", "url": "https://...", "duration": "5 hours", "cost": "Free", "reasoning": "Why it's good."}],
                  "quizzes": [
                    {
                      "id": "q1", "title": "Quiz 1", "difficulty": 1, 
                      "questions": [
                        {"id": "qq1", "text": "Question?", "type": "multiple-choice", "options": ["A", "B", "C", "D"], "correctAnswer": "A", "explanation": "Explanation."}
                      ]
                    }
                  ]
                }
              ]
            }

            CRITICAL INSTRUCTIONS:
            1. The roadmap should cover 12 weeks, broken into 4 distinct milestones. Each milestone should represent a block of learning (e.g., Weeks 1-3, Weeks 4-6, etc.). The 'week' property for the milestones should be 1, 4, 7, and 10 respectively.
            2. For each milestone, provide:
                - A clear title and a 2-3 sentence description.
                - Duration in hours (must fit within the user's weekly budget for 3 weeks).
                - A list of specific, actionable tasks.
                - A list of measurable success criteria.
                - A list of REAL courses from platforms like YouTube, Coursera, Udemy, LinkedIn Learning, edX. Use web search to verify courses exist and URLs are valid. DO NOT hallucinate URLs or course titles.
                - A list of quizzes to test the milestone's concepts. Each quiz should contain a few questions that are a mix of 'multiple-choice' and 'short-answer'. For 'multiple-choice', provide 4 options. Every question needs a correct answer and a brief explanation.
            3. Ensure all generated IDs (for milestones, tasks, courses, quizzes, questions) are unique strings.
            4. The final output MUST be only the JSON object, with no extra text or markdown formatting like \`\`\`json.
        `;

        try {
            setProgressMessage('Generating your learning path...');
            const response = await ai.models.generateContent({
                model: "gemini-2.5-pro",
                contents: prompt,
                config: { tools: [{ googleSearch: {} }] },
            });

            setProgressMessage('Parsing AI response...');
            const rawText = response.text;
            let jsonString = "";
            const markdownMatch = rawText.match(/```(json)?\s*([\s\S]*?)\s*```/);
            if (markdownMatch && markdownMatch[2]) {
                jsonString = markdownMatch[2];
            } else {
                const jsonStart = rawText.indexOf("{");
                const jsonEnd = rawText.lastIndexOf("}");
                if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                    jsonString = rawText.substring(jsonStart, jsonEnd + 1);
                }
            }

            if (!jsonString) {
                throw new Error("The AI failed to generate a valid roadmap structure.");
            }

            let roadmapData;
            try {
                roadmapData = JSON.parse(jsonString);
            } catch (parseError) {
                throw new Error("The AI returned a malformed JSON object. Please try again.");
            }

            setProgressMessage('Saving your new roadmap...');
            const { milestones, ...roadmapDetails } = roadmapData;
            const roadmapRef = doc(collection(db, `tracks/${user.uid}/roadmaps`));
            const batch = writeBatch(db);

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
                const milestoneWithStatus = {
                    ...milestone,
                    tasks: milestone.tasks.map((task: any) => ({ ...task, completed: false })),
                    courses: milestone.courses.map((course: any) => ({ ...course, completed: false })),
                };
                batch.set(milestoneRef, milestoneWithStatus);
            });
            
            const userRef = doc(db, 'users', user.uid);
            batch.update(userRef, {
              lastRoadmapGeneratedAt: serverTimestamp(),
            });

            await batch.commit();
            setProgressMessage('All done!');
            return { roadmapId: roadmapRef.id };

        } catch (err: any) {
            console.error("Error generating roadmap:", err);
            const errorMessage = err.message || 'An unknown error occurred while generating the roadmap.';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [user, userProfile]);

    return { generateRoadmap, loading, error, progressMessage };
};