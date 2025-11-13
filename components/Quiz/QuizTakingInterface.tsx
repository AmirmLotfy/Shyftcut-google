import React, { useState, useEffect, useCallback } from 'react';
import { Quiz, UserAnswer } from '../../types';
import QuestionDisplay from './QuestionDisplay';
import QuizResultsScreen from './QuizResultsScreen';
import { useQuizProgress } from '../../hooks/useQuizProgress';
import { useAnswerGrading } from '../../hooks/useAnswerGrading';
import Spinner from '../Spinner';
import Button from '../Button';
import { XIcon } from '../icons';

interface QuizTakingInterfaceProps {
    quiz: Quiz;
    roadmapId: string;
    milestoneId: string;
    onExit: () => void;
}

const QuizTakingInterface: React.FC<QuizTakingInterfaceProps> = ({ quiz, roadmapId, milestoneId, onExit }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Map<string, string>>(new Map());
    const [startTime, setStartTime] = useState(Date.now());
    const [view, setView] = useState<'taking' | 'review' | 'submitting' | 'results'>('taking');
    const [finalResult, setFinalResult] = useState<Omit<UserAnswer, 'questionText'>[] | null>(null);

    const { saveQuizResult, loading: isSaving } = useQuizProgress(roadmapId, milestoneId);
    const { gradeAnswer, isGrading } = useAnswerGrading();

    const { questions, id: quizId, title: quizTitle } = quiz;
    const currentQuestion = questions[currentQuestionIndex];
    const totalQuestions = questions.length;

    const handleAnswerSelect = (questionId: string, answer: string) => {
        setUserAnswers(prev => new Map(prev).set(questionId, answer));
    };

    const handleNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setView('review');
        }
    };

    const handleBack = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };
    
    const handleSubmit = useCallback(async () => {
        setView('submitting');
        let score = 0;
        const gradedAnswers: Omit<UserAnswer, 'questionText'>[] = [];

        for (const question of questions) {
            const userAnswer = userAnswers.get(question.id) || "";
            let isCorrect = false;
            let explanation = question.explanation; // Default explanation

            const gradingResult = await gradeAnswer(question, userAnswer);
            
            if (gradingResult) {
                isCorrect = gradingResult.correct;
                explanation = gradingResult.explanation;
            } else {
                // Fallback to simple check if AI fails
                if (question.type === 'multiple-choice') {
                    isCorrect = userAnswer === question.correctAnswer;
                }
            }

            if (isCorrect) {
                score++;
            }
            
            gradedAnswers.push({
                questionId: question.id,
                userAnswer,
                correctAnswer: question.correctAnswer,
                isCorrect,
                explanation
            });
        }
        
        setFinalResult(gradedAnswers);

        await saveQuizResult({
            quizId: quizId,
            quizTitle: quizTitle,
            milestoneId: milestoneId,
            score,
            totalQuestions,
            percentage: Math.round((score / totalQuestions) * 100),
            passed: score / totalQuestions >= 0.7,
            timeSpent: Math.round((Date.now() - startTime) / 1000),
            answers: gradedAnswers.map(ans => ({...ans, questionText: questions.find(q=>q.id === ans.questionId)!.text }))
        });

        setView('results');
    }, [questions, quizId, quizTitle, userAnswers, gradeAnswer, saveQuizResult, milestoneId, startTime, totalQuestions]);
    
    const isLoading = isGrading || isSaving;

    if (view === 'results' && finalResult) {
        return <QuizResultsScreen quiz={quiz} userAnswers={finalResult} onExit={onExit} />;
    }

    if(isLoading || view === 'submitting') {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg min-h-[400px]">
                <Spinner size="lg" />
                <p className="mt-4 text-gray-600 font-semibold">{isGrading ? "Grading your answers..." : "Saving your results..."}</p>
            </div>
        );
    }
    
    if (view === 'review') {
        return (
            <div className="p-8 bg-gray-50 rounded-lg">
                <h3 className="text-2xl font-bold text-gray-800">Review Your Answers</h3>
                <ul className="mt-4 space-y-2">
                    {quiz.questions.map((q, i) => (
                        <li key={q.id} className="flex justify-between items-center p-2 bg-white rounded">
                            <span>Question {i + 1}: {q.text.substring(0, 40)}...</span>
                            <span className={userAnswers.has(q.id) ? 'font-bold text-green-600' : 'text-gray-500'}>
                                {userAnswers.has(q.id) ? 'Answered' : 'Skipped'}
                            </span>
                        </li>
                    ))}
                </ul>
                <div className="mt-6 flex justify-between">
                    <Button variant="outline" onClick={() => setView('taking')}>Back to Edit</Button>
                    <Button onClick={handleSubmit}>Submit Quiz</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 relative">
            <button onClick={onExit} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <XIcon className="w-6 h-6" />
            </button>
            <div className="mb-4">
                <p className="text-sm font-medium text-primary">{quiz.title}</p>
                <div className="flex justify-between items-center mt-1">
                    <p className="font-semibold">Question {currentQuestionIndex + 1} of {totalQuestions}</p>
                </div>
                 <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}></div>
                </div>
            </div>

            <div className="min-h-[250px] py-4">
                 <QuestionDisplay
                    question={currentQuestion}
                    userAnswer={userAnswers.get(currentQuestion.id)}
                    onAnswerSelect={(answer) => handleAnswerSelect(currentQuestion.id, answer)}
                />
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t">
                 <Button variant="outline" onClick={handleBack} disabled={currentQuestionIndex === 0}>
                    Previous
                </Button>
                 <Button onClick={handleNext} disabled={!userAnswers.has(currentQuestion.id)}>
                    {currentQuestionIndex === totalQuestions - 1 ? 'Review & Submit' : 'Next'}
                </Button>
            </div>
        </div>
    );
};

export default QuizTakingInterface;