import React, { useState, useEffect, useMemo } from 'react';

export default function TaxSummaryScreen({ payload, setPayload, onPayment, onVerification, onBack }) {
  const [aiExplanation, setAiExplanation] = useState('');
  const [loading, setLoading] = useState(true);

  // Compute tax numbers when component mounts
  const computation = useMemo(() => {
    const income = payload.income || {};
    const deductions = payload.deductions || {};

    const gross =
      (Number(income.gross_salary) || 0) +
      (Number(income.house_property_income) || 0) +
      (Number(income.gross_receipts) || 0) +
      (Number(income.short_term_gains) || 0) +
      (Number(income.savings_and_fd_interest) || 0) +
      (Number(income.dividend_income) || 0);
    
    const totalDeductions = Number(deductions.total) || 0;
    const net = Math.max(0, gross - totalDeductions);
    const tds = Number(income.tds_deducted) || 0;

    // Illustrative simplified slab logic for Hackathon purposes
    // Up to 3L: 0%, 3L-6L: 5%, 6L-9L: 10%, 9L-12L: 15%, 12L-15L: 20%, >15L: 30%
    let tax = 0;
    if (net > 1500000) {
      tax += (net - 1500000) * 0.30 + 150000;
    } else if (net > 1200000) {
      tax += (net - 1200000) * 0.20 + 90000;
    } else if (net > 900000) {
      tax += (net - 900000) * 0.15 + 45000;
    } else if (net > 600000) {
      tax += (net - 600000) * 0.10 + 15000;
    } else if (net > 300000) {
      tax += (net - 300000) * 0.05;
    }

    // Apply Section 87A rebate for income <= 7L (under new regime, simplified here)
    if (net <= 700000) {
      tax = 0;
    }

    const due = tax - tds; // Positive = Due, Negative = Refund

    return { gross, totalDeductions, net, tax, tds, due };
  }, [payload]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  useEffect(() => {
    async function getExplanation() {
      setLoading(true);
      try {
        // Mock fallback simulating an API request to an LLM
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const type = computation.due > 0 ? 'tax due is' : (computation.due === 0 ? 'tax due is' : 'refund is');
        const formattedDue = formatCurrency(Math.abs(computation.due));
        
        const explanation = `You earned a gross income of ${formatCurrency(computation.gross)} and claimed ${formatCurrency(computation.totalDeductions)} in deductions. This brings your net taxable income down to ${formatCurrency(computation.net)}.\n\nYour total calculated tax is ${formatCurrency(computation.tax)}, but since ₹${formatCurrency(computation.tds).replace('₹', '')} was already deducted in TDS, your final ${type} **${formattedDue}**.`;
        
        setAiExplanation(explanation);
      } catch {
        setAiExplanation("We computed your tax but couldn't generate the AI explanation at this time.");
      } finally {
        setLoading(false);
      }
    }
    
    getExplanation();
  }, [computation]);

  const handleNext = () => {
    setPayload(prev => ({
      ...prev,
      taxComputation: computation
    }));

    if (computation.due > 0) {
      onPayment();
    } else {
      onVerification();
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-gray-100 flex flex-col items-center justify-start">
      <div className="w-full max-w-[360px] bg-gray-50 shadow-xl h-dvh relative flex flex-col overflow-hidden sm:border-x sm:border-gray-200">
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-6 space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 animate-pulse text-sm text-center">
            AI is crunching your numbers and applying the latest tax slabs...
          </p>
        </div>
      </div>
      </div>
    );
  }

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
          Tax Summary
        </h1>
        <div className="w-6"></div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-6 pb-6">

        {/* Breakdown Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex justify-between items-center">
            <span className="font-semibold text-blue-900 text-sm tracking-wide uppercase">Computation</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between text-gray-600 text-sm">
              <span>Gross Income</span>
              <span className="font-medium text-gray-800">{formatCurrency(computation.gross)}</span>
            </div>
            <div className="flex justify-between text-red-500 text-sm">
              <span>Less: Deductions</span>
              <span className="font-medium">- {formatCurrency(computation.totalDeductions)}</span>
            </div>
            <div className="border-t border-gray-100 my-2 pt-2 flex justify-between text-gray-800 font-semibold text-sm">
              <span>Net Taxable Income</span>
              <span>{formatCurrency(computation.net)}</span>
            </div>
            
            <div className="border-t-2 border-dashed border-gray-200 my-3"></div>
            
            <div className="flex justify-between text-gray-600 text-sm">
              <span>Computed Tax</span>
              <span className="font-medium text-gray-800">{formatCurrency(computation.tax)}</span>
            </div>
            <div className="flex justify-between text-green-600 text-sm">
              <span>Less: TDS Already Paid</span>
              <span className="font-medium">- {formatCurrency(computation.tds)}</span>
            </div>
          </div>
          
          <div className={`p-4 border-t ${computation.due > 0 ? 'bg-orange-50 border-orange-100 text-orange-900' : 'bg-green-50 border-green-100 text-green-900'}`}>
            <div className="flex justify-between items-center font-bold text-lg">
              <span>
                {computation.due > 0
                  ? 'Total Tax Due'
                  : computation.due < 0
                    ? 'Tax Refund'
                    : 'Nothing to Pay'}
              </span>
              <span>{formatCurrency(Math.abs(computation.due))}</span>
            </div>
          </div>
        </div>

        {/* AI Explanation Box */}
        <div className="bg-blue-600 rounded-xl p-[2px] shadow-sm mb-6">
          <div className="bg-white rounded-[10px] p-5 h-full relative">
            <div className="absolute -top-3 left-4 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
              <span>✨</span> AI Tax Breakdown
            </div>
            <p className="text-gray-700 text-sm leading-relaxed mt-2 whitespace-pre-wrap">
              {aiExplanation.split('**').map((part, index) => 
                index % 2 !== 0 ? <strong key={index} className="text-blue-700 bg-blue-50 px-1 rounded">{part}</strong> : part
              )}
            </p>
          </div>
        </div>

      </div>

      {/* Action Button */}
      <div className="shrink-0 bg-white border-t border-gray-200 p-4 pb-12 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button
          onClick={handleNext}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 px-6 rounded-xl shadow-md transition-all active:scale-95 flex justify-center items-center gap-2"
        >
          {computation.due > 0 ? 'Proceed to Mock Payment' : 'Proceed to e-Verification'}
          <span>→</span>
        </button>
      </div>
    </div>
    </div>
  );
}
