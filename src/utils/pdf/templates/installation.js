import { PDF_CONFIG } from '../config';

const renderInstallation = (doc, { materials = [], quantities = {}, brands = {}, direccion = '' }) => {
  let startY = PDF_CONFIG.margins.top + 50;
  if (direccion && direccion.trim()) {
    const { margins, colors } = PDF_CONFIG;
    doc.setFontSize(11);
    doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
    doc.setFont('helvetica', 'normal');
    doc.text(`Dirección: ${direccion.toUpperCase()}`, margins.left, startY);
    startY += 8;
  }

  const materialsByCategory = {};
  for (const material of materials) {
    const quantity = quantities[material.id] || 0;
    if (quantity > 0) {
      if (!materialsByCategory[material.category]) materialsByCategory[material.category] = [];
      materialsByCategory[material.category].push({ ...material, quantity });
    }
  }

  const { margins, pageWidth, colors, fonts } = PDF_CONFIG;
  const tableWidth = pageWidth - margins.left - margins.right;
  const colWidths = [tableWidth * 0.2, tableWidth * 0.8];
  const rowHeight = 8;
  const headerHeight = 10;

  let currentY = startY;
  const categories = Object.keys(materialsByCategory);
  categories.forEach((category) => {
    const categoryMaterials = materialsByCategory[category];
    doc.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
    doc.rect(margins.left, currentY, tableWidth, headerHeight, 'F');

    doc.setFontSize(fonts.category.size);
    doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
    doc.setFont('helvetica', 'bold');

    const brand = brands[category] || '';
    const categoryTitle = brand ? `${category} - ${brand}` : category;
    doc.text(categoryTitle, margins.left + tableWidth / 2, currentY + 6, { align: 'center' });

    currentY += headerHeight + 2;

    doc.setFillColor(colors.veryLightGray[0], colors.veryLightGray[1], colors.veryLightGray[2]);
    doc.rect(margins.left, currentY, tableWidth, rowHeight, 'F');

    doc.setFontSize(fonts.tableHeader.size);
    doc.setTextColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
    doc.setFont('helvetica', fonts.tableHeader.weight);

    let xPos = margins.left + 5;
    doc.text('Cantidad', xPos, currentY + 5);
    xPos += colWidths[0];
    doc.text('Detalle', xPos, currentY + 5);

    currentY += rowHeight;
    categoryMaterials.forEach((material, index) => {
      if (currentY + rowHeight > PDF_CONFIG.pageHeight - PDF_CONFIG.margins.bottom - 20) {
        doc.addPage();
        currentY = PDF_CONFIG.margins.top;
      }

      const bgColor = index % 2 === 0 ? colors.white : colors.veryLightGray;
      doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      doc.rect(margins.left, currentY, tableWidth, rowHeight, 'F');

      doc.setFontSize(fonts.tableContent.size);
      doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
      doc.setFont('helvetica', fonts.tableContent.weight);

      xPos = margins.left + 5;
      doc.text(material.quantity.toString(), xPos, currentY + 5);
      xPos += colWidths[0];
      const maxWidth = colWidths[1] - 10;
      const materialName = doc.splitTextToSize(material.name, maxWidth);
      doc.text(materialName, xPos, currentY + 5);

      currentY += rowHeight;
    });

    currentY += 10;
  });

  if (categories.length === 0) {
    doc.setFontSize(PDF_CONFIG.fonts.subtitle.size);
    doc.setTextColor(PDF_CONFIG.colors.mediumGray[0], PDF_CONFIG.colors.mediumGray[1], PDF_CONFIG.colors.mediumGray[2]);
    doc.setFont('helvetica', PDF_CONFIG.fonts.subtitle.weight);
    doc.text('No hay materiales seleccionados', PDF_CONFIG.margins.left, currentY);
  }
};

const installationTemplate = {
  headerText: ({ obraName }) => (obraName ? `Obra de: ${obraName.toUpperCase()}` : 'Obra de: [Sin especificar]'),
  shareMeta: ({ obraName }) => ({ title: 'AFS', text: `Materiales para ${obraName || 'la obra'}` }),
  render: renderInstallation,
};

export default installationTemplate;

