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
        if (!latestResult) return { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-200', label: 'Not Attempted' };
        if (latestResult.passed) return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', label: 'Passed' };
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', label: 'Try Again' };
    };

    const { bg, text, border, label } = getStatusStyles();

    return (
        <motion.div 
            className={`p-4 rounded-lg border flex flex-col justify-between ${bg} ${border}`}
            whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)"}}
        >
            <div>
                <div className="flex justify-between items-center">
                    <h4 className={`font-bold ${text}`}>{quiz.title}</h4>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${bg} ${text}`}>{label}</span>
                </div>
                <div className="flex items-center space-x-4 mt-2 text-sm text-slate-600">
                    <span className="flex items-center">
                        <StarIcon className="w-4 h-4 mr-1 text-yellow-500" />
                        Difficulty: {quiz.difficulty}/3
                    </span>
                    <span className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {quiz.questions.length} Questions
                    </span>
                </div>
                {latestResult && (
                    <p className="text-sm font-semibold text-slate-700 mt-2">Best Score: {latestResult.percentage}%</p>
                )}
            </div>
            <Button onClick={onStart} className="w-full mt-4" variant={latestResult?.passed ? "outline" : "primary"}>
                {latestResult?.passed ? 'Review' : 'Start Quiz'}
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
        const q = query(resultsCol, where('milestoneId', '==', milestoneId), orderBy('timestamp', 'desc'));
    
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const latestResults = new Map<string, QuizResult>();
          snapshot.docs.forEach(doc => {
            const result = doc.data() as QuizResult;
            if (!latestResults.has(result.quizId) || (latestResults.get(result.quizId)!.timestamp < result.timestamp)) {
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
        <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-4">
            {quizzes.map(quiz => (
                <QuizCard 
                    key={quiz.id} 
                    quiz={quiz} 
                    latestResult={results.get(quiz.id)}
                    onStart={() => setActiveQuiz(quiz)}
                />
            ))}
        </div>
    );
};

export default QuizSelector;