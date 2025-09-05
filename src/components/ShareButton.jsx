import React from 'react';

const ShareButton = ({ onGeneratePDF, disabled = false }) => {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-40">
      <button
        onClick={onGeneratePDF}
        disabled={disabled}
        className="w-full btn-primary text-lg py-4 px-6 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center justify-center space-x-2">
          <svg 
            className="w-6 h-6" 
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
          <span>Generar y Compartir PDF</span>
        </div>
      </button>
    </div>
  );
};

export default ShareButton;
