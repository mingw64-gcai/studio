
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

const analyzeImageForCrowdsFlow = ai.defineFlow(
  {
    name: 'analyzeImageForCrowdsFlow',
    inputSchema: AnalyzeImageForCrowdsInputSchema,
    outputSchema: AnalyzeImageForCrowdsOutputSchema,
  },
  async ({imageDataUri}) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        {media: {url: imageDataUri}},
        {text: 'Generate a heatmap overlay identifying areas of high crowd density. The heatmap should be red in the most dense areas, and fade to transparent in less dense areas.'},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media) {
      throw new Error('The AI model did not return an image.');
    }

    return {
      heatmapOverlayDataUri: media.url,
    };
  }
);
