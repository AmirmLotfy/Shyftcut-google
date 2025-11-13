import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon } from '../icons';

interface SuccessCriteriaProps {
    criteria: string[];
}

const SuccessCriteria: React.FC<SuccessCriteriaProps> = ({ criteria }) => {
    return (
        <ul className="space-y-3">
            {criteria.map((item, index) => (
                <motion.li 
                    key={index} 
                    className="flex items-start p-4 rounded-xl backdrop-blur-sm bg-white/60 border border-white/30"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <div className="flex-shrink-0">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                            <CheckCircleIcon className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <p className="ml-4 text-slate-700 font-medium leading-relaxed flex-1">{item}</p>
                </motion.li>
            ))}
        </ul>
    );
};

export default SuccessCriteria;