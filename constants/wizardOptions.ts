
import React from 'react';
import {
    CodeBracketIcon, ChartPieIcon, PaintBrushIcon, HomeModernIcon, GlobeAltIcon, DevicePhoneMobileIcon, CircleStackIcon,
    UserGroupIcon, ShieldCheckIcon, CpuChipIcon, CubeTransparentIcon, ServerStackIcon, RocketLaunchIcon, QuestionMarkCircleIcon,
    AcademicCapIcon, UserIcon, BriefcaseIcon, StarIcon, ClockIcon, LightBulbIcon, VideoCameraIcon, BookOpenIcon,
    CodeSandboxIcon, BeakerIcon, SpeakerWaveIcon, ChatBubbleBottomCenterTextIcon, SparklesIcon, CurrencyDollarIcon,
    GiftIcon, GlobeEuropeAfricaIcon
} from '../components/icons';
import { UserPreferences } from '../types';

export const WIZARD_STEPS = 6;

// Fix: Replaced JSX syntax with React.createElement to be valid in a .ts file.
// Step 1: Career Tracks
export const CAREER_TRACKS_OPTIONS = [
  { id: 'digital-marketing', name: 'Digital Marketing', icon: React.createElement(ChartPieIcon, { className: "h-8 w-8 mb-2" }), description: "Master online advertising, SEO, and content strategy." },
  { id: 'ai', name: 'Artificial Intelligence', icon: React.createElement(CpuChipIcon, { className: "h-8 w-8 mb-2" }), description: "Build intelligent systems and explore machine learning." },
  { id: 'graphic-design', name: 'Graphic Design', icon: React.createElement(PaintBrushIcon, { className: "h-8 w-8 mb-2" }), description: "Create stunning visuals for brands and media." },
  { id: 'interior-design', name: 'Interior Design', icon: React.createElement(HomeModernIcon, { className: "h-8 w-8 mb-2" }), description: "Design functional and beautiful indoor spaces." },
  { id: 'web-development', name: 'Web Development', icon: React.createElement(CodeBracketIcon, { className: "h-8 w-8 mb-2" }), description: "Build and maintain websites and web applications." },
  { id: 'app-development', name: 'App Development', icon: React.createElement(DevicePhoneMobileIcon, { className: "h-8 w-8 mb-2" }), description: "Create applications for iOS and Android devices." },
  { id: 'data-science', name: 'Data Science', icon: React.createElement(CircleStackIcon, { className: "h-8 w-8 mb-2" }), description: "Analyze data to uncover insights and trends." },
  { id: 'ux-ui-design', name: 'UX/UI Design', icon: React.createElement(UserGroupIcon, { className: "h-8 w-8 mb-2" }), description: "Design user-friendly and intuitive digital products." },
  { id: 'cybersecurity', name: 'Cybersecurity', icon: React.createElement(ShieldCheckIcon, { className: "h-8 w-8 mb-2" }), description: "Protect computer systems and networks from threats." },
  { id: 'machine-learning', name: 'Machine Learning', icon: React.createElement(BeakerIcon, { className: "h-8 w-8 mb-2" }), description: "A subset of AI focused on building predictive models." },
  { id: 'blockchain', name: 'Blockchain', icon: React.createElement(CubeTransparentIcon, { className: "h-8 w-8 mb-2" }), description: "Explore decentralized technologies and cryptocurrencies." },
  { id: 'cloud-engineering', name: 'Cloud Engineering', icon: React.createElement(ServerStackIcon, { className: "h-8 w-8 mb-2" }), description: "Design and manage cloud infrastructure and services." },
  { id: 'devops', name: 'DevOps', icon: React.createElement(RocketLaunchIcon, { className: "h-8 w-8 mb-2" }), description: "Streamline software development and deployment." },
  { id: 'mobile-development', name: 'Mobile Development', icon: React.createElement(DevicePhoneMobileIcon, { className: "h-8 w-8 mb-2" }), description: "Specializing in creating applications for mobile devices." },
  { id: 'other', name: 'Other', icon: React.createElement(QuestionMarkCircleIcon, { className: "h-8 w-8 mb-2" }), description: "Define your own custom learning path." },
];


