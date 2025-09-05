import jsPDF from 'jspdf';

/**
 * Genera un PDF simple con texto de prueba
 * @returns {jsPDF} Documento PDF generado
 */
export const generatePDF = () => {
  // Crear nuevo documento PDF A4
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Agregar texto de prueba
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('PDF de Prueba', 20, 30);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Este es un PDF generado con texto de prueba.', 20, 50);
  doc.text('El generador de PDF ha sido simplificado.', 20, 60);
  doc.text('Fecha de generación: ' + new Date().toLocaleDateString('es-ES'), 20, 70);
  
  return doc;
};

/**
 * Genera y descarga un PDF simple con texto de prueba
 * @returns {Promise<void>}
 */
export const generateAndSharePDF = async () => {
  try {
    const doc = generatePDF();
    
    // Descargar el archivo
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pdf-prueba-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al generar PDF:', error);
    alert('Error al generar el PDF. Por favor, intenta nuevamente.');
  }
};