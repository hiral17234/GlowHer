'use server';

/**
 * @fileOverview Personalized wellness advice flow that provides custom recommendations based on user mood and cycle data.
 *
 * - getPersonalizedWellnessAdvice - A function that generates personalized wellness advice.
 * - PersonalizedWellnessInput - The input type for the getPersonalizedWellnessAdvice function.
 * - PersonalizedWellnessOutput - The return type for the getPersonalizedWellnessAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedWellnessInputSchema = z.object({
  mood: z.string().describe('The current mood of the user (e.g., happy, sad, stressed).'),
  cycleData: z
    .string()
    .describe(
      'Information about the user’s current menstrual cycle phase (e.g., menstruation, follicular phase, ovulation, luteal phase).'
    ),
});
export type PersonalizedWellnessInput = z.infer<typeof PersonalizedWellnessInputSchema>;

const PersonalizedWellnessOutputSchema = z.object({
  advice: z.string().describe('Personalized wellness advice based on the mood and cycle data.'),
});
export type PersonalizedWellnessOutput = z.infer<typeof PersonalizedWellnessOutputSchema>;

export async function getPersonalizedWellnessAdvice(
  input: PersonalizedWellnessInput
): Promise<PersonalizedWellnessOutput> {
  return personalizedWellnessAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedWellnessPrompt',
  input: {schema: PersonalizedWellnessInputSchema},
  output: {schema: PersonalizedWellnessOutputSchema},
  prompt: `You are a wellness expert providing personalized advice.

  Based on the user's current mood: {{{mood}}} and their menstrual cycle data: {{{cycleData}}}, provide tailored wellness advice to improve their overall well-being.
  The advice should be practical and actionable.
  Response should be no more than 3 sentences.
  `,
});

const personalizedWellnessAdviceFlow = ai.defineFlow(
  {
    name: 'personalizedWellnessAdviceFlow',
    inputSchema: PersonalizedWellnessInputSchema,
    outputSchema: PersonalizedWellnessOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
