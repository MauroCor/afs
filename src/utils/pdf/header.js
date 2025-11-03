import logo from '../../images/logo.png';
import { PDF_CONFIG } from './config';

export const createLogo = (doc, x, y, size = 20) => {
  try {
    if (logo) {
      doc.addImage(logo, 'PNG', x, y, size, size);
      return;
    }
  } catch {}
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  doc.setFillColor(240, 240, 240);
  doc.rect(x, y, size, size, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(x, y, size, size);
  doc.setFontSize(15);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('AFS', centerX, centerY, { align: 'center' });
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.3);
  doc.line(x + 2, centerY + 5, x + size - 2, centerY + 5);
};

export const createHeader = (doc, obraName) => {
  const { margins, pageWidth } = PDF_CONFIG;
  const logoSize = 28;
  const logoY = margins.top - 2;
  createLogo(doc, margins.left, logoY, logoSize);
  const professionalInfo = [
    'ADRIÁN FERNANDO SECULINI',
    'Maestro Mayor de Obras - M.P. 1663/1',
    'Eduardo Olocco 2113 - Santa Elena - Colonia Tirolesa',
    '3517642188 / adrianseculini@hotmail.com'
  ];
  let infoY = logoY + 8;
  professionalInfo.forEach((line, index) => {
    if (index === 0) {
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...PDF_CONFIG.colors.black);
    } else if (index === 1) {
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...PDF_CONFIG.colors.darkGray);
    } else {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...PDF_CONFIG.colors.mediumGray);
    }
    doc.text(line, pageWidth - margins.right - 5, infoY, { align: 'right' });
    infoY += index === 0 ? 7 : 5;
  });
  const separatorY = logoY + logoSize + 8;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margins.left, separatorY, pageWidth - margins.right, separatorY);
  const contentY = separatorY + 8;
  doc.setFontSize(14);
  doc.setTextColor(...PDF_CONFIG.colors.black);
  doc.setFont('helvetica', 'normal');
  doc.text(obraName || '', margins.left, contentY);
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const dateString = `${day}/${month}/${year}`;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...PDF_CONFIG.colors.black);
  doc.text(`${dateString}`, pageWidth - margins.right - 5, contentY, { align: 'right' });
};


