
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
    // Simulate the AI response to avoid hitting rate limits during development.
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network latency

    return {
        analysis: `
### Root Cause Analysis: Bottleneck at Exhibition Center

The described bottleneck at the entrance and exit points of a large venue with 2000 participants points to several potential root causes. A comprehensive analysis suggests the following issues are likely at play:

*   **Inadequate Infrastructure:**
    *   **Insufficient Entry/Exit Points:** The number of available gates is likely insufficient for the volume of people, creating a natural point of congestion.
    *   **Poorly Designed Choke Points:** The physical layout of the entrance/exit areas (narrow corridors, poorly placed security) may not be optimized for smooth flow.

*   **Inefficient Processes:**
    *   **Slow Security Screening:** Manual bag checks or inefficient screening protocols can drastically slow down entry.
    *   **Complex Ticketing/Registration:** A cumbersome registration or ticket validation process will cause significant delays.

*   **Lack of Real-time Management:**
    *   **No Crowd Flow Monitoring:** Without real-time data, staff cannot proactively manage developing congestion.
    *   **Poor Communication:** Attendees are not informed about wait times, alternative routes, or the reasons for delays, leading to frustration and non-compliance with instructions.
        `,
        solution: `
### Suggested Solution: A Multi-Phased Approach

To effectively address this, a solution involving immediate, medium-term, and long-term actions is recommended.

#### **Immediate Actions (To be implemented within 24 hours)**

1.  **Staff Redeployment:**
    *   Increase the number of staff at all bottleneck locations.
    *   Create dedicated "express lanes" for attendees without bags.
2.  **Improve Signage:**
    *   Deploy clear, large, and multilingual signage to direct attendees.
    *   Use staff with megaphones to provide verbal instructions.

#### **Medium-Term Actions (To be implemented within 1-2 weeks)**

1.  **Process Optimization:**
    *   Review and streamline the security screening process.
    *   Implement a digital ticketing system to speed up validation.
2.  **Temporary Infrastructure:**
    *   Install temporary barriers to create structured queuing lanes.
    *   Investigate opening additional temporary exit points during peak egress times.

#### **Long-Term Actions (To be implemented within 3-6 months)**

1.  **Technology Investment:**
    *   Install crowd density sensors and use an analytics platform (like this one!) to monitor flow in real-time.
    *   Develop a mobile app for attendees with real-time wait information and push notifications.
2.  **Infrastructure Redesign:**
    *   Conduct a professional audit of the venue's entry/exit points.
    *   Consider architectural modifications to widen corridors or add permanent gates based on the audit's findings.
      `,
    };

    /*
    const {output} = await solveCrowdProblemPrompt(input);
    return output!;
    */
  }
);
