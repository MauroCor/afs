import React, { useState } from 'react';
import MaterialRow from './InstalationsMaterialRow';

const CategorySection = ({ category, materials, quantities, onQuantityChange, onBrandChange, onAddMaterial }) => {
  const [expandedSections, setExpandedSections] = useState({});
  const [brand, setBrand] = useState('');
  
  // Filtrar materiales de esta categoría
  const categoryMaterials = materials.filter(material => material.category === category);
  
  // Agrupar materiales por sección
  const materialsBySection = categoryMaterials.reduce((acc, material) => {
    const section = material.section || 'Otros';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(material);
    return acc;
  }, {});

  // Asegurar que siempre exista la sección "Otros" aunque esté vacía
  if (!materialsBySection['Otros']) {
    materialsBySection['Otros'] = [];
  }
  
  // Calcular total de materiales seleccionados en esta categoría
  const totalSelected = categoryMaterials.reduce((total, material) => {
    return total + (quantities[material.id] || 0);
  }, 0);

  // Función para toggle de secciones
  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  // Función para manejar cambio de marca
  const handleBrandChange = (e) => {
    const newBrand = e.target.value;
    setBrand(newBrand);
    if (onBrandChange) {
      onBrandChange(category, newBrand);
    }
  };

  // Función para obtener el color de fondo según la categoría
  const getCategoryColor = (category) => {
    switch (category) {
      case 'FUSION GAS':
        return 'bg-amber-500';
      case 'FUSION AGUA':
        return 'bg-sky-500';
      case 'CLOACA CON ORING':
        return 'bg-slate-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="mb-4 w-full">
      {/* Título de la categoría */}
      <div className="mb-3">
        <div className={`${getCategoryColor(category)} text-white rounded-lg shadow-md px-4 py-3 text-center`}>
          <div className="flex items-center justify-center space-x-3">
            <h2 className="text-base font-semibold">
              {category}
            </h2>
            {totalSelected > 0 && (
              <span className="bg-white text-gray-900 text-xs font-bold px-2 py-1 rounded-full">
                {totalSelected}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Input de marca */}
      <div className="mb-4 px-0">
        <div className="flex items-center space-x-3 w-full">
          <label htmlFor={`brand-${category}`} className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Marca:
          </label>
          <input
            type="text"
            id={`brand-${category}`}
            value={brand}
            onChange={handleBrandChange}
            className="w-48 text-sm bg-white border border-gray-300 rounded-lg px-3 py-2 focus:border-afs-blue focus:outline-none"
            placeholder="Ingrese marca"
          />
        </div>
      </div>

      {/* Lista de secciones desplegables */}
      {Object.keys(materialsBySection).length > 0 && (
        <div className="space-y-3">
          {Object.entries(materialsBySection).map(([section, sectionMaterials]) => {
            const isSectionExpanded = expandedSections[section] || false;
            const sectionSelected = sectionMaterials.reduce((total, material) => {
              return total + (quantities[material.id] || 0);
            }, 0);
            
            return (
              <div key={section} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Header de la sección - clickeable */}
                <button
                  onClick={() => toggleSection(section)}
                  className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <h3 className="text-sm font-medium text-gray-900">
                      {section}
                    </h3>
                    {sectionSelected > 0 && (
                      <span className="bg-afs-blue text-white text-xs font-bold px-2 py-1 rounded-full">
                        {sectionSelected}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {sectionMaterials.length} materiales
                    </span>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                        isSectionExpanded ? 'rotate-180' : ''
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
                
                {/* Materiales de la sección - solo si está expandida */}
                {isSectionExpanded && (
                  <div className="divide-y divide-gray-200">
                    {[...sectionMaterials]
                      .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }))
                      .map(material => (
                      <MaterialRow
                        key={material.id}
                        material={material}
                        quantity={quantities[material.id] || 0}
                        onQuantityChange={onQuantityChange}
                      />
                    ))}
                    {/* Botón agregar material - para sección "Otros" en cualquier categoría */}
                    {section === 'Otros' && onAddMaterial && (
                      <div className="px-4 py-3 flex justify-center bg-gray-50">
                        <button
                          onClick={onAddMaterial}
                          className="btn-primary flex items-center justify-center space-x-1 text-sm py-2 px-4"
                        >
                          <span className="text-lg">+</span>
                          <span>Agregar otro</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategorySection;
