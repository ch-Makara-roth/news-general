'use server';
/**
 * @fileOverview An AI flow to find related keywords for a news article.
 *
 * - findRelatedKeywords - A function that uses an LLM to extract relevant keywords.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RelatedKeywordsInputSchema = z.object({
  title: z.string().describe('The title of the article.'),
  content: z.string().optional().describe('The content of the article.'),
});

const RelatedKeywordsOutputSchema = z.array(z.string()).describe("A list of 2-3 relevant keywords based on the article's content.");

export async function findRelatedKeywords(
  articleTitle: string,
  articleContent: string | null
): Promise<string[]> {
    const input = { title: articleTitle, content: articleContent || undefined };
    try {
        const keywords = await findRelatedKeywordsFlow(input);
        console.log(`AI Genkit: Suggested keywords: ${keywords.join(', ')}`);
        return keywords;
    } catch (error) {
        console.error("Error in findRelatedKeywords flow:", error);
        // Fallback to a simple mechanism if the flow fails
        return articleTitle.split(' ').slice(0, 2);
    }
}

const findRelatedKeywordsFlow = ai.defineFlow(
  {
    name: 'findRelatedKeywordsFlow',
    inputSchema: RelatedKeywordsInputSchema,
    outputSchema: RelatedKeywordsOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
        name: 'relatedKeywordsPrompt',
        input: { schema: RelatedKeywordsInputSchema },
        output: { schema: RelatedKeywordsOutputSchema },
        prompt: `From the following article title and content, extract the 2 or 3 most relevant and specific keywords or short phrases. Focus on named entities, specific topics, or key subjects. Avoid generic terms.

        Title: {{{title}}}
        Content: {{{content}}}

        Return only a JSON array of strings.`,
    });

    const {output} = await prompt(input);
    return output || [];
  }
);