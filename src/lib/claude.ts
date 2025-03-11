import { Anthropic } from '@anthropic-ai/sdk';

// Initialize the Anthropic client with the API key
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export const generateContent = async (
  originalContent: string,
  outputFormat: string,
  tone: string
): Promise<string> => {
  try {
    const prompt = `
You are an expert content repurposing assistant. Your task is to transform the following original content into a ${outputFormat} with a ${tone} tone.

Original Content:
${originalContent}

Please rewrite this content as a ${outputFormat} with a ${tone} tone. Ensure the repurposed content maintains the key points and message of the original while optimizing it for the new format.
`;

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Access the text content safely
    if (response.content[0].type === 'text') {
      return response.content[0].text;
    }
    
    return 'Unable to generate content. Please try again.';
  } catch (error) {
    console.error('Error generating content with Claude:', error);
    throw new Error('Failed to generate content');
  }
};
