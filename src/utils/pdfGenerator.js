import jsPDF from 'jspdf';
import logo from '../images/logo.png';

/**
 * Configuración del PDF profesional
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
    lightGray: [240, 240, 240],
    veryLightGray: [248, 248, 248],
    white: [255, 255, 255]
  },
  fonts: {
    title: { size: 20, weight: 'bold' },
    subtitle: { size: 14, weight: 'normal' },
    category: { size: 12, weight: 'bold' },
    tableHeader: { size: 10, weight: 'bold' },
    tableContent: { size: 9, weight: 'normal' },
    footer: { size: 8, weight: 'normal' },
    date: { size: 9, weight: 'normal' }
  }
};

/**
 * Crea el logo del PDF con imagen real y fallback seguro
 * @param {jsPDF} doc - Documento PDF
 * @param {number} x - Posición X
 * @param {number} y - Posición Y
 * @param {number} size - Tamaño del logo en mm
 */
const createLogo = (doc, x, y, size = 20) => {
  try {
    // Intentar usar la imagen real del logo
    if (logo) {
      doc.addImage(logo, 'PNG', x, y, size, size);
      return;
    }
  } catch (imageError) {
    // Fallback silencioso
  }
  
  // Fallback: Logo programático (si la imagen falla)
  const centerX = x + size/2;
  const centerY = y + size/2;
  
  // Fondo del logo
  doc.setFillColor(240, 240, 240);
  doc.rect(x, y, size, size, 'F');
  
  // Borde del logo
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(x, y, size, size);
  
  // Texto AFS
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('AFS', centerX, centerY, { align: 'center' });
  
  // Línea decorativa
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.3);
  doc.line(x + 2, centerY + 5, x + size - 2, centerY + 5);
};

/**
 * Crea el encabezado del PDF
 * @param {jsPDF} doc - Documento PDF
 * @param {string} obraName - Nombre de la obra
 */
const createHeader = (doc, obraName) => {
  const { margins, pageWidth } = PDF_CONFIG;
  
  // Logo más arriba y centrado verticalmente con el contacto
  const logoSize = 28;
  const logoY = margins.top - 2; // Un poco más arriba
  createLogo(doc, margins.left, logoY, logoSize);
  
  // Información profesional - más grande y mejor organizada
  const professionalInfo = [
    'ADRIÁN FERNANDO SECULINI',
    'Maestro Mayor de Obras - M.P. 1663/1',
    'Eduardo Olocco 2113 - Santa Elena - Colonia Tirolesa',
    '3517642188 / adrianseculini@hotmail.com'
  ];
  
  // Posición inicial para la información profesional (centrada con el logo)
  let infoY = logoY + 8; // Centrado con el logo
  
  professionalInfo.forEach((line, index) => {
    if (index === 0) {
      // Nombre más grande y prominente
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(PDF_CONFIG.colors.black[0], PDF_CONFIG.colors.black[1], PDF_CONFIG.colors.black[2]);
    } else if (index === 1) {
      // Título profesional
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(PDF_CONFIG.colors.darkGray[0], PDF_CONFIG.colors.darkGray[1], PDF_CONFIG.colors.darkGray[2]);
    } else {
      // Información de contacto
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(PDF_CONFIG.colors.mediumGray[0], PDF_CONFIG.colors.mediumGray[1], PDF_CONFIG.colors.mediumGray[2]);
    }
    
    doc.text(line, pageWidth - margins.right - 5, infoY, { align: 'right' });
    infoY += index === 0 ? 7 : 5; // Mejor espaciado
  });
  
  // Línea separadora elegante
  const separatorY = logoY + logoSize + 8;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margins.left, separatorY, pageWidth - margins.right, separatorY);
  
  // Nombre de la obra y fecha en una línea, más discretos
  const contentY = separatorY + 8;
  
  // Fecha a la izquierda
  const now = new Date();
  const dateString = now.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(PDF_CONFIG.colors.mediumGray[0], PDF_CONFIG.colors.mediumGray[1], PDF_CONFIG.colors.mediumGray[2]);
  doc.text(`Fecha: ${dateString}`, margins.left, contentY);
  
  // Nombre de la obra a la derecha, más discreto
  if (obraName && obraName.trim()) {
    doc.setFontSize(11);
    doc.setTextColor(PDF_CONFIG.colors.black[0], PDF_CONFIG.colors.black[1], PDF_CONFIG.colors.black[2]);
    doc.setFont('helvetica', 'normal'); // Sin negrita, más discreto
    doc.text(obraName, pageWidth - margins.right - 5, contentY, { align: 'right' });
  } else {
    // Si no hay nombre de obra, usar "Presupuesto" como fallback
    doc.setFontSize(11);
    doc.setTextColor(PDF_CONFIG.colors.black[0], PDF_CONFIG.colors.black[1], PDF_CONFIG.colors.black[2]);
    doc.setFont('helvetica', 'normal');
    doc.text('Presupuesto', pageWidth - margins.right - 5, contentY, { align: 'right' });
  }
  
};

