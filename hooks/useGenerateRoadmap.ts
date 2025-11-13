import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { UserPreferences } from '../types';
import { db } from '../services/firebase';
import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { generateRoadmapFromGemini } from '../services/geminiService';

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

        // Client-side Rate Limiting for 'free' tier (still useful for immediate UI feedback)
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
            const roadmapData = await generateRoadmapFromGemini(preferences);
            const { milestones, ...roadmapDetails } = roadmapData;

            const userTracksCollection = collection(db, `tracks/${user.uid}/roadmaps`);
            const roadmapRef = doc(userTracksCollection);
            
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
                const milestoneRef = doc(roadmapRef, 'milestones', milestone.id);
                const milestoneWithStatus = {
                    ...milestone,
                    tasks: milestone.tasks.map((task: any) => ({ ...task, completed: false })),
                    courses: milestone.courses.map((course: any) => ({ ...course, completed: false })),
                };
                batch.set(milestoneRef, milestoneWithStatus);
            });
            
            const userDocRef = doc(db, 'users', user.uid);
            batch.update(userDocRef, {
                lastRoadmapGeneratedAt: serverTimestamp(),
            });

            await batch.commit();
            
            return { roadmapId: roadmapRef.id };

        } catch (err: any) {
            console.error("Error in generateRoadmap hook:", err);
            const errorMessage = err.message || 'An unknown error occurred while generating the roadmap. Please try again later.';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [user, userProfile]);

    return { generateRoadmap, loading, error };
};