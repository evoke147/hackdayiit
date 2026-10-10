import type { OnboardingData, RoadmapResponse, LaunchPlan } from './types';

const API_BASE = 'http://127.0.0.1:8000';

export async function checkBackendHealth(): Promise<{ status: string; model: string }> {
  const response = await fetch(`${API_BASE}/`, {
    headers: { 'Accept': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Health check failed with HTTP ${response.status}`);
  }
  return response.json();
}

export async function generateRoadmap(data: OnboardingData): Promise<RoadmapResponse> {
  const response = await fetch(`${API_BASE}/roadmap`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Server error: ${response.status}`);
  }

  return response.json();
}

export async function tweakRoadmap(
  onboardingData: OnboardingData,
  previousPlan: LaunchPlan,
  feedback: string
): Promise<RoadmapResponse> {
  const response = await fetch(`${API_BASE}/roadmap/tweak`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      onboarding_data: onboardingData,
      previous_plan: previousPlan,
      user_feedback: feedback,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Server error: ${response.status}`);
  }

  return response.json();
}

export async function sendChatMessage(
  message: string,
  history: Array<{ role: string; content: string }>,
  onboardingData?: OnboardingData | null,
  launchPlan?: LaunchPlan | null
): Promise<{ reply: string; model_used: string }> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      history,
      onboarding_data: onboardingData || null,
      launch_plan: launchPlan || null,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Server error: ${response.status}`);
  }

  return response.json();
}