/**
 * Agrupa materiales por categoría
 * @param {Array} materials - Lista de materiales
 * @param {Object} quantities - Cantidades seleccionadas
 * @returns {Object} Materiales agrupados por categoría
 */
const groupMaterialsByCategory = (materials, quantities) => {
  const grouped = {};
  
  materials.forEach(material => {
    const quantity = quantities[material.id] || 0;
    if (quantity > 0) {
      if (!grouped[material.category]) {
        grouped[material.category] = [];
      }
      grouped[material.category].push({
        ...material,
        quantity
      });
    }
  });
  
  return grouped;
};

/**
 * Crea una tabla de materiales para una categoría
 * @param {jsPDF} doc - Documento PDF
 * @param {string} category - Nombre de la categoría
 * @param {Array} materials - Lista de materiales de la categoría
 * @param {number} startY - Posición Y inicial
 * @returns {number} Posición Y final
 */
const createCategoryTable = (doc, category, materials, startY) => {
  const { margins, pageWidth, colors, fonts } = PDF_CONFIG;
  const tableWidth = pageWidth - margins.left - margins.right;
  const colWidths = [tableWidth * 0.6, tableWidth * 0.2, tableWidth * 0.2];
  const rowHeight = 8;
  const headerHeight = 10;
  
  let currentY = startY;
  
  // Encabezado de categoría
  doc.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
  doc.rect(margins.left, currentY, tableWidth, headerHeight, 'F');
  
  doc.setFontSize(fonts.category.size);
  doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
  doc.setFont('helvetica', fonts.category.weight);
  doc.text(category, margins.left + tableWidth/2, currentY + 6, { align: 'center' });
  
  currentY += headerHeight + 2;
  
  // Encabezados de tabla
  doc.setFillColor(colors.veryLightGray[0], colors.veryLightGray[1], colors.veryLightGray[2]);
  doc.rect(margins.left, currentY, tableWidth, rowHeight, 'F');
  
  doc.setFontSize(fonts.tableHeader.size);
  doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
  doc.setFont('helvetica', fonts.tableHeader.weight);
  
  let xPos = margins.left + 5;
  doc.text('Material', xPos, currentY + 5);
  xPos += colWidths[0];
  doc.text('Unidad', xPos, currentY + 5);
  xPos += colWidths[1];
  doc.text('Cantidad', xPos, currentY + 5);
  
  currentY += rowHeight;
  
  // Filas de materiales
  materials.forEach((material, index) => {
    // Verificar espacio en página
    if (currentY + rowHeight > PDF_CONFIG.pageHeight - PDF_CONFIG.margins.bottom - 20) {
      doc.addPage();
      currentY = PDF_CONFIG.margins.top;
    }
    
    // Alternar colores de fondo
    const bgColor = index % 2 === 0 ? colors.white : colors.veryLightGray;
    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.rect(margins.left, currentY, tableWidth, rowHeight, 'F');
    
    // Contenido de la fila
    doc.setFontSize(fonts.tableContent.size);
    doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
    doc.setFont('helvetica', fonts.tableContent.weight);
    
    xPos = margins.left + 5;
    // Manejar nombres largos con ajuste automático
    const maxWidth = colWidths[0] - 10;
    const materialName = doc.splitTextToSize(material.name, maxWidth);
    doc.text(materialName, xPos, currentY + 5);
    xPos += colWidths[0];
    doc.text(material.unit, xPos, currentY + 5);
    xPos += colWidths[1];
    doc.text(material.quantity.toString(), xPos, currentY + 5);
    
    currentY += rowHeight;
  });
  
  return currentY + 10; // Espacio después de la tabla
};

/**
 * Crea el footer del PDF
 * @param {jsPDF} doc - Documento PDF
 */
const createFooter = (doc) => {
  const { margins, pageWidth, pageHeight, colors, fonts } = PDF_CONFIG;
  const pageCount = doc.internal.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Línea separadora
    doc.setDrawColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
    doc.setLineWidth(0.5);
    doc.line(margins.left, pageHeight - margins.bottom - 10, pageWidth - margins.right, pageHeight - margins.bottom - 10);
    
    // Texto del footer
    doc.setFontSize(fonts.footer.size);
    doc.setTextColor(colors.mediumGray[0], colors.mediumGray[1], colors.mediumGray[2]);
    doc.setFont('helvetica', fonts.footer.weight);
    doc.text('Presupuesto generado por AFS', margins.left, pageHeight - margins.bottom - 5);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - margins.right - 20, pageHeight - margins.bottom - 5, { align: 'right' });
  }
};

/**
 * Genera un PDF profesional con los materiales especificados
 * @param {Array} materials - Lista de materiales
 * @param {Object} quantities - Cantidades seleccionadas
 * @param {string} obraName - Nombre de la obra
 * @returns {jsPDF} Documento PDF generado
 */
