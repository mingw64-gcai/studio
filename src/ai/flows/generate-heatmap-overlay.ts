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
      "A video frame image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
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
      'A heatmap overlay image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
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

const generateHeatmapOverlayFlow = ai.defineFlow(
  {
    name: 'generateHeatmapOverlayFlow',
    inputSchema: GenerateHeatmapOverlayInputSchema,
    outputSchema: GenerateHeatmapOverlayOutputSchema,
  },
  async ({ videoDataUri, keywords }) => {
     const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        {media: {url: videoDataUri}},
        {text: `Analyze the provided image of a crowd. Generate a heatmap overlay identifying areas of high crowd density based on these keywords: "${keywords}". The heatmap should use red for the most dense areas, fading to yellow, then green, and finally becoming transparent in sparse areas. The overlay should only contain the heatmap colors and be otherwise transparent.`},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
        throw new Error('The AI model did not return an image.');
    }

    return {
      heatmapOverlayDataUri: media.url,
    };
  }
);
