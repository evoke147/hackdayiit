export interface OnboardingData {
  degree_specialization: string;
  year_semester: string;
  subjects_studied: string;
  skills: string;
  programming_languages: string;
  career_goals: string;
  preferred_industry: string;
}

export interface IndustryRadar {
  topic: string;
  reason: string;
}

export interface LaunchPlan {
  profile_strengths: string[];
  missing_links: string[];
  next_30_days: string[];
  industry_radar: IndustryRadar;
}

export interface RoadmapResponse {
  model_used: string;
  launch_plan: LaunchPlan;
}

export interface TweakRequest {
  onboarding_data: OnboardingData;
  previous_plan: LaunchPlan;
  user_feedback: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  history: Array<{ role: string; content: string }>;
  onboarding_data?: OnboardingData | null;
  launch_plan?: LaunchPlan | null;
}

export interface ChatResponse {
  reply: string;
  model_used: string;
}
