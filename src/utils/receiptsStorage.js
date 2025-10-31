/**
 * Utilidades para manejar el almacenamiento de recibos en localStorage
 */

/**
 * Obtiene todos los clientes almacenados
 * @returns {Array} Lista de clientes
 */
export const getClientes = () => {
  try {
    const data = localStorage.getItem('afs_recibos');
    if (!data) {
      const initialData = {
        clientes: [],
        nextId: 1,
        ultimaActualizacion: new Date().toISOString()
      };
      localStorage.setItem('afs_recibos', JSON.stringify(initialData));
      return [];
    }
    const parsedData = JSON.parse(data);
    return parsedData.clientes || [];
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    return [];
  }
};

/**
 * Guarda todos los clientes
 * @param {Array} clientes - Lista de clientes
 */
export const saveClientes = (clientes) => {
  try {
    const currentData = JSON.parse(localStorage.getItem('afs_recibos') || '{}');
    const newData = {
      ...currentData,
      clientes,
      ultimaActualizacion: new Date().toISOString()
    };
    localStorage.setItem('afs_recibos', JSON.stringify(newData));
  } catch (error) {
    console.error('Error al guardar clientes:', error);
    alert('Error al guardar los datos');
  }
};

/**
 * Agrega un nuevo cliente
 * @param {Object} cliente - Datos del cliente
 * @returns {Object} Cliente con ID asignado
 */
export const addCliente = (cliente) => {
  const clientes = getClientes();
  const currentData = JSON.parse(localStorage.getItem('afs_recibos') || '{}');

  const nextId = (currentData.nextId || clientes.length + 1);

  const newCliente = {
    ...cliente,
    id: nextId,
    pagos: [],
    saldoPendiente: cliente.montoTotal || 0
  };

  clientes.push(newCliente);

  const updatedData = {
    clientes,
    nextId: nextId + 1,
    ultimaActualizacion: new Date().toISOString()
  };
  localStorage.setItem('afs_recibos', JSON.stringify(updatedData));

  return newCliente;
};

/**
 * Agrega un pago a un cliente
 * @param {number} clienteId - ID del cliente
 * @param {number} monto - Monto del pago
 * @returns {Object} Información del pago y cliente
 */
export const addPago = (clienteId, monto) => {
  const clientes = getClientes();
  const currentData = JSON.parse(localStorage.getItem('afs_recibos') || '{}');

  const clienteIndex = clientes.findIndex(c => c.id === clienteId);
  if (clienteIndex === -1) {
    throw new Error('Cliente no encontrado');
  }

  const cliente = clientes[clienteIndex];

  const pago = {
    fecha: new Date().toLocaleDateString('es-AR'),
    monto: monto
  };

  cliente.pagos = cliente.pagos || [];
  cliente.pagos.push(pago);

  cliente.saldoPendiente = cliente.montoTotal - cliente.pagos.reduce((sum, p) => sum + p.monto, 0);

  const updatedData = {
    clientes,
    nextId: currentData.nextId || 1,
    ultimaActualizacion: new Date().toISOString()
  };
  localStorage.setItem('afs_recibos', JSON.stringify(updatedData));

  return { pago, cliente };
};

/**
 * Elimina un cliente por ID
 * @param {number} clienteId - ID del cliente a eliminar
 */
export const deleteCliente = (clienteId) => {
  try {
    const currentData = JSON.parse(localStorage.getItem('afs_recibos') || '{}');
    const clientes = Array.isArray(currentData.clientes) ? currentData.clientes : [];
    const filtered = clientes.filter(c => c.id !== clienteId);
    const newData = {
      ...currentData,
      clientes: filtered,
      ultimaActualizacion: new Date().toISOString()
    };
    localStorage.setItem('afs_recibos', JSON.stringify(newData));
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    alert('Error al eliminar el cliente');
  }
};

/**
 * Obtiene estadísticas generales
 * @returns {Object} Estadísticas
 */
export const getStats = () => {
  const clientes = getClientes();

  const totalClientes = clientes.length;
  const clientesPagados = clientes.filter(c => c.saldoPendiente <= 0).length;
  const clientesConDeuda = clientes.filter(c => c.saldoPendiente > 0).length;

  const montoTotalPresupuestos = clientes.reduce((sum, c) => sum + (c.montoTotal || 0), 0);
  const montoTotalPagado = clientes.reduce((sum, c) => {
    return sum + (c.pagos?.reduce((s, p) => s + p.monto, 0) || 0);
  }, 0);
  const montoTotalPendiente = montoTotalPresupuestos - montoTotalPagado;

  return {
    totalClientes,
    clientesPagados,
    clientesConDeuda,
    montoTotalPresupuestos,
    montoTotalPagado,
    montoTotalPendiente
  };
};


