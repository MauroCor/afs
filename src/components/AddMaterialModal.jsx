import React, { useState, useEffect } from 'react';
import { categories, initialMaterials } from '../data/materials';

const AddMaterialModal = ({ isOpen, onClose, onAddMaterial }) => {
  const [formData, setFormData] = useState({
    name: '',
    section: '',
    category: categories[0]
  });

  // Obtener secciones disponibles para la categoría seleccionada
  const getAvailableSections = (category) => {
    const categoryMaterials = initialMaterials.filter(material => material.category === category);
    const sections = [...new Set(categoryMaterials.map(material => material.section))];
    // Agregar "Otros" como opción adicional
    sections.push('Otros');
    return sections.sort();
  };

  const [availableSections, setAvailableSections] = useState(getAvailableSections(categories[0]));

  // Inicializar la sección cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      const sections = getAvailableSections(formData.category);
      setAvailableSections(sections);
      setFormData(prev => ({
        ...prev,
        section: sections[0] || ''
      }));
    }
  }, [isOpen, formData.category]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'category') {
      // Cuando cambia la categoría, actualizar las secciones disponibles y resetear la sección
      const newSections = getAvailableSections(value);
      setAvailableSections(newSections);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        section: newSections[0] || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Función para resetear el formulario
  const resetForm = () => {
    setFormData({
      name: '',
      section: '',
      category: categories[0]
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.section.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    // Generar ID único
    const newId = Date.now();
    
    const newMaterial = {
      id: newId,
      name: formData.name.trim(),
      section: formData.section.trim(),
      category: formData.category
    };

    onAddMaterial(newMaterial);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Agregar material
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            aria-label="Cerrar modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del material
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Ej: Cemento Portland"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="input-field"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-2">
              Sección
            </label>
            <select
              id="section"
              name="section"
              value={formData.section}
              onChange={handleInputChange}
              className="input-field"
              required
            >
              <option value="">Selecciona una sección</option>
              {availableSections.map(section => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </select>
          </div>

          {/* Botones */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
            >
              Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMaterialModal;
