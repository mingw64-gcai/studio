
'use server';

/**
 * @fileOverview Flow for analyzing a crowd-related problem and suggesting a solution.
 *
 * - solveCrowdProblem - Analyzes a problem description and provides a potential solution.
 * - SolveCrowdProblemInput - The input type for the solveCrowdProblem function.
 * - SolveCrowdProblemOutput - The return type for the solveCrowdProblem function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SolveCrowdProblemInputSchema = z.object({
  problemDescription: z.string().describe('A text description of a crowd management problem.'),
});
export type SolveCrowdProblemInput = z.infer<typeof SolveCrowdProblemInputSchema>;

const SolveCrowdProblemOutputSchema = z.object({
  analysis: z.string().describe('An analysis of the root causes of the described problem, formatted in Markdown.'),
  solution: z.string().describe('A suggested solution to address the problem, formatted in Markdown.'),
});
export type SolveCrowdProblemOutput = z.infer<typeof SolveCrowdProblemOutputSchema>;

export async function solveCrowdProblem(input: SolveCrowdProblemInput): Promise<SolveCrowdProblemOutput> {
  return solveCrowdProblemFlow(input);
}

const solveCrowdProblemPrompt = ai.definePrompt({
  name: 'solveCrowdProblemPrompt',
  input: {schema: SolveCrowdProblemInputSchema},
  output: {schema: SolveCrowdProblemOutputSchema},
  prompt: `You are an expert in crowd management and public safety.
  A user has described a problem. Analyze the potential root causes and propose a detailed, actionable solution.
  
  **Format your entire response in Markdown.**
  
  For the 'analysis', use headings, bold text, and lists to explain the root causes.
  For the 'solution', use headings for different timeframes (e.g., "Immediate Actions", "Long-Term"), and use nested lists for the specific steps.

  Problem Description: {{{problemDescription}}}`,
});

const solveCrowdProblemFlow = ai.defineFlow(
  {
    name: 'solveCrowdProblemFlow',
    inputSchema: SolveCrowdProblemInputSchema,
    outputSchema: SolveCrowdProblemOutputSchema,
  },
  async input => {
    const {output} = await solveCrowdProblemPrompt(input);
    return output!;
  }
);
