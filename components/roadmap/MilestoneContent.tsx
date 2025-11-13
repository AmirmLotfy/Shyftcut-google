

import React from 'react';
import { Milestone, Task } from '../../types';
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
    onStartFocus: (task: Task) => void;
}

const Section: React.FC<{title: string; children: React.ReactNode}> = ({ title, children }) => (
    <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card p-8"
    >
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/20">
            <div className="h-1 w-12 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
            <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
        </div>
        {children}
    </motion.section>
);


const MilestoneContent: React.FC<MilestoneContentProps> = ({ milestone, roadmapId, onUpdateTask, onUpdateCourse, onStartFocus }) => {
    return (
        <div className="space-y-8">
            <motion.div 
                className="glass-card p-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <span className="inline-block backdrop-blur-sm bg-primary/20 text-primary-700 px-3 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wider border border-primary/20">
                    Week {milestone.week} &bull; {milestone.durationHours} Hours
                </span>
                <h2 className="mt-4 text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">{milestone.title}</h2>
                <p className="mt-4 text-lg sm:text-xl text-slate-600 max-w-3xl leading-relaxed">{milestone.description}</p>
            </motion.div>
            
            <Section title="Actionable Tasks">
                <TaskList 
                    tasks={milestone.tasks} 
                    onToggle={(taskId, completed) => onUpdateTask(milestone.id, taskId, completed)}
                    onStartFocus={onStartFocus}
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