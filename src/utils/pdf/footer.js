import { PDF_CONFIG } from './config';

export const createFooter = (doc, type = 'instalaciones') => {
  const { margins, pageWidth, pageHeight, colors, fonts } = PDF_CONFIG;
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
    doc.setLineWidth(0.5);
    doc.line(margins.left, pageHeight - margins.bottom - 10, pageWidth - margins.right, pageHeight - margins.bottom - 10);
    doc.setFontSize(fonts.footer.size);
    doc.setTextColor(colors.mediumGray[0], colors.mediumGray[1], colors.mediumGray[2]);
    doc.setFont('helvetica', fonts.footer.weight);
    const footerText = type === 'presupuestos' ? 'AFS PRESUPUESTOS' : type === 'recibos' ? 'AFS RECIBOS' : 'AFS INSTALACIONES';
    doc.text(footerText, margins.left, pageHeight - margins.bottom - 5);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - margins.right - 20, pageHeight - margins.bottom - 5, { align: 'right' });
  }
};


