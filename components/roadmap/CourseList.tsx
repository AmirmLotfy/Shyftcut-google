import React from 'react';
import { Course } from '../../types';
import { BookOpenIcon, CheckCircleIcon, ArrowTopRightOnSquareIcon } from '../icons';
import Button from '../Button';
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
        <Card className={`p-4 transition-opacity ${isCompleted ? 'opacity-70' : 'opacity-100'}`}>
            <div className="flex flex-col h-full">
                <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-primary-100 text-primary">
                        <BookOpenIcon className="h-6 w-6" />
                    </div>
                    <div className="ml-4 flex-1">
                        <h4 className="text-base font-bold text-gray-800">{course.title}</h4>
                        <p className="text-sm text-gray-500">{course.platform}</p>
                    </div>
                </div>
                <p className="mt-3 text-sm text-gray-600 flex-grow">{course.reasoning}</p>
                <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex space-x-4 text-xs font-medium text-gray-500">
                        <span>{course.duration}</span>
                        <span>&bull;</span>
                        <span>{course.cost}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <a href={course.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                            Open <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1.5" />
                        </a>
                         <button 
                            onClick={handleToggle}
                            className={`inline-flex items-center px-2.5 py-1.5 border shadow-sm text-xs font-medium rounded transition-colors ${isCompleted ? 'bg-green-100 text-green-800 border-transparent' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                         >
                            <CheckCircleIcon className="w-4 h-4 mr-1.5" />
                            {isCompleted ? 'Completed' : 'Mark as Done'}
                         </button>
                    </div>
                </div>
            </div>
        </Card>
    );
}

const CourseList: React.FC<CourseListProps> = ({ courses, onToggle }) => {
    return (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {courses.map(course => (
                <CourseCard key={course.id} course={course} onToggle={(completed) => onToggle(course.id, completed)} />
            ))}
        </div>
    );
};

export default CourseList;