import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClientes, addCliente, addPago, deleteCliente } from '../utils/receiptsStorage';
import { sharePDF } from '../utils/pdf/generator';
import { formatCurrency, parseMoneyInput } from '../utils/format';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import IconTrash from '../components/IconTrash';
import AppHeader from '../components/AppHeader';
import ShareButton from '../components/ShareButton';

const ReceiptsPage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [isAddClienteModalOpen, setIsAddClienteModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [nuevoPago, setNuevoPago] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);

  const [nombreCliente, setNombreCliente] = useState('');
  const [montoTotal, setMontoTotal] = useState('');

  useEffect(() => {
    const auth = localStorage.getItem('afs_authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadClientes();
    }
  }, [isAuthenticated]);

  const loadClientes = () => {
    const clientesList = getClientes();
    setClientes(clientesList);
  };

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      localStorage.removeItem('afs_authenticated');
      navigate('/login', { replace: true });
    }
  };

  const handleOpenClienteModal = (cliente) => {
    setSelectedCliente(cliente);
    setNuevoPago('');
    setIsClientModalOpen(true);
  };

  const handleConfirmNuevoPago = () => {
    if (!selectedCliente) return;
    const montoNumero = parseMoneyInput(nuevoPago);
    if (!Number.isFinite(montoNumero) || montoNumero <= 0) return;

    try {
      const { pago, cliente } = addPago(selectedCliente.id, montoNumero);
      sharePDF('receipt', {
        clienteName: cliente.nombre,
        pago,
        montoTotal: cliente.montoTotal,
        saldoPendiente: cliente.saldoPendiente,
      });
      loadClientes();
      setIsClientModalOpen(false);
      setSelectedCliente(null);
      setNuevoPago('');
    } catch (error) {
      console.error('Error al registrar pago:', error);
      alert('Error al registrar el pago');
    }
  };

  const handleOpenDeleteModal = (cliente) => {
    setClienteAEliminar(cliente);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!clienteAEliminar) return;
    try {
      deleteCliente(clienteAEliminar.id);
      setIsDeleteModalOpen(false);
      setClienteAEliminar(null);
      loadClientes();
    } catch (error) {
      // errores ya se alertan en util
    }
  };

  const handleOpenAddClienteModal = () => {
    setNombreCliente('');
    setMontoTotal('');
    setIsAddClienteModalOpen(true);
  };

  const handleConfirmAddCliente = () => {
    if (!nombreCliente.trim() || !montoTotal.trim()) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    const montoNumero = parseFloat(montoTotal.replace(',', '.'));
    if (isNaN(montoNumero) || montoNumero <= 0) {
      alert('Por favor ingrese un monto válido');
      return;
    }

    addCliente({
      nombre: nombreCliente.trim().toUpperCase(),
      montoTotal: montoNumero,
      pagos: []
    });

    loadClientes();
    setIsAddClienteModalOpen(false);
    setNombreCliente('');
    setMontoTotal('');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header con navegación y logout */}
      <AppHeader title="RECIBOS" onLogout={handleLogout} homePath="/" />

      <div className="w-full max-w-[400px] mx-auto px-4 py-6">
        {/* Botón para agregar nuevo cliente */}
        <div className="grid grid-cols-1 gap-3 mb-4">
          <button
            onClick={handleOpenAddClienteModal}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
          >
            <span className="text-xl">+</span>
            <span>Agregar Cliente</span>
          </button>
        </div>

        {/* Estado vacío: mensaje cuando no hay clientes registrados */}
        {clientes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay clientes registrados
            </h3>
            <p className="text-gray-500 mb-4">
              Agrega tu primer cliente para comenzar
            </p>
            <button
              onClick={handleOpenAddClienteModal}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
            >
              Agregar cliente
            </button>
          </div>
        ) : (
          /* Lista de clientes registrados */
          <div className="space-y-3">
            {clientes.map((cliente) => {
              return (
                <div key={cliente.id} className="mb-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
                  <button
                    className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between"
                    onClick={() => handleOpenClienteModal(cliente)}
                  >
                    <div className="flex items-center space-x-3">
                      <h2 className="text-base font-semibold text-gray-900">{cliente.nombre}</h2>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleOpenDeleteModal(cliente); }}
                        className="p-2 rounded hover:bg-red-50 text-red-600 hover:text-red-700"
                        title={`Eliminar ${cliente.nombre}`}
                        aria-label={`Eliminar ${cliente.nombre}`}
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="h-4"></div>
      </div>

      {/* Modal: Formulario para agregar nuevo cliente */}
      {isAddClienteModalOpen && (
        <Modal
          title="Agregar Cliente"
          onClose={() => setIsAddClienteModalOpen(false)}
          secondaryText="Cancelar"
          onSecondary={() => setIsAddClienteModalOpen(false)}
          primaryText="Agregar"
          primaryDisabled={!nombreCliente.trim() || !(Number.isFinite(parseFloat(montoTotal.replace(',', '.'))) && parseFloat(montoTotal.replace(',', '.')) > 0)}
          onPrimary={handleConfirmAddCliente}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Cliente:
              </label>
              <input
                type="text"
                value={nombreCliente}
                onChange={(e) => setNombreCliente(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Nombre del cliente"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Presupuesto Total:
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={montoTotal}
                onChange={(e) => setMontoTotal(e.target.value.replace(/[^0-9.,]/g, ''))}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="$..."
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Registro de nuevo pago y generación de recibo PDF */}
      {isClientModalOpen && selectedCliente && (
        <Modal
          title={`RECIBOS: ${selectedCliente.nombre}`}
          onClose={() => { setIsClientModalOpen(false); setSelectedCliente(null); setNuevoPago(''); }}
          footer={
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => { setIsClientModalOpen(false); setSelectedCliente(null); setNuevoPago(''); }}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
              >
                Cancelar
              </button>
              <div className="flex-1">
                <ShareButton
                  onGeneratePDF={handleConfirmNuevoPago}
                  disabled={!nuevoPago || parseMoneyInput(nuevoPago) <= 0}
                  fullWidth
                  noMargin
                />
              </div>
            </div>
          }
        >
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Presupuesto total:</span>
              <span className="font-medium">{formatCurrency(selectedCliente.montoTotal)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold">
              <span>Pendiente:</span>
              <span>{formatCurrency(selectedCliente.saldoPendiente)}</span>
            </div>
            {selectedCliente.pagos && selectedCliente.pagos.length > 0 && (
              <div className="text-xs text-gray-500 border-t pt-2">
                {(() => {
                  const u = selectedCliente.pagos[selectedCliente.pagos.length - 1];
                  return `Último pago: ${u.fecha}`;
                })()}
              </div>
            )}
            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nuevo pago</label>
              <input
                type="text"
                inputMode="numeric"
                value={nuevoPago}
                onChange={(e) => setNuevoPago(e.target.value.replace(/[^0-9.,]/g, ''))}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="$..."
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Confirmación de eliminación de cliente */}
      {isDeleteModalOpen && clienteAEliminar && (
        <ConfirmModal
          title={`Eliminar cliente: ${clienteAEliminar.nombre}`}
          message={`¿Seguro que querés eliminar al cliente ${clienteAEliminar.nombre}?`}
          confirmText="Eliminar"
          onConfirm={handleConfirmDelete}
          onCancel={() => { setIsDeleteModalOpen(false); setClienteAEliminar(null); }}
        />
      )}

      {/* Footer de la aplicación */}
      <Footer />
    </div>
  );
};

export default ReceiptsPage;


