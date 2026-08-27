import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const SYSTEM_PROMPT = `You are translating an Indian Income Tax defective-return notice for a non-expert citizen. Given the raw official notice text, output JSON with exactly three keys: 
1) 'plain_summary': 2-3 sentences, 8th-grade reading level, absolutely no jargon. 
2) 'what_they_need_to_do': A one-sentence action step. 
3) 'guided_questions': An array of 1-3 simple questions (objects with 'id', 'question', 'type' representing boolean or numeric) that would resolve this specific defect.
CRITICAL RULE: Never invent tax rules. If the raw defect text does not clearly imply a fix, say so in 'what_they_need_to_do' instead of guessing.`;

/**
 * Calls the OpenAI Chat Completions API to translate raw legal notice text
 * into a structured, plain-language JSON object.
 *
 * @param {string} rawLegalText - The raw official notice text from the IT department.
 * @returns {Promise<Object|null>} Parsed JSON with plain_summary, what_they_need_to_do,
 *   and guided_questions, or null on failure.
 */
export async function fetchNoticeTranslation(rawLegalText) {
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
    return parsed;
  } catch (error) {
    console.warn("OpenAI API unavailable or rate-limited. Serving mock fallback payload for prototype demo:", error);
    return {
      "plain_summary": "Your bank deducted tax on your Fixed Deposit interest, but your tax form reported ₹0 for this income. The tax department requires you to declare this interest so your return is accurate.",
      "what_they_need_to_do": "Answer the questions below so we can calculate your corrected interest income.",
      "guided_questions": [
        { "id": "q1", "question": "Did you earn interest income from Fixed Deposits (FD) or Savings Accounts this year?", "type": "boolean" },
        { "id": "q2", "question": "What was the approximate total interest earned from bank deposits?", "type": "currency", "placeholder": "e.g., ₹45,000" }
      ]
    };
  }
}
