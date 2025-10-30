import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClientes, addCliente, addPago, exportData, importData, getStats } from '../utils/deliveriesStorage';
import { generateAndDownloadReceipt } from '../utils/receiptGenerator';
import PaymentModal from '../components/PaymentModal';
import Footer from '../components/Footer';
import logo from '../images/logo.png';

const DeliveriesPage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAddClienteModalOpen, setIsAddClienteModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [stats, setStats] = useState(null);

  // Formulario para agregar cliente
  const [nombreCliente, setNombreCliente] = useState('');
  const [direccionCliente, setDireccionCliente] = useState('');
  const [montoTotal, setMontoTotal] = useState('');

  // Verificar autenticación
  useEffect(() => {
    const auth = localStorage.getItem('afs_authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // Cargar clientes al montar
  useEffect(() => {
    if (isAuthenticated) {
      loadClientes();
    }
  }, [isAuthenticated]);

  const loadClientes = () => {
    const clientesList = getClientes();
    setClientes(clientesList);
    setStats(getStats());
  };

  // Cerrar sesión
  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      localStorage.removeItem('afs_authenticated');
      navigate('/login', { replace: true });
    }
  };

  // Abrir modal de pago
  const handleOpenPaymentModal = (cliente) => {
    setSelectedCliente(cliente);
    setIsPaymentModalOpen(true);
  };

  // Confirmar pago
  const handleConfirmPayment = async (monto) => {
    if (!selectedCliente) return;

    try {
      const { pago, cliente } = addPago(selectedCliente.id, monto);
      
      // Calcular saldo anterior
      const saldoAnterior = cliente.saldoPendiente + monto;
      
      // Generar PDF del recibo
      generateAndDownloadReceipt(
        cliente.nombre,
        pago,
        saldoAnterior,
        cliente.saldoPendiente,
        cliente.montoTotal
      );

      // Recargar clientes
      loadClientes();

      // Cerrar modal
      setIsPaymentModalOpen(false);
      setSelectedCliente(null);
    } catch (error) {
      console.error('Error al registrar pago:', error);
      alert('Error al registrar el pago');
    }
  };

  // Abrir modal de agregar cliente
  const handleOpenAddClienteModal = () => {
    setNombreCliente('');
    setDireccionCliente('');
    setMontoTotal('');
    setIsAddClienteModalOpen(true);
  };

  // Confirmar agregar cliente
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
      direccion: direccionCliente.trim(),
      montoTotal: montoNumero,
      pagos: []
    });

    // Recargar clientes
    loadClientes();

    // Cerrar modal
    setIsAddClienteModalOpen(false);
    setNombreCliente('');
    setDireccionCliente('');
    setMontoTotal('');
  };

  // Exportar datos
  const handleExportData = () => {
    exportData();
  };

  // Importar datos
  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const success = await importData(file);
      if (success) {
        loadClientes();
        window.location.reload();
      }
    };
    input.click();
  };

  // Obtener color según saldo pendiente
  const getStatusColor = (saldoPendiente, montoTotal) => {
    const porcentaje = (saldoPendiente / montoTotal) * 100;
    if (porcentaje <= 30) return 'text-green-600';
    if (porcentaje <= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Obtener badge de estado
  const getStatusBadge = (saldoPendiente, montoTotal) => {
    const porcentaje = (saldoPendiente / montoTotal) * 100;
    if (saldoPendiente === 0) return { text: 'Pagado', bg: 'bg-green-100', textColor: 'text-green-700' };
    if (porcentaje <= 30) return { text: 'Al día', bg: 'bg-green-100', textColor: 'text-green-700' };
    if (porcentaje <= 70) return { text: 'En plazo', bg: 'bg-yellow-100', textColor: 'text-yellow-700' };
    return { text: 'Deuda alta', bg: 'bg-red-100', textColor: 'text-red-700' };
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-mobile mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div></div>
            
            {/* Logo con título centrado - clickeable */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center hover:opacity-80 transition-opacity duration-200 w-64"
              title="Volver al inicio"
            >
              <img
                src={logo}
                alt="AFS Logo"
                className="h-16 w-16 object-contain flex-shrink-0 mr-3"
              />
              <h1 className="text-lg font-bold text-gray-900">
                Entregas
              </h1>
            </button>
            
            {/* Botón de Cerrar Sesión */}
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition duration-200"
              title="Cerrar sesión"
            >
              Salir
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="w-full max-w-[400px] mx-auto px-4 py-6">
        {/* Estadísticas */}
        {stats && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.totalClientes}</div>
                <div className="text-xs text-gray-600">Clientes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  ${stats.montoTotalPendiente.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Por cobrar</div>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={handleOpenAddClienteModal}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
          >
            <span className="text-xl">+</span>
            <span>Agregar Cliente</span>
          </button>
          
          <button
            onClick={handleExportData}
            className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Exportar</span>
          </button>
        </div>

        {/* Botón importar */}
        <button
          onClick={handleImportData}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200 mb-4 flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span>Importar Datos</span>
        </button>

        {/* Lista de clientes */}
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
          <div className="space-y-3">
            {clientes.map((cliente) => {
              const statusBadge = getStatusBadge(cliente.saldoPendiente, cliente.montoTotal);
              const ultimoPago = cliente.pagos && cliente.pagos.length > 0 
                ? cliente.pagos[cliente.pagos.length - 1]
                : null;
              
              return (
                <div key={cliente.id} className="bg-white rounded-lg shadow-md p-4">
                  {/* Header con badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{cliente.nombre}</h3>
                      {cliente.direccion && (
                        <p className="text-sm text-gray-600">📍 {cliente.direccion}</p>
                      )}
                    </div>
                    <span className={`${statusBadge.bg} ${statusBadge.textColor} px-2 py-1 rounded text-xs font-medium`}>
                      {statusBadge.text}
                    </span>
                  </div>

                  {/* Información financiera */}
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-medium">${cliente.montoTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Pagado:</span>
                      <span className="font-medium text-green-600">
                        ${(cliente.montoTotal - cliente.saldoPendiente).toLocaleString()}
                      </span>
                    </div>
                    <div className={`flex justify-between text-sm font-bold ${getStatusColor(cliente.saldoPendiente, cliente.montoTotal)}`}>
                      <span>Pendiente:</span>
                      <span>${cliente.saldoPendiente.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Último pago */}
                  {ultimoPago && (
                    <div className="text-xs text-gray-500 mb-3 pb-3 border-b border-gray-200">
                      Último pago: {ultimoPago.fecha} - Recibo #{ultimoPago.reciboNum}
                    </div>
                  )}

                  {/* Botón pagar */}
                  <button
                    onClick={() => handleOpenPaymentModal(cliente)}
                    disabled={cliente.saldoPendiente === 0}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition duration-200 ${
                      cliente.saldoPendiente === 0
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                  >
                    {cliente.saldoPendiente === 0 ? '✓ Pagado' : '💰 Registrar Pago'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Espaciado para el footer */}
        <div className="h-4"></div>
      </div>

      {/* Modal agregar cliente */}
      {isAddClienteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Agregar Cliente</h2>
              
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
                    Dirección (opcional):
                  </label>
                  <input
                    type="text"
                    value={direccionCliente}
                    onChange={(e) => setDireccionCliente(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Dirección del cliente"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto Total:
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

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddClienteModalOpen(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmAddCliente}
                    disabled={!nombreCliente.trim() || !montoTotal.trim()}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de pago */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedCliente(null);
        }}
        onConfirm={handleConfirmPayment}
        clienteName={selectedCliente?.nombre || ''}
        saldoPendiente={selectedCliente?.saldoPendiente || 0}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default DeliveriesPage;

