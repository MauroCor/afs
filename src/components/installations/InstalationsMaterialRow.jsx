import React from 'react';

const MaterialRow = ({ material, quantity = 0, onQuantityChange }) => {
  const handleIncrement = () => {
    onQuantityChange(material.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      onQuantityChange(material.id, quantity - 1);
    }
  };

  return (
    <div className="flex items-start justify-between py-3 px-4 border-b border-gray-200 bg-white">
      <div className="flex-1 min-w-0 pr-4">
        <h3 className="text-sm font-medium text-gray-900 break-words leading-tight">
          {material.name}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          {material.section || 'Otros'}
        </p>
      </div>
      
      <div className="flex items-center space-x-3 flex-shrink-0">
        <button
          onClick={handleDecrement}
          className="btn-quantity disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={quantity === 0}
          aria-label={`Reducir cantidad de ${material.name}`}
        >
          −
        </button>
        
        <div className="min-w-[3rem] text-center">
          <span className="text-lg font-semibold text-gray-900">
            {quantity}
          </span>
        </div>
        
        <button
          onClick={handleIncrement}
          className="btn-quantity"
          aria-label={`Aumentar cantidad de ${material.name}`}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default MaterialRow;
