import jsPDF from 'jspdf';
import logo from '../images/logo.png';

/**
 * Configuración del PDF de recibo
 */
const PDF_CONFIG = {
  pageWidth: 210,
  pageHeight: 297,
  margins: {
    top: 20,
    bottom: 20,
    left: 20,
    right: 20
  },
  colors: {
    black: [0, 0, 0],
    darkGray: [64, 64, 64],
    mediumGray: [128, 128, 128],
    lightGray: [200, 200, 200],
    white: [255, 255, 255],
    blue: [0, 102, 204]
  }
};

/**
 * Crea el logo del PDF
 */
const createLogo = (doc, x, y, size = 20) => {
  try {
    if (logo) {
      doc.addImage(logo, 'PNG', x, y, size, size);
      return;
    }
  } catch (error) {
    // Fallback silencioso
  }
  
  // Fallback: cuadrado con texto
  const centerX = x + size/2;
  const centerY = y + size/2;
  
  doc.setFillColor(240, 240, 240);
  doc.rect(x, y, size, size, 'F');
  
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(x, y, size, size);
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('AFS', centerX, centerY, { align: 'center' });
  
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.3);
  doc.line(x + 2, centerY + 5, x + size - 2, centerY + 5);
};

/**
 * Crea el encabezado del recibo
 */
const createHeader = (doc) => {
  const { margins, pageWidth } = PDF_CONFIG;
  
  // Logo
  const logoSize = 25;
  const logoY = margins.top + 5;
  createLogo(doc, margins.left, logoY, logoSize);
  
  // Información de la empresa
  const infoX = pageWidth - margins.right;
  let infoY = logoY + 5;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PDF_CONFIG.colors.black);
  doc.text('ADRIÁN FERNANDO SECULINI', infoX, infoY, { align: 'right' });
  
  infoY += 5;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...PDF_CONFIG.colors.darkGray);
  doc.text('Maestro Mayor de Obras - M.P. 1663/1', infoX, infoY, { align: 'right' });
  
  infoY += 4;
  doc.setFontSize(8);
  doc.setTextColor(...PDF_CONFIG.colors.mediumGray);
  doc.text('Eduardo Olocco 2113 - Santa Elena', infoX, infoY, { align: 'right' });
  
  infoY += 4;
  doc.text('3517642188 / adrianseculini@hotmail.com', infoX, infoY, { align: 'right' });
  
  // Línea separadora
  const separatorY = logoY + logoSize + 10;
  doc.setDrawColor(...PDF_CONFIG.colors.lightGray);
  doc.setLineWidth(0.5);
  doc.line(margins.left, separatorY, pageWidth - margins.right, separatorY);
};

/**
 * Crea el título "RECIBO"
 */
const createReceiptTitle = (doc, y) => {
  const { pageWidth } = PDF_CONFIG;
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PDF_CONFIG.colors.black);
  doc.text('RECIBO', pageWidth / 2, y, { align: 'center' });
};

/**
 * Genera el PDF del recibo
 * @param {string} clienteName - Nombre del cliente
 * @param {Object} pago - Información del pago
 * @param {number} saldoAnterior - Saldo anterior al pago
 * @param {number} saldoPendiente - Saldo pendiente después del pago
 * @param {number} montoTotal - Monto total del presupuesto
 * @returns {jsPDF} Documento PDF generado
 */
