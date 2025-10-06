'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const StandardizeCategoryNamesInputSchema = z.object({
  categories: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  ),
});
export type StandardizeCategoryNamesInput = z.infer<typeof StandardizeCategoryNamesInputSchema>;

const StandardizeCategoryNamesOutputSchema = z.object({
  standardizedCategories: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  ),
});
export type StandardizeCategoryNamesOutput = z.infer<typeof StandardizeCategoryNamesOutputSchema>;

export async function standardizeCategoryNames(input: StandardizeCategoryNamesInput): Promise<StandardizeCategoryNamesOutput> {
  return standardizeCategoryNamesFlow(input);
}

const standardizeCategoryNamesFlow = ai.defineFlow(
  {
    name: 'standardizeCategoryNamesFlow',
    inputSchema: StandardizeCategoryNamesInputSchema,
    outputSchema: StandardizeCategoryNamesOutputSchema,
  },
  async (input) => {
    const prompt = `You are a helpful assistant that standardizes category names for a budget app.
    Given a list of category names, please provide a shorter, single-word synonym or a very brief descriptive name for each.
    The goal is to make all names have a similar, short length for better UI alignment. Return the names in JSON format.
    Keep the original ID for each category.

    Here are the categories:
    ${JSON.stringify(input.categories)}
    `;

    const { output } = await ai.generate({
      prompt,
      output: { schema: StandardizeCategoryNamesOutputSchema },
    });
    
    return output!;
  }
);
