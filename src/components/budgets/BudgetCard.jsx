import React from 'react';
import IconTrash from '../IconTrash';
import { formatCurrency } from '../../utils/format';

const BudgetCard = ({ budget, onSelect, onDelete, canDelete, isSelected = false }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Si no es fecha válida, devolver original
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div 
      className={`bg-white rounded-lg p-3 cursor-pointer transition-all ${
        isSelected 
          ? 'border-2 border-blue-500 bg-blue-50 shadow-md' 
          : 'border border-gray-300 hover:border-blue-500 hover:shadow-md'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900">
            {budget.category || 'PRESUPUESTO'} - {formatDate(budget.date)}
          </h3>
          <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">
            {budget.status === 'active' ? 'ACTIVO' : 'CANCELADO'}
          </span>
        </div>
        {canDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="ml-2 text-red-500 hover:text-red-700 transition-colors"
          >
            <IconTrash />
          </button>
        )}
      </div>
      <div className="mt-2 space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Total:</span>
          <span className="font-medium">{formatCurrency(budget.total)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Pendiente:</span>
          <span className="font-semibold text-orange-600">{formatCurrency(budget.pending)}</span>
        </div>
      </div>
    </div>
  );
};

export default BudgetCard;

