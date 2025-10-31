import React, { useState } from 'react';
import { formatCurrency } from '../../utils/format';
import ShareButton from '../ShareButton';

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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Campo Obra de */}
      <div className="mb-4">
        <input
          type="text"
          id="obraName"
          value={obraName}
          onChange={(e) => setObraName(e.target.value)}
          className="w-full text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:border-afs-blue focus:outline-none"
          placeholder="Obra de..."
          required
        />
      </div>

      {/* Campo Dirección */}
      <div className="mb-4">
        <input
          type="text"
          id="direccion"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          className="w-full text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:border-afs-blue focus:outline-none"
          placeholder="Dirección..."
        />
      </div>

      {/* Campo Categoría */}
      <div className="mb-4">
        <select
          id="categoria"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:border-afs-blue focus:outline-none"
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
                <span className="text-sm font-medium">{formatCurrency(work.monto)}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="flex justify-between items-center font-bold text-lg">
              <span>TOTAL:</span>
              <span>{formatCurrency(total)}</span>
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
      <ShareButton
        type="submit"
        loading={isGeneratingPDF}
        disabled={!obraName.trim() || works.length === 0}
      />
    </form>
  );
};

export default BudgetForm;