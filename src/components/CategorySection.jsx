import React, { useState } from 'react';
import MaterialRow from './MaterialRow';

const CategorySection = ({ category, materials, quantities, onQuantityChange, onBrandChange, onAddMaterial }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [brand, setBrand] = useState('');
  
  // Filtrar materiales de esta categoría
  const categoryMaterials = materials.filter(material => material.category === category);
  
  // Agrupar materiales por sección
  const materialsBySection = categoryMaterials.reduce((acc, material) => {
    // Para "OTROS MATERIALES", no agrupar por sección si está vacía
    if (category === 'OTROS MATERIALES' && (!material.section || material.section.trim() === '')) {
      if (!acc['']) {
        acc[''] = [];
      }
      acc[''].push(material);
    } else {
      const section = material.section || 'Sin sección';
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(material);
    }
    return acc;
  }, {});
  
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

  return (
    <div className="mb-4 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
      {/* Header de la categoría */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <h2 className="text-base font-semibold text-gray-900">
            {category}
          </h2>
          {totalSelected > 0 && (
            <span className="bg-afs-blue text-white text-xs font-bold px-2 py-1 rounded-full">
              {totalSelected}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
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

      {/* Input de marca - solo para categorías que no sean "OTROS MATERIALES" */}
      {isExpanded && category !== 'OTROS MATERIALES' && (
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-3 w-full">
            <label htmlFor={`brand-${category}`} className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Marca:
            </label>
            <input
              type="text"
              id={`brand-${category}`}
              value={brand}
              onChange={handleBrandChange}
              className="w-48 text-sm bg-white border border-gray-300 rounded-md px-3 py-2 focus:border-afs-blue focus:outline-none"
              placeholder="Ingrese marca"
            />
          </div>
        </div>
      )}

      {/* Lista de materiales agrupados por sección */}
      {isExpanded && (
        <div>
          {/* Botón agregar material - solo para "OTROS MATERIALES" */}
          {category === 'OTROS MATERIALES' && onAddMaterial && (
            <div className="px-4 py-3 bg-white flex justify-center border-b border-gray-200">
              <button
                onClick={onAddMaterial}
                className="btn-primary flex items-center justify-center space-x-1 text-sm py-2 px-4"
              >
                <span className="text-lg">+</span>
                <span>Agregar</span>
              </button>
            </div>
          )}
          {Object.keys(materialsBySection).length > 0 ? (
            Object.entries(materialsBySection).map(([section, sectionMaterials]) => {
              const isSectionExpanded = expandedSections[section] || false;
              const sectionSelected = sectionMaterials.reduce((total, material) => {
                return total + (quantities[material.id] || 0);
              }, 0);
              
              // Para "OTROS MATERIALES" con sección vacía, mostrar materiales directamente sin header de sección
              if (category === 'OTROS MATERIALES' && (!section || section.trim() === '')) {
                // Ordenar materiales alfabéticamente por nombre
                const sortedMaterials = [...sectionMaterials].sort((a, b) => 
                  a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
                );
                
                return (
                  <div key={section} className="divide-y divide-gray-200">
                    {sortedMaterials.map(material => (
                      <MaterialRow
                        key={material.id}
                        material={material}
                        quantity={quantities[material.id] || 0}
                        onQuantityChange={onQuantityChange}
                      />
                    ))}
                  </div>
                );
              }
              
              return (
                <div key={section}>
                  {/* Header de la sección - clickeable */}
                  <button
                    onClick={() => toggleSection(section)}
                    className="w-full px-4 py-2 bg-gray-100 border-b border-gray-200 hover:bg-gray-200 transition-colors duration-200 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
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
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
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
                    </div>
                  )}
                </div>
              );
            })
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
