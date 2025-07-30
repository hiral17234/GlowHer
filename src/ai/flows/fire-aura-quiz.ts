'use server';
/**
 * @fileOverview A flow that generates advice based on the fire aura quiz.
 *
 * - getFireAuraQuizAdvice - A function that generates the advice.
 * - FireAuraQuizInput - The input type for the getFireAuraQuizAdvice function.
 * - FireAuraQuizOutput - The return type for the getFireAuraQuizAdvice function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FireAuraQuizInputSchema = z.object({
    fireFeeling: z.string().describe("How the user feels about fire."),
    passionMeaning: z.string().describe("What passion means to the user."),
    energyFlame: z.string().describe("How the user's energy is burning."),
    creativeSpark: z.string().describe("What creative spark the user wants to ignite."),
    challengeFire: z.string().describe("What fire the user uses to face challenges."),
    burnAway: z.string().describe("What the user wants to let go of."),
});
export type FireAuraQuizInput = z.infer<typeof FireAuraQuizInputSchema>;

const FireAuraQuizOutputSchema = z.object({
  advice: z.string().describe('Personalized, thoughtful advice based on the user\'s answers. It should be 3-4 paragraphs long, written in a gentle, encouraging, and insightful tone. Use newline characters for paragraph breaks.'),
});
export type FireAuraQuizOutput = z.infer<typeof FireAuraQuizOutputSchema>;

export async function getFireAuraQuizAdvice(input: FireAuraQuizInput): Promise<FireAuraQuizOutput> {
  return fireAuraQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fireAuraQuizPrompt',
  input: { schema: FireAuraQuizInputSchema },
  output: { schema: FireAuraQuizOutputSchema },
  prompt: `You are a wise, empathetic mindfulness coach. A user has answered a reflective questionnaire about their 'inner fire'. Your task is to provide a thoughtful, personalized reflection and gentle advice based on their answers. The tone should be encouraging, insightful, and calming. Structure the response into 3-4 distinct paragraphs.

Here are the user's answers:

- When they imagine fire, they feel: {{{fireFeeling}}}
- What 'passion' means to them now is: {{{passionMeaning}}}
- Their energy flame is like: {{{energyFlame}}}
- The creative spark they want to ignite is for: {{{creativeSpark}}}
- To face a challenge, they use the fire of: {{{challengeFire}}}
- They want to burn away and let go of: {{{burnAway}}}

Based on these answers, synthesize a holistic reflection. 
- Start by acknowledging their current state of being, drawing connections between their answers. For example, if their energy is a 'pilot light' and they want to burn away 'self-doubt', acknowledge that it's natural for a small flame to feel vulnerable.
- Offer gentle, actionable tips. For instance, if they seek a 'spark of joy' and their energy is a 'steady burn', suggest small, consistent rituals that can introduce novelty without requiring massive energy.
- Conclude with an empowering and affirming message that ties back to the fire metaphor. Reassure them that all fires, big or small, are valid and powerful.

Do not just repeat their answers. Interpret and connect them to provide genuine insight. Ensure the output is a single string in the 'advice' field, with paragraphs separated by newline characters.`,
});

const fireAuraQuizFlow = ai.defineFlow(
  {
    name: 'fireAuraQuizFlow',
    inputSchema: FireAuraQuizInputSchema,
    outputSchema: FireAuraQuizOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
