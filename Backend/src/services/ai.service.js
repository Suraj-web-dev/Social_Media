import { GoogleGenAI } from '@google/genai';

const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in backend environment variables.');
  }
  return new GoogleGenAI({ apiKey });
};

// Fallback priority: 3.5-flash is fast & stable, followed by 3.8-flash and flash-latest
const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.8-flash',
  'gemini-flash-latest',
];

/**
 * Generic caller that tries candidate models with automatic fallback
 */
async function generateContentWithFallback(contents, systemInstruction = '') {
  const ai = getAIClient();
  let lastError = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const config = {};
      if (systemInstruction) {
        config.systemInstruction = systemInstruction;
      }

      const response = await ai.models.generateContent({
        model,
        contents,
        config: Object.keys(config).length > 0 ? config : undefined,
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err) {
      console.warn(`[AI Service] Model ${model} failed: ${err.message || err}. Trying fallback...`);
      lastError = err;
    }
  }

  throw new Error(`All Gemini models failed: ${lastError?.message || 'Unknown AI error'}`);
}

/**
 * Clean and parse JSON from Gemini response (handles markdown codeblocks)
 */
function parseJsonSafely(text, fallback) {
  try {
    let clean = text.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return JSON.parse(clean);
  } catch (err) {
    console.error('[AI Service] Failed to parse JSON:', text);
    return fallback;
  }
}

/**
 * 1. AI Caption & Hashtag Generator
 */
export async function generateCaptionsAndHashtags({ prompt, mood = 'Aesthetic', imageBuffer, imageMime }) {
  const systemPrompt = `You are a world-class social media strategist and viral content creator for Instagram and PingUp.
Generate high-converting, trendy, and natural captions and relevant hashtags.
Always respond strictly with a valid JSON object matching this schema:
{
  "captions": [
    "Option 1 caption text with fitting emojis",
    "Option 2 caption text with fitting emojis",
    "Option 3 caption text with fitting emojis"
  ],
  "hashtags": [
    "#hashtag1",
    "#hashtag2",
    "#hashtag3",
    "#hashtag4",
    "#hashtag5",
    "#hashtag6"
  ]
}
Do NOT include any markdown code blocks or additional conversational text outside the JSON.`;

  const userInstruction = `Mood/Tone: ${mood}
User Description or Theme: ${prompt || 'A creative and engaging post'}
Generate 3 distinct caption variations (short, engaging, storytelling) and 6 to 10 trending, relevant hashtags.`;

  const contents = [];

  if (imageBuffer && imageMime) {
    contents.push({
      role: 'user',
      parts: [
        { text: userInstruction },
        {
          inlineData: {
            mimeType: imageMime,
            data: imageBuffer.toString('base64'),
          },
        },
      ],
    });
  } else {
    contents.push({
      role: 'user',
      parts: [{ text: userInstruction }],
    });
  }

  const rawText = await generateContentWithFallback(contents, systemPrompt);
  const fallback = {
    captions: [
      `Embracing the moment ✨ ${prompt || ''}`,
      `Good vibes and better memories 🌟`,
      `Just another day creating magic 💫`,
    ],
    hashtags: ['#PingUp', '#SocialVibes', '#InstaGood', '#ExplorePage', '#Vibes'],
  };

  return parseJsonSafely(rawText, fallback);
}

/**
 * 2. PingAI - Interactive Chat Assistant
 */
export async function chatWithPingAI({ message, history = [], userName = 'friend' }) {
  const systemInstruction = `You are PingAI, the intelligent, friendly, and witty AI companion inside PingUp (an Instagram-like social media platform).
You assist users (${userName}) with:
- Crafting creative captions, bio ideas, and reel concepts.
- Answering questions about coding, technology, social media trends, and life tips.
- Having natural, uplifting, and fun conversations.
Keep your replies concise, charismatic, helpful, and beautifully formatted with bullet points and emojis where appropriate. Never say you are an OpenAI model; you are PingAI, powered by Google Gemini.`;

  // Format previous history for Gemini
  // Gemini expects: { role: 'user' | 'model', parts: [{ text: '...' }] }
  const formattedContents = [];

  if (Array.isArray(history)) {
    // Keep last 10 messages for context efficiency
    const recent = history.slice(-10);
    for (const msg of recent) {
      const role = msg.sender === 'pingai' || msg.role === 'model' || msg.isAI ? 'model' : 'user';
      const text = msg.text || msg.content || '';
      if (text) {
        formattedContents.push({
          role,
          parts: [{ text }],
        });
      }
    }
  }

  // Append latest user message
  formattedContents.push({
    role: 'user',
    parts: [{ text: message }],
  });

  const reply = await generateContentWithFallback(formattedContents, systemInstruction);
  return { reply: reply.trim() };
}

/**
 * 3. One-Tap AI Smart Replies
 */
export async function generateSmartReplies({ context, type = 'comment' }) {
  const systemInstruction = `You are an AI assistant generating 3 quick, ultra-natural, contextual smart-reply suggestions for a social media app.
Return strictly a JSON object with this format:
{
  "replies": [
    "Quick reply 1",
    "Quick reply 2",
    "Quick reply 3"
  ]
}
Requirements:
- Each reply should be 2 to 7 words with an appropriate emoji.
- Sound authentic, friendly, and natural for ${type === 'comment' ? 'an Instagram post comment' : 'a direct chat message'}.
- Do NOT output anything other than valid JSON.`;

  const userPrompt = `Context (${type === 'comment' ? 'Post Caption or Content' : 'Last received chat message'}):
"${context || 'Awesome day!'}"

Provide 3 diverse reply options (e.g. enthusiastic praise, relatable reaction, friendly question or agreement).`;

  const rawText = await generateContentWithFallback(
    [{ role: 'user', parts: [{ text: userPrompt }] }],
    systemInstruction
  );

  const defaultReplies = type === 'comment'
    ? ['Love this! 😍', 'So inspiring ✨', 'Total perfection! 🔥']
    : ['Sounds good! 👍', 'On it right now! 🚀', 'Can’t wait to catch up! 😊'];

  const parsed = parseJsonSafely(rawText, { replies: defaultReplies });
  return parsed.replies && Array.isArray(parsed.replies) && parsed.replies.length > 0
    ? parsed.replies.slice(0, 3)
    : defaultReplies;
}
