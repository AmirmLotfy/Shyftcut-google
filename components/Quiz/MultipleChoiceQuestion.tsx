import React from 'react';

interface MultipleChoiceQuestionProps {
    options: string[];
    selectedOption?: string;
    onOptionSelect: (option: string) => void;
}

const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({ options, selectedOption, onOptionSelect }) => {
    const letters = ['A', 'B', 'C', 'D'];
    return (
        <div className="space-y-3">
            {options.map((option, index) => (
                <button
                    key={index}
                    onClick={() => onOptionSelect(option)}
                    className={`w-full text-left p-3 border-2 rounded-lg flex items-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                        ${selectedOption === option
                            ? 'bg-primary-50 border-primary shadow-md'
                            : 'bg-white border-gray-200 hover:border-primary-300'
                        }`
                    }
                >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-md border flex items-center justify-center mr-4 font-semibold
                        ${selectedOption === option ? 'bg-primary text-white border-primary' : 'bg-gray-100 text-gray-600 border-gray-300'}`}>
                        {letters[index]}
                    </div>
                    <span className="text-gray-700">{option}</span>
                </button>
            ))}
        </div>
    );
};

export default MultipleChoiceQuestion;