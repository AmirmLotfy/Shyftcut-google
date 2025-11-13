import { useState, useCallback } from 'react';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './useAuth';
import { QuizResult } from '../types';

export const useQuizProgress = (roadmapId: string, milestoneId: string) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getLatestAttempt = useCallback(async (quizId: string) => {
        if (!user) return null;
        try {
            const resultsCol = collection(db, `tracks/${user.uid}/roadmaps/${roadmapId}/quizResults`);
            const q = query(
                resultsCol,
                where('milestoneId', '==', milestoneId),
                where('quizId', '==', quizId),
                orderBy('timestamp', 'desc'),
                limit(1)
            );
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                return snapshot.docs[0].data() as QuizResult;
            }
            return null;
        } catch (e) {
            console.error("Error fetching latest quiz attempt:", e);
            return null;
        }
    }, [user, roadmapId, milestoneId]);

    const saveQuizResult = useCallback(async (resultData: Omit<QuizResult, 'id' | 'attemptNumber' | 'timestamp'>) => {
        if (!user) {
            setError("User not logged in.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const latestAttempt = await getLatestAttempt(resultData.quizId);
            const attemptNumber = latestAttempt ? latestAttempt.attemptNumber + 1 : 1;
            
            const resultsCol = collection(db, `tracks/${user.uid}/roadmaps/${roadmapId}/quizResults`);
            await addDoc(resultsCol, {
                ...resultData,
                attemptNumber,
                timestamp: serverTimestamp(),
            });
        } catch (e: any) {
            console.error("Error saving quiz result:", e);
            setError("Failed to save your quiz results. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [user, roadmapId, getLatestAttempt]);

    return { loading, error, saveQuizResult };
};