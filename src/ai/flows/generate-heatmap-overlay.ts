'use server';

/**
 * @fileOverview Flow to generate heatmap overlays on a video feed based on AI prompting.
 *
 * - generateHeatmapOverlay - A function that generates a heatmap overlay based on the given input.
 * - GenerateHeatmapOverlayInput - The input type for the generateHeatmapOverlay function.
 * - GenerateHeatmapOverlayOutput - The return type for the generateHeatmapOverlay function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHeatmapOverlayInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A video feed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  keywords: z.string().describe('Keywords to highlight high density areas in the crowd.'),
});
export type GenerateHeatmapOverlayInput = z.infer<
  typeof GenerateHeatmapOverlayInputSchema
>;

const GenerateHeatmapOverlayOutputSchema = z.object({
  heatmapOverlayDataUri: z
    .string()
    .describe(
      'A heatmap overlay image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Explicitly escape special characters
    ),
});
export type GenerateHeatmapOverlayOutput = z.infer<
  typeof GenerateHeatmapOverlayOutputSchema
>;

export async function generateHeatmapOverlay(
  input: GenerateHeatmapOverlayInput
): Promise<GenerateHeatmapOverlayOutput> {
  return generateHeatmapOverlayFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHeatmapOverlayPrompt',
  input: {schema: GenerateHeatmapOverlayInputSchema},
  output: {schema: GenerateHeatmapOverlayOutputSchema},
  prompt: `You are an AI that generates heatmap overlays for video feeds to visualize crowd density.

  Based on the video feed and the provided keywords, generate a heatmap overlay image that highlights areas of high crowd density related to the keywords.

  Video Feed: {{media url=videoDataUri}}
  Keywords: {{{keywords}}}

  Return the heatmap overlay as a data URI.
  `,
});

const generateHeatmapOverlayFlow = ai.defineFlow(
  {
    name: 'generateHeatmapOverlayFlow',
    inputSchema: GenerateHeatmapOverlayInputSchema,
    outputSchema: GenerateHeatmapOverlayOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
