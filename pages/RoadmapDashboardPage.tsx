import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useRoadmapData } from '../hooks/useRoadmapData';
import Spinner from '../components/Spinner';
import { ArrowLeftIcon } from '../components/icons';
import { useAuth } from '../hooks/useAuth';
import { AnimatePresence } from 'framer-motion';
import { Task } from '../types';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../services/firebase';


import RoadmapSidebar from '../components/roadmap/RoadmapSidebar';
import RoadmapHeader from '../components/roadmap/RoadmapHeader';
import MilestoneContent from '../components/roadmap/MilestoneContent';
import FocusModeTimer from '../components/roadmap/FocusModeTimer';
import MobileBottomNav from '../components/roadmap/MobileBottomNav';
import MobileRoadmapHeader from '../components/roadmap/MobileRoadmapHeader';
import ShareModal from '../components/ShareModal';
import EditRoadmapModal from '../components/EditRoadmapModal';


const RoadmapDashboardPage: React.FC = () => {
    const { roadmapId } = useParams<{ roadmapId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { roadmap, milestones, quizResults, loading, error, updateTaskCompletion, updateCourseCompletion, updateTimeSpent } = useRoadmapData(roadmapId!);
    
    const [isArchiving, setIsArchiving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);
    const [focusTask, setFocusTask] = useState<Task | null>(null);

    const handleStartFocus = (task: Task) => {
        setFocusTask(task);
        setIsFocusModeOpen(true);
    };


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
        setActionError(null);
        try {
            const roadmapRef = doc(db, 'tracks', user.uid, 'roadmaps', roadmapId);
            await updateDoc(roadmapRef, {
                status: 'archived',
                updatedAt: serverTimestamp(),
            });
            navigate('/dashboard');
        } catch (e: any) {
            console.error("Failed to archive roadmap:", e);
            setActionError(e.message || "Could not archive roadmap. Please try again.");
        } finally {
            setIsArchiving(false);
        }
    };

    const handleSaveEdit = async (updatedData: { title: string; description: string }) => {
        if (!roadmapId || !user) return;
        const roadmapRef = doc(db, 'tracks', user.uid, 'roadmaps', roadmapId);
        await updateDoc(roadmapRef, {
            ...updatedData,
            updatedAt: serverTimestamp(),
        });
    };

    const handleDelete = async () => {
        if (!roadmapId || !user) return;
        if (!window.confirm("Are you sure you want to permanently delete this roadmap? This action CANNOT be undone.")) {
            return;
        }
        setIsDeleting(true);
        setActionError(null);
        try {
            const deleteRoadmapFn = httpsCallable(functions, 'deleteRoadmap');
            await deleteRoadmapFn({ roadmapId });
            navigate('/dashboard');
        } catch (e: any) {
            console.error("Failed to delete roadmap:", e);
            setActionError(e.message || "Could not delete roadmap. Please try again later.");
        } finally {
            setIsDeleting(false);
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
        return null;
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

    return (
        <>
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
                
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 pb-24 lg:pb-8">
                    <RoadmapHeader 
                        roadmap={roadmap} 
                        milestones={milestones} 
                        completionStatus={milestoneCompletionStatus} 
                        onArchive={handleArchive}
                        onShare={() => setIsShareModalOpen(true)}
                        onEdit={() => setIsEditModalOpen(true)}
                        onDelete={handleDelete}
                        isArchiving={isArchiving || isDeleting}
                    />
                    {actionError && <p className="text-center text-red-500 my-4">{actionError}</p>}
                    
                    <div className="mt-8">
                        <div className="max-w-4xl mx-auto">
                             <MilestoneContent 
                                milestone={selectedMilestone}
                                roadmapId={roadmapId!}
                                onUpdateTask={updateTaskCompletion}
                                onUpdateCourse={updateCourseCompletion}
                                onStartFocus={handleStartFocus}
                            />
                        </div>
                    </div>
                </div>
                <MobileBottomNav 
                    onPrev={handlePrevMilestone}
                    onNext={handleNextMilestone}
                    isPrevDisabled={milestones.findIndex(m => m.id === selectedMilestoneId) === 0}
                    isNextDisabled={milestones.findIndex(m => m.id === selectedMilestoneId) === milestones.length - 1}
                />
            </main>
        </div>
        <AnimatePresence>
            {isShareModalOpen && user && (
                 <ShareModal 
                    roadmap={roadmap} 
                    user={user}
                    onClose={() => setIsShareModalOpen(false)} 
                />
            )}
            {isEditModalOpen && user && roadmap && (
                 <EditRoadmapModal 
                    roadmap={roadmap} 
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleSaveEdit}
                />
            )}
            {isFocusModeOpen && selectedMilestone && focusTask && (
                <FocusModeTimer 
                    task={focusTask}
                    onClose={() => setIsFocusModeOpen(false)}
                    onSessionComplete={(minutes) => {
                        updateTimeSpent(selectedMilestone.id, minutes);
                        setIsFocusModeOpen(false);
                    }}
                />
            )}
        </AnimatePresence>
        </>
    );
};

export default RoadmapDashboardPage;
