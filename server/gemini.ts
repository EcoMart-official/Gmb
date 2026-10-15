import { GoogleGenAI } from '@google/genai';

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
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

interface GenerateDraftOptions {
  businessName: string;
  category: string;
  productsAndServices?: string;
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
Output ONLY the review text itself, with no introductory or concluding pleasantries.`;

  const prompt = `Write a ${options.starRating}-star customer review for "${options.businessName}" (${options.category}).
Key details about the business:
- Offerings: ${options.productsAndServices || 'High quality products and services'}
- Atmosphere / Experience: ${options.customerExperience || 'Clean, welcoming and professional'}

Things I specifically loved and want to mention:
${options.highlightChips.length > 0 ? options.highlightChips.map(c => `- ${c}`).join('\n') : '- Great service and quality'}

Keywords to blend in naturally if appropriate:
${(options.customKeywords || []).join(', ')}

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
  customerExperience?: string;
  authorName: string;
  starRating: number;
  reviewText: string;
}

export async function generateBusinessReviewReply(options: GenerateReplyOptions): Promise<string> {
  const ai = getAiClient();

  const systemInstruction = `You are the owner / manager of "${options.businessName}".
Your brand tone is: ${options.brandTone || 'friendly and professional'}.
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
