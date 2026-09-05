import React, { useState } from 'react';
import mockAIS from '../data/mockAIS.json';

export default function PreFillScreen({ setPayload, onNext, onBack }) {
  // Initialize local state with mock AIS data so users can edit it
  const [incomeData, setIncomeData] = useState({
    gross_salary: mockAIS.gross_salary.amount,
    tds_deducted: mockAIS.tds_deducted.amount,
    savings_and_fd_interest: mockAIS.savings_and_fd_interest.amount,
    dividend_income: mockAIS.dividend_income.amount,
  });

  // Track which fields are in edit mode
  const [editMode, setEditMode] = useState({
    gross_salary: false,
    tds_deducted: false,
    savings_and_fd_interest: false,
    dividend_income: false,
  });

  const handleEditToggle = (key) => {
    setEditMode(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleInputChange = (key, value) => {
    // Only allow numbers
    const num = value.replace(/[^0-9]/g, '');
    setIncomeData(prev => ({ ...prev, [key]: Number(num) }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleConfirm = () => {
    // Merge into backgroundITRPayload
    setPayload(prev => ({
      ...prev,
      income: {
        ...incomeData
      }
    }));
    onNext();
  };

  // Helper to render an income card
  const renderCard = (key, title, sourceText) => {
    const isEditing = editMode[key];
    const value = incomeData[key];

    return (
      <div key={key} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <button 
            onClick={() => handleEditToggle(key)}
            className="text-xs text-blue-600 font-medium hover:text-blue-800 transition-colors bg-blue-50 px-2 py-1 rounded"
          >
            {isEditing ? 'Save' : 'Edit'}
          </button>
        </div>
        
        <div className="mb-3">
          {isEditing ? (
            <div className="flex items-center text-gray-900 font-bold text-xl">
              <span className="mr-1">₹</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                aria-label={`${title} amount in rupees`}
                value={value}
                onChange={(e) => handleInputChange(key, e.target.value)}
                className="w-full border-b-2 border-blue-500 focus:outline-none focus:border-blue-600 pb-1"
                autoFocus
              />
            </div>
          ) : (
            <p className="text-gray-900 font-bold text-xl">{formatCurrency(value)}</p>
          )}
        </div>
        
        <div className="inline-block bg-gray-100 text-gray-500 text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-semibold">
          Source: {sourceText}
        </div>
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
          Pre-Filled Data
        </h1>
        <div className="w-6"></div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-6 pb-6">
        {/* Synthetic Tag */}
        <div className="flex justify-center mb-4">
          <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full border border-purple-200">
            Prototype — Synthetic AIS Data
          </span>
        </div>

        {/* Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="text-blue-500 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm text-blue-900 font-medium leading-relaxed">
              We pulled this directly from your verified financial records. Review and confirm.
            </p>
          </div>
        </div>

        {/* Cards */}
        <div className="space-y-4">
          {renderCard('gross_salary', 'Gross Salary', mockAIS.gross_salary.source)}
          {renderCard('tds_deducted', 'TDS Deducted', mockAIS.tds_deducted.source)}
          {renderCard('savings_and_fd_interest', 'Savings & FD Interest', mockAIS.savings_and_fd_interest.source)}
          {renderCard('dividend_income', 'Dividend Income', mockAIS.dividend_income.source)}
        </div>
      </div>

      {/* Bottom Action Row */}
      <div className="shrink-0 bg-white border-t border-gray-200 p-4 pb-12 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button
          onClick={handleConfirm}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3.5 px-6 rounded-xl shadow-md transition-all active:scale-95 flex justify-center items-center gap-2"
        >
          Confirm & Continue
          <span>→</span>
        </button>
      </div>
    </div>
    </div>
  );
}
