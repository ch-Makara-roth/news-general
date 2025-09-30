'use server';
/**
 * @fileOverview An AI flow to summarize a list of news headlines for a specific topic.
 *
 * - summarizeNews - A function that uses an LLM to generate a brief summary.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { unstable_noStore as noStore } from 'next/cache';

const SummarizeNewsInputSchema = z.object({
  topic: z.string().describe('The main topic or category of the news (e.g., "Technology", "Sports in Canada").'),
  titles: z.array(z.string()).describe('A list of news article titles to summarize.'),
});

const SummarizeNewsOutputSchema = z.string().describe('A concise, engaging summary (2-3 sentences) of the provided news headlines for the given topic.');

export async function summarizeNews(topic: string, titles: string[]): Promise<string> {
    noStore();
    if (!titles || titles.length === 0) {
        return "";
    }
    const input = { topic, titles };
    try {
        const summary = await summarizeNewsFlow(input);
        console.log(`AI Genkit: Generated summary for topic "${topic}"`);
        return summary;
    } catch (error) {
        console.error("Error in summarizeNews flow:", error);
        return ""; // Return empty string on error to avoid breaking the UI
    }
}

const summarizeNewsFlow = ai.defineFlow(
  {
    name: 'summarizeNewsFlow',
    inputSchema: SummarizeNewsInputSchema,
    outputSchema: SummarizeNewsOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
        name: 'summarizeNewsPrompt',
        input: { schema: SummarizeNewsInputSchema },
        output: { schema: SummarizeNewsOutputSchema },
        prompt: `You are a helpful news assistant. Based on the topic "{{{topic}}}", write a short, engaging summary (2-3 sentences) of the following list of article headlines. This summary should provide a high-level overview of the current events in that topic.

        Article Headlines:
        {{#each titles}}
        - {{{this}}}
        {{/each}}
        
        Generate the summary only.`,
    });

    const {output} = await prompt(input);
    return output || "Stay updated with the latest headlines on this topic.";
  }
);