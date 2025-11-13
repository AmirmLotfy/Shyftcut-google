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
        <div className="min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <motion.h1 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold text-gray-900"
                    >
                        Dashboard
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mt-2 text-lg text-slate-600"
                    >
                        Welcome back, {userProfile?.name}! Your learning journey continues here.
                    </motion.p>
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Button onClick={() => navigate('/app/wizard')} size="lg">
                        Create New Roadmap
                    </Button>
                </motion.div>
            </div>
            
            <div className="flex items-center mb-6 glass-card p-1">
                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as 'active' | 'archived')}
                        className={`relative px-6 py-3 text-base font-semibold capitalize transition-all duration-300 rounded-xl flex-1 ${
                            activeTab === tab 
                                ? 'bg-primary/20 text-primary' 
                                : 'text-slate-600 hover:text-slate-800 hover:bg-white/40'
                        }`}
                    >
                        {activeTab === tab ? (
                            <>
                                <motion.div 
                                    className="absolute inset-0 bg-primary/20 rounded-xl"
                                    layoutId="activeTab"
                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                />
                                <span className="relative z-10">{tab}</span>
                            </>
                        ) : (
                            tab
                        )}
                    </button>
                ))}
            </div>
            
            {statusUpdateError && (
                <div className="glass-card p-4 mb-4 border-red-200 bg-red-50/80">
                    <p className="text-center text-red-600">{statusUpdateError}</p>
                </div>
            )}

            <div>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {roadmaps.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {roadmaps.map((roadmap, index) => (
                                    <motion.div
                                        key={roadmap.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1, duration: 0.3 }}
                                    >
                                        <RoadmapCard 
                                            roadmap={roadmap} 
                                            onStatusUpdate={handleStatusUpdate}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center glass-card p-12 mt-10"
                            >
                                <motion.div 
                                    className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-md border border-primary/20"
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                >
                                    <SparklesIcon className="w-10 h-10 text-primary"/>
                                </motion.div>
                                <h2 className="mt-6 text-2xl font-bold text-gray-900">
                                    {activeTab === 'archived' ? "No archived roadmaps." : "Let's build your future."}
                                </h2>
                                <p className="mt-2 text-slate-600 max-w-md mx-auto">
                                    {activeTab === 'archived' ? "Your archived items will appear here." : "Your personalized AI-powered learning plan is just a few clicks away."}
                                </p>
                                {activeTab !== 'archived' && (
                                    <Button className="mt-6" onClick={() => navigate('/app/wizard')}>
                                        Create My First Roadmap
                                    </Button>
                                )}
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default DashboardHomePage;