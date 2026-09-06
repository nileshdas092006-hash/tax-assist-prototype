/**
 * Sends the raw legal notice text to the serverless translation endpoint
 * (`/api/translate-notice`), which performs the OpenAI call server-side so the
 * API key never reaches the browser.
 *
 * @param {string} rawLegalText - The raw official notice text from the IT department.
 * @returns {Promise<Object|null>} Parsed JSON with plain_summary, what_they_need_to_do,
 *   and guided_questions, or the hardcoded mock fallback on any failure.
 */
export async function fetchNoticeTranslation(rawLegalText) {
  try {
    let isDevMode = false;
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      isDevMode = urlParams.get('devmode') === 'verify';
    }

    const response = await fetch('/api/translate-notice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawLegalText, devmode: isDevMode }),
    });

    if (!response.ok) {
      // 429 (rate limit / no credits), 500 (misconfigured), 502 (upstream) etc.
      throw new Error(`Translation endpoint responded with ${response.status}`);
    }

    const parsed = await response.json();
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
