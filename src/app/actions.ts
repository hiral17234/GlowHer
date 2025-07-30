
'use server';

import { getPersonalizedWellnessAdvice, type PersonalizedWellnessInput } from '@/ai/flows/personalized-wellness-advice';
import { getThoughtOfTheDay } from '@/ai/flows/thought-generator';


export async function generateWellnessAdvice(input: PersonalizedWellnessInput): Promise<{ success: boolean; advice?: string; error?: string }> {
  if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
    console.warn('AI feature skipped: API key not configured.');
    return { success: false, error: 'AI feature not configured.' };
  }
  
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

export async function fetchThoughtOfTheDay(): Promise<{ success: boolean; thought?: string; error?: string }> {
    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
      console.warn('Thought of the day feature skipped: API key not configured.');
      // Return a default thought to prevent application errors when no API key is set.
      return { success: true, thought: '"The best way to predict the future is to create it." – Abraham Lincoln' };
    }
    
    try {
      const result = await getThoughtOfTheDay();
      return { success: true, thought: result.thought };
    } catch (error) {
      console.error('Error generating thought of the day:', error);
      return { success: false, error: 'Failed to generate a thought. Please try again later.' };
    }
  }

