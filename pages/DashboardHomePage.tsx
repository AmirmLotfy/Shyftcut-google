
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { collection, query, getDocs, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Roadmap } from '../types';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import RoadmapCard from '../components/roadmap/RoadmapCard';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon } from '../components/icons';

const DashboardHomePage: React.FC = () => {
    const { user, userProfile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
    const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
    const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);

    const fetchRoadmaps = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setStatusUpdateError(null);
        try {
            const roadmapsCol = collection(db, 'tracks', user.uid, 'roadmaps');
            const q = query(roadmapsCol, orderBy('createdAt', 'desc'));
            const roadmapSnapshot = await getDocs(q);

            const allRoadmaps = roadmapSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Roadmap));
            
            const filteredRoadmaps = activeTab === 'archived'
                ? allRoadmaps.filter(r => r.status === 'archived')
                : allRoadmaps.filter(r => r.status !== 'archived');

            setRoadmaps(filteredRoadmaps);
        } catch (error) {
            console.error("Error fetching roadmaps:", error);
            if (error instanceof Error && error.message.includes("requires an index")) {
                 setStatusUpdateError("Firestore query failed. Please ensure database indexes are deployed.");
            } else {
                 setStatusUpdateError("Could not load roadmaps. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }, [user, activeTab]);

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
    }, [user, userProfile, activeTab, fetchRoadmaps]);

    const handleStatusUpdate = async (roadmapId: string, status: Roadmap['status']) => {
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
            fetchRoadmaps();
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full pt-20"><Spinner size="lg" /></div>;
    }

    const TABS = ['active', 'archived'];

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
                    <p className="mt-2 text-lg text-slate-500">Welcome back, {userProfile?.name}! Your learning journey continues here.</p>
                </div>
                <Button onClick={() => navigate('/app/wizard')} size="lg">Create New Roadmap</Button>
            </div>
            
            <div className="flex items-center border-b border-gray-200 mb-6">
                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as 'active' | 'archived')}
                        className={`relative px-4 py-3 text-base font-semibold capitalize transition-colors ${activeTab === tab ? 'text-primary' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" layoutId="underline" />
                        )}
                    </button>
                ))}
            </div>
            
            {statusUpdateError && <p className="text-center text-red-500 mb-4">{statusUpdateError}</p>}

            <div>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {roadmaps.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {roadmaps.map(roadmap => (
                                    <RoadmapCard 
                                        key={roadmap.id} 
                                        roadmap={roadmap} 
                                        onStatusUpdate={handleStatusUpdate}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center bg-white p-12 rounded-2xl border border-gray-200 mt-10">
                                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary-50">
                                    <SparklesIcon className="w-8 h-8 text-primary"/>
                                </div>
                                <h2 className="mt-6 text-xl font-bold text-gray-800">
                                    {activeTab === 'archived' ? "No archived roadmaps." : "Let's build your future."}
                                </h2>
                                <p className="mt-2 text-slate-500">
                                    {activeTab === 'archived' ? "Your archived items will appear here." : "Your personalized AI-powered learning plan is just a few clicks away."}
                                </p>
                                {activeTab !== 'archived' && (
                                    <Button className="mt-6" onClick={() => navigate('/app/wizard')}>
                                        Create My First Roadmap
                                    </Button>
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default DashboardHomePage;