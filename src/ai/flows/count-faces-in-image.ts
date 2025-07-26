
'use server';

/**
 * @fileOverview Flow to count faces in an image.
 *
 * - countFacesInImage - A function that analyzes an image and returns the number of faces detected.
 * - CountFacesInImageInput - The input type for the countFacesInImage function.
 * - CountFacesInImageOutput - The return type for the countFacesInImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CountFacesInImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type CountFacesInImageInput = z.infer<typeof CountFacesInImageInputSchema>;

const CountFacesInImageOutputSchema = z.object({
  faceCount: z.number().describe("The number of human faces detected in the image."),
});
export type CountFacesInImageOutput = z.infer<typeof CountFacesInImageOutputSchema>;


export async function countFacesInImage(
  input: CountFacesInImageInput
): Promise<CountFacesInImageOutput> {
  return countFacesInImageFlow(input);
}

const countFacesPrompt = ai.definePrompt({
    name: 'countFacesPrompt',
    input: { schema: CountFacesInImageInputSchema },
    output: { schema: CountFacesInImageOutputSchema },
    prompt: `Analyze the provided image and count the number of human faces visible. Provide only the total count.

    Image: {{media url=imageDataUri}}`
});

const countFacesInImageFlow = ai.defineFlow(
  {
    name: 'countFacesInImageFlow',
    inputSchema: CountFacesInImageInputSchema,
    outputSchema: CountFacesInImageOutputSchema,
  },
  async (input) => {
    const { output } = await countFacesPrompt(input);
    if (output === null) {
        return { faceCount: 0 }
    }
    return output;
  }
);
