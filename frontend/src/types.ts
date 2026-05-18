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

// ── Track (matches Bedrock + DynamoDB shape) ──────

export interface TrackTask {
  task_id: string;
  label: string;
  category: 'research' | 'internship' | 'college' | 'competition' | 'extracurricular';
  difficulty: number; // 0–100
  description: string;
  deadline: string | null;
  completed?: boolean;
}

export interface TrackRecommendation {
  track_id: string;
  label: string;
  description: string;
  difficulty: number; // average of task difficulties
  tasks: TrackTask[];
  status?: 'active' | 'completed' | 'aborted';
  selected_at?: string;
  outcomes?: { task_id: string; result: string }[];
}

// ── Action guide / plan (matches Bedrock + S3 shape) ──

export interface PlanTask {
  task_id: string;
  label: string;
  materials_needed: string[];
  deadlines: {
    application: string | null;
    financial_aid: string | null;
  };
  action_items: string[];
  match_reasoning: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface CollegeFitSchool {
  school: string;
  fit_type: 'reach' | 'match' | 'safety';
  why_it_fits: string;
  requirements: {
    gpa: string;
    test_scores: string;
    notable_requirements: string[];
  };
  application_deadline: string | null;
  financial_aid_deadline: string | null;
}

export interface ActionGuide {
  track_id: string;
  label: string;
  tasks: PlanTask[];
  college_fit_chart: CollegeFitSchool[] | null;
}

// ── Task detail (cached deep-dive on a plan task) ──

export interface TaskDetail {
  overview: string;
  actionItems: string[];
  tips: string[];
  estimatedTime?: string;
  generatedAt: string;
}

// ── Plan persistence ──────────────────────────────

export interface PlanProgress {
  completedTaskIds: string[];
  taskDetails?: Record<string, TaskDetail>;
  updatedAt?: string;
}

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

// ── UI state ──────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
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
