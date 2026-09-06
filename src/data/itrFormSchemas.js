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
 * Scope: individual / HUF returns only (ITR-1 to ITR-4). ITR-5/6/7 are excluded.
 * Every figure is treated in a deliberately simplified way — see DISCLAIMER.
 */

export const ITR_SCHEMA_DISCLAIMER =
  'Simplified — illustrative set of common fields based on AY 2026-27 rules, not the complete official form; verify actual requirements at incometax.gov.in.';

export const ITR_FORM_SCHEMAS = {
  'ITR-1': {
    name: 'ITR-1 (Sahaj)',
    description:
      'Resident individual with income from salary or pension, one house property, and other sources such as interest — total income up to ₹50 lakh.',
    requiredFields: [
      {
        // Source: Schedule S (Details of Income from Salary)
        id: 'income.gross_salary',
        label: 'Gross Salary or Pension',
        type: 'currency',
        plainLanguageQuestion:
          'What was your total salary or pension income this year, before any deductions?',
      },
      {
        // Source: Schedule HP (Details of Income from House Property)
        id: 'income.house_property_income',
        label: 'Income from House Property',
        type: 'currency',
        plainLanguageQuestion:
          "What is the net annual income from your house property? Enter 0 if it's self-occupied or you don't own one.",
      },
      {
        // Source: Schedule OS (Income from Other Sources)
        id: 'income.savings_and_fd_interest',
        label: 'Interest Income',
        type: 'currency',
        plainLanguageQuestion:
          'How much total interest did you earn from savings accounts and fixed deposits?',
      },
      {
        // Source: Schedule OS (Income from Other Sources)
        id: 'income.dividend_income',
        label: 'Dividend Income',
        type: 'currency',
        plainLanguageQuestion:
          'How much did you receive in dividends from shares or mutual funds?',
      },
      {
        // Source: Schedule VI-A (Deductions under Chapter VI-A)
        id: 'deductions.total',
        label: 'Total Deductions (Chapter VI-A)',
        type: 'currency',
        plainLanguageQuestion:
          'What is the total of all the deductions you are claiming — 80C, 80D, NPS and the like?',
      },
      {
        // Source: Schedule TDS (Details of Tax Deducted at Source)
        id: 'income.tds_deducted',
        label: 'Tax Already Paid (TDS)',
        type: 'currency',
        plainLanguageQuestion:
          'How much tax has already been deducted at source? You will find this on Form 16 or Form 26AS.',
      },
      {
        // Source: Part A-GEN (Eligibility check — disqualifies from ITR-1 if yes)
        id: 'disqualifier.capital_gains_check',
        label: 'Any Capital Gains?',
        type: 'boolean',
        plainLanguageQuestion:
          'Did you sell any property, shares, or mutual funds this year at a gain?',
      },
      {
        // Source: Part A-GEN (Eligibility check — disqualifies from ITR-1 if yes)
        id: 'disqualifier.foreign_assets_check',
        label: 'Foreign Assets or Income?',
        type: 'boolean',
        plainLanguageQuestion:
          'Do you own any assets outside India, or have any income from a foreign source?',
      },
    ],
  },

  'ITR-2': {
    name: 'ITR-2',
    description:
      'Individual or HUF with no business or professional income, but with capital gains, more than one house property, foreign assets, or total income above ₹50 lakh.',
    requiredFields: [
      {
        // Source: Schedule S (Details of Income from Salary)
        id: 'income.gross_salary',
        label: 'Gross Salary or Pension',
        type: 'currency',
        plainLanguageQuestion: 'What was your total salary or pension income this year?',
      },
      {
        // Source: Schedule HP (Details of Income from House Property)
        id: 'income.house_property_income',
        label: 'Income from House Property',
        type: 'currency',
        plainLanguageQuestion:
          'What is the total net income from all your house properties (rent received, minus municipal taxes and the standard deduction)?',
      },
      {
        // Source: Schedule CG (Capital Gains)
        id: 'income.short_term_gains',
        label: 'Capital Gains',
        type: 'currency',
        plainLanguageQuestion:
          'What was your total capital gains this year from selling shares, mutual funds, or property?',
      },
      {
        // Source: Schedule OS (Income from Other Sources)
        id: 'income.savings_and_fd_interest',
        label: 'Interest & Other Income',
        type: 'currency',
        plainLanguageQuestion:
          'How much did you earn from interest, deposits, and other sources?',
      },
      {
        // Source: Schedule OS (Income from Other Sources)
        id: 'income.dividend_income',
        label: 'Dividend Income',
        type: 'currency',
        plainLanguageQuestion: 'How much did you receive in dividends this year?',
      },
      {
        // Source: Schedule VI-A (Deductions under Chapter VI-A)
        id: 'deductions.total',
        label: 'Total Deductions (Chapter VI-A)',
        type: 'currency',
        plainLanguageQuestion: 'What is the total of all the deductions you are claiming?',
      },
      {
        // Source: Schedule TDS (Details of Tax Deducted at Source)
        id: 'income.tds_deducted',
        label: 'Tax Already Paid (TDS)',
        type: 'currency',
        plainLanguageQuestion:
          'How much tax was already deducted at source across all your income?',
      },
      {
        // Source: Part A-GEN (Eligibility check — disqualifies from ITR-2 if yes)
        id: 'disqualifier.business_income_check',
        label: 'Any Business Income?',
        type: 'boolean',
        plainLanguageQuestion:
          'Do you have any income from running a business or a profession? If yes, you will need ITR-3 instead.',
      },
    ],
  },

  'ITR-3': {
    name: 'ITR-3',
    description:
      'Individual or HUF carrying on a business or profession and maintaining regular books of account.',
    requiredFields: [
      {
        // Source: Schedule BP (Computation of income from business or profession)
        id: 'income.gross_receipts',
        label: 'Net Profit from Business / Profession',
        type: 'currency',
        plainLanguageQuestion:
          'What was your net profit from your business or profession this year, after deducting business expenses?',
      },
      {
        // Source: Schedule S (Details of Income from Salary)
        id: 'income.gross_salary',
        label: 'Salary or Pension (if any)',
        type: 'currency',
        plainLanguageQuestion:
          'Do you also draw a salary or pension? Enter the amount, or 0 if none.',
      },
      {
        // Source: Schedule CG (Capital Gains)
        id: 'income.short_term_gains',
        label: 'Capital Gains',
        type: 'currency',
        plainLanguageQuestion:
          'What were your total capital gains this year? Enter 0 if none.',
      },
      {
        // Source: Schedule OS (Income from Other Sources)
        id: 'income.savings_and_fd_interest',
        label: 'Interest & Other Income',
        type: 'currency',
        plainLanguageQuestion:
          'How much did you earn from interest, deposits, and other sources?',
      },
      {
        // Source: Schedule VI-A (Deductions under Chapter VI-A)
        id: 'deductions.total',
        label: 'Total Deductions (Chapter VI-A)',
        type: 'currency',
        plainLanguageQuestion:
          'What is the total of the deductions you are claiming under 80C, 80D and similar sections?',
      },
      {
        // Source: Schedule TDS (Details of Tax Deducted at Source)
        id: 'income.tds_deducted',
        label: 'Tax Already Paid (TDS)',
        type: 'currency',
        plainLanguageQuestion:
          'How much tax was already deducted at source across all your income?',
      },
      {
        // Source: Part A-GEN (General Information)
        id: 'disqualifier.books_maintained_check',
        label: 'Books of Account Maintained?',
        type: 'boolean',
        plainLanguageQuestion:
          'Do you keep regular books of account for your business or profession?',
      },
      {
        // Source: Part A-GEN (General Information - Audit Information)
        id: 'disqualifier.audit_check',
        label: 'Tax Audit Applicable?',
        type: 'boolean',
        plainLanguageQuestion:
          'Is your business or profession required to undergo a tax audit this year?',
      },
    ],
  },

  'ITR-4': {
    name: 'ITR-4 (Sugam)',
    description:
      'Resident with presumptive business or professional income under Sections 44AD / 44ADA / 44AE, with total income up to ₹50 lakh.',
    requiredFields: [
      {
        // Source: Schedule BP (Computation of income from business or profession - Section 44AD/ADA/AE)
        id: 'income.gross_receipts',
        label: 'Presumptive Turnover / Gross Receipts',
        type: 'currency',
        plainLanguageQuestion:
          'What was your total business turnover or professional gross receipts for the year? Presumptive income is worked out as a fixed percentage of this figure.',
      },
      {
        // Source: Schedule BP (Computation of income from business or profession)
        id: 'disqualifier.presumptive_profession_check',
        label: 'Profession under Section 44ADA?',
        type: 'boolean',
        plainLanguageQuestion:
          'Are you a professional declaring income under Section 44ADA? Answer No if you run a business under 44AD, or a goods-transport business under 44AE.',
      },
      {
        // Source: Schedule S (Details of Income from Salary)
        id: 'income.gross_salary',
        label: 'Salary or Pension (if any)',
        type: 'currency',
        plainLanguageQuestion:
          'Do you also draw a salary or pension? Enter the amount, or 0 if none.',
      },
      {
        // Source: Schedule OS (Income from Other Sources)
        id: 'income.savings_and_fd_interest',
        label: 'Interest & Other Income',
        type: 'currency',
        plainLanguageQuestion:
          'How much did you earn from interest and deposits this year?',
      },
      {
        // Source: Schedule VI-A (Deductions under Chapter VI-A)
        id: 'deductions.total',
        label: 'Total Deductions (Chapter VI-A)',
        type: 'currency',
        plainLanguageQuestion:
          'What is the total of the deductions you are claiming — 80C, 80D and similar?',
      },
      {
        // Source: Schedule TDS (Details of Tax Deducted at Source)
        id: 'income.tds_deducted',
        label: 'Tax Already Paid (TDS)',
        type: 'currency',
        plainLanguageQuestion: 'How much tax was already deducted at source?',
      },
      {
        // Source: Part A-GEN (Eligibility check)
        id: 'disqualifier.presumptive_eligible_check',
        label: 'Presumptive Scheme Confirmed?',
        type: 'boolean',
        plainLanguageQuestion:
          'Do you confirm you are declaring profit on a presumptive basis and are not maintaining full books of account?',
      },
    ],
  },
};

export default ITR_FORM_SCHEMAS;
