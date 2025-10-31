import React from 'react';

const ShareButton = ({ onGeneratePDF, label = 'Generar PDF', disabled = false, loading = false, type = 'button', fullWidth = false, noMargin = false }) => {
  const isDisabled = disabled || loading;
  return (
    <div className={`flex justify-center ${fullWidth ? 'w-full' : ''} ${noMargin ? '' : 'mt-4'}`}>
      <button
        type={type}
        onClick={onGeneratePDF}
        disabled={isDisabled}
        className={`btn-primary text-base py-3 px-6 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${fullWidth ? 'w-full' : ''}`}
      >
        <div className="flex items-center justify-center space-x-2">
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          <span>{loading ? 'Generando...' : label}</span>
        </div>
      </button>
    </div>
  );
};

export default ShareButton;
