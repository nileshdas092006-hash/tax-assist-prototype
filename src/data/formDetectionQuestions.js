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
      'For someone whose income is mainly salary or pension, perhaps one house and some bank interest, and under ₹50 lakh in total.',
  },
  'ITR-2': {
    name: 'ITR-2',
    blurb:
      'For people with no business income who have profit from selling investments or property, more than one house, assets abroad, or income above ₹50 lakh.',
  },
  'ITR-3': {
    name: 'ITR-3',
    blurb:
      'For people running a business or profession who keep a full set of accounting records.',
  },
  'ITR-4': {
    name: 'ITR-4 (Sugam)',
    blurb:
      'For smaller businesses and professionals who use the simple scheme, where tax is worked out from a set share of income, with total income up to ₹50 lakh.',
  },
};

export const FORM_DETECTION_TREE = {
  start: 'business_income',
  questions: {
    business_income: {
      id: 'business_income',
      text: 'Do you earn money from your own business or profession — not just a salary?',
      help: 'Freelancing, consulting, a shop, a firm, or trading run as a business all count.',
      whyWeAsk:
        'Any business or professional income rules out ITR-1 and ITR-2 — it needs ITR-3 (full accounts) or ITR-4 (the simple scheme).',
      yes: { next: 'presumptive', recap: 'Earns from a business or profession' },
      no: { next: 'capital_or_foreign', recap: 'Salary or pension only — no business income' },
    },
    presumptive: {
      id: 'presumptive',
      text: 'For that business or profession, do you want the simple scheme — where you declare a set percentage of your income as profit and skip detailed account books?',
      help: 'This suits smaller businesses and professionals. Instead of keeping full accounts, you treat a fixed share of your total receipts as your taxable profit.',
      whyWeAsk:
        '"Yes" leads to ITR-4 and presumptive taxation (Sections 44AD / 44ADA / 44AE). "No" leads to ITR-3, filed with regular books of account.',
      yes: { form: 'ITR-4', recap: 'Wants the simple, set-percentage scheme' },
      no: { form: 'ITR-3', recap: 'Keeps full business accounts' },
    },
    capital_or_foreign: {
      id: 'capital_or_foreign',
      text: 'Did you sell shares, mutual funds, or property at a profit this year, or do you own anything abroad or shares in a company that is not listed on a stock exchange?',
      help: 'This covers profit from selling investments or property, any bank account or asset outside India, and shares in companies that are not publicly listed.',
      whyWeAsk:
        'Capital gains, any foreign asset (Schedule FA), or unlisted shares each require ITR-2 instead of ITR-1.',
      yes: { form: 'ITR-2', recap: 'Has investment/property profit, foreign assets, or unlisted shares' },
      no: { next: 'income_threshold', recap: 'None of: investment profit, foreign assets, unlisted shares' },
    },
    income_threshold: {
      id: 'income_threshold',
      text: 'Is your total income for the year above ₹50 lakh, or do you own more than two houses?',
      help: 'Add up everything — salary, interest, rent, and any other income — before tax-saving deductions.',
      whyWeAsk:
        'ITR-1 (Sahaj) is only allowed up to ₹50 lakh total income and two house properties; above either limit, ITR-2 applies.',
      yes: { form: 'ITR-2', recap: 'Income above ₹50 lakh, or more than two houses' },
      no: { form: 'ITR-1', recap: 'Income up to ₹50 lakh, and up to two houses' },
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
