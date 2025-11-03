import jsPDF from 'jspdf';
import { createHeader } from './header';
import { createFooter } from './footer';
import { shareOrDownload, buildFilename } from './helpers';
import { addClientPdf, getClientById } from '../clientsStorage';
import installation from './templates/installation';
import budget from './templates/budget';
import receipt from './templates/receipt';

const REGISTRY = {
  installation,
  budget,
  receipt,
};

export const generatePDF = (kind, params = {}) => {
  const t = REGISTRY[kind];
  if (!t) throw new Error(`Tipo de PDF no soportado: ${kind}`);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  createHeader(doc, t.headerText(params));
  t.render(doc, params);
  createFooter(doc, kind === 'installation' ? 'instalaciones' : kind === 'budget' ? 'presupuestos' : 'recibos');
  return doc;
};

export const sharePDF = async (kind, params = {}) => {
  const t = REGISTRY[kind];
  if (!t) throw new Error(`Tipo de PDF no soportado: ${kind}`);
  const doc = generatePDF(kind, params);
  const filename = buildFilename(kind, params);
  await shareOrDownload(doc, filename);
};

/**
 * Genera un PDF y devuelve filename y dataUrl para persistencia
 */
export const generatePDFData = (kind, params = {}) => {
  const doc = generatePDF(kind, params);
  const filename = buildFilename(kind, params);
  const dataUrl = doc.output('dataurlstring');
  return { doc, filename, dataUrl };
};

/**
 * Genera y guarda el PDF en el cliente indicado (no comparte/descarga)
 * kind: 'installation' | 'budget' | 'receipt'
 * storageType: 'installations' | 'budgets' | 'receipts'
 */
export const createAndSaveClientPdf = (kind, storageType, clientId, params = {}, meta = {}) => {
  const { filename, dataUrl } = generatePDFData(kind, params);
  const record = { filename, dataUrl, date: new Date().toISOString(), meta };
  const saved = addClientPdf(clientId, storageType, record);
  try {
    const fullClient = getClientById(clientId);
    // Log estructurado del cliente completo luego de guardar el PDF
    // Nota: puede ser grande por incluir dataUrl; se mantiene para depuración puntual
    // Si molesta en consola, comentar la siguiente línea
    // eslint-disable-next-line no-console
    console.log('CLIENTE COMPLETO TRAS GUARDAR PDF:', JSON.stringify(fullClient, null, 2));
  } catch {}
  return saved;
};