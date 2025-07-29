'use server';

import { getPersonalizedWellnessAdvice, PersonalizedWellnessInput } from '@/ai/flows/personalized-wellness-advice';

export async function generateWellnessAdvice(input: PersonalizedWellnessInput): Promise<{ success: boolean; advice?: string; error?: string }> {
  if (!input.mood || !input.cycleData) {
    return { success: false, error: 'Mood and cycle data are required.' };
  }

  try {
    const result = await getPersonalizedWellnessAdvice(input);
    return { success: true, advice: result.advice };
  } catch (error) {
    console.error('Error generating wellness advice:', error);
    return { success: false, error: 'Failed to generate personalized advice. Please try again later.' };
  }
}
