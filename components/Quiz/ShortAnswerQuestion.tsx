import React from 'react';

interface ShortAnswerQuestionProps {
    userAnswer?: string;
    onAnswerChange: (answer: string) => void;
}

const ShortAnswerQuestion: React.FC<ShortAnswerQuestionProps> = ({ userAnswer, onAnswerChange }) => {
    return (
        <div>
            <textarea
                value={userAnswer || ''}
                onChange={(e) => onAnswerChange(e.target.value)}
                rows={5}
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                placeholder="Type your answer here..."
            />
        </div>
    );
};

export default ShortAnswerQuestion;