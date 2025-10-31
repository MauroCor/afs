/**
 * Utilidades para manejar el almacenamiento de clientes en localStorage
 * Clientes unificados con budgets y payments
 */

/**
 * Obtiene todos los clientes almacenados
 * @returns {Array} Lista de clientes
 */
export const getClients = () => {
  try {
    const data = localStorage.getItem('afs_clients');
    if (!data) {
      const initialData = {
        clients: [],
        nextId: 1,
        ultimaActualizacion: new Date().toISOString()
      };
      localStorage.setItem('afs_clients', JSON.stringify(initialData));
      return [];
    }
    const parsedData = JSON.parse(data);
    return parsedData.clients || [];
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    return [];
  }
};

/**
 * Guarda todos los clientes
 * @param {Array} clients - Lista de clientes
 */
export const saveClients = (clients) => {
  try {
    const currentData = JSON.parse(localStorage.getItem('afs_clients') || '{}');
    const newData = {
      ...currentData,
      clients,
      ultimaActualizacion: new Date().toISOString()
    };
    localStorage.setItem('afs_clients', JSON.stringify(newData));
  } catch (error) {
    console.error('Error al guardar clientes:', error);
    alert('Error al guardar los datos');
  }
};

/**
 * Busca clientes por nombre (búsqueda parcial, case-insensitive)
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Array} Lista de clientes que coinciden
 */
export const searchClients = (searchTerm) => {
  if (!searchTerm || searchTerm.trim() === '') {
    return [];
  }
  const clients = getClients();
  const term = searchTerm.trim().toUpperCase();
  return clients.filter(client => 
    client.name.toUpperCase().includes(term) ||
    (client.address && client.address.toUpperCase().includes(term))
  );
};

/**
 * Verifica si un cliente existe (por nombre, case-insensitive)
 * @param {string} name - Nombre del cliente a verificar
 * @returns {Object|null} Cliente encontrado o null
 */
export const findClientByName = (name) => {
  const clients = getClients();
  const nameUpper = name.trim().toUpperCase();
  return clients.find(c => c.name.toUpperCase() === nameUpper) || null;
};

/**
 * Agrega un nuevo cliente
 * @param {Object} client - Datos del cliente {name, address}
 * @returns {Object} Cliente con ID asignado
 */
export const addClient = (client) => {
  const clients = getClients();
  const currentData = JSON.parse(localStorage.getItem('afs_clients') || '{}');

  const nextId = (currentData.nextId || clients.length + 1);

  const newClient = {
    name: client.name.trim().toUpperCase(),
    address: client.address ? client.address.trim() : '',
    id: nextId,
    budgets: {},
    payments: {},
    createdAt: new Date().toISOString()
  };

  clients.push(newClient);

  const updatedData = {
    clients,
    nextId: nextId + 1,
    ultimaActualizacion: new Date().toISOString()
  };
  localStorage.setItem('afs_clients', JSON.stringify(updatedData));

  return newClient;
};

/**
 * Actualiza un cliente existente
 * @param {number} clientId - ID del cliente
 * @param {Object} updates - Campos a actualizar {name?, address?}
 * @returns {Object|null} Cliente actualizado o null si no existe
 */
export const updateClient = (clientId, updates) => {
  const clients = getClients();
  const clientIndex = clients.findIndex(c => c.id === clientId);
  
  if (clientIndex === -1) {
    return null;
  }

  const client = clients[clientIndex];
  const updatedClient = {
    ...client,
    ...updates,
    name: updates.name ? updates.name.trim().toUpperCase() : client.name,
    address: updates.address !== undefined ? updates.address.trim() : client.address,
    updatedAt: new Date().toISOString()
  };

  clients[clientIndex] = updatedClient;
  saveClients(clients);

  return updatedClient;
};

/**
 * Elimina un cliente por ID
 * @param {number} clientId - ID del cliente a eliminar
 */
export const deleteClient = (clientId) => {
  try {
    const clients = getClients();
    const filtered = clients.filter(c => c.id !== clientId);
    const currentData = JSON.parse(localStorage.getItem('afs_clients') || '{}');
    const newData = {
      ...currentData,
      clients: filtered,
      ultimaActualizacion: new Date().toISOString()
    };
    localStorage.setItem('afs_clients', JSON.stringify(newData));
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    alert('Error al eliminar el cliente');
  }
};

/**
 * Obtiene un cliente por ID
 * @param {number} clientId - ID del cliente
 * @returns {Object|null} Cliente encontrado o null
 */
export const getClientById = (clientId) => {
  const clients = getClients();
  return clients.find(c => c.id === clientId) || null;
};

/**
 * Agrega un presupuesto a un cliente
 * @param {number} clientId - ID del cliente
 * @param {Object} budgetData - Datos del presupuesto {total, date, category}
 * @returns {string} ID del budget creado
 */
