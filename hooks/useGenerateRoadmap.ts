
import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { UserPreferences } from '../types';
import { functions } from '../services/firebase';
import { httpsCallable } from 'firebase/functions';

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

        setProgressMessage('Warming up the AI...');
        
        try {
            setProgressMessage('Generating your learning path...');
            // This is now calling the Firebase Cloud Function
            const generateRoadmapFn = httpsCallable(functions, 'generateRoadmap');
            const result: any = await generateRoadmapFn({ preferences });
            
            const { roadmapId } = result.data;
            if (!roadmapId) {
                throw new Error("Cloud function did not return a roadmap ID.");
            }
            
            setProgressMessage('All done!');
            return { roadmapId };

        } catch (err: any) {
            console.error("Error generating roadmap via cloud function:", err);
            // Firebase callable functions wrap errors, so the message is on err.message
            // The default message is often not user-friendly, so we'll provide a more helpful one.
            const errorMessage = err.message || 'An unknown error occurred while generating the roadmap. Please try again later.';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [user, userProfile]);

    return { generateRoadmap, loading, error, progressMessage };
};
