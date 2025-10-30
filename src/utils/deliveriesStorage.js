/**
 * Utilidades para manejar el almacenamiento de entregas en localStorage
 */

/**
 * Obtiene todos los clientes almacenados
 * @returns {Array} Lista de clientes
 */
export const getClientes = () => {
  try {
    const data = localStorage.getItem('afs_entregas');
    if (!data) {
      // Si no hay datos, inicializar con estructura vacía
      const initialData = {
        clientes: [],
        nextId: 1,
        ultimoReciboNum: 0,
        ultimaActualizacion: new Date().toISOString()
      };
      localStorage.setItem('afs_entregas', JSON.stringify(initialData));
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
    const currentData = JSON.parse(localStorage.getItem('afs_entregas') || '{}');
    const newData = {
      ...currentData,
      clientes,
      ultimaActualizacion: new Date().toISOString()
    };
    localStorage.setItem('afs_entregas', JSON.stringify(newData));
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
  const currentData = JSON.parse(localStorage.getItem('afs_entregas') || '{}');
  
  // Obtener el siguiente ID
  const nextId = (currentData.nextId || clientes.length + 1);
  
  const newCliente = {
    ...cliente,
    id: nextId,
    pagos: [],
    saldoPendiente: cliente.montoTotal || 0
  };
  
  clientes.push(newCliente);
  
  // Guardar todo junto: clientes y nextId actualizado
  const updatedData = {
    clientes,
    nextId: nextId + 1,
    ultimoReciboNum: currentData.ultimoReciboNum || 0,
    ultimaActualizacion: new Date().toISOString()
  };
  localStorage.setItem('afs_entregas', JSON.stringify(updatedData));
  
  return newCliente;
};

/**
 * Agrega un pago a un cliente
 * @param {number} clienteId - ID del cliente
 * @param {number} monto - Monto del pago
 * @returns {Object} Información del pago
 */
export const addPago = (clienteId, monto) => {
  const clientes = getClientes();
  const currentData = JSON.parse(localStorage.getItem('afs_entregas') || '{}');
  
  const clienteIndex = clientes.findIndex(c => c.id === clienteId);
  if (clienteIndex === -1) {
    throw new Error('Cliente no encontrado');
  }
  
  const cliente = clientes[clienteIndex];
  
  // Obtener siguiente número de recibo
  const reciboNum = (currentData.ultimoReciboNum || 0) + 1;
  
  // Crear pago
  const pago = {
    fecha: new Date().toLocaleDateString('es-AR'),
    monto: monto,
    reciboNum: reciboNum.toString().padStart(3, '0')
  };
  
  // Agregar pago
  cliente.pagos = cliente.pagos || [];
  cliente.pagos.push(pago);
  
  // Calcular nuevo saldo pendiente
  cliente.saldoPendiente = cliente.montoTotal - cliente.pagos.reduce((sum, p) => sum + p.monto, 0);
  
  // Guardar todo junto: clientes y ultimoReciboNum actualizado
  const updatedData = {
    clientes,
    nextId: currentData.nextId || 1,
    ultimoReciboNum: reciboNum,
    ultimaActualizacion: new Date().toISOString()
  };
  localStorage.setItem('afs_entregas', JSON.stringify(updatedData));
  
  return { pago, cliente };
};

/**
 * Exporta los datos a JSON
 */
export const exportData = () => {
  try {
    const data = localStorage.getItem('afs_entregas');
    if (!data) {
      alert('No hay datos para exportar');
      return;
    }
    
    const parsedData = JSON.parse(data);
    const jsonStr = JSON.stringify(parsedData, null, 2);
    
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const fecha = new Date().toISOString().split('T')[0];
    const filename = `afs-entregas-backup-${fecha}.json`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
    
    alert(`✓ Archivo descargado: ${filename}`);
  } catch (error) {
    console.error('Error al exportar:', error);
    alert('Error al exportar los datos');
  }
};

/**
 * Valida la estructura de datos importados
 * @param {Object} data - Datos a validar
 * @returns {boolean} True si es válido
 */
const validateData = (data) => {
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  if (!data.clientes || !Array.isArray(data.clientes)) {
    return false;
  }
  
  // Validar que cada cliente tenga los campos necesarios
  return data.clientes.every(cliente => 
    cliente.nombre && 
    typeof cliente.montoTotal === 'number' &&
    cliente.montoTotal >= 0 &&
    Array.isArray(cliente.pagos)
  );
};

/**
 * Importa datos desde un archivo JSON
 * @param {File} file - Archivo JSON
 * @returns {Promise<boolean>} True si se importó correctamente
 */
export const importData = async (file) => {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    if (!validateData(data)) {
      alert('❌ El archivo no es válido');
      return false;
    }
    
    // Mostrar resumen de datos
    const clienteCount = data.clientes.length;
    const totalPagos = data.clientes.reduce((sum, c) => sum + (c.pagos?.length || 0), 0);
    
    const confirmMessage = `¿Importar ${clienteCount} cliente(s) con ${totalPagos} pago(s) en total?\n\n⚠️ Esto reemplazará tus datos actuales.`;
    
    if (!window.confirm(confirmMessage)) {
      return false;
    }
    
    // Importar datos
    localStorage.setItem('afs_entregas', JSON.stringify(data));
    
    alert(`✓ Datos importados correctamente:\n${clienteCount} cliente(s)`);
    return true;
    
  } catch (error) {
    console.error('Error al importar:', error);
    alert('❌ Error al importar el archivo. Verifica que sea un JSON válido.');
    return false;
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

