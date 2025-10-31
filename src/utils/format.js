export const formatCurrency = (amount = 0) => {
  const n = typeof amount === 'number' ? amount : Number(amount) || 0;
  return `$${n.toLocaleString('es-AR')}`;
};

export const parseMoneyInput = (value = '') => {
  const cleaned = String(value).replace(/[^0-9.,]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : 0;
};

