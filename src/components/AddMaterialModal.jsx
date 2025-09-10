import React, { useState } from 'react';

const AddMaterialModal = ({ isOpen, onClose, onAddMaterial }) => {
  const [formData, setFormData] = useState({
    name: ''
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para resetear el formulario
  const resetForm = () => {
    setFormData({
      name: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Por favor ingresa el nombre del material');
      return;
    }

    // Generar ID único
    const newId = Date.now();
    
    const newMaterial = {
      id: newId,
      name: formData.name.trim(),
      section: '',
      category: 'Otros Materiales'
    };

    onAddMaterial(newMaterial);
    
    // Mostrar mensaje de éxito
    setShowSuccessMessage(true);
    resetForm();
    
    // Ocultar mensaje después de 2 segundos
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 2000);
  };

  const handleClose = () => {
    resetForm();
    setShowSuccessMessage(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleClose}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              title="Cerrar modal"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Cerrar</span>
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              Agregar material
            </h2>
          </div>
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
              placeholder="Ej: Tiner 1 Lt."
              required
            />
          </div>

          {/* Mensaje de éxito */}
          {showSuccessMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Material agregado exitosamente
              </div>
            </div>
          )}

          {/* Información */}
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
            <p className="text-sm">
              El material se agregará automáticamente a la categoría "Otros Materiales"
            </p>
          </div>

          {/* Botones */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 btn-secondary"
            >
              Cerrar
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
