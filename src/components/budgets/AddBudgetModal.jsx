import React, { useState, useEffect } from 'react';
import Modal from '../Modal';

const AddBudgetModal = ({ isOpen, onClose, onAddWork, selectedCategory }) => {
  const [trabajo, setTrabajo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Trabajos disponibles para GAS
  const gasTrabajos = [
    'FACTIBILIDAD + PARCIAL VIVIENDA UNIFAMILIAR (OBRA NUEVA CASA TIPO)',
    'FINAL (CON INSTALACIÓN DE COCINA) + INSPECCIÓN',
    'PEDIDO DE SOLDADURA/CORTE (TASAS, CARGOS Y PERMISOS DE ECOGAS A CARGO DEL PROPIETARIO)',
    'RETIRO DE MEDIDOR EN JESÚS MARÍA E INSTALACIÓN DEL MISMO Y ADECUACIÓN DE GLP A GAS NATURAL',
    'ADECUACIÓN DE ARTEFACTO',
    'REJILLAS DE VENTILACIÓN INFERIOR/SUPERIOR',
    'CAÑOS DE VENTILACIÓN DE ARTEFACTOS REGLAMENTARIOS',
    'INSTALACIÓN DE ARTEFACTOS',
    'INSTALACIÓN DE CAÑERÍA DE GAS',
    'OTROS'
  ];

  // Resetear campos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setTrabajo('');
      setDescripcion('');
      setMonto('');
      setShowSuccess(false);
    }
  }, [isOpen]);

  const handleMontoChange = (e) => {
    const value = e.target.value;
    // Solo permitir números, punto y coma
    const numericValue = value.replace(/[^0-9.,]/g, '');
    setMonto(numericValue);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const montoNumero = parseFloat(monto.replace(',', '.'));
    if (!trabajo.trim() || !Number.isFinite(montoNumero) || montoNumero <= 0) return;

    const newWork = {
      trabajo: trabajo,
      descripcion: descripcion.trim(),
      monto: montoNumero
    };

    onAddWork(newWork);
    
    // Mostrar mensaje de confirmación
    setShowSuccess(true);
    
    // Resetear campos para facilitar la carga
    setTrabajo('');
    setDescripcion('');
    setMonto('');
    
    // Ocultar mensaje después de 3 segundos
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const handleClose = () => {
    setTrabajo('');
    setDescripcion('');
    setMonto('');
    setShowSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      title="Agregar presupuesto"
      onClose={handleClose}
      contentClassName="max-h-[90vh] overflow-y-auto"
      primaryText="Agregar"
      primaryDisabled={!trabajo.trim() || !(Number.isFinite(parseFloat(monto.replace(',', '.'))) && parseFloat(monto.replace(',', '.')) > 0)}
      onPrimary={(e) => { e?.preventDefault?.(); handleSubmit({ preventDefault: () => {} }); }}
      secondaryText="Cerrar"
      onSecondary={handleClose}
    >
      {showSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Trabajo agregado al presupuesto
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="trabajo" className="block text-sm font-medium text-gray-700 mb-2">Trabajos:</label>
          <select
            id="trabajo"
            value={trabajo}
            onChange={(e) => setTrabajo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleccione un trabajo</option>
            {selectedCategory === 'GAS' && gasTrabajos.map((trabajo, index) => (
              <option key={index} value={trabajo}>{trabajo}</option>
            ))}
            {selectedCategory !== 'GAS' && (
              <option value="TRABAJO PERSONALIZADO">Trabajo personalizado</option>
            )}
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
      </form>
    </Modal>
  );
};

export default AddBudgetModal;
