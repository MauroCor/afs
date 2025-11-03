import { PDF_CONFIG } from '../config';

const renderReceipt = (doc, { pago = {}, montoTotal = 0, saldoPendiente = 0 }) => {
  const { margins, pageWidth, colors, fonts } = PDF_CONFIG;
  let currentY = margins.top + 50;

  const tableWidth = pageWidth - margins.left - margins.right;
  const headerHeight = 10;
  doc.setFillColor(colors.lightGray[0], colors.lightGray[1], colors.lightGray[2]);
  doc.rect(margins.left, currentY, tableWidth, headerHeight, 'F');

  doc.setFontSize(fonts.category.size);
  doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('RECIBO', margins.left + tableWidth / 2, currentY + 6, { align: 'center' });
  currentY += headerHeight + 12;

  const mainSize = 15;
  doc.setFontSize(mainSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
  doc.text('Monto recibido:', margins.left, currentY);
  const montoTexto = `$${(pago.monto || 0).toLocaleString('es-AR')}`;
  doc.text(montoTexto, pageWidth - margins.right, currentY, { align: 'right' });
  currentY += 10;

  doc.setFontSize(mainSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
  doc.text('Presupuesto total:', margins.left, currentY);
  doc.text(`$${(montoTotal || 0).toLocaleString('es-AR')}`, pageWidth - margins.right, currentY, { align: 'right' });
  currentY += 10;

  doc.setFontSize(mainSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
  doc.text('Saldo pendiente:', margins.left, currentY);
  doc.text(`$${(saldoPendiente || 0).toLocaleString('es-AR')}`, pageWidth - margins.right, currentY, { align: 'right' });
  currentY += 8;

  return currentY;
};

const receiptTemplate = {
  headerText: ({ clienteName = '', direccion = '' }) => {
    const name = clienteName.trim().toUpperCase() || '[Sin especificar]';
    const dir = direccion.trim().toUpperCase();
    return dir ? `Cliente: ${name} (${dir})` : `Cliente: ${name}`;
  },
  shareMeta: ({ clienteName }) => ({ title: 'AFS Recibo', text: `Recibo de ${clienteName || ''}` }),
  render: renderReceipt,
};

export default receiptTemplate;

