import React from 'react';
import { Question } from '../../types';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import ShortAnswerQuestion from './ShortAnswerQuestion';

interface QuestionDisplayProps {
    question: Question;
    userAnswer?: string;
    onAnswerSelect: (answer: string) => void;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ question, userAnswer, onAnswerSelect }) => {
    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-800">{question.text}</h3>
            <div className="mt-4">
                {question.type === 'multiple-choice' && (
                    <MultipleChoiceQuestion
                        options={question.options!}
                        selectedOption={userAnswer}
                        onOptionSelect={onAnswerSelect}
                    />
                )}
                {question.type === 'short-answer' && (
                    <ShortAnswerQuestion
                        userAnswer={userAnswer}
                        onAnswerChange={onAnswerSelect}
                    />
                )}
            </div>
        </div>
    );
};

export default QuestionDisplay;