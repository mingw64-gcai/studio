'use server';

/**
 * @fileOverview Flow for analyzing historical crowd density data and predicting future crowd behavior.
 *
 * - analyzeHistoricalData - Analyzes historical data based on a text prompt to predict future crowd behavior.
 * - AnalyzeHistoricalDataInput - The input type for the analyzeHistoricalData function.
 * - AnalyzeHistoricalDataOutput - The return type for the analyzeHistoricalData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeHistoricalDataInputSchema = z.object({
  query: z.string().describe('A text prompt describing the desired analysis of historical crowd density data.'),
});
export type AnalyzeHistoricalDataInput = z.infer<typeof AnalyzeHistoricalDataInputSchema>;

const AnalyzeHistoricalDataOutputSchema = z.object({
  analysisResult: z.string().describe('The AI analysis result predicting future crowd behavior based on historical data.'),
});
export type AnalyzeHistoricalDataOutput = z.infer<typeof AnalyzeHistoricalDataOutputSchema>;

export async function analyzeHistoricalData(input: AnalyzeHistoricalDataInput): Promise<AnalyzeHistoricalDataOutput> {
  return analyzeHistoricalDataFlow(input);
}

const analyzeHistoricalDataPrompt = ai.definePrompt({
  name: 'analyzeHistoricalDataPrompt',
  input: {schema: AnalyzeHistoricalDataInputSchema},
  output: {schema: AnalyzeHistoricalDataOutputSchema},
  prompt: `You are an expert in analyzing historical crowd density data to predict future crowd behavior.
  Based on the following analysis request, provide a detailed prediction.

  Analysis Request: {{{query}}}`,
});

const analyzeHistoricalDataFlow = ai.defineFlow(
  {
    name: 'analyzeHistoricalDataFlow',
    inputSchema: AnalyzeHistoricalDataInputSchema,
    outputSchema: AnalyzeHistoricalDataOutputSchema,
  },
  async input => {
    const {output} = await analyzeHistoricalDataPrompt(input);
    return output!;
  }
);
