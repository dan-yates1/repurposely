import { Anthropic } from '@anthropic-ai/sdk';

// Initialize the Anthropic client with the API key
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export const generateContent = async (
  originalContent: string,
  outputFormat: string,
  tone: string,
  contentLength: string = 'medium',
  targetAudience: string = 'general'
): Promise<string> => {
  try {
    // Define length guidelines based on the contentLength parameter
    let lengthGuideline = '';
    switch (contentLength) {
      case 'short':
        lengthGuideline = 'Keep it concise and to the point, focusing only on the most essential information.';
        break;
      case 'medium':
        lengthGuideline = 'Include all key points with moderate detail.';
        break;
      case 'long':
        lengthGuideline = 'Provide comprehensive coverage with detailed explanations and examples where appropriate.';
        break;
      default:
        lengthGuideline = 'Include all key points with moderate detail.';
    }

    // Define audience-specific instructions
    let audienceGuideline = '';
    switch (targetAudience) {
      case 'professionals':
        audienceGuideline = 'Target professionals with industry-specific terminology and practical insights.';
        break;
      case 'executives':
        audienceGuideline = 'Focus on high-level strategic insights and business impact for executive decision-makers.';
        break;
      case 'technical':
        audienceGuideline = 'Include technical details and specific implementation considerations for a technical audience.';
        break;
      case 'students':
        audienceGuideline = 'Explain concepts clearly with educational value and learning opportunities in mind.';
        break;
      case 'marketers':
        audienceGuideline = 'Emphasize marketing concepts, engagement strategies, and persuasive elements.';
        break;
      default:
        audienceGuideline = 'Write for a general audience with clear, accessible language.';
    }

    const prompt = `
You are an expert content repurposing assistant. Your task is to transform the following original content into a ${outputFormat} with a ${tone} tone.

Original Content:
${originalContent}

Please rewrite this content as a ${outputFormat} with a ${tone} tone, targeting a ${targetAudience} audience. ${lengthGuideline} ${audienceGuideline}

Format-specific guidelines:
${getFormatGuidelines(outputFormat)}

Tone-specific guidelines:
${getToneGuidelines(tone)}

IMPORTANT: Do not include any introductory text like "Here is the original content repurposed as..." Just start directly with the repurposed content.
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
      let content = response.content[0].text;
      
      // Remove any introductory text like "Here is the original content repurposed as..."
      const introPatterns = [
        /^Here is the original content repurposed as .+?:\s*/i,
        /^Here's the content repurposed as .+?:\s*/i,
        /^I've repurposed the content as .+?:\s*/i,
        /^The original content repurposed as .+?:\s*/i,
        /^Here is your .+? with a .+? tone:\s*/i
      ];
      
      for (const pattern of introPatterns) {
        content = content.replace(pattern, '');
      }
      
      return content.trim();
    }
    
    return 'Unable to generate content. Please try again.';
  } catch (error) {
    console.error('Error generating content with Claude:', error);
    throw new Error('Failed to generate content');
  }
};

// Helper function to get format-specific guidelines
function getFormatGuidelines(outputFormat: string): string {
  switch (outputFormat) {
    case 'twitter-thread':
      return 'Create a thread of 3-5 tweets (280 characters max each). Number each tweet and ensure they flow logically.';
    case 'linkedin-post':
      return 'Create a professional post with paragraphs, bullet points if needed, and a call to action. Include relevant hashtags.';
    case 'facebook-post':
      return 'Create an engaging post with a conversational tone. Include questions to encourage engagement and consider emoji use where appropriate.';
    case 'instagram-caption':
      return 'Create a caption that works well with visual content. Include relevant hashtags and a call to action.';
    case 'email-newsletter':
      return 'Structure with a compelling subject line, greeting, body with sections, and a clear call to action at the end.';
    case 'youtube-script':
      return 'Create a script with an engaging intro, clearly structured content, and a strong call to action at the end.';
    case 'blog-post':
      return 'Structure with a compelling headline, introduction, subheadings for each section, and a conclusion with next steps.';
    case 'press-release':
      return 'Follow standard press release format with headline, dateline, lead paragraph summarizing the news, quotes, and boilerplate information.';
    default:
      return 'Adapt the content to the appropriate format while maintaining the key messages.';
  }
}

// Helper function to get tone-specific guidelines
function getToneGuidelines(tone: string): string {
  switch (tone) {
    case 'professional':
      return 'Use formal language, industry-appropriate terminology, and maintain a business-focused approach.';
    case 'casual':
      return 'Use conversational language, contractions, and a relaxed approach as if talking to a friend.';
    case 'friendly':
      return 'Be warm and approachable, using inclusive language and a positive, supportive tone.';
    case 'humorous':
      return 'Incorporate appropriate humor, light-hearted remarks, and a playful tone while still delivering the key message.';
    case 'formal':
      return 'Use proper grammar, avoid contractions, and maintain a serious, authoritative tone throughout.';
    case 'inspirational':
      return 'Use motivational language, emphasize possibilities, and include uplifting messages that inspire action.';
    case 'persuasive':
      return 'Use compelling arguments, evidence, and persuasive techniques to convince the audience.';
    case 'educational':
      return 'Focus on clear explanations, examples, and a structured approach that facilitates learning.';
    default:
      return 'Maintain a balanced, neutral tone that focuses on clearly communicating the message.';
  }
}
