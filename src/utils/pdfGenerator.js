import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logo from '../images/logo.png';

/**
 * Configuración del PDF profesional
 */
const PDF_CONFIG = {
  // Tamaño A4 en puntos
  pageWidth: 210,
  pageHeight: 297,
  margins: {
    top: 20,
    bottom: 20,
    left: 20,
    right: 20
  },
  // Colores profesionales (grises y negro)
  colors: {
    black: [0, 0, 0],
    darkGray: [64, 64, 64],
    mediumGray: [128, 128, 128],
    lightGray: [240, 240, 240],
    veryLightGray: [248, 248, 248],
    white: [255, 255, 255]
  },
  // Tipografías
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
 * Crea el logo del PDF usando la imagen real
 * @param {jsPDF} doc - Documento PDF
 * @param {number} x - Posición X
 * @param {number} y - Posición Y
 * @param {number} size - Tamaño del logo en mm
 */
const createLogo = (doc, x, y, size = 20) => {
  // doc.addImage(logo, 'PNG', x, y, size, size);
  
  // Logo programático similar al PNG original
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
  
  // Logo directo
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
export const generatePDF = (materials, quantities, obraName = '') => {
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
 * Crea el contenido HTML para el PDF (compatible con móvil)
 * @param {Array} materials - Lista de materiales
 * @param {Object} quantities - Cantidades seleccionadas
 * @param {string} obraName - Nombre de la obra
 * @returns {string} HTML del contenido
 */
const createPDFContent = (materials, quantities, obraName) => {
  const currentDate = new Date().toLocaleDateString('es-ES');
  
  // Agrupar materiales por categoría
  const materialsByCategory = groupMaterialsByCategory(materials, quantities);
  
  let categoriesHTML = '';
  
  Object.keys(materialsByCategory).forEach(category => {
    const categoryMaterials = materialsByCategory[category];
    
    let materialsHTML = '';
    categoryMaterials.forEach(material => {
      materialsHTML += `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${material.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${material.unit}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${material.quantity}</td>
        </tr>
      `;
    });
    
    categoriesHTML += `
      <div style="margin-bottom: 30px;">
        <h3 style="background: #f8f9fa; padding: 0px 12px 15px 12px; margin: 0 0 10px 0; border-left: 4px solid #333; color: #333; font-size: 16px; font-weight: bold; line-height: 16px;">${category}</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="padding: 0px 6px 15px 12px; text-align: left; border-bottom: 2px solid #333; font-weight: bold; vertical-align: middle;">Material</th>
              <th style="padding: 0px 6px 15px 12px; text-align: center; border-bottom: 2px solid #333; font-weight: bold; vertical-align: middle;">Unidad</th>
              <th style="padding: 0px 6px 15px 12px; text-align: center; border-bottom: 2px solid #333; font-weight: bold; vertical-align: middle;">Cantidad</th>
            </tr>
          </thead>
          <tbody>
            ${materialsHTML}
          </tbody>
        </table>
      </div>
    `;
  });
  
  return `
    <div style="max-width: 800px; margin: 0 auto; background: white;">
      <!-- Header -->
      <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #333;">
        <div style="display: flex; align-items: flex-start;">
          <img src="${logo}" alt="Logo AFS" style="width: 50px; height: 50px; margin-right: 15px; margin-top: -5px; object-fit: contain;">
          <div>
            <h1 style="margin: 0; font-size: 24px; color: #333; font-weight: normal; line-height: 1;">Presupuesto</h1>
            ${obraName ? `<p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Obra: ${obraName}</p>` : ''}
          </div>
        </div>
        <div style="text-align: right;">
          <p style="margin: 0; font-size: 12px; color: #999;">${currentDate}</p>
        </div>
      </div>
      
      <!-- Contenido de materiales -->
      ${Object.keys(materialsByCategory).length > 0 ? categoriesHTML : '<p style="text-align: center; color: #999; font-style: italic;">No hay materiales seleccionados</p>'}
      
      
      <!-- Footer -->
      <div style="margin-top: 30px; text-align: center; font-size: 10px; color: #999;">
        Generado por AFS
      </div>
    </div>
  `;
};

/**
 * Genera y comparte un PDF con los materiales especificados (compatible con móvil)
 * @param {Array} materials - Lista de materiales
 * @param {Object} quantities - Cantidades seleccionadas
 * @param {string} obraName - Nombre de la obra
 * @returns {Promise<void>}
 */
export const generateAndSharePDF = async (materials, quantities, obraName = '') => {
  try {
    // Crear elemento HTML temporal para el PDF
    const pdfContent = createPDFContent(materials, quantities, obraName);
    
    // Agregar al DOM temporalmente
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.style.width = '800px';
    tempContainer.style.backgroundColor = 'white';
    tempContainer.style.padding = '20px';
    tempContainer.style.fontFamily = 'Arial, sans-serif';
    tempContainer.innerHTML = pdfContent;
    
    document.body.appendChild(tempContainer);
    
    // Generar canvas desde HTML
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    // Crear PDF desde canvas
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Limpiar DOM
    document.body.removeChild(tempContainer);
    
    // Convertir a blob
    const pdfBlob = pdf.output('blob');
    
    // Verificar si el navegador soporta Web Share API
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [pdfBlob] })) {
      try {
        await navigator.share({
          title: 'Presupuesto AFS',
          text: `Presupuesto para ${obraName || 'la obra'}`,
          files: [new File([pdfBlob], `presupuesto-${obraName || 'obra'}.pdf`, { type: 'application/pdf' })]
        });
      } catch (shareError) {
        console.log('Error al compartir:', shareError);
        // Fallback: descargar el archivo
        downloadPDF(pdf, obraName);
      }
    } else {
      // Fallback: descargar el archivo
      downloadPDF(pdf, obraName);
    }
  } catch (error) {
    console.error('Error al generar PDF:', error);
    alert('Error al generar el PDF. Por favor, intenta nuevamente.');
  }
};

/**
 * Descarga el PDF generado
 * @param {jsPDF} doc - Documento PDF
 * @param {string} obraName - Nombre de la obra
 */
const downloadPDF = (doc, obraName = '') => {
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `presupuesto-${obraName || 'obra'}-${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};