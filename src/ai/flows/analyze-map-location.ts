
'use server';

/**
 * @fileOverview Flow to analyze a map location for potential crowd density.
 *
 * - analyzeMapLocation - A function that analyzes a map screenshot and returns a heatmap overlay.
 * - AnalyzeMapLocationInput - The input type for the analyzeMapLocation function.
 * - AnalyzeMapLocationOutput - The return type for the analyzeMapLocation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeMapLocationInputSchema = z.object({
  mapImageDataUri: z
    .string()
    .describe(
      "A screenshot of a map area, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
    query: z.string().describe('A query describing what to look for, e.g., "nearby crowded areas".')
});
export type AnalyzeMapLocationInput = z.infer<typeof AnalyzeMapLocationInputSchema>;

const AnalyzeMapLocationOutputSchema = z.object({
  heatmapOverlayDataUri: z
    .string()
    .describe(
      "A heatmap overlay image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeMapLocationOutput = z.infer<typeof AnalyzeMapLocationOutputSchema>;


export async function analyzeMapLocation(
  input: AnalyzeMapLocationInput
): Promise<AnalyzeMapLocationOutput> {
  return analyzeMapLocationFlow(input);
}

const analyzeMapLocationFlow = ai.defineFlow(
  {
    name: 'analyzeMapLocationFlow',
    inputSchema: AnalyzeMapLocationInputSchema,
    outputSchema: AnalyzeMapLocationOutputSchema,
  },
  async ({mapImageDataUri, query}) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        {media: {url: mapImageDataUri}},
        {text: `Based on this map image, generate a heatmap overlay identifying areas that are likely to have high crowd density related to the query: "${query}". The heatmap should be red in the most dense areas, and fade to transparent in less dense areas.`},
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
