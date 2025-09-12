import React, { useState } from 'react';

const BudgetForm = ({ onGeneratePDF, isGeneratingPDF }) => {
  const [clientName, setClientName] = useState('');
  const [budgetText, setBudgetText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (clientName.trim() && budgetText.trim()) {
      onGeneratePDF(clientName, budgetText);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo nombre del cliente */}
        <div>
          <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre:
          </label>
          <input
            type="text"
            id="clientName"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ingrese el nombre del cliente"
            required
          />
        </div>

        {/* Campo de texto libre para actividades y montos */}
        <div>
          <label htmlFor="budgetText" className="block text-sm font-medium text-gray-700 mb-2">
            Presupuesto:
          </label>
          <textarea
            id="budgetText"
            value={budgetText}
            onChange={(e) => setBudgetText(e.target.value)}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            placeholder="Ingrese el trabajo realizado"
            required
          />
        </div>

        {/* Botón generar PDF */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isGeneratingPDF || !clientName.trim() || !budgetText.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-md transition duration-200 flex items-center space-x-2"
          >
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
            <span>{isGeneratingPDF ? 'Generando...' : 'Generar PDF'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default BudgetForm;
