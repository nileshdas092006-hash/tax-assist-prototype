/**
 * Master ITR form schema — the single source of truth for which fields each
 * form asks for, and how to ask for them in plain language.
 *
 * Consumed by:
 *   - DynamicFormFillerScreen  (renders one field at a time from requiredFields)
 *   - TaxSummaryScreen          (reads the income.* / deductions.* values back)
 *
 * Field id convention: `<bucket>.<key>` — the filler splits on "." and writes the
 * answer to `payload[bucket][key]`, so every value lands in a predictable place.
 *   income.*       -> counted toward gross income in TaxSummaryScreen
 *   deductions.*   -> subtracted from gross income
 *   disqualifier.* -> a yes/no eligibility check; recorded, not used in the maths
 *
 * (The flat ids in a bare spec — `gross_salary` — would collide across forms and
 * bypass this routing, so the bucket prefix is deliberate.)
 *
 * Copy rule: plainLanguageQuestion and label are what the citizen reads. Keep
 * them jargon-free — no bare section numbers (80C, 44ADA, Chapter VI-A). The
 * optional `whyWeAsk` string holds the official section reference, shown only
 * when the user taps "Why we ask". The `// Source:` comments are for maintainers.
 *
 * Scope: individual / HUF returns only (ITR-1 to ITR-4). ITR-5/6/7 are excluded.
 * Every figure is treated in a deliberately simplified way — see DISCLAIMER.
 */

export const ITR_SCHEMA_DISCLAIMER =
  'Simplified — a common set of fields based on AY 2026-27 rules, not the full official form. Check the exact requirements at incometax.gov.in.';

