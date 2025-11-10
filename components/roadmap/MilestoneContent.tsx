
import React from 'react';
import { Milestone } from '../../types';
import TaskList from './TaskList';
import CourseList from './CourseList';
import SuccessCriteria from './SuccessCriteria';
import QuizSelector from '../Quiz/QuizSelector';
import Button from '../Button';

interface MilestoneContentProps {
    milestone: Milestone;
    roadmapId: string;
    onUpdateTask: (milestoneId: string, taskId: string, completed: boolean) => void;
    onUpdateCourse: (milestoneId: string, courseId: string, completed: boolean) => void;
    onMarkComplete: () => void;
    isComplete: boolean;
}

const MilestoneContent: React.FC<MilestoneContentProps> = ({ milestone, roadmapId, onUpdateTask, onUpdateCourse, onMarkComplete, isComplete }) => {
    return (
        <div className="space-y-8">
            <div>
                <span className="text-sm font-semibold text-primary uppercase">Week {milestone.week} &bull; {milestone.durationHours} Hours</span>
                <h2 className="mt-1 text-3xl font-bold text-gray-800">{milestone.title}</h2>
                <p className="mt-2 text-lg text-gray-600">{milestone.description}</p>
            </div>
            
             <div className="mt-6">
                <Button 
                    onClick={onMarkComplete}
                    disabled={isComplete}
                    className={`w-full transition-colors ${isComplete ? '!bg-green-500 hover:!bg-green-600' : ''}`}
                    size="lg"
                >
                    {isComplete ? 'Milestone Complete!' : 'Mark All as Complete'}
                </Button>
            </div>

            <section>
                <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">Actionable Tasks</h3>
                <TaskList 
                    tasks={milestone.tasks} 
                    onToggle={(taskId, completed) => onUpdateTask(milestone.id, taskId, completed)}
                />
            </section>
            
            <section>
                <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">Recommended Courses & Resources</h3>
                 <CourseList 
                    courses={milestone.courses} 
                    onToggle={(courseId, completed) => onUpdateCourse(milestone.id, courseId, completed)}
                />
            </section>

            <section>
                <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">Test Your Knowledge</h3>
                 <QuizSelector
                    quizzes={milestone.quizzes}
                    milestoneId={milestone.id}
                    roadmapId={roadmapId}
                 />
            </section>

            <section>
                <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">Success Criteria</h3>
                <SuccessCriteria criteria={milestone.successCriteria} />
            </section>
        </div>
    );
};

export default MilestoneContent;
