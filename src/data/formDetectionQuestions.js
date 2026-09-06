/**
 * Deterministic ITR form-detection engine for individual taxpayers, AY 2026-27.
 *
 * Fully offline: a fixed decision tree plus a pure resolver. No API, no model.
 * ITR-5 / ITR-6 / ITR-7 (firms, LLPs, companies, trusts) are out of scope — this
 * only distinguishes ITR-1, ITR-2, ITR-3 and ITR-4 for an individual / HUF.
 *
 * Decision tree
 *   Q1  business/professional income?
 *        yes -> Q2   no -> Q3
 *   Q2  presumptive scheme, turnover < ₹2cr / receipts < ₹50L?
 *        yes -> ITR-4   no -> ITR-3
 *   Q3  capital gains beyond small listed equity / foreign assets / unlisted shares?
 *        yes -> ITR-2   no -> Q4
 *   Q4  total income > ₹50L, or more than two house properties?
 *        yes -> ITR-2   no -> ITR-1
 */

export const FORM_DETAILS = {
  'ITR-1': {
    name: 'ITR-1 (Sahaj)',
    blurb:
      'For a resident individual whose income is salary or pension, one house property, and other income such as bank interest — with total income up to ₹50 lakh.',
  },
  'ITR-2': {
    name: 'ITR-2',
    blurb:
      'For an individual or HUF with no business or professional income, but with capital gains, more than one house property, foreign assets, unlisted shares, or total income above ₹50 lakh.',
  },
  'ITR-3': {
    name: 'ITR-3',
    blurb:
      'For an individual or HUF carrying on a business or profession and maintaining regular books of account.',
  },
  'ITR-4': {
    name: 'ITR-4 (Sugam)',
    blurb:
      'For a resident with presumptive business or professional income under Sections 44AD / 44ADA / 44AE, and total income up to ₹50 lakh.',
  },
};

export const FORM_DETECTION_TREE = {
  start: 'business_income',
  questions: {
    business_income: {
      id: 'business_income',
      text: 'Do you have income from a business or profession (not just a salary)?',
      help: 'Freelancing, consulting, a shop or firm, or trading run as a business all count.',
      yes: { next: 'presumptive', recap: 'Has business or professional income' },
      no: { next: 'capital_or_foreign', recap: 'Salary / pension only — no business income' },
    },
    presumptive: {
      id: 'presumptive',
      text: 'Is that business under presumptive taxation (no full books of account), with turnover under ₹2 crore, or professional receipts under ₹50 lakh?',
      help: 'Presumptive taxation is Sections 44AD, 44ADA and 44AE — you declare a fixed share of turnover as profit instead of keeping detailed accounts.',
      yes: { form: 'ITR-4', recap: 'Business is under the presumptive scheme' },
      no: { form: 'ITR-3', recap: 'Business keeps regular books of account' },
    },
    capital_or_foreign: {
      id: 'capital_or_foreign',
      text: 'Do you have capital gains beyond small listed-equity amounts, own any foreign assets, or hold unlisted company shares?',
      help: 'Sale of property, mutual funds or shares above the small exempt limit; ESOPs or stock in a company outside India; any overseas bank account or investment.',
      yes: { form: 'ITR-2', recap: 'Has capital gains, foreign assets, or unlisted shares' },
      no: { next: 'income_threshold', recap: 'No capital gains, foreign assets, or unlisted shares' },
    },
    income_threshold: {
      id: 'income_threshold',
      text: 'Is your total income above ₹50 lakh, or do you own more than two house properties?',
      help: 'Total income is before deductions but after exemptions — salary plus interest plus any other income.',
      yes: { form: 'ITR-2', recap: 'Income above ₹50 lakh or more than two house properties' },
      no: { form: 'ITR-1', recap: 'Income up to ₹50 lakh, up to two house properties' },
    },
  },
};

const MAX_DEPTH = 3; // longest path: business_income -> capital_or_foreign -> income_threshold

function branchFor(node, answer) {
  if (answer === 'yes') return node.yes;
  if (answer === 'no') return node.no;
  return null;
}

/**
 * Walk the tree following `answers` ({ [questionId]: 'yes' | 'no' }).
 * @returns {{ form: string|null, path: string[] }}
 *   `form` is set once a leaf is reached; `path` is the ordered list of
 *   question ids that have been answered so far.
 */
export function resolveForm(answers = {}) {
  const { start, questions } = FORM_DETECTION_TREE;
  const path = [];
  let nodeId = start;
  const seen = new Set();

  while (nodeId && !seen.has(nodeId)) {
    seen.add(nodeId);
    const node = questions[nodeId];
    if (!node) break;

    const branch = branchFor(node, answers[nodeId]);
    if (!branch) return { form: null, path }; // this question not yet answered

    path.push(nodeId);
    if (branch.form) return { form: branch.form, path };
    nodeId = branch.next;
  }

  return { form: null, path };
}

/**
 * The next question the user still needs to answer, or `null` once a form is
 * resolved.
 * @returns {{ id: string, text: string, help?: string }|null}
 */
export function nextQuestion(answers = {}) {
  const { start, questions } = FORM_DETECTION_TREE;
  let nodeId = start;
  const seen = new Set();

  while (nodeId && !seen.has(nodeId)) {
    seen.add(nodeId);
    const node = questions[nodeId];
    if (!node) return null;

    const branch = branchFor(node, answers[nodeId]);
    if (!branch) return node;
    if (branch.form) return null;
    nodeId = branch.next;
  }

  return null;
}

/**
 * Human-readable recap of every answered step, for the result screen.
 * @returns {{ id: string, question: string, answer: 'yes'|'no', recap: string }[]}
 */
export function answeredSteps(answers = {}) {
  const { questions } = FORM_DETECTION_TREE;
  return resolveForm(answers).path.map((id) => {
    const node = questions[id];
    const answer = answers[id];
    return { id, question: node.text, answer, recap: branchFor(node, answer).recap };
  });
}

/** Progress through the tree as a 0–1 fraction, for the progress bar. */
export function progress(answers = {}) {
  const answered = resolveForm(answers).path.length;
  const done = nextQuestion(answers) === null && answered > 0;
  return done ? 1 : Math.min(answered / MAX_DEPTH, 0.95);
}
