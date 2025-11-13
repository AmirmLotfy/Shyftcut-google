import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { UserPreferences } from '../types';
import { authenticatedFetch } from '../services/api';

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
            const data = await authenticatedFetch('/api/generateRoadmap', user, {
                method: 'POST',
                body: JSON.stringify({ preferences })
            });

            if (!data || !data.roadmapId) {
                throw new Error("API did not return a valid roadmap ID.");
            }

            return { roadmapId: data.roadmapId };

        } catch (err: any) {
            console.error("Error calling generateRoadmap API:", err);
            const errorMessage = err.message || 'An unknown error occurred while generating the roadmap. Please try again later.';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [user, userProfile]);

    return { generateRoadmap, loading, error };
};
