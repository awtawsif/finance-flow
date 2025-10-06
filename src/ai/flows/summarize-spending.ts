
'use server';
/**
 * @fileOverview A flow that summarizes spending habits.
 *
 * - summarizeSpending - Analyzes expenses and earnings to provide insights.
 * - SpendingSummaryInput - The input type for the summarizeSpending function.
 * - SpendingSummaryOutput - The return type for the summarizeSpending function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SpendingSummaryInputSchema = z.object({
  expenses: z.array(
    z.object({
      id: z.string(),
      description: z.string(),
      amount: z.number(),
      categoryId: z.string(),
      date: z.string(),
    })
  ),
  categories: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  ),
  earnings: z.array(
    z.object({
      id: z.string(),
      description: z.string(),
      amount: z.number(),
      date: z.string(),
    })
  ),
});
export type SpendingSummaryInput = z.infer<typeof SpendingSummaryInputSchema>;

const SpendingSummaryOutputSchema = z.object({
  analysis: z.string().describe('A short, insightful, and friendly analysis of the user\'s spending habits. Mention specific days, categories, or trends. e.g., "On Tuesday, you spent the most on Food." or "Your spending on Transportation has decreased this week."'),
});
export type SpendingSummaryOutput = z.infer<typeof SpendingSummaryOutputSchema>;


export async function summarizeSpending(input: SpendingSummaryInput): Promise<SpendingSummaryOutput> {
  return summarizeSpendingFlow(input);
}

const summarizeSpendingFlow = ai.defineFlow(
  {
    name: 'summarizeSpendingFlow',
    inputSchema: SpendingSummaryInputSchema,
    outputSchema: SpendingSummaryOutputSchema,
  },
  async (input) => {
    const today = new Date();
    const prompt = `You are a helpful financial assistant reviewing a user's recent transactions for a budget app.
    Today's date is ${today.toDateString()}.
    
    Analyze the provided expenses, earnings, and categories to generate a single, concise, and interesting fact or observation about their spending.
    Make it feel personal and insightful. For example, you could point out their highest spending day, their top category, or a recent trend.
    Keep the tone friendly and encouraging.

    Here is the data:
    - Earnings: ${JSON.stringify(input.earnings)}
    - Expenses: ${JSON.stringify(input.expenses)}
    - Categories: ${JSON.stringify(input.categories)}
    `;

    const { output } = await ai.generate({
      prompt,
      output: { schema: SpendingSummaryOutputSchema },
    });
    
    return output!;
  }
);
