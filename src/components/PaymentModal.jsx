import React, { useState, useEffect } from 'react';

const PaymentModal = ({ isOpen, onClose, onConfirm, clienteName, saldoPendiente }) => {
  const [monto, setMonto] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Valores sugeridos
  const quickAmounts = [5000, 10000, 20000, 50000];

  // Resetear campos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
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

  const handleQuickAmountClick = (amount) => {
    setMonto(amount.toString());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!monto.trim()) {
      alert('Por favor ingrese un monto');
      return;
    }

    const montoNumero = parseFloat(monto.replace(',', '.'));
    if (isNaN(montoNumero) || montoNumero <= 0) {
      alert('Por favor ingrese un monto válido');
      return;
    }

    if (montoNumero > saldoPendiente) {
      alert(`El monto no puede ser mayor al saldo pendiente: $${saldoPendiente.toLocaleString()}`);
      return;
    }

    onConfirm(montoNumero);
    
    // Mostrar mensaje de confirmación
    setShowSuccess(true);
    
    // Resetear y cerrar después de 1.5 segundos
    setTimeout(() => {
      setMonto('');
      setShowSuccess(false);
      onClose();
    }, 1500);
  };

  const handleClose = () => {
    setMonto('');
    setShowSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Registrar pago - {clienteName}
          </h2>
          
          {/* Mensaje de confirmación */}
          {showSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Pago registrado correctamente
              </div>
            </div>
          )}
          
          {!showSuccess && (
            <>
              {/* Saldo pendiente */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <div className="text-sm text-gray-600 mb-1">Saldo pendiente</div>
                <div className="text-2xl font-bold text-orange-600">
                  ${saldoPendiente.toLocaleString()}
                </div>
              </div>

              {/* Botones rápidos */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto sugerido:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handleQuickAmountClick(amount)}
                      className={`px-4 py-3 border-2 rounded-lg font-medium transition-all ${
                        monto === amount.toString()
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      }`}
                    >
                      ${amount.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Campo manual */}
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="monto" className="block text-sm font-medium text-gray-700 mb-2">
                    Monto personalizado:
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9.,]*"
                    id="monto"
                    value={monto}
                    onChange={handleMontoChange}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-lg font-medium"
                    placeholder="$..."
                    autoFocus
                  />
                </div>

                {/* Botones */}
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!monto.trim()}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                  >
                    Confirmar
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