export const ITR_FORM_SCHEMAS = {
  'ITR-1': {
    name: 'ITR-1 (Sahaj)',
    description:
      'For someone whose income is mainly salary or pension, perhaps one house and some bank interest, and under ₹50 lakh in total.',
    requiredFields: [
      {
        // Source: Schedule S (Details of Income from Salary)
        id: 'income.gross_salary',
        label: 'Salary or Pension',
        type: 'currency',
        plainLanguageQuestion:
          'What was your total salary or pension for the year, before any tax or deductions were taken out?',
      },
      {
        // Source: Schedule HP (Details of Income from House Property)
        id: 'income.house_property_income',
        label: 'Rental Income',
        type: 'currency',
        plainLanguageQuestion:
          "How much rent did you receive this year from a property you own? Enter 0 if you don't own one, or you live in it yourself.",
      },
      {
        // Source: Schedule OS (Income from Other Sources)
        id: 'income.savings_and_fd_interest',
        label: 'Interest Income',
        type: 'currency',
        plainLanguageQuestion:
          'How much interest did you earn this year from bank savings accounts and fixed deposits?',
      },
      {
        // Source: Schedule OS (Income from Other Sources)
        id: 'income.dividend_income',
        label: 'Dividend Income',
        type: 'currency',
        plainLanguageQuestion:
          'How much did you receive this year as dividends from shares or mutual funds?',
      },
      {
        // Source: Schedule VI-A (Deductions under Chapter VI-A)
        id: 'deductions.total',
        label: 'Tax-Saving Deductions',
        type: 'currency',
        plainLanguageQuestion:
          'Add up the tax-saving amounts you want to claim — money you put into things like Provident Fund (PF), PPF, life or health insurance premiums, ELSS mutual funds, or NPS. What is the total?',
        whyWeAsk:
          'These are the deductions allowed under Chapter VI-A of the Income Tax Act — mainly Section 80C (investments and premiums), Section 80D (health insurance) and Section 80CCD (NPS).',
      },
      {
        // Source: Schedule TDS (Details of Tax Deducted at Source)
        id: 'income.tds_deducted',
        label: 'Tax Already Paid',
        type: 'currency',
        plainLanguageQuestion:
          'Some tax may already have been paid on your behalf this year — your employer takes it from your salary, and your bank takes it from interest. How much was deducted this way? Your Form 16 or a bank interest certificate shows the amount.',
        whyWeAsk:
          'This is TDS — Tax Deducted at Source (Schedule TDS on the return). It counts toward the tax you owe, so it is subtracted at the end and you pay only the balance.',
      },
      {
        // Source: Part A-GEN (Eligibility check — disqualifies from ITR-1 if yes)
        id: 'disqualifier.capital_gains_check',
        label: 'Sold Any Investments?',
        type: 'boolean',
        plainLanguageQuestion:
          'Did you sell any shares, mutual funds, or property this year and make a profit on it?',
      },
      {
        // Source: Part A-GEN (Eligibility check — disqualifies from ITR-1 if yes)
        id: 'disqualifier.foreign_assets_check',
        label: 'Anything Abroad?',
        type: 'boolean',
        plainLanguageQuestion:
          'Do you own any money, property, or investments outside India, or earn any income from abroad?',
      },
    ],
  },

  'ITR-2': {
    name: 'ITR-2',
    description:
      'For people with no business income who have profit from selling investments or property, more than one house, assets abroad, or income above ₹50 lakh.',
    requiredFields: [
      {
        // Source: Schedule S (Details of Income from Salary)
        id: 'income.gross_salary',
        label: 'Salary or Pension',
        type: 'currency',
        plainLanguageQuestion:
          'What was your total salary or pension for the year, before deductions?',
      },
      {
        // Source: Schedule HP (Details of Income from House Property)
        id: 'income.house_property_income',
        label: 'Rental Income',
        type: 'currency',
        plainLanguageQuestion:
          'How much did you earn from renting out property this year, across all the properties you own? Enter 0 if none.',
      },
      {
        // Source: Schedule CG (Capital Gains)
        id: 'income.short_term_gains',
        label: 'Profit from Selling Investments',
        type: 'currency',
        plainLanguageQuestion:
          'How much profit did you make this year from selling shares, mutual funds, or property?',
      },
      {
        // Source: Schedule OS (Income from Other Sources)
        id: 'income.savings_and_fd_interest',
        label: 'Interest & Other Income',
        type: 'currency',
        plainLanguageQuestion:
          'How much did you earn this year from bank interest, deposits, and any other small income?',
      },
      {
        // Source: Schedule OS (Income from Other Sources)
        id: 'income.dividend_income',
        label: 'Dividend Income',
        type: 'currency',
        plainLanguageQuestion: 'How much did you receive as dividends this year?',
      },
      {
        // Source: Schedule VI-A (Deductions under Chapter VI-A)
        id: 'deductions.total',
        label: 'Tax-Saving Deductions',
        type: 'currency',
        plainLanguageQuestion:
          'Add up the tax-saving amounts you want to claim — money you put into things like Provident Fund (PF), PPF, life or health insurance premiums, ELSS mutual funds, or NPS. What is the total?',
        whyWeAsk:
          'These are the deductions allowed under Chapter VI-A of the Income Tax Act — mainly Section 80C (investments and premiums), Section 80D (health insurance) and Section 80CCD (NPS).',
      },
      {
        // Source: Schedule TDS (Details of Tax Deducted at Source)
        id: 'income.tds_deducted',
        label: 'Tax Already Paid',
        type: 'currency',
        plainLanguageQuestion:
          'Some tax may already have been paid on your behalf this year — an employer takes it from salary, a bank takes it from interest, a buyer takes it on a property sale. How much was deducted this way? Your Form 16, Form 26AS or an interest certificate shows the amount.',
        whyWeAsk:
          'This is TDS — Tax Deducted at Source (Schedule TDS). It counts toward the tax you owe, so it is subtracted at the end and you pay only the balance.',
      },
      {
        // Source: Part A-GEN (Eligibility check — disqualifies from ITR-2 if yes)
        id: 'disqualifier.business_income_check',
        label: 'Any Business Income?',
        type: 'boolean',
        plainLanguageQuestion:
          'Do you earn anything from running a business, trade, or profession of your own? If yes, a different return form applies.',
        whyWeAsk:
          'Any business or professional income rules out ITR-2 — you would file ITR-3 (with full accounts) or ITR-4 (simple scheme) instead.',
      },
    ],
  },

  'ITR-3': {
    name: 'ITR-3',
    description:
      'For people running a business or profession who keep a full set of accounting records.',
    requiredFields: [
      {
        // Source: Schedule BP (Computation of income from business or profession)
        id: 'income.gross_receipts',
        label: 'Business / Profession Profit',
        type: 'currency',
        plainLanguageQuestion:
          'What was your profit from your business or profession this year — the money you earned minus your business expenses?',
      },
      {
        // Source: Schedule S (Details of Income from Salary)
        id: 'income.gross_salary',
        label: 'Salary (if any)',
        type: 'currency',
        plainLanguageQuestion:
          'Do you also receive a salary or pension? Enter the amount, or 0 if not.',
      },
      {
        // Source: Schedule CG (Capital Gains)
        id: 'income.short_term_gains',
        label: 'Profit from Selling Investments',
        type: 'currency',
        plainLanguageQuestion:
          'How much profit did you make from selling shares, mutual funds, or property this year? Enter 0 if none.',
      },
      {
        // Source: Schedule OS (Income from Other Sources)
        id: 'income.savings_and_fd_interest',
        label: 'Interest & Other Income',
        type: 'currency',
        plainLanguageQuestion:
          'How much did you earn this year from bank interest and other small income?',
      },
      {
        // Source: Schedule VI-A (Deductions under Chapter VI-A)
        id: 'deductions.total',
        label: 'Tax-Saving Deductions',
        type: 'currency',
        plainLanguageQuestion:
          'Add up the tax-saving amounts you want to claim — money you put into things like Provident Fund (PF), PPF, life or health insurance premiums, ELSS mutual funds, or NPS. What is the total?',
        whyWeAsk:
          'These are the deductions allowed under Chapter VI-A — mainly Section 80C (investments and premiums), Section 80D (health insurance) and Section 80CCD (NPS).',
      },
      {
        // Source: Schedule TDS (Details of Tax Deducted at Source)
        id: 'income.tds_deducted',
        label: 'Tax Already Paid',
        type: 'currency',
        plainLanguageQuestion:
          'Some tax may already have been paid on your behalf this year — from salary, from bank interest, or on your business receipts. How much was deducted this way? Your Form 16, Form 26AS or an interest certificate shows the amount.',
        whyWeAsk:
          'This is TDS — Tax Deducted at Source (Schedule TDS). It counts toward the tax you owe, so it is subtracted at the end.',
      },
      {
        // Source: Part A-GEN (General Information)
        id: 'disqualifier.books_maintained_check',
        label: 'Keep Full Accounts?',
        type: 'boolean',
        plainLanguageQuestion:
          'Do you keep a complete set of accounting records for your business — a full record of all income and expenses?',
        whyWeAsk:
          'ITR-3 is the form for business or professional income where you maintain regular books of account (Schedule BP).',
      },
      {
        // Source: Part A-GEN (General Information - Audit Information)
        id: 'disqualifier.audit_check',
        label: 'Accounts Audited?',
        type: 'boolean',
        plainLanguageQuestion:
          'Does an accountant have to formally audit your business accounts this year? This is usually required only for larger businesses.',
        whyWeAsk:
          'A tax audit under Section 44AB is generally required once turnover crosses ₹1 crore (₹10 crore if nearly all receipts are digital), or professional receipts cross ₹50 lakh.',
      },
    ],
  },

  'ITR-4': {
    name: 'ITR-4 (Sugam)',
    description:
      'For smaller businesses and professionals who use the simple scheme, where tax is based on a set share of income, with total income up to ₹50 lakh.',
    requiredFields: [
      {
        // Source: Schedule BP (Computation of income from business or profession - Section 44AD/ADA/AE)
        id: 'income.gross_receipts',
        label: 'Business / Profession Receipts',
        type: 'currency',
        plainLanguageQuestion:
          'What was the total amount you received from your business or profession this year, before taking out any expenses?',
        whyWeAsk:
          'In the simple scheme your taxable profit is a fixed percentage of this figure — you do not deduct actual expenses.',
      },
      {
        // Source: Schedule BP (44ADA profession vs 44AD business — sets the deemed-profit rate)
        id: 'disqualifier.presumptive_profession_check',
        label: 'Paid for Your Expertise?',
        type: 'boolean',
        plainLanguageQuestion:
          'Do you earn by offering professional services — like a doctor, lawyer, architect, accountant, engineer, designer, or freelance consultant? Choose No if you run a shop, trade, manufacturing, or transport business.',
        whyWeAsk:
          'This sets your deemed-profit rate: professionals fall under Section 44ADA (half of receipts treated as profit); trades and shops under Section 44AD; goods transport under Section 44AE.',
      },
      {
        // Source: Schedule S (Details of Income from Salary)
        id: 'income.gross_salary',
        label: 'Salary (if any)',
        type: 'currency',
        plainLanguageQuestion:
          'Do you also receive a salary or pension? Enter the amount, or 0 if not.',
      },
      {
        // Source: Schedule OS (Income from Other Sources)
        id: 'income.savings_and_fd_interest',
        label: 'Interest Income',
        type: 'currency',
        plainLanguageQuestion:
          'How much did you earn from bank interest and deposits this year?',
      },
      {
        // Source: Schedule VI-A (Deductions under Chapter VI-A)
        id: 'deductions.total',
        label: 'Tax-Saving Deductions',
        type: 'currency',
        plainLanguageQuestion:
          'Add up the tax-saving amounts you want to claim — money you put into things like Provident Fund (PF), PPF, life or health insurance premiums, ELSS mutual funds, or NPS. What is the total?',
        whyWeAsk:
          'These are the deductions allowed under Chapter VI-A — mainly Section 80C (investments and premiums), Section 80D (health insurance) and Section 80CCD (NPS).',
      },
      {
        // Source: Schedule TDS (Details of Tax Deducted at Source)
        id: 'income.tds_deducted',
        label: 'Tax Already Paid',
        type: 'currency',
        plainLanguageQuestion:
          'Some tax may already have been paid on your behalf this year — from salary, from bank interest, or on your business receipts. How much was deducted this way? Your Form 16, Form 26AS or an interest certificate shows the amount.',
        whyWeAsk:
          'This is TDS — Tax Deducted at Source (Schedule TDS). It counts toward the tax you owe, so it is subtracted at the end.',
      },
      {
        // Source: Part A-GEN (Eligibility check for the presumptive scheme)
        id: 'disqualifier.presumptive_eligible_check',
        label: 'Use the Simple Scheme?',
        type: 'boolean',
        whyWeAsk:
          'This is the presumptive-taxation scheme (Sections 44AD / 44ADA / 44AE) — you skip detailed accounts and declare a fixed percentage of receipts as profit.',
        plainLanguageQuestion:
          'Are you happy for your tax to be worked out from a set percentage of your income, instead of preparing detailed profit-and-loss accounts? Most small businesses and professionals choose this.',
      },
    ],
  },
};

export default ITR_FORM_SCHEMAS;
