import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, onSnapshot, collection, query, orderBy, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './useAuth';
import { Roadmap, Milestone, Task, Course, QuizResult } from '../types';

export const useRoadmapData = (roadmapId: string) => {
    const { user } = useAuth();
    const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user || !roadmapId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const roadmapRef = doc(db, `tracks/${user.uid}/roadmaps`, roadmapId);

        const unsubscribeRoadmap = onSnapshot(roadmapRef, (docSnap) => {
            if (docSnap.exists()) {
                setRoadmap({ id: docSnap.id, ...docSnap.data() } as Roadmap);
            } else {
                setError("Roadmap not found.");
                setRoadmap(null);
            }
        }, (err) => {
            console.error("Error fetching roadmap:", err);
            setError("Failed to load roadmap data.");
        });

        const milestonesColRef = collection(roadmapRef, 'milestones');
        const milestonesQuery = query(milestonesColRef, orderBy('week'));

        const unsubscribeMilestones = onSnapshot(milestonesQuery, (snapshot) => {
            const fetchedMilestones = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Milestone));
            setMilestones(fetchedMilestones);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching milestones:", err);
            setError("Failed to load milestone data.");
            setLoading(false);
        });
        
        const quizResultsColRef = collection(db, `tracks/${user.uid}/roadmaps/${roadmapId}/quizResults`);
        const quizResultsQuery = query(quizResultsColRef, orderBy('timestamp', 'desc'));
        
        const unsubscribeQuizResults = onSnapshot(quizResultsQuery, (snapshot) => {
            const results = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as QuizResult));
            setQuizResults(results);
        }, (err) => {
            console.error("Error fetching quiz results:", err);
        });

        return () => {
            unsubscribeRoadmap();
            unsubscribeMilestones();
            unsubscribeQuizResults();
        };

    }, [user, roadmapId]);
    
    const updateMilestoneField = useCallback(async (milestoneId: string, updatedData: Partial<Milestone>) => {
        if (!user || !roadmapId) return;
        const milestoneRef = doc(db, `tracks/${user.uid}/roadmaps/${roadmapId}/milestones`, milestoneId);
        try {
            await updateDoc(milestoneRef, updatedData);
        } catch (err) {
            console.error("Failed to update milestone:", err);
            // Optionally revert UI change here
        }
    }, [user, roadmapId]);

    const updateTaskCompletion = async (milestoneId: string, taskId: string, completed: boolean) => {
        const milestone = milestones.find(m => m.id === milestoneId);
        if (milestone) {
            const updatedTasks = milestone.tasks.map(task => 
                task.id === taskId ? { ...task, completed } : task
            );
            await updateMilestoneField(milestoneId, { tasks: updatedTasks });
        }
    };

    const updateCourseCompletion = async (milestoneId: string, courseId: string, completed: boolean) => {
        const milestone = milestones.find(m => m.id === milestoneId);
        if (milestone) {
            const updatedCourses = milestone.courses.map(course => 
                course.id === courseId ? { ...course, completed } : course
            );
            await updateMilestoneField(milestoneId, { courses: updatedCourses });
        }
    };
    
    const updateTimeSpent = async (milestoneId: string, additionalMinutes: number) => {
        const milestone = milestones.find(m => m.id === milestoneId);
        if(milestone) {
            const newTime = (milestone.timeSpent || 0) + additionalMinutes;
            await updateMilestoneField(milestoneId, { timeSpent: newTime });
        }
    };

    return { roadmap, milestones, quizResults, loading, error, updateTaskCompletion, updateCourseCompletion, updateTimeSpent };
};