import { GoogleGenAI } from '@google/genai';

export function getAiClient(apiKeyOverride?: string): GoogleGenAI | null {
  const apiKey = (apiKeyOverride || process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export async function testGeminiApiKey(apiKey: string): Promise<{ valid: boolean; message: string }> {
  const key = apiKey.trim();
  if (!key) {
    return { valid: false, message: 'Please provide a valid Gemini API key.' };
  }
  try {
    const ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Respond with "Ready"',
    });
    if (response && response.text) {
      return { valid: true, message: 'Connected to Gemini 3.8 Flash successfully!' };
    }
    return { valid: false, message: 'Received empty response from Gemini API.' };
  } catch (err: any) {
    return { valid: false, message: err?.message || 'Authentication failed. Please verify your API key.' };
  }
}

interface GenerateDraftOptions {
  businessName: string;
  category: string;
  productsAndServices?: string;
  shopAiDetails?: string;
  reviewWritingRules?: string;
  customerExperience?: string;
  brandTone?: string;
  starRating: number;
  highlightChips: string[];
  customKeywords?: string[];
  language?: string;
}

export async function generateCustomerReviewDraft(options: GenerateDraftOptions): Promise<string> {
  const ai = getAiClient();
  const lang = options.language || 'English';

  const systemInstruction = `You are a real, satisfied customer writing a genuine, organic Google Business Profile review.
Write in first-person natural perspective. Avoid sounding like an advertisement, marketing copy, or an AI bot.
Do NOT use overly formal words, corporate buzzwords, hashtags, or quotation marks around the review.
Follow these review writing guidelines if applicable: ${options.reviewWritingRules || 'Keep it natural, genuine and specific to the service received.'}
Output ONLY the review text itself, with no introductory or concluding pleasantries.`;

  const prompt = `Write a ${options.starRating}-star customer review for "${options.businessName}" (${options.category}).
Key details about the business:
- Services & Offerings: ${options.productsAndServices || 'High quality products and services'}
${options.shopAiDetails ? `- Shop & Business Details: ${options.shopAiDetails}` : ''}
- Atmosphere / Experience: ${options.customerExperience || 'Clean, welcoming and professional'}

Things I specifically loved and want to mention:
${options.highlightChips.length > 0 ? options.highlightChips.map(c => `- ${c}`).join('\n') : '- Great service and quality'}

Keywords to blend in naturally if appropriate:
${(options.customKeywords || []).join(', ')}

Review Style / Tone: ${options.brandTone || 'friendly'}
${options.reviewWritingRules ? `Specific Review Writing Rules to obey:\n${options.reviewWritingRules}` : ''}

Language required: ${lang}.
Keep it concise, authentic, friendly, and approximately 2-4 sentences.`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.8,
        },
      });

      const text = response.text?.trim();
      if (text) {
        return text.replace(/^"|"$/g, '');
      }
    } catch (err: any) {
      console.error('[Gemini Draft Error]', err.message);
    }
  }

  // Fallback high-quality template if Gemini API key is missing or offline
  const chipMentions = options.highlightChips.length > 0
    ? `The ${options.highlightChips.slice(0, 2).join(' and ')} really stood out to me.`
    : 'The attention to detail and care were fantastic.';
  return `I had a wonderful experience at ${options.businessName}! ${chipMentions} Definitely coming back again and highly recommend them to anyone looking for great ${options.category.toLowerCase() || 'service'}.`;
}

interface GenerateReplyOptions {
  businessName: string;
  category: string;
  brandTone: string;
  shopAiDetails?: string;
  reviewWritingRules?: string;
  customerExperience?: string;
  authorName: string;
  starRating: number;
  reviewText: string;
}

export async function generateBusinessReviewReply(options: GenerateReplyOptions): Promise<string> {
  const ai = getAiClient();

  const systemInstruction = `You are the owner / manager of "${options.businessName}".
Your brand tone / review style is: ${options.brandTone || 'friendly and professional'}.
${options.shopAiDetails ? `Business details: ${options.shopAiDetails}` : ''}
${options.reviewWritingRules ? `Review Reply Writing Rules: ${options.reviewWritingRules}` : ''}
Write an official, warm, respectful owner reply to a Google Business Profile customer review.
Acknowledge the customer by name if known (${options.authorName}).
Thank them genuinely for taking the time to share feedback.
Address specific aspects mentioned in their review without being robotic or defensive.
Keep the reply concise (2-3 sentences), warm, and inviting.
Output ONLY the reply text, no quotes or metadata.`;

  const prompt = `Customer Name: ${options.authorName}
Star Rating: ${options.starRating} out of 5 stars
Customer Review Text: "${options.reviewText}"

Please craft a thoughtful, brand-aligned public response to this review.`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const text = response.text?.trim();
      if (text) {
        return text.replace(/^"|"$/g, '');
      }
    } catch (err: any) {
      console.error('[Gemini Reply Error]', err.message);
    }
  }

  // Graceful fallback
  if (options.starRating >= 4) {
    return `Thank you so much for the glowing review, ${options.authorName}! Our team at ${options.businessName} is thrilled you enjoyed your experience. We truly appreciate your support and look forward to welcoming you back soon!`;
  } else {
    return `Hello ${options.authorName}, thank you for sharing your candid feedback. At ${options.businessName}, we hold our standards high and would love the chance to make this right. Please feel free to reach out to us directly so we can assist you.`;
  }
}
