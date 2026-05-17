export interface StudentProfile {
  name: string;
  grade: number;
  age: number;
  interests: string[];
  strengths: string[];
  goals: string[];
  extracurriculars: string[];
}

export interface UserSession {
  userId: string;
  email: string;
  isNewUser: boolean;
}

/** AI-generated “what to do right now” option for the student to choose */
export interface TrackRecommendation {
  id: string;
  title: string;
  summary: string;
  matchReason: string;
  timeHorizon: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'research' | 'internship' | 'college' | 'competition' | 'extracurricular' | 'skill-building';
  tags: string[];
}

export interface GuideResource {
  title: string;
  url: string;
  description: string;
}

export interface GuideStep {
  id: string;
  order: number;
  title: string;
  description: string;
  tips?: string[];
}

/** Bedrock-generated deep dive for one plan step (cached on the saved plan). */
export interface StepDetail {
  overview: string;
  actionItems: string[];
  tips: string[];
  estimatedTime?: string;
  generatedAt: string;
}

/** Second AI output: practical instructions sourced from the web */
export interface ActionGuide {
  trackId: string;
  trackTitle: string;
  overview: string;
  estimatedDuration: string;
  prerequisites: string[];
  steps: GuideStep[];
  resources: GuideResource[];
  weeklyMilestones: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Recommendation {
  id: string;
  category: 'research' | 'internship' | 'college' | 'competition' | 'extracurricular';
  title: string;
  organization: string;
  description: string;
  matchReason: string;
  gradeRange: string;
  deadline?: string;
  tags: string[];
}

export interface CollegeFitItem {
  id: string;
  name: string;
  location: string;
  type: 'reach' | 'match' | 'safety';
  matchReason: string;
  acceptanceRate: string;
  satRange: string;
  deadline: string;
  programs: string[];
  notes: string;
}

export interface PlanMaterial {
  id: string;
  item: string;
  status: 'not_started' | 'in_progress' | 'completed';
  dueDate?: string;
  notes: string;
}

export interface ApplicationPlan {
  id: string;
  opportunityTitle: string;
  organization: string;
  applicationDeadline: string;
  financialAidDeadline?: string;
  matchReasoning: string;
  materials: PlanMaterial[];
  actionItems: ActionItem[];
  colleges?: CollegeFitItem[];
}

export interface ActionItem {
  id: string;
  task: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  dueDate?: string;
}

export interface PlanProgress {
  completedStepIds: string[];
  completedMilestoneIndexes: number[];
  stepDetails?: Record<string, StepDetail>;
  updatedAt?: string;
}

/** Persisted track + action guide for AI growth memory */
export interface SavedPlan {
  id: string;
  userId: string;
  track: TrackRecommendation;
  guide: ActionGuide;
  profileSnapshot: StudentProfile;
  createdAt: string;
  status: 'active' | 'completed';
  progress?: PlanProgress;
}

export type AppPage =
  | 'landing'
  | 'login'
  | 'signup'
  | 'profile'
  | 'recommendations'
  | 'action-guide'
  | 'hub';

export type HubTab = 'home' | 'past-plans' | 'profile';
export type DashboardTab = 'recommendations' | 'plans' | 'profile';
