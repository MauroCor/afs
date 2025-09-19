import React, { useState } from 'react';

const BudgetForm = ({ onGeneratePDF, isGeneratingPDF, onAddWork, works, total, selectedCategory, onCategoryChange }) => {
  const [obraName, setObraName] = useState('');
  const [direccion, setDireccion] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (obraName.trim()) {
      onGeneratePDF(obraName, direccion, works, total);
    }
  };

  const categories = ['GAS', 'AGUA PLUVIAL', 'SANITARIO', 'CALEFACCION'];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Generar Presupuesto</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo Obra de */}
        <div>
          <input
            type="text"
            id="obraName"
            value={obraName}
            onChange={(e) => setObraName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Obra de..."
            required
          />
        </div>

        {/* Campo Dirección */}
        <div>
          <input
            type="text"
            id="direccion"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Dirección..."
          />
        </div>

        {/* Campo Categoría */}
        <div>
          <select
            id="categoria"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleccione una categoría</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Lista de trabajos agregados */}
        {works.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Trabajos Agregados:</h3>
            <div className="space-y-2">
              {works.map((work, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <span className="text-sm">{work.trabajo}</span>
                  <span className="text-sm font-medium">${work.monto.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="flex justify-between items-center font-bold text-lg">
                <span>TOTAL:</span>
                <span>${total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Botón Agregar */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onAddWork}
            disabled={!selectedCategory}
            className="btn-primary flex items-center justify-center space-x-1 text-sm py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-lg">+</span>
            <span>Agregar</span>
          </button>
        </div>

        {/* Botón generar PDF */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isGeneratingPDF || !obraName.trim() || works.length === 0}
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