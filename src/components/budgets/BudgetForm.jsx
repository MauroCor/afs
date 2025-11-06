import React, { useState } from 'react';
import { formatCurrency } from '../../utils/format';
import ShareButton from '../ShareButton';
import ClientSelector from '../clients/ClientSelector';
import { budgetWorksByCategory } from '../../data/budgetWorks';
import { addBudget } from '../../utils/clientsStorage';
import { createAndSaveClientPdf } from '../../utils/pdf/generator';

const BudgetForm = ({ onGeneratePDF, isGeneratingPDF, onAddWork, works, total, selectedCategory }) => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [trabajo, setTrabajo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedClient) {
      const clienteName = selectedClient.name || '';
      const direccion = selectedClient.address || '';
      // Persistir el presupuesto para el cliente antes de generar el PDF
      try {
        addBudget(selectedClient.id, {
          total: total,
          date: new Date().toISOString().split('T')[0],
          category: selectedCategory || ''
        });
      } catch (err) {
        console.error('Error al guardar el presupuesto:', err);
      }
      try {
        createAndSaveClientPdf('budget', 'budgets', selectedClient.id, { clienteName, direccion, works, total }, { source: 'BudgetsPage' });
      } catch (e) {
        console.error('Error al guardar PDF de presupuesto en cliente:', e);
      }
      onGeneratePDF(clienteName, direccion, works, total);
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'GAS':
        return 'bg-amber-500';
      case 'AGUA':
        return 'bg-sky-500';
      case 'PLUVIAL':
        return 'bg-teal-500';
      case 'SANITARIO':
        return 'bg-slate-600';
      case 'CALEFACCION':
        return 'bg-rose-500';
      default:
        return 'bg-gray-600';
    }
  };

  const handleMontoChange = (e) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^0-9.,]/g, '');
    setMonto(numericValue);
  };

  const canAdd = () => {
    const montoNumero = parseFloat(monto.replace(',', '.'));
    return trabajo.trim() && Number.isFinite(montoNumero) && montoNumero > 0;
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const montoNumero = parseFloat(monto.replace(',', '.'));
    if (!canAdd()) return;
    onAddWork({
      trabajo: trabajo,
      descripcion: (descripcion || '').trim(),
      monto: montoNumero
    });
    setTrabajo('');
    setDescripcion('');
    setMonto('');
  };

  const trabajosOptions = budgetWorksByCategory[selectedCategory] || ['TRABAJO PERSONALIZADO'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ClientSelector
        onSelectClient={setSelectedClient}
        selectedClient={selectedClient}
        required={true}
      />

      <div className="mb-2">
        <div className={`${getCategoryColor(selectedCategory)} text-white rounded-lg shadow-md px-4 py-3 text-center`}>
          <h2 className="text-base font-semibold">{selectedCategory}</h2>
        </div>
      </div>

      <div>
        <label htmlFor="trabajo" className="block text-sm font-medium text-gray-700 mb-2">Trabajos:</label>
        <select
          id="trabajo"
          value={trabajo}
          onChange={(e) => setTrabajo(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Seleccione un trabajo</option>
          {trabajosOptions.map((t, index) => (
            <option key={`${t}-${index}`} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">Descripción:</label>
        <textarea
          id="descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
          placeholder="Describa trabajos a realizar (opcional)"
        />
      </div>

      <div>
        <label htmlFor="monto" className="block text-sm font-medium text-gray-700 mb-2">Monto:</label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9.,]*"
          id="monto"
          value={monto}
          onChange={handleMontoChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="$..."
        />
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleAdd}
          disabled={!canAdd()}
          className="btn-primary flex items-center justify-center space-x-1 text-sm py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Agregar trabajo</span>
        </button>
      </div>

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

      <ShareButton
        type="submit"
        loading={isGeneratingPDF}
        disabled={!selectedClient || works.length === 0}
        label="Generar PDF"
      />
    </form>
  );
};

export default BudgetForm;