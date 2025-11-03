export const groupMaterialsByCategory = (materials = [], quantities = {}) => {
  const grouped = {};
  for (const material of materials) {
    const quantity = quantities[material.id] || 0;
    if (quantity > 0) {
      if (!grouped[material.category]) grouped[material.category] = [];
      grouped[material.category].push({ ...material, quantity });
    }
  }
  return grouped;
};

export const formatObraNameForFile = (obraName) => {
  if (!obraName || typeof obraName !== 'string') return 'OBRA';
  return obraName
    .toUpperCase()
    .replace(/\s+/g, '-')
    .replace(/[^A-Z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

export const supportsWebShare = () =>
  typeof navigator !== 'undefined' && navigator.share && typeof navigator.share === 'function';

export const supportsFileConstructor = () =>
  typeof File !== 'undefined' && typeof File === 'function';

export const shareOrDownload = async (doc, filename) => {
  const blob = doc.output('blob');
  if (supportsWebShare() && supportsFileConstructor()) {
    try {
      const file = new File([blob], filename, { type: 'application/pdf' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: filename, files: [file] });
        return;
      }
    } catch {}
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  try { a.click(); } catch { window.open(url, '_blank'); }
  setTimeout(() => { try { document.body.removeChild(a); URL.revokeObjectURL(url); } catch {} }, 300);
};

export const buildFilename = (type, meta = {}) => {
  const date = new Date().toISOString().split('T')[0];
  if (type === 'installation') return `AFS-INSTALACION-${formatObraNameForFile(meta.clienteName || '')}-${date}.pdf`;
  if (type === 'budget') return `AFS-PRESUPUESTO-${formatObraNameForFile(meta.clienteName || '')}-${date}.pdf`;
  if (type === 'receipt') {
    const cliente = (meta.clienteName || 'CLIENTE').toUpperCase().replace(/[^A-Z0-9]/g, '-').replace(/-+/g, '-').substring(0, 20);
    return `AFS-RECIBO-${cliente}-${date}.pdf`;
  }
  return `AFS-${date}.pdf`;
};


