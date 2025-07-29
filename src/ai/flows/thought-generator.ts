'use server';

/**
 * @fileOverview A flow that generates a random, inspiring thought of the day.
 *
 * - getThoughtOfTheDay - A function that generates the thought.
 * - ThoughtOfTheDayOutput - The return type for the getThoughtOfTheDay function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ThoughtOfTheDayOutputSchema = z.object({
  thought: z.string().describe('A short, inspiring or interesting thought for the day. Should be like a quote.'),
});
export type ThoughtOfTheDayOutput = z.infer<typeof ThoughtOfTheDayOutputSchema>;

export async function getThoughtOfTheDay(): Promise<ThoughtOfTheDayOutput> {
  return thoughtOfTheDayFlow();
}

const prompt = ai.definePrompt({
  name: 'thoughtOfTheDayPrompt',
  output: {schema: ThoughtOfTheDayOutputSchema},
  prompt: `You are a wise and thoughtful sage.
  
  Generate a single, short, inspiring or interesting thought for the day.
  It should be a quote or a profound statement.
  Keep it to one or two sentences.`,
});

const thoughtOfTheDayFlow = ai.defineFlow(
  {
    name: 'thoughtOfTheDayFlow',
    outputSchema: ThoughtOfTheDayOutputSchema,
  },
  async () => {
    const {output} = await prompt();
    return output!;
  }
);
