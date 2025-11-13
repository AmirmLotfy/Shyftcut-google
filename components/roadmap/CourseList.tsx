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
        <Card className={`p-5 transition-opacity group ${isCompleted ? 'bg-gray-50' : 'bg-white'}`}>
            <div className="flex flex-col h-full">
                <div className="flex items-start">
                    <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-xl bg-primary-50 text-primary">
                        <BookOpenIcon className="h-7 w-7" />
                    </div>
                    <div className="ml-4 flex-1">
                        <h4 className="text-base font-bold text-gray-800">{course.title}</h4>
                        <p className="text-sm text-gray-500">{course.platform}</p>
                    </div>
                     <button 
                        onClick={handleToggle}
                        aria-label="Mark as complete"
                        className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${isCompleted ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}
                    >
                        <AnimatePresence>
                        {isCompleted && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                <CheckIcon className="w-4 h-4 text-white" />
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </button>
                </div>
                <p className="mt-4 text-sm text-gray-600 flex-grow">{course.reasoning}</p>
                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex space-x-4 text-xs font-medium text-gray-500">
                        <span>{course.duration}</span>
                        <span>&bull;</span>
                        <span className={`font-bold ${course.cost === 'Free' ? 'text-green-600' : 'text-yellow-600'}`}>{course.cost}</span>
                    </div>
                    <a href={course.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-bold rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                        Open Resource
                        <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2" />
                    </a>
                </div>
            </div>
        </Card>
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