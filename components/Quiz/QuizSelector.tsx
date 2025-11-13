import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Quiz, QuizResult } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import Button from '../Button';
import { StarIcon, ClockIcon } from '../icons';
import QuizTakingInterface from './QuizTakingInterface';

interface QuizSelectorProps {
    quizzes: Quiz[];
    milestoneId: string;
    roadmapId: string;
}

const QuizCard: React.FC<{
    quiz: Quiz;
    latestResult: QuizResult | null | undefined;
    onStart: () => void;
}> = ({ quiz, latestResult, onStart }) => {
    const getStatusStyles = () => {
        if (!latestResult) return { border: 'border-l-slate-300', text: 'text-slate-800', label: 'Not Attempted' };
        if (latestResult.passed) return { border: 'border-l-green-500', text: 'text-green-800', label: 'Passed' };
        return { border: 'border-l-yellow-500', text: 'text-yellow-800', label: 'Try Again' };
    };

    const { border, text, label } = getStatusStyles();

    return (
        <motion.div 
            className={`glass-card p-6 flex flex-col justify-between h-full border-l-4 ${
                !latestResult ? 'border-l-slate-300' :
                latestResult.passed ? 'border-l-green-500' : 'border-l-yellow-500'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
            <div>
                <div className="flex justify-between items-start gap-3 mb-4">
                    <h4 className="font-bold text-gray-900 text-lg leading-tight flex-1">{quiz.title}</h4>
                    <span className={`px-3 py-1 text-xs font-bold rounded-lg backdrop-blur-sm border flex-shrink-0 ${
                        !latestResult ? 'bg-slate-100/80 text-slate-700 border-slate-200/50' :
                        latestResult.passed ? 'bg-green-100/80 text-green-800 border-green-200/50' : 
                        'bg-yellow-100/80 text-yellow-800 border-yellow-200/50'
                    }`}>{label}</span>
                </div>
                <div className="flex items-center flex-wrap gap-4 mt-3 text-sm text-slate-600">
                    <span className="flex items-center backdrop-blur-sm bg-white/40 px-2.5 py-1 rounded-lg border border-white/30">
                        <StarIcon className="w-4 h-4 mr-1.5 text-yellow-500" />
                        Difficulty: {quiz.difficulty}/3
                    </span>
                    <span className="flex items-center backdrop-blur-sm bg-white/40 px-2.5 py-1 rounded-lg border border-white/30">
                        <ClockIcon className="w-4 h-4 mr-1.5" />
                        {quiz.questions.length} Questions
                    </span>
                </div>
                {latestResult && (
                    <motion.div 
                        className={`mt-4 p-3 rounded-xl backdrop-blur-sm border ${
                            latestResult.passed 
                                ? 'bg-green-50/80 border-green-200/50' 
                                : 'bg-yellow-50/80 border-yellow-200/50'
                        }`}
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                    >
                        <p className={`text-sm font-bold ${text}`}>Best Score: {latestResult.percentage}%</p>
                    </motion.div>
                )}
            </div>
            <Button 
                onClick={onStart} 
                className="w-full mt-4" 
                variant={latestResult?.passed ? "glass-primary" : "primary"}
            >
                {latestResult?.passed ? 'Review Quiz' : 'Start Quiz'}
            </Button>
        </motion.div>
    );
};


const QuizSelector: React.FC<QuizSelectorProps> = ({ quizzes, milestoneId, roadmapId }) => {
    const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
    const [results, setResults] = useState<Map<string, QuizResult | null>>(new Map());
    const { user } = useAuth();

    React.useEffect(() => {
        if (!user) return;
    
        const resultsCol = collection(db, `tracks/${user.uid}/roadmaps/${roadmapId}/quizResults`);
        // FIX: Remove orderBy to avoid needing a composite index. We will find the latest result on the client.
        const q = query(resultsCol, where('milestoneId', '==', milestoneId));
    
        const unsubscribe = onSnapshot(q, (snapshot) => {
            // Process all results for the milestone to find the latest one for each quiz.
            const allResultsForMilestone = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizResult));
            const latestResults = new Map<string, QuizResult>();
            
            allResultsForMilestone.forEach(result => {
                const existingResult = latestResults.get(result.quizId);
                // If we haven't seen this quiz yet, or if the current result is newer, update the map.
                if (!existingResult || existingResult.timestamp.toMillis() < result.timestamp.toMillis()) {
                    latestResults.set(result.quizId, result);
                }
            });
            setResults(latestResults);
        });
    
        return () => unsubscribe();
    }, [user, roadmapId, milestoneId]);


    if (activeQuiz) {
        return <QuizTakingInterface quiz={activeQuiz} roadmapId={roadmapId} milestoneId={milestoneId} onExit={() => setActiveQuiz(null)} />;
    }

    return (
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz, index) => (
                <motion.div
                    key={quiz.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <QuizCard 
                        quiz={quiz} 
                        latestResult={results.get(quiz.id)}
                        onStart={() => setActiveQuiz(quiz)}
                    />
                </motion.div>
            ))}
        </div>
    );
};

export default QuizSelector;