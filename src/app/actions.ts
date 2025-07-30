'use server';

import { getPersonalizedWellnessAdvice, type PersonalizedWellnessInput } from '@/ai/flows/personalized-wellness-advice';
import { getThoughtOfTheDay } from '@/ai/flows/thought-generator';
import { getFireAuraQuizAdvice, type FireAuraQuizInput } from '@/ai/flows/fire-aura-quiz';


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

export async function fetchThoughtOfTheDay(): Promise<{ success: boolean; thought?: string; error?: string }> {
    try {
      const result = await getThoughtOfTheDay();
      return { success: true, thought: result.thought };
    } catch (error) {
      console.error('Error generating thought of the day:', error);
      return { success: false, error: 'Failed to generate a thought. Please try again later.' };
    }
  }

export async function generateFireAuraAdvice(quizAnswers: Record<string, string>): Promise<{ success: boolean; advice?: string; error?: string }> {
    const input: FireAuraQuizInput = {
        fireFeeling: quizAnswers.fireFeeling || "",
        passionMeaning: quizAnswers.passionMeaning || "",
        energyFlame: quizAnswers.energyFlame || "",
        creativeSpark: quizAnswers.creativeSpark || "",
        challengeFire: quizAnswers.challengeFire || "",
        burnAway: quizAnswers.burnAway || "",
    };

    if (Object.values(input).some(value => value === "")) {
        return { success: false, error: "All quiz questions must be answered to generate advice." };
    }

    try {
        const result = await getFireAuraQuizAdvice(input);
        return { success: true, advice: result.advice };
    } catch (error) {
        console.error('Error generating fire aura advice:', error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: `Failed to generate personalized advice: ${errorMessage}` };
    }
}
