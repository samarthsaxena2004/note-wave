// FILE: src/lib/mastery.ts

export type LearningStyle = 'Visual' | 'Auditory' | 'Kinesthetic';

export interface CognitiveState {
  burnoutRisk: number; // 0-100
  focusLevel: number; // 0-100
  recommendedStyle: LearningStyle;
}

/**
 * PHASE 3: Calculates if the user is nearing burnout based on 
 * session length and quiz performance.
 */
export function calculateCognitiveLoad(
  sessionStartTime: number,
  averageScore: number
): CognitiveState {
  const sessionMinutes = (Date.now() - sessionStartTime) / (1000 * 60);
  
  // Logical heuristic: Low scores after 45 mins = Burnout
  const burnoutRisk = sessionMinutes > 45 && averageScore < 70 ? 85 : 15;
  const focusLevel = 100 - (sessionMinutes * 0.5); // Focus decays over time

  return {
    burnoutRisk,
    focusLevel,
    recommendedStyle: averageScore < 60 ? 'Kinesthetic' : 'Visual'
  };
}