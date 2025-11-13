import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { Quiz, UserAnswer } from '../../types';
import Button from '../Button';
import Confetti from '../Confetti';
import { CheckCircleIcon, XCircleIcon } from '../icons';

interface AnimatedCounterProps {
    to: number;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ to }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const controls = animate(0, to, {
            duration: 1.5,
            ease: "easeOut",
            onUpdate: (value) => {
                setCount(Math.round(value));
            }
        });
        return () => controls.stop();
    }, [to]);

    return <motion.span>{count}</motion.span>;
};


const AnswerAccordion: React.FC<{ question: any, answer: any, index: number }> = ({ question, answer, index }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
         <div className="bg-white p-4 rounded-lg border border-slate-200">
            <button className="flex items-start w-full text-left" onClick={() => setIsOpen(!isOpen)}>
                {answer.isCorrect ? <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" /> : <XCircleIcon className="w-5 h-5 text-red-500 mr-3 mt-1 flex-shrink-0" />}
                <p className="font-semibold text-slate-800 flex-1">{index + 1}. {question.text}</p>
                 <svg className={`w-5 h-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                >
                    <div className="mt-4 pt-4 border-t border-slate-200">
                        <div className={`mt-2 p-2 rounded-md text-sm ${answer.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                            <strong>Your Answer: </strong>
                            <span className={answer.isCorrect ? 'text-green-800' : 'text-red-800'}>{answer.userAnswer || '(No answer provided)'}</span>
                        </div>
                        {!answer.isCorrect && (
                            <div className="mt-2 p-2 rounded-md text-sm bg-green-50">
                                <strong>Correct Answer: </strong>
                                <span className="text-green-800">{answer.correctAnswer}</span>
                            </div>
                        )}
                        <div className="mt-2 text-sm text-slate-600">
                            <strong>Explanation: </strong> {answer.explanation}
                        </div>
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    )
}

const QuizResultsScreen: React.FC<{ quiz: Quiz; userAnswers: Omit<UserAnswer, 'questionText'>[]; onExit: () => void; }> = ({ quiz, userAnswers, onExit }) => {
    const totalQuestions = quiz.questions.length;
    const correctAnswers = userAnswers.filter(a => a.isCorrect).length;
    const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = scorePercentage >= 70;

    return (
        <div className="p-6 bg-slate-50 rounded-lg">
            {passed && <Confetti />}
            <div className="text-center">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${passed ? 'bg-green-100' : 'bg-yellow-100'}`}>
                    <span className="text-3xl">{passed ? '🎉' : '🤔'}</span>
                </div>
                <h2 className="mt-4 text-2xl font-bold text-slate-800">
                    {passed ? 'Congratulations! You Passed!' : 'Good Effort! Let\'s Review.'}
                </h2>
                <div className={`mt-2 text-6xl font-extrabold ${passed ? 'text-green-600' : 'text-yellow-600'}`}>
                    <AnimatedCounter to={scorePercentage} />%
                </div>
                <p className="text-slate-600">You answered {correctAnswers} out of {totalQuestions} questions correctly.</p>
            </div>
            
            <div className="mt-8">
                <h3 className="text-lg font-semibold text-slate-700 mb-4">Answer Breakdown</h3>
                <div className="space-y-3">
                    {quiz.questions.map((question, index) => {
                        const answer = userAnswers.find(a => a.questionId === question.id);
                        if (!answer) return null;
                        return <AnswerAccordion key={question.id} question={question} answer={answer} index={index} />
                    })}
                </div>
            </div>

            <div className="mt-8 flex justify-center">
                <Button onClick={onExit}>Back to Milestone</Button>
            </div>
        </div>
    );
};

export default QuizResultsScreen;