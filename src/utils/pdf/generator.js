import jsPDF from 'jspdf';
import { createHeader } from './header';
import { createFooter } from './footer';
import { shareOrDownload, buildFilename } from './helpers';
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