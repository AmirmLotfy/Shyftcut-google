
export interface UserProfile {
  uid: string;
  email: string | null;
  name: string;
  country: string;
  age: number;
  profileComplete: boolean;
  createdAt: any; // Firebase Timestamp
  lastRoadmapGeneratedAt?: any; // Firebase Timestamp
  preferences: UserPreferences;
  subscriptionRole?: 'free' | 'pro' | 'team';
  trialEndsAt?: any; // Firebase Timestamp
}

export interface UserPreferences {
  careerTrack: string;
  experienceLevel: string;
  weeklyHours: number;
  learningStyles: string[];
  resourcePreference: string;
}

export interface Roadmap {
  id: string;
  title: string;
  description: string;
  track: string;
  level: string;
  createdAt: any; // Firebase Timestamp
  updatedAt: any; // Firebase Timestamp
  status: 'in-progress' | 'completed' | 'pending' | 'archived';
  totalHours: number;
  estimatedCompletion: string;
  // Milestones are now a subcollection
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export interface Course {
  id: string;
  title: string;
  platform: string;
  url: string;
  duration: string;
  cost: string;
  reasoning: string;
  completed: boolean;
}

export interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'short-answer';
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  difficulty: number; // e.g., 1 to 3
  questions: Question[];
}

export interface Milestone {
  id: string;
  title: string;
  week: number;
  description: string;
  durationHours: number;
  tasks: Task[];
  successCriteria: string[];
  courses: Course[];
  quizzes: Quiz[];
  timeSpent?: number; // in minutes
}

export interface QuizResult {
  id: string;
  quizId: string;
  quizTitle: string;
  milestoneId: string;
  attemptNumber: number;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  timeSpent: number; // in seconds
  timestamp: any; // Firebase Timestamp
  answers: UserAnswer[];
}

export interface UserAnswer {
  questionId: string;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}