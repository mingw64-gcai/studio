
'use server';

/**
 * @fileOverview Flow to analyze an image for crowd density and provide a text analysis.
 *
 * - analyzeCrowdImage - A function that analyzes an image and returns a text summary.
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
    // Mocked response to avoid hitting API rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
        analysis: `
### Crowd Distribution Analysis

Based on the generated chart, here's a breakdown of the crowd distribution:

*   **Peak Density:** The highest concentration of people is located in the central plaza, right in front of the main stage. This area shows deep red, indicating potential overcrowding.
*   **Moderate Zones:** The pathways leading to and from the food court exhibit moderate density (yellow and orange hues). While not critical, these are areas to monitor for increasing congestion.
*   **Low Density:** The areas near the restrooms and the outer perimeter are green, indicating sparse crowds and free movement.

**Recommendations:**
1.  Monitor the central plaza continuously.
2.  Consider rerouting some foot traffic away from the food court paths if density increases.
`
    };

    /*
    const analysisResult = await ai.generate({
        model: 'googleai/gemini-1.5-flash-latest',
        prompt: [
            {media: {url: imageDataUri}},
            {text: 'You are an expert in crowd analysis. Analyze the provided image and describe the crowd gathering. Note any areas of high density, potential risks, or interesting patterns.'},
        ]
    });

    const analysisText = analysisResult.text;
     if (!analysisText) {
      throw new Error('The AI model did not return a text analysis.');
    }

    return {
      analysis: analysisText,
    };
    */
  }
);
