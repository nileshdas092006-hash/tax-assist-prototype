import { useState } from 'react';
import {
  FORM_DETAILS,
  resolveForm,
  nextQuestion,
  answeredSteps,
  progress,
} from '../data/formDetectionQuestions';

const BackArrow = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
      clipRule="evenodd"
    />
  </svg>
);

const Chevron = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

export default function FormDetectionScreen({ payload, setPayload, onNext, onBack }) {
  const [answers, setAnswers] = useState(() => {
    const seed = payload?.formDetectionAnswers;
    return seed && typeof seed === 'object' ? seed : {};
  });

  const current = nextQuestion(answers);
  const { form } = resolveForm(answers);
  const steps = answeredSteps(answers);
  const pct = Math.round(progress(answers) * 100);

  const answer = (value) => {
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  };

  const goBackOneStep = () => {
    if (steps.length === 0) {
      onBack();
      return;
    }
    const last = steps[steps.length - 1].id;
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[last];
      return copy;
    });
  };

  const handleContinue = () => {
    // recommended_form drives the next screen (DynamicFormFillerScreen picks its
    // field schema from it). formDetectionAnswers lets this screen rehydrate if
    // the user comes back.
    setPayload((prev) => {
      const next = { ...prev, formDetectionAnswers: answers, recommended_form: form };
      // If the detected form changed (e.g. the user came back and picked
      // different answers), drop everything the previous form's schema wrote —
      // otherwise stale income/deduction fields would still be counted downstream.
      if (prev.recommended_form && prev.recommended_form !== form) {
        delete next.income;
        delete next.deductions;
        delete next.disqualifier;
        delete next.taxComputation;
        delete next.payment;
      }
      return next;
    });
    onNext();
  };

  // ---- Result screen ----------------------------------------------------
  if (form) {
    const details = FORM_DETAILS[form];
    return (
      <div className="min-h-dvh bg-gray-100 flex flex-col items-center justify-start">
        <div className="w-full max-w-[360px] bg-gray-50 shadow-xl h-dvh relative flex flex-col overflow-hidden sm:border-x sm:border-gray-200">
          <div className="bg-white px-4 py-4 shadow-sm z-10 flex items-center border-b border-gray-200 shrink-0">
            <button
              onClick={goBackOneStep}
              aria-label="Back"
              className="text-gray-500 hover:text-gray-700 transition-colors p-1 -ml-1"
            >
              <BackArrow />
            </button>
            <h1 className="flex-1 text-center text-sm font-semibold text-gray-800 tracking-wide">
              Form Detection
            </h1>
            <div className="w-6" />
          </div>

          <div className="w-full bg-gray-200 h-1.5">
            <div className="bg-green-600 h-1.5 w-full transition-all duration-300 ease-out" />
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-8 pb-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 font-medium">Based on your answers, you need</p>
              <p className="text-3xl font-black text-gray-900 mt-1">{details.name}</p>
            </div>

            <p className="text-[15px] text-gray-700 leading-relaxed mt-5 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              {details.blurb}
            </p>

            <div className="mt-5">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Why this form
              </h2>
              <ul className="space-y-2">
                {steps.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-start gap-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2"
                  >
                    <span
                      className={`mt-0.5 text-[11px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        s.answer === 'yes'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {s.answer}
                    </span>
                    <span>{s.recap}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-gray-400 mt-5 leading-relaxed">
              This is a guided suggestion based on the common rules for individual taxpayers
              (AY&nbsp;2026-27). Unusual situations may still need a review.
            </p>
          </div>

          <div className="shrink-0 bg-white border-t border-gray-200 p-4 pb-12 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <button
              onClick={handleContinue}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 px-6 rounded-xl shadow-md transition-all active:scale-95 flex justify-center items-center gap-2"
            >
              Continue
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Question screen ------------------------------------------------------
  const questionNumber = steps.length + 1;

  return (
    <div className="min-h-dvh bg-gray-100 flex flex-col items-center justify-start">
      <div className="w-full max-w-[360px] bg-gray-50 shadow-xl h-dvh relative flex flex-col overflow-hidden sm:border-x sm:border-gray-200">
        <div className="bg-white px-4 py-4 shadow-sm z-10 flex items-center border-b border-gray-200 shrink-0">
          <button
            onClick={goBackOneStep}
            aria-label="Back"
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 -ml-1"
          >
            <BackArrow />
          </button>
          <h1 className="flex-1 text-center text-sm font-semibold text-gray-800 tracking-wide">
            Form Detection &middot; Question {questionNumber}
          </h1>
          <div className="w-6" />
        </div>

        <div className="w-full bg-gray-200 h-1.5">
          <div
            className="bg-blue-600 h-1.5 transition-all duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-8 pb-14">
          <h2 className="text-xl font-bold text-gray-900 leading-snug">{current.text}</h2>
          {current.help && (
            <p className="text-sm text-gray-500 leading-relaxed mt-3">{current.help}</p>
          )}

          <div className="flex flex-col space-y-3 mt-8">
            {[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => answer(opt.value)}
                className="w-full min-h-[60px] text-left bg-white border border-gray-200 hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-5 shadow-sm hover:shadow transition-all active:scale-[0.98] flex items-center justify-between"
              >
                <span className="font-bold text-gray-800 text-lg">{opt.label}</span>
                <span className="text-gray-300">
                  <Chevron />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