// Fix: Replaced JSX syntax with React.createElement to be valid in a .ts file.
// Step 2: Experience Levels
export const EXPERIENCE_LEVELS_OPTIONS = [
  { id: 'beginner', name: 'Beginner', icon: React.createElement(AcademicCapIcon, { className: "h-8 w-8 text-green-500" }), description: "I'm just starting out and have little to no experience in this field." },
  { id: 'intermediate', name: 'Intermediate', icon: React.createElement(UserIcon, { className: "h-8 w-8 text-blue-500" }), description: "I have some basic knowledge and practical experience." },
  { id: 'advanced', name: 'Advanced', icon: React.createElement(BriefcaseIcon, { className: "h-8 w-8 text-indigo-500" }), description: "I have solid experience and can work independently on projects." },
  { id: 'expert', name: 'Expert', icon: React.createElement(StarIcon, { className: "h-8 w-8 text-yellow-500" }), description: "I'm a seasoned professional with deep knowledge in this field." },
];

// Fix: Replaced JSX syntax with React.createElement to be valid in a .ts file.
// Step 3: Weekly Hours
export const WEEKLY_HOURS_OPTIONS = [
  { hours: 5, label: 'Casual', impact: 'Great for exploring a new topic.', icon: React.createElement(ClockIcon, { className: "h-6 w-6 mr-3" }) },
  { hours: 10, label: 'Regular', impact: 'Steady progress without feeling rushed.', icon: React.createElement(ClockIcon, { className: "h-6 w-6 mr-3" }) },
  { hours: 15, label: 'Serious', impact: 'Significant weekly learning and skill gain.', icon: React.createElement(ClockIcon, { className: "h-6 w-6 mr-3" }) },
  { hours: 20, label: 'Intense', impact: 'Equivalent to a part-time job, rapid growth.', icon: React.createElement(ClockIcon, { className: "h-6 w-6 mr-3" }) },
  { hours: 30, label: 'Full-Time', impact: 'Fully immersive, fastest path to mastery.', icon: React.createElement(ClockIcon, { className: "h-6 w-6 mr-3" }) },
];

// Fix: Replaced JSX syntax with React.createElement to be valid in a .ts file.
// Step 4: Learning Styles
export const LEARNING_STYLES_OPTIONS = [
  { id: 'video-learning', name: 'Video Learning', icon: React.createElement(VideoCameraIcon, { className: "h-5 w-5 mr-2" }), example: "e.g., YouTube, Coursera, Udemy" },
  { id: 'written-content', name: 'Written Content', icon: React.createElement(BookOpenIcon, { className: "h-5 w-5 mr-2" }), example: "e.g., Blogs, Articles, Books" },
  { id: 'hands-on-projects', name: 'Hands-on Projects', icon: React.createElement(CodeSandboxIcon, { className: "h-5 w-5 mr-2" }), example: "e.g., Building real applications" },
  { id: 'interactive-coding', name: 'Interactive Coding', icon: React.createElement(BeakerIcon, { className: "h-5 w-5 mr-2" }), example: "e.g., LeetCode, HackerRank" },
  { id: 'webinars', name: 'Webinars', icon: React.createElement(SpeakerWaveIcon, { className: "h-5 w-5 mr-2" }), example: "e.g., Live sessions with experts" },
  { id: 'podcasts', name: 'Podcasts', icon: React.createElement(ChatBubbleBottomCenterTextIcon, { className: "h-5 w-5 mr-2" }), example: "e.g., Learning during your commute" },
  { id: 'mixed', name: 'Mixed', icon: React.createElement(SparklesIcon, { className: "h-5 w-5 mr-2" }), example: "A balanced blend of all styles" },
];

// Fix: Replaced JSX syntax with React.createElement to be valid in a .ts file.
// Step 5: Resource Preferences
export const RESOURCE_PREFERENCES_OPTIONS = [
  { id: 'free-only', name: 'Free Only', icon: React.createElement(GiftIcon, { className: "h-8 w-8 text-green-500" }), description: "I want to learn using only freely available resources.", cost: "Estimated Cost: $0" },
  { id: 'paid-only', name: 'Paid Only', icon: React.createElement(CurrencyDollarIcon, { className: "h-8 w-8 text-yellow-500" }), description: "I prefer premium, paid courses and materials.", cost: "Costs can vary significantly." },
  { id: 'mixed', name: 'Mixed (Free & Paid)', icon: React.createElement(GlobeEuropeAfricaIcon, { className: "h-8 w-8 text-blue-500" }), description: "I'm open to both free and paid resources to get the best learning experience.", cost: "Flexible, based on course selection." },
];

export const initialWizardData: UserPreferences = {
    careerTrack: '',
    experienceLevel: '',
    weeklyHours: 10,
    learningStyles: [],
    resourcePreference: '',
};