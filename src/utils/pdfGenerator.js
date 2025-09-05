import jsPDF from 'jspdf';

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
 * Crea el logo del PDF
 * @param {jsPDF} doc - Documento PDF
 * @param {number} x - Posición X
 * @param {number} y - Posición Y
 * @param {number} size - Tamaño del logo en mm
 */
const createLogo = (doc, x, y, size = 20) => {
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
 * Crea el encabezado del PDF
 * @param {jsPDF} doc - Documento PDF
 * @param {string} obraName - Nombre de la obra
 */
const createHeader = (doc, obraName) => {
  const { margins, pageWidth } = PDF_CONFIG;
  
  // Logo
  createLogo(doc, margins.left, margins.top, 18);
  
  // Título
  doc.setFontSize(PDF_CONFIG.fonts.title.size);
  doc.setTextColor(PDF_CONFIG.colors.black[0], PDF_CONFIG.colors.black[1], PDF_CONFIG.colors.black[2]);
  doc.setFont('helvetica', PDF_CONFIG.fonts.title.weight);
  doc.text('Presupuesto', margins.left + 25, margins.top + 8);
  
  // Nombre de la obra
  if (obraName && obraName.trim()) {
    doc.setFontSize(PDF_CONFIG.fonts.subtitle.size);
    doc.setFont('helvetica', PDF_CONFIG.fonts.subtitle.weight);
    doc.setTextColor(PDF_CONFIG.colors.darkGray[0], PDF_CONFIG.colors.darkGray[1], PDF_CONFIG.colors.darkGray[2]);
    doc.text(obraName, margins.left + 25, margins.top + 16);
  }
  
  // Fecha
  const now = new Date();
  const dateString = now.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  doc.setFontSize(PDF_CONFIG.fonts.date.size);
  doc.setFont('helvetica', PDF_CONFIG.fonts.date.weight);
  doc.setTextColor(PDF_CONFIG.colors.mediumGray[0], PDF_CONFIG.colors.mediumGray[1], PDF_CONFIG.colors.mediumGray[2]);
  doc.text(dateString, pageWidth - margins.right - 20, margins.top + 8, { align: 'right' });
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
  doc.text(category, margins.left + 5, currentY + 6);
  
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
    doc.text('Generado con AFS Presupuestos', margins.left, pageHeight - margins.bottom - 5);
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
  
  let currentY = PDF_CONFIG.margins.top + 40; // Espacio después del encabezado
  
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
    console.log('Iniciando generación de PDF...');
    
    // Validar parámetros
    const safeMaterials = Array.isArray(materials) ? materials : [];
    const safeQuantities = typeof quantities === 'object' && quantities !== null ? quantities : {};
    const safeObraName = typeof obraName === 'string' ? obraName : '';
    
    console.log('Parámetros validados:', { 
      materialsCount: safeMaterials.length, 
      quantitiesKeys: Object.keys(safeQuantities).length,
      obraName: safeObraName 
    });
    
    const doc = generatePDF(safeMaterials, safeQuantities, safeObraName);
    console.log('PDF generado correctamente');
    
    // Convertir a blob de forma segura
    let pdfBlob;
    try {
      pdfBlob = doc.output('blob');
      console.log('Blob creado, tamaño:', pdfBlob.size);
    } catch (blobError) {
      console.error('Error al crear blob:', blobError);
      throw new Error('No se pudo crear el archivo PDF');
    }
    
    // Intentar compartir con Web Share API si está disponible
    if (supportsWebShare() && supportsFileConstructor()) {
      try {
        console.log('Intentando compartir con Web Share API...');
        
        const fileName = `presupuesto-${safeObraName || 'obra'}-${new Date().toISOString().split('T')[0]}.pdf`;
        const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
        
        // Verificar si se puede compartir este archivo
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Presupuesto AFS',
            text: `Presupuesto para ${safeObraName || 'la obra'}`,
            files: [file]
          });
          console.log('PDF compartido exitosamente');
          return;
        } else {
          console.log('Web Share API no soporta archivos, usando fallback');
        }
      } catch (shareError) {
        console.log('Error al compartir con Web Share API:', shareError);
        // Continuar con fallback
      }
    } else {
      console.log('Web Share API no disponible, usando fallback');
    }
    
    // Fallback: descargar el archivo
    console.log('Usando fallback de descarga...');
    downloadPDF(doc, safeObraName);
    
  } catch (error) {
    console.error('Error al generar PDF:', error);
    
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
      console.error('Error en fallback:', fallbackError);
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
    console.log('Iniciando descarga de PDF...');
    
    // Generar blob de forma segura
    let pdfBlob;
    try {
      pdfBlob = doc.output('blob');
      console.log('Blob generado, tamaño:', pdfBlob.size);
    } catch (blobError) {
      console.error('Error al generar blob:', blobError);
      throw new Error('No se pudo generar el archivo PDF');
    }
    
    // Crear URL del blob
    const url = URL.createObjectURL(pdfBlob);
    
    // Crear nombre de archivo seguro
    const safeObraName = (obraName || 'obra').replace(/[^a-zA-Z0-9-_]/g, '_');
    const fileName = `presupuesto-${safeObraName}-${new Date().toISOString().split('T')[0]}.pdf`;
    
    console.log('Descargando archivo:', fileName);
    
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
      console.log('Descarga iniciada');
    } catch (clickError) {
      console.error('Error al hacer click en el enlace:', clickError);
      
      // Fallback: abrir en nueva ventana
      try {
        window.open(url, '_blank');
        console.log('Abriendo PDF en nueva ventana');
      } catch (openError) {
        console.error('Error al abrir en nueva ventana:', openError);
        throw new Error('No se pudo descargar ni abrir el PDF');
      }
    }
    
    // Limpiar después de un tiempo
    setTimeout(() => {
      try {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log('Recursos limpiados');
      } catch (cleanupError) {
        console.warn('Error al limpiar recursos:', cleanupError);
      }
    }, 1000);
    
  } catch (error) {
    console.error('Error en downloadPDF:', error);
    throw error;
  }
};