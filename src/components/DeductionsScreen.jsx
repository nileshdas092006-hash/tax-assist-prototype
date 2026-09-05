import React, { useState } from 'react';

export default function DeductionsScreen({ payload, setPayload, onNext, onBack }) {
  const [deductions, setDeductions] = useState({
    section80C: { has: null, amount: '' },
    section80D: { has: null, amount: '' },
    rent: { has: null, amount: '' }
  });

  const questions = [
    {
      id: 'section80C',
      text: 'Do you invest in EPF, PPF, ELSS, or Life Insurance? (Section 80C)',
    },
    {
      id: 'section80D',
      text: 'Do you pay for Health Insurance? (Section 80D)',
    },
    {
      id: 'rent',
      text: 'Do you pay house rent without receiving HRA?',
    }
  ];

  const handleChipSelect = (id, hasDeduction) => {
    setDeductions(prev => ({
      ...prev,
      [id]: { ...prev[id], has: hasDeduction, amount: hasDeduction ? prev[id].amount : '' }
    }));
  };

  const handleAmountChange = (id, value) => {
    // Allow digits and up to 2 decimal places, block negatives
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setDeductions(prev => ({
        ...prev,
        [id]: { ...prev[id], amount: value }
      }));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const totalDeductions = 
    (Number(deductions.section80C.amount) || 0) + 
    (Number(deductions.section80D.amount) || 0) + 
    (Number(deductions.rent.amount) || 0);

  const handleConfirm = () => {
    setPayload(prev => ({
      ...prev,
      deductions: {
        section80C: Number(deductions.section80C.amount) || 0,
        section80D: Number(deductions.section80D.amount) || 0,
        rent: Number(deductions.rent.amount) || 0,
        total: totalDeductions
      }
    }));
    onNext();
  };

  const renderQuestionCard = (q, index) => {
    const state = deductions[q.id];
    
    // Determine if this question should be visible (one by one flow)
    // We show a question if the previous question has been answered (has is not null)
    if (index > 0) {
      const prevId = questions[index - 1].id;
      if (deductions[prevId].has === null) {
        return null;
      }
    }

    return (
      <div key={q.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm transition-all duration-300 animate-fadeIn">
        <h3 className="font-semibold text-gray-800 text-lg mb-4">{q.text}</h3>
        
        <div className="flex space-x-3 mb-2">
          <button
            onClick={() => handleChipSelect(q.id, false)}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              state.has === false 
                ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
            }`}
          >
            No
          </button>
          <button
            onClick={() => handleChipSelect(q.id, true)}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              state.has === true 
                ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
            }`}
          >
            Yes
          </button>
        </div>

        {state.has === true && (
          <div className="mt-4 pt-4 border-t border-gray-100 animate-fadeIn">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={state.amount}
                onChange={(e) => handleAmountChange(q.id, e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl pl-8 pr-4 py-3 text-lg font-semibold text-gray-900 transition-all outline-none"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-dvh bg-gray-100 flex flex-col items-center justify-start">
    <div className="w-full max-w-[360px] bg-gray-50 shadow-xl h-dvh relative flex flex-col overflow-hidden sm:border-x sm:border-gray-200">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm z-10 flex items-center border-b border-gray-200 sticky top-0">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 transition-colors p-1 -ml-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <h1 className="flex-1 text-center text-sm font-semibold text-gray-800 tracking-wide">
          Tax Deductions
        </h1>
        <div className="w-6"></div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 pb-6 space-y-6">
        <style>{`
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        
        {questions.map((q, index) => renderQuestionCard(q, index))}
      </div>

      {/* Bottom Action Row with Real-Time Total */}
      <div className="shrink-0 bg-white border-t border-gray-200 shadow-[0_-8px_15px_-3px_rgba(0,0,0,0.1)] z-20">
        <div className="bg-green-50 border-b border-green-100 px-5 py-3 flex justify-between items-center">
          <span className="text-green-800 text-xs font-semibold uppercase tracking-wider">Total Claimed</span>
          <span className="text-green-700 font-bold text-lg">{formatCurrency(totalDeductions)}</span>
        </div>
        <div className="p-4 pb-12">
          <button
            onClick={handleConfirm}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 px-6 rounded-xl shadow-md transition-all active:scale-95 flex justify-center items-center gap-2"
          >
            Calculate Tax
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}
