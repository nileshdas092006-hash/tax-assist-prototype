import { useState } from 'react';
import { ITR_FORM_SCHEMAS, ITR_SCHEMA_DISCLAIMER } from '../data/itrFormSchemas';

/**
 * One Q&A engine for every ITR form. It reads `requiredFields` from
 * itrFormSchemas.js for the resolved form type and walks the user through them
 * one at a time — boolean fields as Yes/No chips, currency fields as a validated
 * ₹ input with a running preview. Each answer is written straight into the
 * shared payload at the field's id path (`income.gross_salary` ->
 * payload.income.gross_salary), which is what TaxSummaryScreen reads back.
 */

const BackArrow = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
      clipRule="evenodd"
    />
  </svg>
);

const readValue = (payload, id) => {
  const [category, key] = id.split('.');
  return payload && payload[category] ? payload[category][key] : undefined;
};

const toNum = (v) => {
  const n = parseFloat(String(v ?? '').replace(/[₹,\s]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

const fmtINR = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n || 0);

function validateAmount(value) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return { isValid: false, errorMessage: 'Please enter an amount (enter 0 if this does not apply).' };
  }
  const stripped = String(value).replace(/[₹,\s]/g, '');
  if (stripped.startsWith('-')) {
    return { isValid: false, errorMessage: 'Amount cannot be negative.' };
  }
  if (/[eE]/.test(stripped)) {
    return { isValid: false, errorMessage: 'Enter the full amount without scientific notation.' };
  }
  if (!/^\d+(\.\d+)?$/.test(stripped)) {
    return { isValid: false, errorMessage: 'Please enter numbers only.' };
  }
  if (!/^\d+(\.\d{1,2})?$/.test(stripped)) {
    return { isValid: false, errorMessage: 'Amount can only have up to 2 decimal places.' };
  }
  if (parseFloat(stripped) > 100000000) {
    return { isValid: false, errorMessage: 'Amount cannot exceed ₹10,00,00,000.' };
  }
  return { isValid: true, errorMessage: '' };
}

const Shell = ({ children }) => (
  <div className="min-h-dvh bg-gray-100 flex flex-col items-center justify-start">
    <div className="w-full max-w-[360px] bg-gray-50 shadow-xl h-dvh relative flex flex-col overflow-hidden sm:border-x sm:border-gray-200">
      {children}
    </div>
  </div>
);

const Disclaimer = () => (
  <p className="text-[11px] text-gray-400 leading-snug text-center px-2 mb-3">{ITR_SCHEMA_DISCLAIMER}</p>
);