export const generateReceiptPDF = (
  clienteName = '', 
  pago = {}, 
  saldoAnterior = 0, 
  saldoPendiente = 0,
  montoTotal = 0
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  const { margins, pageWidth } = PDF_CONFIG;
  let currentY = margins.top;
  
  // Encabezado
  createHeader(doc);
  currentY += 40;
  
  // Título RECIBO
  createReceiptTitle(doc, currentY);
  currentY += 10;
  
  // Número de recibo
  if (pago.reciboNum) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PDF_CONFIG.colors.darkGray);
    doc.text(`Nº ${pago.reciboNum}`, pageWidth / 2, currentY, { align: 'center' });
    currentY += 8;
  }
  
  // Espaciado
  currentY += 5;
  
  // Fecha
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...PDF_CONFIG.colors.black);
  doc.text('Fecha:', margins.left, currentY);
  doc.setFont('helvetica', 'bold');
  doc.text(pago.fecha || new Date().toLocaleDateString('es-AR'), margins.left + 15, currentY);
  currentY += 7;
  
  // Cliente
  doc.setFont('helvetica', 'normal');
  doc.text('Cliente:', margins.left, currentY);
  doc.setFont('helvetica', 'bold');
  const clienteNameLines = doc.splitTextToSize(clienteName.toUpperCase(), 150);
  doc.text(clienteNameLines, margins.left + 15, currentY);
  currentY += 7;
  
  // Concepto
  doc.setFont('helvetica', 'normal');
  doc.text('Concepto:', margins.left, currentY);
  const concepto = saldoPendiente > 0 ? 'Señoraje de pago parcial' : 'Señoraje de pago final';
  doc.setFont('helvetica', 'normal');
  doc.text(concepto, margins.left + 20, currentY);
  currentY += 10;
  
  // Línea separadora
  doc.setDrawColor(...PDF_CONFIG.colors.lightGray);
  doc.setLineWidth(0.3);
  doc.line(margins.left, currentY, pageWidth - margins.right, currentY);
  currentY += 8;
  
  // Monto recibido (destacado)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PDF_CONFIG.colors.black);
  doc.text('Monto recibido:', margins.left, currentY);
  
  const montoTexto = `$${pago.monto.toLocaleString('es-AR')}`;
  doc.setFont('helvetica', 'bold');
  doc.text(montoTexto, pageWidth - margins.right, currentY, { align: 'right' });
  currentY += 10;
  
  // Detalles del saldo
  currentY += 3;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...PDF_CONFIG.colors.darkGray);
  
  doc.text(`Total presupuestado: $${montoTotal.toLocaleString('es-AR')}`, margins.left, currentY);
  currentY += 6;
  
  doc.text(`Saldo anterior: $${saldoAnterior.toLocaleString('es-AR')}`, margins.left, currentY);
  currentY += 6;
  
  // Saldo pendiente
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PDF_CONFIG.colors.black);
  const saldoTexto = saldoPendiente > 0 
    ? `Saldo pendiente: $${saldoPendiente.toLocaleString('es-AR')}`
    : 'Cliente pagado';
  doc.text(saldoTexto, margins.left, currentY);
  
  // Footer
  const footerY = PDF_CONFIG.pageHeight - PDF_CONFIG.margins.bottom - 10;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...PDF_CONFIG.colors.mediumGray);
  
  doc.setDrawColor(...PDF_CONFIG.colors.lightGray);
  doc.setLineWidth(0.3);
  doc.line(margins.left, footerY - 5, pageWidth - margins.right, footerY - 5);
  
  doc.text('AFS Entregas', margins.left, footerY);
  
  return doc;
};

/**
 * Genera y descarga el PDF del recibo
 * @param {string} clienteName - Nombre del cliente
 * @param {Object} pago - Información del pago
 * @param {number} saldoAnterior - Saldo anterior
 * @param {number} saldoPendiente - Saldo pendiente
 * @param {number} montoTotal - Monto total
 * @param {string} reciboNum - Número de recibo
 */
export const generateAndDownloadReceipt = (
  clienteName, 
  pago, 
  saldoAnterior, 
  saldoPendiente, 
  montoTotal
) => {
  try {
    const doc = generateReceiptPDF(clienteName, pago, saldoAnterior, saldoPendiente, montoTotal);
    
    let pdfBlob;
    try {
      pdfBlob = doc.output('blob');
    } catch (error) {
      throw new Error('No se pudo crear el archivo PDF');
    }
    
    const url = URL.createObjectURL(pdfBlob);
    const fechaStr = new Date().toISOString().split('T')[0];
    const clienteFileName = clienteName.toUpperCase().replace(/[^A-Z0-9]/g, '-').substring(0, 20);
    const fileName = `RECIBO-${pago.reciboNum}-${clienteFileName}-${fechaStr}.pdf`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    
    try {
      link.click();
    } catch (error) {
      window.open(url, '_blank');
    }
    
    setTimeout(() => {
      try {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        // Limpieza silenciosa
      }
    }, 100);
    
  } catch (error) {
    console.error('Error al generar recibo:', error);
    alert('Error al generar el recibo. Por favor, intenta nuevamente.');
  }
};

