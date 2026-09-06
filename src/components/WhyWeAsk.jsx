import { useState } from 'react';

/**
 * A small "Why we ask" disclosure — collapsed by default. The plain-language
 * question is always what the citizen reads; the official section references
 * live in here for anyone (e.g. a CA reviewing the return) who wants them.
 * Same idea as the "View Official Notice Text" accordion on the notice screen.
 */
export default function WhyWeAsk({ children }) {
  const [open, setOpen] = useState(false);
  if (!children) return null;

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 rounded"
      >
        <span className="text-sm leading-none w-3 text-center">{open ? '−' : '+'}</span>
        Why we ask
      </button>
      {open && (
        <p className="mt-2 text-xs text-gray-500 leading-relaxed bg-gray-50 border border-gray-100 rounded-lg p-3">
          {children}
        </p>
      )}
    </div>
  );
}
