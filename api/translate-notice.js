import OpenAI from 'openai';

// Server-side only. The key is read from the serverless environment and never
// reaches the browser bundle.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Exact system prompt carried over verbatim from the previous client implementation
// (src/utils/translateNotice.js), including its original line breaks.
const SYSTEM_PROMPT = `You are translating an Indian Income Tax defective-return notice for a non-expert citizen. Given the raw official notice text, output JSON with exactly three keys:
1) 'plain_summary': 2-3 sentences, 8th-grade reading level, absolutely no jargon.
2) 'what_they_need_to_do': A one-sentence action step.
3) 'guided_questions': An array of 1-3 simple questions (objects with 'id', 'question', 'type' representing boolean or numeric) that would resolve this specific defect.
CRITICAL RULE: Never invent tax rules. If the raw defect text does not clearly imply a fix, say so in 'what_they_need_to_do' instead of guessing.`;

/**
 * Vercel serverless function (Node.js).
 * POST { rawLegalText: string } -> 200 { plain_summary, what_they_need_to_do, guided_questions }
 * Any upstream failure returns a non-2xx status so the client falls back to mock data.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Server is not configured with OPENAI_API_KEY.' });
  }

  // Vercel parses JSON bodies automatically, but accept a raw string too.
  const body = typeof req.body === 'string' ? safeParse(req.body) : (req.body || {});
  const rawLegalText = body && body.rawLegalText;

  if (!rawLegalText || typeof rawLegalText !== 'string') {
    return res.status(400).json({ error: 'Request body must include a "rawLegalText" string.' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: rawLegalText },
      ],
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    return res.status(200).json(parsed);
  } catch (error) {
    console.error('translate-notice: OpenAI call failed:', error);
    const status = error && error.status === 429 ? 429 : 502;
    return res.status(status).json({ error: 'Translation service unavailable.' });
  }
}

function safeParse(str) {
  try {
    return JSON.parse(str || '{}');
  } catch {
    return {};
  }
}
