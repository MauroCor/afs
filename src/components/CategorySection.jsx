import React, { useState } from 'react';
import MaterialRow from './MaterialRow';

const CategorySection = ({ category, materials, quantities, onQuantityChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Filtrar materiales de esta categoría
  const categoryMaterials = materials.filter(material => material.category === category);
  
  // Calcular total de materiales seleccionados en esta categoría
  const totalSelected = categoryMaterials.reduce((total, material) => {
    return total + (quantities[material.id] || 0);
  }, 0);

  return (
    <div className="mb-4 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header de la categoría */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-semibold text-gray-900">
            {category}
          </h2>
          {totalSelected > 0 && (
            <span className="bg-afs-blue text-white text-xs font-bold px-2 py-1 rounded-full">
              {totalSelected}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {categoryMaterials.length} materiales
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Lista de materiales */}
      {isExpanded && (
        <div className="divide-y divide-gray-200">
          {categoryMaterials.length > 0 ? (
            categoryMaterials.map(material => (
              <MaterialRow
                key={material.id}
                material={material}
                quantity={quantities[material.id] || 0}
                onQuantityChange={onQuantityChange}
              />
            ))
          ) : (
            <div className="px-4 py-8 text-center text-gray-500">
              <p>No hay materiales en esta categoría</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategorySection;
