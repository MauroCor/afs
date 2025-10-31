import React, { useState } from 'react';
import Modal from '../Modal';

const AddMaterialModal = ({ isOpen, onClose, onAddMaterial, category }) => {
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
    if (!formData.name.trim()) return;

    // Generar ID único
    const newId = Date.now();
    
    const newMaterial = {
      id: newId,
      name: formData.name.trim(),
      section: '', // Se asignará automáticamente a "Otros" por la lógica de CategorySection
      category: category || ''
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
    <Modal
      title="Agregar material"
      onClose={handleClose}
      contentClassName="max-h-[90vh] overflow-y-auto"
      primaryText="Agregar"
      primaryDisabled={!formData.name.trim()}
      onPrimary={(e) => { e?.preventDefault?.(); handleSubmit({ preventDefault: () => {} }); }}
      secondaryText="Cerrar"
      onSecondary={handleClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Nombre del material</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="input-field"
            placeholder="Ej: Tiner 1 Lt."
          />
        </div>
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
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
          <p className="text-sm">El material se agregará automáticamente a la sección "Otros" de la categoría "{category}"</p>
        </div>
      </form>
    </Modal>
  );
};

export default AddMaterialModal;
