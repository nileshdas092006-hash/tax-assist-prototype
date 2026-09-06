import React, { useState } from 'react';

export default function PaymentScreen({ payload, setPayload, onNext, onBack }) {
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [isSimulating, setIsSimulating] = useState(false);
  // A payment already recorded (e.g. the user refreshed on this screen) counts as success.
  const [isSuccess, setIsSuccess] = useState(() => payload.payment?.paymentStatus === 'SUCCESS');

  // Extract the computed tax due from the previous phase
  const taxDue = payload.taxComputation?.due || 0;

  // Reached with nothing to pay (a refund/nil return, or landed here via Back).
  // Don't show a payment form for a non-positive amount — offer to continue.
  if (taxDue <= 0 && !isSuccess) {
    return (
      <div className="min-h-dvh bg-gray-100 flex flex-col items-center justify-start">
        <div className="w-full max-w-[360px] bg-gray-50 shadow-xl h-dvh relative flex flex-col overflow-hidden sm:border-x sm:border-gray-200">
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">Nothing to Pay</h2>
            <p className="text-gray-600 text-sm mb-8">
              Based on your computation there is no self-assessment tax due. You can go straight to e-verification.
            </p>
            <button
              onClick={onNext}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 px-6 rounded-xl shadow-md transition-all active:scale-95"
            >
              Proceed to e-Verification &rarr;
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const paymentMethods = [
    { id: 'upi', label: 'UPI (GPay/PhonePe)' },
    { id: 'netbanking', label: 'Net Banking' },
    { id: 'debit', label: 'Debit Card' }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const handlePay = () => {
    if (!selectedMethod) return;
    setIsSimulating(true);
    
    // Simulate payment gateway delay
    setTimeout(() => {
      setIsSimulating(false);
      setIsSuccess(true);
    }, 1500);
  };

  const handleNext = () => {
    // Append payment receipt to the background payload
    setPayload(prev => ({
      ...prev,
      payment: {
        paymentStatus: "SUCCESS",
        challanRef: "2026-ITX-9941",
        method: selectedMethod,
        amount: taxDue
      }
    }));
    onNext();
  };

  return (
    <div className="min-h-dvh bg-gray-100 flex flex-col items-center justify-start">
    <div className="w-full max-w-[360px] bg-gray-50 shadow-xl h-dvh relative flex flex-col overflow-hidden sm:border-x sm:border-gray-200">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm z-10 flex items-center border-b border-gray-200 sticky top-0">
        {!isSuccess && !isSimulating && (
          <button onClick={onBack} className="text-gray-500 hover:text-gray-700 transition-colors p-1 -ml-1 absolute left-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
        <h1 className="flex-1 text-center text-sm font-semibold text-gray-800 tracking-wide">
          Secure Payment
        </h1>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-6 pb-6">

        {/* Payable Amount Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 text-center p-6">
          <p className="text-gray-500 text-sm font-medium mb-1 uppercase tracking-wide">Tax Payable</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(taxDue)}</p>
          <div className="inline-block bg-orange-100 text-orange-800 text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-bold">
            Simulated Sandbox
          </div>
        </div>

        {/* Challan Details Box */}
        <div className="bg-gray-100 rounded-xl p-4 mb-6 border border-gray-200 font-mono text-xs text-gray-600">
          <p className="font-sans font-semibold text-gray-800 mb-2 uppercase text-[11px] tracking-wide">Challan Details ITNS 280</p>
          <div className="flex justify-between mb-1">
            <span>BSR Code:</span>
            <span className="font-semibold text-gray-800">0292852</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Assessment Year:</span>
            <span className="font-semibold text-gray-800">2026-27</span>
          </div>
          <div className="flex justify-between">
            <span>Tax Type:</span>
            <span className="font-semibold text-gray-800">(300) Self Assessment</span>
          </div>
        </div>

        {isSuccess ? (
          /* Success State */
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center animate-[fadeIn_0.5s_ease-out]">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-green-900 mb-2">Payment Verified</h2>
            <p className="text-green-700 text-sm mb-4">
              Your mock payment was successful. The tax challan has been instantly linked to your PAN.
            </p>
            <div className="bg-white p-3 rounded-lg border border-green-100">
              <p className="text-xs text-gray-500 uppercase font-semibold">Challan CRN</p>
              <p className="text-gray-900 font-mono font-bold tracking-wider">#2026-ITX-9941</p>
            </div>
          </div>
        ) : (
          /* Payment Method Selector */
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Select Payment Method</h2>
            <div className="space-y-3">
              {paymentMethods.map(method => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedMethod === method.id 
                      ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500 shadow-sm' 
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${selectedMethod === method.id ? 'text-blue-900' : 'text-gray-700'}`}>
                      {method.label}
                    </span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedMethod === method.id ? 'border-blue-600' : 'border-gray-300'}`}>
                      {selectedMethod === method.id && <div className="w-3 h-3 bg-blue-600 rounded-full"></div>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="shrink-0 bg-white border-t border-gray-200 p-4 pb-12 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {isSuccess ? (
          <button
            onClick={handleNext}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3.5 px-6 rounded-xl shadow-md transition-all active:scale-95 flex justify-center items-center gap-2"
          >
            Proceed to Final e-Verification
            <span>→</span>
          </button>
        ) : (
          <button
            onClick={handlePay}
            disabled={!selectedMethod || isSimulating}
            className={`w-full font-medium py-3.5 px-6 rounded-xl shadow-md transition-all flex justify-center items-center gap-2 ${
              isSimulating 
                ? 'bg-blue-400 text-white cursor-wait' 
                : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
            }`}
          >
            {isSimulating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                Simulating bank gateway...
              </>
            ) : (
              `Pay ${formatCurrency(taxDue)} (Simulated)`
            )}
          </button>
        )}
      </div>
    </div>
    </div>
  );
}
