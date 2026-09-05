import React, { useState } from 'react';

const SubmitConfirmationScreen = ({ flowType = 'correction', formType = 'ITR-1', onBack, handleReturnToDashboard }) => {
  const [otp, setOtp] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (otp.length >= 4) { // Allow easy demoing
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-dvh bg-gray-100 flex flex-col items-center justify-start">
        <div className="w-full max-w-[360px] bg-white shadow-xl h-dvh relative flex flex-col overflow-hidden">
          <div className="flex flex-col items-center mt-12 mb-8 px-6 shrink-0">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-5 shadow-inner">
              <span className="text-4xl">✅</span>
            </div>
            <h1 className="text-[22px] font-black text-gray-900 text-center leading-tight">
              {flowType === 'filing' ? 'ITR Successfully Filed & Digitally Verified' : 'Response Submitted Successfully'}
            </h1>
            <p className="text-gray-500 text-[15px] mt-3 text-center font-medium">
              {flowType === 'filing' 
                ? 'Your return is now with the Centralized Processing Center (CPC). No physical paperwork required.' 
                : 'Your tax return has been corrected and digitally signed.'}
            </p>
            {flowType === 'filing' && (
              <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3 text-center w-full">
                <p className="text-xs text-gray-500 uppercase font-semibold">Acknowledgement No.</p>
                <p className="text-sm font-mono font-bold text-gray-800">ACK-2026-889104</p>
                <p className="text-xs text-gray-500 mt-2 uppercase font-semibold">Form Type</p>
                <p className="text-sm font-bold text-gray-800">{formType}</p>
                <p className="text-[10px] text-gray-400 mt-2">{new Date().toLocaleString()}</p>
              </div>
            )}
          </div>

          <div className="px-5 w-full flex-grow min-h-0 overflow-y-auto">
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 shadow-sm">
              <h3 className="text-xs font-black text-gray-700 uppercase tracking-widest mb-5">What happens next?</h3>
              
              <div className="space-y-0">
                {/* Step 1 */}
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm shadow-md z-10">1</div>
                  <div className="ml-4 mt-0.5 pb-6 border-l-2 border-green-500 pl-4 relative -left-[1.1rem]">
                    <p className="text-[15px] font-bold text-gray-900">Response Received</p>
                    <p className="text-xs text-green-600 font-bold mt-1 uppercase tracking-wide">Today</p>
                  </div>
                </div>
                
                {/* Step 2 */}
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm z-10">2</div>
                  <div className="ml-4 mt-0.5 pb-6 border-l-2 border-gray-200 pl-4 relative -left-[1.1rem]">
                    <p className="text-[15px] font-bold text-gray-700">Automated Verification</p>
                    <p className="text-xs text-gray-500 font-medium mt-1">Usually 3-5 days</p>
                  </div>
                </div>
                
                {/* Step 3 */}
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-sm z-10">3</div>
                  <div className="ml-4 mt-0.5 pl-4 relative -left-[1.1rem]">
                    <p className="text-[15px] font-bold text-gray-700">Refund Processing</p>
                    <p className="text-xs text-gray-500 font-medium mt-1">If applicable</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 pt-4 pb-12 w-full shrink-0">
            <button 
              onClick={handleReturnToDashboard}
              className="w-full min-h-[56px] bg-[#113C7A] hover:bg-blue-800 active:bg-blue-900 text-white font-extrabold text-[17px] rounded-xl shadow-lg transition-transform active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-blue-300 flex justify-center items-center"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gray-100 flex flex-col items-center justify-start">
      <div className="w-full max-w-[360px] bg-white shadow-xl h-dvh relative flex flex-col overflow-hidden">

        <header className="bg-[#113C7A] text-white p-5 rounded-b-2xl shadow-md z-10">
          <h1 className="text-xl font-extrabold leading-tight">
            {flowType === 'filing' ? 'Verify with Aadhaar OTP' : 'Verification'}
          </h1>
          <p className="text-blue-200 text-xs mt-1">
            {flowType === 'filing' ? 'Digitally sign your return' : 'Digitally sign your correction'}
          </p>
        </header>

        <div className="p-5 flex-grow min-h-0 space-y-6 overflow-y-auto pb-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-xl shadow-sm">
            <h3 className="text-xs font-black text-yellow-800 uppercase tracking-widest mb-2 flex items-center">
              <span className="mr-2">🔒</span> Secure Sign
            </h3>
            <p className="text-sm text-yellow-900 font-medium leading-relaxed">
              {flowType === 'filing' 
                ? 'To finalize your tax filing, please enter the One-Time Password sent to your Aadhaar-linked mobile number.'
                : 'To finalize your response, please enter the One-Time Password sent to your Aadhaar-linked mobile number.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl shadow-sm">
              <div className="flex justify-between items-end mb-3">
                <label className="block text-sm font-bold text-gray-800">
                  Aadhaar OTP / EVC
                </label>
                <button 
                  type="button" 
                  onClick={() => setOtp('123456')}
                  className="text-xs text-blue-600 font-bold bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded"
                >
                  Fill Demo OTP
                </button>
              </div>
              <input 
                type="text" 
                maxLength="6"
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full min-h-[56px] px-4 border-2 border-gray-300 rounded-xl text-3xl tracking-[0.5em] text-center font-bold text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
            </div>
          </form>
        </div>

        {/* Sticky Footer CTAs */}
        <div className="p-4 pb-12 bg-white border-t border-gray-100 shrink-0 z-10 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] flex space-x-3">
          <button 
            onClick={onBack}
            className="w-1/3 min-h-[56px] bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-extrabold text-sm rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            &larr; Back
          </button>
          
          <button 
            onClick={handleSubmit}
            disabled={otp.length < 4}
            className={`w-2/3 min-h-[56px] font-extrabold text-[17px] rounded-xl shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-green-200 flex justify-center items-center ${otp.length >= 4 ? 'bg-[#27AE60] hover:bg-[#219653] text-white active:scale-[0.98]' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
          >
            Submit &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmitConfirmationScreen;
