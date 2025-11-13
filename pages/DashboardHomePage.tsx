
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { collection, query, getDocs, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Roadmap } from '../types';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import RoadmapCard from '../components/roadmap/RoadmapCard';

const DashboardHomePage: React.FC = () => {
    const { user, userProfile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
    const [showArchived, setShowArchived] = useState(false);
    const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);

    const fetchRoadmaps = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setStatusUpdateError(null);
        try {
            const roadmapsCol = collection(db, 'tracks', user.uid, 'roadmaps');
            // Query without status filter to avoid composite index requirement.
            const q = query(roadmapsCol, orderBy('createdAt', 'desc'));
            const roadmapSnapshot = await getDocs(q);

            // Perform filtering on the client side.
            const allRoadmaps = roadmapSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Roadmap));
            
            const filteredRoadmaps = showArchived
                ? allRoadmaps.filter(r => r.status === 'archived')
                : allRoadmaps.filter(r => r.status !== 'archived');

            setRoadmaps(filteredRoadmaps);
        } catch (error) {
            console.error("Error fetching roadmaps:", error);
            // Check if the error is the index error and provide a more specific message.
            if (error instanceof Error && error.message.includes("requires an index")) {
                 setStatusUpdateError("Firestore query failed. Please ensure database indexes are deployed.");
            } else {
                 setStatusUpdateError("Could not load roadmaps. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }, [user, showArchived]);

    useEffect(() => {
        if (user && userProfile && !userProfile.profileComplete) {
            navigate('/app/wizard');
        }
    }, [user, userProfile, navigate]);
    
    useEffect(() => {
        if(user && userProfile?.profileComplete) {
            fetchRoadmaps();
        } else if (user) {
            setLoading(false);
        }
    }, [user, userProfile, showArchived, fetchRoadmaps]);

    const handleStatusUpdate = async (roadmapId: string, status: Roadmap['status']) => {
        // Optimistic UI update
        setRoadmaps(prev => prev.filter(r => r.id !== roadmapId));
        setStatusUpdateError(null);
        try {
            if (!user) {
                throw new Error("User not authenticated.");
            }
            const roadmapRef = doc(db, 'tracks', user.uid, 'roadmaps', roadmapId);
            await updateDoc(roadmapRef, {
                status,
                updatedAt: serverTimestamp(),
            });
        } catch (e) {
            console.error("Failed to update roadmap status:", e);
            setStatusUpdateError(`Failed to update roadmap. Please refresh.`);
            // Re-fetch to revert optimistic update on failure
            fetchRoadmaps();
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Welcome back, {userProfile?.name}!</h1>
                    <p className="mt-1 text-slate-500">Your learning journey continues here.</p>
                </div>
                <Button onClick={() => navigate('/app/wizard')}>Create New Roadmap</Button>
            </div>
            
            <div className="flex items-center justify-end mb-4">
                <label htmlFor="show-archived" className="mr-3 text-sm font-medium text-gray-700">
                    Show Archived
                </label>
                <input
                    id="show-archived"
                    type="checkbox"
                    checked={showArchived}
                    onChange={(e) => setShowArchived(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-2"
                />
            </div>
            
            {statusUpdateError && <p className="text-center text-red-500 mb-4">{statusUpdateError}</p>}

            <div>
                {roadmaps.length > 0 ? (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold text-gray-700">{showArchived ? "Archived Roadmaps" : "Your Roadmaps"}</h2>
                        {roadmaps.map(roadmap => (
                            <RoadmapCard 
                                key={roadmap.id} 
                                roadmap={roadmap} 
                                onStatusUpdate={handleStatusUpdate}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center bg-gray-50 p-12 rounded-lg border border-dashed">
                        <h2 className="text-xl font-semibold text-gray-700">
                            {showArchived ? "No archived roadmaps." : "You don't have a learning roadmap yet."}
                        </h2>
                        <p className="mt-2 text-gray-500">
                            {showArchived ? "Your archived items will appear here." : "Let's create one based on your goals."}
                        </p>
                        {!showArchived && (
                            <Button className="mt-6" onClick={() => navigate('/app/wizard')}>
                                Create My First Roadmap
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardHomePage;