export default function DynamicFormFillerScreen({ payload, setPayload, onNext, onBack }) {
  const formType = payload.recommended_form || 'ITR-1';
  const schema = ITR_FORM_SCHEMAS[formType];
  const fields = schema ? schema.requiredFields : [];

  // Resume where the user left off: first field that has no valid answer yet.
  const firstUnanswered = () => {
    const i = fields.findIndex((f) => {
      const v = readValue(payload, f.id);
      if (v === undefined || v === '') return true;
      // A currency field left holding a non-numeric string (corrupt storage) is
      // not "answered" — send the user back to fix it rather than silently 0 it.
      if (f.type === 'currency' && !/^\d+(\.\d{1,2})?$/.test(String(v).replace(/[₹,\s]/g, ''))) return true;
      return false;
    });
    return i === -1 ? fields.length : i;
  };

  const [currentIndex, setCurrentIndex] = useState(firstUnanswered());
  const [validationError, setValidationError] = useState('');

  if (!schema) {
    return (
      <Shell>
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-red-500 font-bold text-center">
            No field schema found for &ldquo;{formType}&rdquo;.
          </p>
        </div>
      </Shell>
    );
  }

  // ---- live preview, driven entirely by the schema -----------------------
  const previewIncome = fields
    .filter((f) => f.type === 'currency' && f.id.startsWith('income.') && f.id !== 'income.tds_deducted')
    .reduce((sum, f) => sum + toNum(readValue(payload, f.id)), 0);
  const previewDeductions = fields
    .filter((f) => f.type === 'currency' && f.id.startsWith('deductions.'))
    .reduce((sum, f) => sum + toNum(readValue(payload, f.id)), 0);
  const answeredCount = fields.filter((f) => {
    const v = readValue(payload, f.id);
    return v !== undefined && v !== '';
  }).length;

  const writeAnswer = (id, value) => {
    const [category, key] = id.split('.');
    setPayload((prev) => ({
      ...prev,
      [category]: { ...(prev[category] || {}), [key]: value },
    }));
  };

  const isReview = currentIndex >= fields.length;

  // ================= Review screen ======================================
  if (isReview) {
    return (
      <Shell>
        <div className="bg-white px-4 py-4 shadow-sm z-10 flex items-center border-b border-gray-200 shrink-0">
          <button
            onClick={() => setCurrentIndex(fields.length - 1)}
            aria-label="Back"
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 -ml-1"
          >
            <BackArrow />
          </button>
          <h1 className="flex-1 text-center text-sm font-semibold text-gray-800 tracking-wide">
            {schema.name} &middot; Review
          </h1>
          <div className="w-6" />
        </div>
        <div className="w-full bg-gray-200 h-1.5 shrink-0">
          <div className="bg-green-600 h-1.5 w-full" />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-6 pb-6">
          <div className="flex flex-col items-center text-center mb-5">
            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-gray-900">Review your {schema.name} details</h2>
            <p className="text-gray-500 text-sm mt-1">Tap any row to change it.</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm divide-y divide-gray-100">
            {fields.map((f, i) => {
              const v = readValue(payload, f.id);
              const display =
                f.type === 'boolean'
                  ? v === true
                    ? 'Yes'
                    : v === false
                      ? 'No'
                      : '—'
                  : v !== undefined && v !== ''
                    ? fmtINR(toNum(v))
                    : '—';
              return (
                <button
                  key={f.id}
                  onClick={() => setCurrentIndex(i)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm text-gray-600">{f.label}</span>
                  <span className="text-sm font-bold text-gray-900 shrink-0">{display}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-blue-900 font-medium">Income entered</span>
              <span className="font-bold text-blue-900">{fmtINR(previewIncome)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-900 font-medium">Deductions claimed</span>
              <span className="font-bold text-blue-900">- {fmtINR(previewDeductions)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-blue-200 pt-2">
              <span className="text-blue-900 font-bold">Net (before tax)</span>
              <span className="font-black text-blue-900">
                {fmtINR(Math.max(0, previewIncome - previewDeductions))}
              </span>
            </div>
          </div>
        </div>

        <div className="shrink-0 bg-white border-t border-gray-200 px-4 pt-3 pb-12 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <Disclaimer />
          <button
            onClick={onNext}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[17px] py-4 px-6 rounded-xl shadow-md transition-all active:scale-[0.98] flex justify-center items-center gap-2"
          >
            Calculate Tax Summary
            <span>&rarr;</span>
          </button>
        </div>
      </Shell>
    );
  }

  // ================= Question screen ====================================
  const field = fields[currentIndex];
  const value = readValue(payload, field.id);
  const pct = Math.round((currentIndex / fields.length) * 100);
  const isLast = currentIndex === fields.length - 1;

  const goBackOneStep = () => {
    setValidationError('');
    if (currentIndex === 0) onBack();
    else setCurrentIndex(currentIndex - 1);
  };

  const goForward = () => {
    if (field.type === 'currency') {
      const check = validateAmount(value);
      if (!check.isValid) {
        setValidationError(check.errorMessage);
        return;
      }
    } else if (value === undefined) {
      setValidationError('Please choose Yes or No.');
      return;
    }
    setValidationError('');
    setCurrentIndex(currentIndex + 1);
  };

  const currencyValid = field.type === 'currency' && value !== undefined ? validateAmount(value).isValid : field.type !== 'currency';
  const nextDisabled =
    value === undefined ||
    (field.type === 'currency' && !currencyValid) ||
    validationError !== '';

  return (
    <Shell>
      <div className="bg-white px-4 py-4 shadow-sm z-10 flex items-center border-b border-gray-200 shrink-0">
        <button
          onClick={goBackOneStep}
          aria-label="Back"
          className="text-gray-500 hover:text-gray-700 transition-colors p-1 -ml-1"
        >
          <BackArrow />
        </button>
        <h1 className="flex-1 text-center text-sm font-semibold text-gray-800 tracking-wide">
          {schema.name} &middot; {currentIndex + 1}/{fields.length}
        </h1>
        <div className="w-6" />
      </div>

      <div className="w-full bg-gray-200 h-1.5 shrink-0">
        <div className="bg-blue-600 h-1.5 transition-all duration-300 ease-out" style={{ width: `${pct}%` }} />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-8 pb-6">
        <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
          <label className="block text-sm font-bold text-gray-800 mb-4 leading-snug">
            <span className="text-blue-600 mr-2">Q{currentIndex + 1}.</span>
            {field.plainLanguageQuestion}
          </label>

          {field.type === 'boolean' && (
            <div className="flex space-x-3">
              {[
                { v: true, label: 'Yes' },
                { v: false, label: 'No' },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => {
                    writeAnswer(field.id, opt.v);
                    setValidationError('');
                  }}
                  className={`flex-1 min-h-[56px] rounded-xl font-bold text-lg border-2 transition-colors focus:outline-none ${
                    value === opt.v
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-300 text-gray-600 hover:border-blue-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {field.type === 'currency' && (
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">₹</span>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                aria-label={field.label}
                aria-invalid={validationError ? 'true' : 'false'}
                placeholder="e.g. 500000"
                value={value ?? ''}
                onChange={(e) => {
                  // Accept only a well-formed partial number (digits, one dot, <=2
                  // decimals). Anything else is ignored, so the payload never
                  // holds a string that would silently become 0 later.
                  const raw = e.target.value.replace(/[₹,\s]/g, '');
                  if (raw !== '' && !/^\d*\.?\d{0,2}$/.test(raw)) return;
                  writeAnswer(field.id, raw);
                  setValidationError(validateAmount(raw).errorMessage);
                }}
                onBlur={(e) => setValidationError(validateAmount(e.target.value).errorMessage)}
                className={`w-full min-h-[56px] pl-10 pr-4 border-2 rounded-xl text-xl font-bold text-gray-900 focus:outline-none transition-all ${
                  validationError
                    ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                }`}
              />
              {validationError && (
                <p className="text-xs text-red-600 mt-2 font-medium">{validationError}</p>
              )}
            </div>
          )}
        </div>

        {/* Live preview — updates as currency answers come in */}
        {answeredCount > 0 && (previewIncome > 0 || previewDeductions > 0) && (
          <div className="mt-5 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">So far</p>
            <div className="flex justify-between text-sm text-gray-700">
              <span>Income entered</span>
              <span className="font-bold">{fmtINR(previewIncome)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-700 mt-1">
              <span>Deductions</span>
              <span className="font-bold">- {fmtINR(previewDeductions)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-900 mt-2 pt-2 border-t border-gray-100">
              <span className="font-bold">Net so far</span>
              <span className="font-black">{fmtINR(Math.max(0, previewIncome - previewDeductions))}</span>
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 bg-white border-t border-gray-200 px-4 pt-3 pb-12 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <Disclaimer />
        <button
          onClick={goForward}
          disabled={nextDisabled}
          className="w-full bg-[#27AE60] hover:bg-[#219653] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-extrabold text-[17px] py-4 px-6 rounded-xl shadow-md transition-all active:scale-[0.98] flex justify-center items-center gap-2"
        >
          {isLast ? 'Review & Finish' : 'Next Question'}
          <span>&rarr;</span>
        </button>
      </div>
    </Shell>
  );
}
