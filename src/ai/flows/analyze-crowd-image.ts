
'use server';

/**
 * @fileOverview Flow to analyze an image for crowd density, generate a heatmap, and provide a text analysis.
 *
 * - analyzeCrowdImage - A function that analyzes an image and returns a heatmap and text summary.
 * - AnalyzeCrowdImageInput - The input type for the analyzeCrowdImage function.
 * - AnalyzeCrowdImageOutput - The return type for the analyzeCrowdImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeCrowdImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image of a location, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeCrowdImageInput = z.infer<typeof AnalyzeCrowdImageInputSchema>;

const AnalyzeCrowdImageOutputSchema = z.object({
  heatmapOverlayDataUri: z
    .string()
    .describe(
      "A heatmap overlay image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  analysis: z.string().describe("A text-based analysis of the crowd gathering in the image."),
});
export type AnalyzeCrowdImageOutput = z.infer<typeof AnalyzeCrowdImageOutputSchema>;


export async function analyzeCrowdImage(
  input: AnalyzeCrowdImageInput
): Promise<AnalyzeCrowdImageOutput> {
  return analyzeCrowdImageFlow(input);
}

const analyzeCrowdImageFlow = ai.defineFlow(
  {
    name: 'analyzeCrowdImageFlow',
    inputSchema: AnalyzeCrowdImageInputSchema,
    outputSchema: AnalyzeCrowdImageOutputSchema,
  },
  async ({imageDataUri}) => {

    const [heatmapResult, analysisResult] = await Promise.all([
        // Generate heatmap
        ai.generate({
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt: [
                {media: {url: imageDataUri}},
                {text: 'Generate a heatmap overlay identifying areas of high crowd density. The heatmap should be red in the most dense areas, and fade to transparent in less dense areas.'},
            ],
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        }),
        // Generate text analysis
        ai.generate({
            model: 'googleai/gemini-pro-vision',
            prompt: [
                {media: {url: imageDataUri}},
                {text: 'You are an expert in crowd analysis. Describe the scene in the image, focusing on crowd density, potential risks, and overall atmosphere. Provide a concise summary.'},
            ]
        })
    ]);

    const heatmapMedia = heatmapResult.media;
    if (!heatmapMedia) {
      throw new Error('The AI model did not return a heatmap image.');
    }

    const analysisText = analysisResult.text;
     if (!analysisText) {
      throw new Error('The AI model did not return a text analysis.');
    }

    return {
      heatmapOverlayDataUri: heatmapMedia.url,
      analysis: analysisText,
    };
  }
);
