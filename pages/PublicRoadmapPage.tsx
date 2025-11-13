import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Roadmap, Milestone } from '../types';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Spinner from '../components/Spinner';
import { BookOpenIcon, CheckCircleIcon } from '../components/icons';

const PublicRoadmapPage: React.FC = () => {
    const { roadmapId } = useParams<{ roadmapId: string }>();
    const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPublicRoadmap = async () => {
            if (!roadmapId) {
                setError("No roadmap specified.");
                setLoading(false);
                return;
            }

            try {
                const roadmapRef = doc(db, 'publicRoadmaps', roadmapId);
                const roadmapSnap = await getDoc(roadmapRef);

                if (!roadmapSnap.exists()) {
                    setError("This roadmap does not exist or is not public.");
                    setLoading(false);
                    return;
                }
                const roadmapData = { id: roadmapSnap.id, ...roadmapSnap.data() } as Roadmap;
                setRoadmap(roadmapData);

                const milestonesColRef = collection(db, 'publicRoadmaps', roadmapId, 'milestones');
                const milestonesQuery = query(milestonesColRef, orderBy('week'));
                const milestonesSnap = await getDocs(milestonesQuery);

                const milestonesData = milestonesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Milestone));
                setMilestones(milestonesData);

            } catch (err) {
                console.error("Error fetching public roadmap:", err);
                setError("Could not load the roadmap. Please check the link and try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchPublicRoadmap();
    }, [roadmapId]);

    if (loading) {
        return <div className="flex items-center justify-center h-screen"><Spinner size="lg" /></div>;
    }

    if (error || !roadmap) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-center">
                <h1 className="text-2xl font-bold text-red-600">Unable to Load Roadmap</h1>
                <p className="mt-2 text-slate-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-50">
            <Header />
            <main className="py-16 sm:py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                    <div className="text-center">
                        <p className="text-base font-semibold text-primary">{roadmap.track}</p>
                        <h1 className="mt-2 text-4xl font-extrabold text-slate-900 sm:text-5xl">{roadmap.title}</h1>
                        <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-600">{roadmap.description}</p>
                        <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-slate-500">
                            <span>{roadmap.estimatedCompletion}</span>
                            <span>&bull;</span>
                            <span>{roadmap.totalHours} Hours</span>
                            <span>&bull;</span>
                            <span className="capitalize">{roadmap.level} Level</span>
                        </div>
                    </div>

                    <div className="mt-16 space-y-12">
                        {milestones.map(milestone => (
                            <div key={milestone.id}>
                                <div className="pb-4 border-b-2 border-primary-200">
                                    <h2 className="text-3xl font-bold text-slate-800">Milestone: {milestone.title}</h2>
                                    <p className="mt-1 text-sm font-semibold text-primary">Week {milestone.week} &bull; {milestone.durationHours} Hours</p>
                                </div>
                                <p className="mt-4 text-slate-600">{milestone.description}</p>
                                
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold text-slate-700 mb-3">Tasks to Complete:</h3>
                                    <ul className="space-y-2">
                                        {milestone.tasks.map(task => (
                                            <li key={task.id} className="flex items-start">
                                                <div className="w-5 h-5 bg-slate-200 rounded-md mt-1 flex-shrink-0" />
                                                <span className="ml-3 text-slate-800">{task.title}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold text-slate-700 mb-3">Recommended Courses:</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {milestone.courses.map(course => (
                                            <div key={course.id} className="bg-white p-4 rounded-lg border border-slate-200">
                                                <div className="flex items-start">
                                                     <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-primary-50 text-primary">
                                                        <BookOpenIcon className="h-6 w-6" />
                                                    </div>
                                                    <div className="ml-3">
                                                        <h4 className="font-bold text-slate-800">{course.title}</h4>
                                                        <p className="text-sm text-slate-500">{course.platform}</p>
                                                    </div>
                                                </div>
                                                <p className="mt-2 text-sm text-slate-600">{course.reasoning}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-6">
                                     <h3 className="text-lg font-semibold text-slate-700 mb-3">Success Criteria:</h3>
                                     <ul className="space-y-2">
                                        {milestone.successCriteria.map((item, index) => (
                                            <li key={index} className="flex items-start">
                                                <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                                <span className="ml-3 text-slate-800">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PublicRoadmapPage;
