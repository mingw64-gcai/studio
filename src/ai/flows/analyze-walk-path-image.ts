
'use server';

/**
 * @fileOverview Flow to analyze a walk path prediction image and provide a text analysis.
 *
 * - analyzeWalkPathImage - A function that analyzes an image and returns a text summary.
 * - AnalyzeWalkPathImageInput - The input type for the analyzeWalkPathImage function.
 * - AnalyzeWalkPathImageOutput - The return type for the analyzeWalkPathImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeWalkPathImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image of a walk path prediction, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeWalkPathImageInput = z.infer<typeof AnalyzeWalkPathImageInputSchema>;

const AnalyzeWalkPathImageOutputSchema = z.object({
  analysis: z.string().describe("A text-based analysis of the walk path prediction in the image."),
});
export type AnalyzeWalkPathImageOutput = z.infer<typeof AnalyzeWalkPathImageOutputSchema>;


export async function analyzeWalkPathImage(
  input: AnalyzeWalkPathImageInput
): Promise<AnalyzeWalkPathImageOutput> {
  return analyzeWalkPathImageFlow(input);
}

const analyzeWalkPathImageFlow = ai.defineFlow(
  {
    name: 'analyzeWalkPathImageFlow',
    inputSchema: AnalyzeWalkPathImageInputSchema,
    outputSchema: AnalyzeWalkPathImageOutputSchema,
  },
  async ({imageDataUri}) => {

    const analysisResult = await ai.generate({
        model: 'googleai/gemini-1.5-flash-latest',
        prompt: [
            {media: {url: imageDataUri}},
            {text: 'You are an expert in crowd movement analysis. Analyze the provided image showing predicted walk paths. Describe what the paths indicate about crowd flow and potential congestion points.'},
        ]
    });

    const analysisText = analysisResult.text;
     if (!analysisText) {
      throw new Error('The AI model did not return a text analysis.');
    }

    return {
      analysis: analysisText,
    };
  }
);