export const addBudget = (clientId, budgetData) => {
  const clients = getClients();
  const clientIndex = clients.findIndex(c => c.id === clientId);
  
  if (clientIndex === -1) {
    throw new Error('Cliente no encontrado');
  }

  const client = clients[clientIndex];
  
  // Obtener el siguiente ID de budget para este cliente
  const budgetIds = Object.keys(client.budgets || {});
  const nextBudgetId = budgetIds.length > 0 
    ? String(Math.max(...budgetIds.map(id => parseInt(id))) + 1)
    : "0";

  const newBudget = {
    total: budgetData.total || 0,
    pending: budgetData.total || 0,
    date: budgetData.date || new Date().toISOString().split('T')[0],
    category: budgetData.category || '',
    status: 'active'
  };

  client.budgets = client.budgets || {};
  client.budgets[nextBudgetId] = newBudget;
  client.payments = client.payments || {};
  client.payments[nextBudgetId] = [];

  clients[clientIndex] = client;
  saveClients(clients);

  return nextBudgetId;
};

/**
 * Agrega un pago a un presupuesto
 * @param {number} clientId - ID del cliente
 * @param {string} budgetId - ID del presupuesto
 * @param {Object} paymentData - Datos del pago {amount, date}
 * @returns {Object} Pago creado y cliente actualizado
 */
export const addPayment = (clientId, budgetId, paymentData) => {
  const clients = getClients();
  const clientIndex = clients.findIndex(c => c.id === clientId);
  
  if (clientIndex === -1) {
    throw new Error('Cliente no encontrado');
  }

  const client = clients[clientIndex];
  
  if (!client.budgets || !client.budgets[budgetId]) {
    throw new Error('Presupuesto no encontrado');
  }

  const payment = {
    budget_id: budgetId,
    date: paymentData.date || new Date().toLocaleDateString('es-AR'),
    amount: paymentData.amount || 0
  };

  client.payments = client.payments || {};
  client.payments[budgetId] = client.payments[budgetId] || [];
  client.payments[budgetId].push(payment);

  // Recalcular pending
  updateBudgetPending(clientId, budgetId);

  const updatedClient = { ...client };
  saveClients(clients);

  return { payment, client: updatedClient };
};

/**
 * Recalcula el saldo pendiente de un presupuesto
 * @param {number} clientId - ID del cliente
 * @param {string} budgetId - ID del presupuesto
 */
export const updateBudgetPending = (clientId, budgetId) => {
  const clients = getClients();
  const clientIndex = clients.findIndex(c => c.id === clientId);
  
  if (clientIndex === -1 || !clients[clientIndex].budgets || !clients[clientIndex].budgets[budgetId]) {
    return;
  }

  const budget = clients[clientIndex].budgets[budgetId];
  const payments = clients[clientIndex].payments[budgetId] || [];
  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  
  budget.pending = budget.total - totalPaid;
  
  clients[clientIndex].budgets[budgetId] = budget;
  saveClients(clients);
};

/**
 * Elimina un presupuesto (solo si no tiene pagos)
 * @param {number} clientId - ID del cliente
 * @param {string} budgetId - ID del presupuesto
 * @returns {boolean} true si se eliminó, false si tenía pagos
 */
export const deleteBudget = (clientId, budgetId) => {
  const clients = getClients();
  const clientIndex = clients.findIndex(c => c.id === clientId);
  
  if (clientIndex === -1 || !clients[clientIndex].budgets || !clients[clientIndex].budgets[budgetId]) {
    return false;
  }

  const payments = clients[clientIndex].payments[budgetId] || [];
  
  if (payments.length > 0) {
    return false; // No se puede eliminar si tiene pagos
  }

  delete clients[clientIndex].budgets[budgetId];
  delete clients[clientIndex].payments[budgetId];
  
  saveClients(clients);
  return true;
};

/**
 * Cancela un presupuesto (marca como cancelado)
 * @param {number} clientId - ID del cliente
 * @param {string} budgetId - ID del presupuesto
 */
export const cancelBudget = (clientId, budgetId) => {
  const clients = getClients();
  const clientIndex = clients.findIndex(c => c.id === clientId);
  
  if (clientIndex === -1 || !clients[clientIndex].budgets || !clients[clientIndex].budgets[budgetId]) {
    return;
  }

  clients[clientIndex].budgets[budgetId].status = 'cancel';
  saveClients(clients);
};

/**
 * Obtiene los presupuestos activos de un cliente (con pending > 0)
 * @param {number} clientId - ID del cliente
 * @returns {Array} Lista de presupuestos activos
 */
export const getActiveBudgets = (clientId) => {
  const client = getClientById(clientId);
  if (!client || !client.budgets) {
    return [];
  }

  return Object.entries(client.budgets)
    .filter(([id, budget]) => budget.status === 'active' && budget.pending > 0)
    .map(([id, budget]) => ({
      id,
      ...budget
    }));
};

