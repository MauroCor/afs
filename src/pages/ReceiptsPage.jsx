import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveBudgets, addPayment, addBudget, deleteBudget, cancelBudget, getClientById } from '../utils/clientsStorage';
import { sharePDF } from '../utils/pdf/generator';
import { formatCurrency, parseMoneyInput } from '../utils/format';
import Footer from '../components/Footer';
import ConfirmModal from '../components/ConfirmModal';
import AppHeader from '../components/AppHeader';
import ShareButton from '../components/ShareButton';
import ClientSelector from '../components/ClientSelector';
import BudgetCard from '../components/BudgetCard';

const ReceiptsPage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeBudgets, setActiveBudgets] = useState([]);
  const [selectedBudgetId, setSelectedBudgetId] = useState(null);
  const [presupuestoTotal, setPresupuestoTotal] = useState('');
  const [saldoPendiente, setSaldoPendiente] = useState('');
  const [nuevoPago, setNuevoPago] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isDeleteBudgetModalOpen, setIsDeleteBudgetModalOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);

  useEffect(() => {
    const auth = localStorage.getItem('afs_authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (selectedClient) {
      const budgets = getActiveBudgets(selectedClient.id);
      setActiveBudgets(budgets);
      // Limpiar campos si cambia el cliente
      setSelectedBudgetId(null);
      setPresupuestoTotal('');
      setSaldoPendiente('');
      setNuevoPago('');
    } else {
      setActiveBudgets([]);
      setSelectedBudgetId(null);
      setPresupuestoTotal('');
      setSaldoPendiente('');
      setNuevoPago('');
    }
  }, [selectedClient]);

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      localStorage.removeItem('afs_authenticated');
      navigate('/login', { replace: true });
    }
  };

  const handleSelectBudget = (budgetId) => {
    // Si ya está seleccionado, deseleccionar
    if (selectedBudgetId === budgetId) {
      setSelectedBudgetId(null);
      setPresupuestoTotal('');
      setSaldoPendiente('');
      return;
    }
    
    // Seleccionar nuevo presupuesto
    setSelectedBudgetId(budgetId);
    const budget = activeBudgets.find(b => b.id === budgetId);
    if (budget) {
      setPresupuestoTotal(formatCurrency(budget.total));
      setSaldoPendiente(formatCurrency(budget.pending));
    }
  };

  const handleDeleteBudget = (budgetId, event) => {
    event.stopPropagation();
    const budget = activeBudgets.find(b => b.id === budgetId);
    const client = getClientById(selectedClient.id);
    const payments = client?.payments?.[budgetId] || [];
    
    if (payments.length > 0) {
      // Si tiene pagos, cancelar en lugar de eliminar
      cancelBudget(selectedClient.id, budgetId);
      const updatedBudgets = getActiveBudgets(selectedClient.id);
      setActiveBudgets(updatedBudgets);
      if (selectedBudgetId === budgetId) {
        setSelectedBudgetId(null);
        setPresupuestoTotal('');
        setSaldoPendiente('');
      }
    } else {
      // Si no tiene pagos, eliminar
      setBudgetToDelete({ clientId: selectedClient.id, budgetId });
      setIsDeleteBudgetModalOpen(true);
    }
  };

  const handleConfirmDeleteBudget = () => {
    if (!budgetToDelete) return;
    const deleted = deleteBudget(budgetToDelete.clientId, budgetToDelete.budgetId);
    if (deleted) {
      const updatedBudgets = getActiveBudgets(selectedClient.id);
      setActiveBudgets(updatedBudgets);
      if (selectedBudgetId === budgetToDelete.budgetId) {
        setSelectedBudgetId(null);
        setPresupuestoTotal('');
        setSaldoPendiente('');
      }
    }
    setIsDeleteBudgetModalOpen(false);
    setBudgetToDelete(null);
  };

  const handleGeneratePDF = async () => {
    if (!selectedClient || !nuevoPago) return;
    
    const montoNumero = parseMoneyInput(nuevoPago);
    if (!Number.isFinite(montoNumero) || montoNumero <= 0) return;

    setIsGeneratingPDF(true);

    try {
      let budgetId = selectedBudgetId;
      let montoTotal = parseMoneyInput(presupuestoTotal.replace(/[$.,]/g, ''));
      let saldoPendienteNum = parseMoneyInput(saldoPendiente.replace(/[$.,]/g, ''));

      // Si no hay presupuesto seleccionado, crear uno nuevo
      if (!budgetId) {
        if (montoTotal <= 0) {
          alert('Por favor ingrese un presupuesto total válido');
          setIsGeneratingPDF(false);
          return;
        }
        budgetId = addBudget(selectedClient.id, {
          total: montoTotal,
          date: new Date().toISOString().split('T')[0],
          category: ''
        });
        // Recalcular saldo pendiente inicial
        saldoPendienteNum = montoTotal;
      }

      // Agregar pago
      const { payment, client } = addPayment(selectedClient.id, budgetId, {
        amount: montoNumero,
        date: new Date().toLocaleDateString('es-AR')
      });

      // Obtener datos actualizados
      const updatedClient = getClientById(selectedClient.id);
      const updatedBudget = updatedClient.budgets[budgetId];

      // Generar PDF
      await sharePDF('receipt', {
        clienteName: client.name,
        pago: {
          fecha: payment.date,
          monto: payment.amount
        },
        montoTotal: updatedBudget.total,
        saldoPendiente: updatedBudget.pending,
      });

      // Actualizar estado
      const budgets = getActiveBudgets(selectedClient.id);
      setActiveBudgets(budgets);
      setNuevoPago('');
      setSaldoPendiente(formatCurrency(updatedBudget.pending));
    } catch (error) {
      console.error('Error al registrar pago:', error);
      alert('Error al registrar el pago');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader title="RECIBOS" onLogout={handleLogout} homePath="/" />

      <div className="w-full max-w-[400px] mx-auto px-4 py-6">
        {/* Selector de cliente */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cliente:
          </label>
          <ClientSelector
            onSelectClient={setSelectedClient}
            selectedClient={selectedClient}
            required={false}
          />
        </div>

        {/* Cards de presupuestos activos */}
        {selectedClient && activeBudgets.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Presupuestos:
            </label>
            <div className="space-y-2">
              {activeBudgets.map((budget) => {
                const client = getClientById(selectedClient.id);
                const payments = client?.payments?.[budget.id] || [];
                const canDelete = payments.length === 0;
                
                return (
                  <BudgetCard
                    key={budget.id}
                    budget={budget}
                    onSelect={() => handleSelectBudget(budget.id)}
                    onDelete={(e) => handleDeleteBudget(budget.id, e)}
                    canDelete={true}
                    isSelected={selectedBudgetId === budget.id}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Campos de presupuesto y pago */}
        {selectedClient && (
          <div className="space-y-4">
            {/* Presupuesto Total */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Presupuesto Total:
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={presupuestoTotal}
                onChange={(e) => setPresupuestoTotal(e.target.value.replace(/[^0-9.,]/g, ''))}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="$..."
                disabled={!!selectedBudgetId}
              />
            </div>

            {/* Saldo Pendiente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Saldo Pendiente:
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={saldoPendiente}
                onChange={(e) => setSaldoPendiente(e.target.value.replace(/[^0-9.,]/g, ''))}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="$..."
                disabled={!!selectedBudgetId}
              />
            </div>

            {/* Nuevo Pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nuevo Pago:
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={nuevoPago}
                onChange={(e) => setNuevoPago(e.target.value.replace(/[^0-9.,]/g, ''))}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="$..."
                autoFocus
              />
            </div>

            {/* Botón Generar PDF */}
            <div className="flex justify-center">
              <ShareButton
                onGeneratePDF={handleGeneratePDF}
                disabled={!nuevoPago || parseMoneyInput(nuevoPago) <= 0}
                loading={isGeneratingPDF}
                label="Generar PDF"
              />
            </div>
          </div>
        )}

        <div className="h-4"></div>
      </div>

      {/* Modal: Confirmación de eliminación de presupuesto */}
      {isDeleteBudgetModalOpen && budgetToDelete && (
        <ConfirmModal
          title="Eliminar Presupuesto"
          message="¿Seguro que querés eliminar este presupuesto?"
          confirmText="Eliminar"
          onConfirm={handleConfirmDeleteBudget}
          onCancel={() => { setIsDeleteBudgetModalOpen(false); setBudgetToDelete(null); }}
        />
      )}

      <Footer />
    </div>
  );
};

export default ReceiptsPage;
