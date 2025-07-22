
'use server';

/**
 * @fileOverview Flow to analyze an image for crowd density and generate a heatmap.
 *
 * - analyzeImageForCrowds - A function that analyzes an image and returns a heatmap overlay.
 * - AnalyzeImageForCrowdsInput - The input type for the analyzeImageForCrowds function.
 * - AnalyzeImageForCrowdsOutput - The return type for the analyzeImageForCrowds function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeImageForCrowdsInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image of a location, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeImageForCrowdsInput = z.infer<typeof AnalyzeImageForCrowdsInputSchema>;

const AnalyzeImageForCrowdsOutputSchema = z.object({
  heatmapOverlayDataUri: z
    .string()
    .describe(
      "A heatmap overlay image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeImageForCrowdsOutput = z.infer<typeof AnalyzeImageForCrowdsOutputSchema>;


export async function analyzeImageForCrowds(
  input: AnalyzeImageForCrowdsInput
): Promise<AnalyzeImageForCrowdsOutput> {
  return analyzeImageForCrowdsFlow(input);
}


const prompt = ai.definePrompt({
  name: 'analyzeImageForCrowdsPrompt',
  input: { schema: AnalyzeImageForCrowdsInputSchema },
  output: { schema: AnalyzeImageForCrowdsOutputSchema },
  prompt: `You are an AI expert in analyzing images to detect crowd density.
  Based on the provided image, generate a heatmap overlay that highlights areas with a high concentration of people.
  The heatmap should be red in the most dense areas, and fade to transparent in less dense areas.

  Image for analysis: {{media url=imageDataUri}}

  Return the heatmap overlay as a data URI.
  `,
});


const analyzeImageForCrowdsFlow = ai.defineFlow(
  {
    name: 'analyzeImageForCrowdsFlow',
    inputSchema: AnalyzeImageForCrowdsInputSchema,
    outputSchema: AnalyzeImageForCrowdsOutputSchema,
  },
  async input => {
    // In a real scenario, you might have more complex logic here.
    // For this example, we directly call the prompt.
    const { output } = await prompt(input);
    return output!;
  }
);
