import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Course } from '../../types';
import { BookOpenIcon, ArrowTopRightOnSquareIcon, CheckIcon } from '../icons';
import Card from '../Card';

interface CourseListProps {
    courses: Course[];
    onToggle: (courseId: string, completed: boolean) => void;
}

const CourseCard: React.FC<{ course: Course, onToggle: (completed: boolean) => void }> = ({ course, onToggle }) => {
    const [isCompleted, setIsCompleted] = React.useState(course.completed);

    const handleToggle = () => {
        const newStatus = !isCompleted;
        setIsCompleted(newStatus);
        onToggle(newStatus);
    }
    
    return (
        <motion.div 
            className={`p-6 rounded-xl backdrop-blur-sm bg-white/70 border border-white/30 transition-all duration-300 hover:bg-white/90 hover:border-primary/20 hover:shadow-lg group h-full ${
                isCompleted ? 'opacity-75' : ''
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
        >
            <div className="flex flex-col h-full">
                <div className="flex items-start">
                    <motion.div 
                        className="flex-shrink-0 h-14 w-14 flex items-center justify-center rounded-xl backdrop-blur-sm bg-gradient-to-br from-primary/20 to-primary/30 border border-primary/20 text-primary"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                        <BookOpenIcon className="h-8 w-8" />
                    </motion.div>
                    <div className="ml-4 flex-1 min-w-0">
                        <h4 className="text-base font-bold text-gray-900 line-clamp-2">{course.title}</h4>
                        <p className="text-sm text-slate-600 mt-1">{course.platform}</p>
                    </div>
                     <motion.button 
                        onClick={handleToggle}
                        aria-label="Mark as complete"
                        className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                            isCompleted 
                                ? 'bg-gradient-to-br from-primary to-primary-600 border-primary shadow-lg shadow-primary/30' 
                                : 'bg-white/80 border-slate-300/50 backdrop-blur-sm hover:border-primary/50'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <AnimatePresence>
                        {isCompleted && (
                            <motion.div 
                                initial={{ scale: 0, rotate: -180 }} 
                                animate={{ scale: 1, rotate: 0 }} 
                                exit={{ scale: 0, rotate: 180 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                            >
                                <CheckIcon className="w-5 h-5 text-white" />
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </motion.button>
                </div>
                <p className="mt-4 text-sm text-slate-600 flex-grow leading-relaxed">{course.reasoning}</p>
                <div className="mt-4 pt-4 border-t border-white/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex space-x-4 text-xs font-semibold text-slate-600">
                        <span>{course.duration}</span>
                        <span>&bull;</span>
                        <span className={`font-bold ${course.cost === 'Free' ? 'text-green-600' : 'text-yellow-600'}`}>{course.cost}</span>
                    </div>
                    <motion.a 
                        href={course.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center px-4 py-2 backdrop-blur-sm bg-primary/10 border border-primary/20 text-sm font-semibold rounded-xl text-primary hover:bg-primary/20 hover:border-primary/30 transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Open Resource
                        <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2" />
                    </motion.a>
                </div>
            </div>
        </motion.div>
    );
}

const CourseList: React.FC<CourseListProps> = ({ courses, onToggle }) => {
    return (
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
            {courses.map(course => (
                <CourseCard key={course.id} course={course} onToggle={(completed) => onToggle(course.id, completed)} />
            ))}
        </div>
    );
};

export default CourseList;