export const generatePDF = (materials = [], quantities = {}, obraName = '') => {
  // Crear nuevo documento PDF A4
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Crear encabezado
  createHeader(doc, obraName);
  
  // Agrupar materiales por categoría
  const materialsByCategory = groupMaterialsByCategory(materials, quantities);
  
  let currentY = PDF_CONFIG.margins.top + 50; // Espacio después del encabezado (ajustado para el nuevo diseño)
  
  // Crear tabla para cada categoría
  Object.keys(materialsByCategory).forEach(category => {
    const categoryMaterials = materialsByCategory[category];
    currentY = createCategoryTable(doc, category, categoryMaterials, currentY);
  });
  
  // Si no hay materiales seleccionados
  if (Object.keys(materialsByCategory).length === 0) {
    doc.setFontSize(PDF_CONFIG.fonts.subtitle.size);
    doc.setTextColor(PDF_CONFIG.colors.mediumGray[0], PDF_CONFIG.colors.mediumGray[1], PDF_CONFIG.colors.mediumGray[2]);
    doc.setFont('helvetica', PDF_CONFIG.fonts.subtitle.weight);
    doc.text('No hay materiales seleccionados', PDF_CONFIG.margins.left, currentY);
  }
  
  // Crear footer
  createFooter(doc);
  
  return doc;
};

/**
 * Verifica si el navegador soporta Web Share API
 * @returns {boolean}
 */
const supportsWebShare = () => {
  return (
    typeof navigator !== 'undefined' &&
    navigator.share &&
    typeof navigator.share === 'function'
  );
};

/**
 * Verifica si el navegador soporta File constructor
 * @returns {boolean}
 */
const supportsFileConstructor = () => {
  return typeof File !== 'undefined' && typeof File === 'function';
};

/**
 * Genera y comparte un PDF profesional (compatible con móvil)
 * @param {Array} materials - Lista de materiales
 * @param {Object} quantities - Cantidades seleccionadas
 * @param {string} obraName - Nombre de la obra
 * @returns {Promise<void>}
 */
export const generateAndSharePDF = async (materials = [], quantities = {}, obraName = '') => {
  try {
    // Validar parámetros
    const safeMaterials = Array.isArray(materials) ? materials : [];
    const safeQuantities = typeof quantities === 'object' && quantities !== null ? quantities : {};
    const safeObraName = typeof obraName === 'string' ? obraName : '';
    
    const doc = generatePDF(safeMaterials, safeQuantities, safeObraName);
    
    // Convertir a blob de forma segura
    let pdfBlob;
    try {
      pdfBlob = doc.output('blob');
    } catch (blobError) {
      throw new Error('No se pudo crear el archivo PDF');
    }
    
    // Intentar compartir con Web Share API si está disponible
    if (supportsWebShare() && supportsFileConstructor()) {
      try {
        const fileName = `presupuesto-${safeObraName || 'obra'}-${new Date().toISOString().split('T')[0]}.pdf`;
        const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
        
        // Verificar si se puede compartir este archivo
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Presupuesto AFS',
            text: `Presupuesto para ${safeObraName || 'la obra'}`,
            files: [file]
          });
          return;
        }
      } catch (shareError) {
        // Continuar con fallback
      }
    }
    
    // Fallback: descargar el archivo
    downloadPDF(doc, safeObraName);
    
  } catch (error) {
    // Mostrar error más específico
    let errorMessage = 'Error al generar el PDF. Por favor, intenta nuevamente.';
    
    if (error.message.includes('blob')) {
      errorMessage = 'Error al crear el archivo PDF. Tu navegador podría no ser compatible.';
    } else if (error.message.includes('share')) {
      errorMessage = 'Error al compartir el PDF. Se descargará automáticamente.';
    }
    
    alert(errorMessage);
    
    // Intentar descarga de emergencia
    try {
      const doc = generatePDF(materials, quantities, obraName);
      downloadPDF(doc, obraName);
    } catch (fallbackError) {
      alert('Error crítico. Por favor, recarga la página e intenta nuevamente.');
    }
  }
};

/**
 * Descarga el PDF generado (compatible con móviles)
 * @param {jsPDF} doc - Documento PDF
 * @param {string} obraName - Nombre de la obra
 */
const downloadPDF = (doc, obraName = '') => {
  try {
    // Generar blob de forma segura
    let pdfBlob;
    try {
      pdfBlob = doc.output('blob');
    } catch (blobError) {
      throw new Error('No se pudo generar el archivo PDF');
    }
    
    // Crear URL del blob
    const url = URL.createObjectURL(pdfBlob);
    
    // Crear nombre de archivo seguro
    const safeObraName = (obraName || 'obra').replace(/[^a-zA-Z0-9-_]/g, '_');
    const fileName = `presupuesto-${safeObraName}-${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Crear enlace de descarga
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    
    // Agregar al DOM temporalmente
    document.body.appendChild(link);
    
    // Intentar descarga
    try {
      link.click();
    } catch (clickError) {
      // Fallback: abrir en nueva ventana
      try {
        window.open(url, '_blank');
      } catch (openError) {
        throw new Error('No se pudo descargar ni abrir el PDF');
      }
    }
    
    // Limpiar después de un tiempo
    setTimeout(() => {
      try {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (cleanupError) {
        // Limpieza silenciosa
      }
    }, 1000);
    
  } catch (error) {
    throw error;
  }
};