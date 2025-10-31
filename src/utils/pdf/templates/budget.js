import { PDF_CONFIG } from '../config';

const renderBudget = (doc, { works = [], total = 0, direccion = '' }) => {
  let startY = PDF_CONFIG.margins.top + 50;
  if (direccion && direccion.trim()) {
    const { margins, colors } = PDF_CONFIG;
    doc.setFontSize(11);
    doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
    doc.setFont('helvetica', 'normal');
    doc.text(`Dirección: ${direccion.toUpperCase()}`, margins.left, startY);
    startY += 8;
  }

  const { margins, pageWidth, colors, fonts } = PDF_CONFIG;
  const tableWidth = pageWidth - margins.left - margins.right;
  const headerHeight = 10;

  let currentY = startY;

  doc.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
  doc.rect(margins.left, currentY, tableWidth, headerHeight, 'F');

  doc.setFontSize(fonts.category.size);
  doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('PRESUPUESTO', margins.left + tableWidth / 2, currentY + 6, { align: 'center' });

  currentY += headerHeight + 10;

  doc.setFontSize(fonts.tableContent.size);
  doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
  doc.setFont('helvetica', 'normal');

  works.forEach((work, index) => {
    if (currentY + 8 > PDF_CONFIG.pageHeight - PDF_CONFIG.margins.bottom - 20) {
      doc.addPage();
      currentY = PDF_CONFIG.margins.top;
    }

    if (index > 0) {
      doc.setDrawColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
      doc.setLineWidth(0.3);
      doc.line(margins.left + 5, currentY - 2, margins.left + tableWidth - 5, currentY - 2);
      currentY += 3;
    }

    doc.setFontSize(fonts.tableContent.size);
    doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
    doc.setFont('helvetica', 'normal');

    const montoText = `$${work.monto.toLocaleString()}`;
    const montoWidth = doc.getTextWidth(montoText);
    const availableWidth = tableWidth - montoWidth - 20;

    const workLines = doc.splitTextToSize(work.trabajo, availableWidth);

    workLines.forEach((line, lineIndex) => {
      if (lineIndex === 0) {
        doc.text(line, margins.left + 5, currentY);
        doc.text(montoText, margins.left + tableWidth - 5, currentY, { align: 'right' });
      } else {
        doc.text(line, margins.left + 5, currentY);
      }
      currentY += 6;
    });

    if (work.descripcion && work.descripcion.trim()) {
      const montoText2 = `$${work.monto.toLocaleString()}`;
      const montoWidth2 = doc.getTextWidth(montoText2);
      const availableWidthForDesc = tableWidth - montoWidth2 - 20;

      const descLines = doc.splitTextToSize(work.descripcion, availableWidthForDesc);
      descLines.forEach(line => {
        if (currentY + 5 > PDF_CONFIG.pageHeight - PDF_CONFIG.margins.bottom - 20) {
          doc.addPage();
          currentY = PDF_CONFIG.margins.top;
        }
        doc.setFontSize(fonts.tableContent.size);
        doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
        doc.setFont('helvetica', 'normal');
        doc.text(`  ${line}`, margins.left + 5, currentY);
        currentY += 4;
      });
      currentY += 2;
    }
  });

  currentY += 5;
  doc.setDrawColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
  doc.setLineWidth(0.5);
  doc.line(margins.left + 5, currentY, margins.left + tableWidth - 5, currentY);
  currentY += 5;

  doc.setFontSize(fonts.tableHeader.size);
  doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', margins.left + 5, currentY);

  const totalText = `$${total.toLocaleString()}`;
  doc.text(totalText, margins.left + tableWidth - 5, currentY, { align: 'right' });
  currentY += 15;

  doc.setFontSize(fonts.tableContent.size + 2);
  doc.setTextColor(colors.mediumGray[0], colors.mediumGray[1], colors.mediumGray[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('Este presupuesto no incluye materiales a utilizar y tiene una vigencia de 30 días hábiles.', margins.left + 5, currentY);

  return currentY + 10;
};

const budgetTemplate = {
  headerText: ({ obraName }) => (obraName ? `Obra de: ${obraName.toUpperCase()}` : 'Obra de: [Sin especificar]'),
  shareMeta: ({ obraName }) => ({ title: 'AFS Presupuesto', text: `Presupuesto para ${obraName || 'la obra'}` }),
  render: renderBudget,
};

export default budgetTemplate;


