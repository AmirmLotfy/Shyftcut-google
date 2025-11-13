
import React from 'react';
import { Milestone } from '../../types';
import TaskList from './TaskList';
import CourseList from './CourseList';
import SuccessCriteria from './SuccessCriteria';
import QuizSelector from '../Quiz/QuizSelector';
import { motion } from 'framer-motion';

interface MilestoneContentProps {
    milestone: Milestone;
    roadmapId: string;
    onUpdateTask: (milestoneId: string, taskId: string, completed: boolean) => void;
    onUpdateCourse: (milestoneId: string, courseId: string, completed: boolean) => void;
}

const Section: React.FC<{title: string; children: React.ReactNode}> = ({ title, children }) => (
    <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        <h3 className="text-2xl font-bold text-gray-800 pb-2 mb-6 border-b border-gray-200">{title}</h3>
        {children}
    </motion.section>
);


const MilestoneContent: React.FC<MilestoneContentProps> = ({ milestone, roadmapId, onUpdateTask, onUpdateCourse }) => {
    return (
        <div className="space-y-12">
            <div>
                <span className="text-base font-semibold text-primary uppercase tracking-wider">Week {milestone.week} &bull; {milestone.durationHours} Hours</span>
                <h2 className="mt-2 text-5xl font-extrabold text-gray-900">{milestone.title}</h2>
                <p className="mt-4 text-xl text-gray-600 max-w-3xl">{milestone.description}</p>
            </div>
            
            <Section title="Actionable Tasks">
                <TaskList 
                    tasks={milestone.tasks} 
                    onToggle={(taskId, completed) => onUpdateTask(milestone.id, taskId, completed)}
                />
            </Section>
            
            <Section title="Recommended Courses & Resources">
                 <CourseList 
                    courses={milestone.courses} 
                    onToggle={(courseId, completed) => onUpdateCourse(milestone.id, courseId, completed)}
                />
            </Section>

            <Section title="Test Your Knowledge">
                 <QuizSelector
                    quizzes={milestone.quizzes}
                    milestoneId={milestone.id}
                    roadmapId={roadmapId}
                 />
            </Section>

            <Section title="Success Criteria">
                <SuccessCriteria criteria={milestone.successCriteria} />
            </Section>
        </div>
    );
};

export default MilestoneContent;