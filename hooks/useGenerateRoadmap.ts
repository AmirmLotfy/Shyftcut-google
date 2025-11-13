import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { UserPreferences } from '../types';
import { functions } from '../services/firebase';
import { httpsCallable } from 'firebase/functions';

export const useGenerateRoadmap = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const generateRoadmap = useCallback(async (preferences: UserPreferences) => {
        setLoading(true);
        setError(null);

        if (!user) {
            const errorMsg = "You must be logged in to create a roadmap.";
            setError(errorMsg);
            setLoading(false);
            throw new Error(errorMsg);
        }
        
        try {
            const generateRoadmapFn = httpsCallable(functions, 'generateRoadmap');
            const result = await generateRoadmapFn({ preferences });
            return result.data as { roadmapId: string };
        } catch (err: any) {
            console.error("Error calling generateRoadmap function:", err);
            const errorMessage = err.message || 'An unknown error occurred while generating the roadmap. Please try again later.';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [user]);

    return { generateRoadmap, loading, error };
};
