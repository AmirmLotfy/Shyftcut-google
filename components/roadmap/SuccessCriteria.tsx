import React from 'react';
import { CheckCircleIcon } from '../icons';

interface SuccessCriteriaProps {
    criteria: string[];
}

const SuccessCriteria: React.FC<SuccessCriteriaProps> = ({ criteria }) => {
    return (
        <ul className="space-y-3">
            {criteria.map((item, index) => (
                <li key={index} className="flex items-start">
                    <div className="flex-shrink-0">
                        <CheckCircleIcon className="w-6 h-6 text-green-500" />
                    </div>
                    <p className="ml-3 text-gray-700">{item}</p>
                </li>
            ))}
        </ul>
    );
};

export default SuccessCriteria;