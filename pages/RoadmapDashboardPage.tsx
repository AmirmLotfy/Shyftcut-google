import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useRoadmapData } from '../hooks/useRoadmapData';
import Spinner from '../components/Spinner';
import { ArrowLeftIcon } from '../components/icons';
import { useAuth } from '../hooks/useAuth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

import RoadmapSidebar from '../components/roadmap/RoadmapSidebar';
import RoadmapHeader from '../components/roadmap/RoadmapHeader';
import MilestoneContent from '../components/roadmap/MilestoneContent';
import PomodoroTimer from '../components/roadmap/PomodoroTimer';
import MobileBottomNav from '../components/roadmap/MobileBottomNav';
import MobileRoadmapHeader from '../components/roadmap/MobileRoadmapHeader';

const RoadmapDashboardPage: React.FC = () => {
    const { roadmapId } = useParams<{ roadmapId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { roadmap, milestones, quizResults, loading, error, updateTaskCompletion, updateCourseCompletion, updateTimeSpent } = useRoadmapData(roadmapId!);
    
    const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
    const [isArchiving, setIsArchiving] = useState(false);
    const [archiveError, setArchiveError] = useState<string | null>(null);

    // Effect to select the first milestone once data is loaded
    React.useEffect(() => {
        if (!selectedMilestoneId && milestones.length > 0) {
            setSelectedMilestoneId(milestones[0].id);
        }
    }, [milestones, selectedMilestoneId]);

    const selectedMilestone = useMemo(() => {
        return milestones.find(m => m.id === selectedMilestoneId);
    }, [milestones, selectedMilestoneId]);
    
    const milestoneCompletionStatus = useMemo(() => {
        const statusMap = new Map<string, boolean>();
        milestones.forEach(milestone => {
            const allTasksDone = milestone.tasks.every(t => t.completed);
            const allCoursesDone = milestone.courses.every(c => c.completed);
            
            const passedQuizIds = new Set(
                quizResults.filter(r => r.milestoneId === milestone.id && r.passed).map(r => r.quizId)
            );
            const allQuizzesPassed = milestone.quizzes.every(q => passedQuizIds.has(q.id));

            statusMap.set(milestone.id, allTasksDone && allCoursesDone && allQuizzesPassed);
        });
        return statusMap;
    }, [milestones, quizResults]);

    const handleArchive = async () => {
        if (!roadmapId || !user) return;
        if (!window.confirm("Are you sure you want to archive this roadmap? You can restore it later from your dashboard.")) {
            return;
        }
        setIsArchiving(true);
        setArchiveError(null);
        try {
            const roadmapRef = doc(db, 'tracks', user.uid, 'roadmaps', roadmapId);
            await updateDoc(roadmapRef, {
                status: 'archived',
                updatedAt: serverTimestamp(),
            });
            navigate('/dashboard');
        } catch (e) {
            console.error("Failed to archive roadmap:", e);
            setArchiveError("Could not archive roadmap. Please try again.");
        } finally {
            setIsArchiving(false);
        }
    };


    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-gray-50"><Spinner size="lg" /></div>;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-center">
                <h2 className="text-2xl font-semibold text-red-600">Oops! Something went wrong.</h2>
                <p className="mt-2 text-gray-600">{error}</p>
                <Link to="/dashboard" className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-700">
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    Back to Dashboard
                </Link>
            </div>
        );
    }
    
    if (!roadmap || !selectedMilestone) {
        return null; // or a more specific "not found" message
    }
    
    const handleNextMilestone = () => {
        const currentIndex = milestones.findIndex(m => m.id === selectedMilestoneId);
        if (currentIndex < milestones.length - 1) {
            setSelectedMilestoneId(milestones[currentIndex + 1].id);
        }
    };
    
    const handlePrevMilestone = () => {
        const currentIndex = milestones.findIndex(m => m.id === selectedMilestoneId);
        if (currentIndex > 0) {
            setSelectedMilestoneId(milestones[currentIndex - 1].id);
        }
    };
    
    const handleMarkMilestoneComplete = async () => {
        if (!selectedMilestone) return;
        const updatePromises: Promise<void>[] = [];
        selectedMilestone.tasks.forEach(task => {
            if (!task.completed) {
                updatePromises.push(updateTaskCompletion(selectedMilestone.id, task.id, true));
            }
        });
        selectedMilestone.courses.forEach(course => {
            if (!course.completed) {
                updatePromises.push(updateCourseCompletion(selectedMilestone.id, course.id, true));
            }
        });
        await Promise.all(updatePromises);
    };
    
    const isCurrentMilestoneComplete = milestoneCompletionStatus.get(selectedMilestone.id) || false;


    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            <RoadmapSidebar 
                roadmap={roadmap} 
                milestones={milestones}
                selectedMilestoneId={selectedMilestoneId}
                onSelectMilestone={setSelectedMilestoneId}
                completionStatus={milestoneCompletionStatus}
            />
            <main className="flex-1 flex flex-col overflow-hidden">
                <MobileRoadmapHeader
                    roadmap={roadmap}
                    milestones={milestones}
                    selectedMilestoneId={selectedMilestoneId}
                    onSelectMilestone={setSelectedMilestoneId}
                />
                
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
                    <RoadmapHeader 
                        roadmap={roadmap} 
                        milestones={milestones} 
                        completionStatus={milestoneCompletionStatus} 
                        onArchive={handleArchive}
                        isArchiving={isArchiving}
                    />
                    {archiveError && <p className="text-center text-red-500 my-4">{archiveError}</p>}
                    
                    <div className="mt-8 lg:grid lg:grid-cols-3 lg:gap-8">
                        <div className="lg-col-span-2">
                             <MilestoneContent 
                                milestone={selectedMilestone}
                                roadmapId={roadmapId!}
                                onUpdateTask={updateTaskCompletion}
                                onUpdateCourse={updateCourseCompletion}
                                onMarkComplete={handleMarkMilestoneComplete}
                                isComplete={isCurrentMilestoneComplete}
                            />
                        </div>
                        <div className="mt-8 lg:mt-0">
                            <PomodoroTimer onSessionComplete={(minutes) => updateTimeSpent(selectedMilestoneId!, minutes)} />
                        </div>
                    </div>
                </div>
                <MobileBottomNav 
                    onPrev={handlePrevMilestone}
                    onNext={handleNextMilestone}
                    isPrevDisabled={milestones.findIndex(m => m.id === selectedMilestoneId) === 0}
                    isNextDisabled={milestones.findIndex(m => m.id === selectedMilestoneId) === milestones.length - 1}
                    onMarkComplete={handleMarkMilestoneComplete}
                    isComplete={isCurrentMilestoneComplete}
                />
            </main>
        </div>
    );
};

export default RoadmapDashboardPage;