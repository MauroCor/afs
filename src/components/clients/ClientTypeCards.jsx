import React from 'react';

const ClientTypeCards = ({ onSelect }) => {
  const types = [
    { key: 'installations', label: 'INSTALACIONES', icon: '🔧', color: 'bg-blue-500', hover: 'hover:bg-blue-600' },
    { key: 'budgets', label: 'PRESUPUESTOS', icon: '🧾', color: 'bg-green-500', hover: 'hover:bg-green-600' },
    { key: 'receipts', label: 'RECIBOS', icon: '💰', color: 'bg-orange-500', hover: 'hover:bg-orange-600' },
  ];

  return (
    <div className="space-y-3">
      {types.map((t) => (
        <button
          key={t.key}
          onClick={() => onSelect(t.key)}
          className={`w-full ${t.color} ${t.hover} text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 px-4 py-6 text-center`}
        >
          <div className="flex items-center space-x-4 justify-center">
            <div className="text-2xl">{t.icon}</div>
            <h2 className="text-lg font-semibold">{t.label}</h2>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ClientTypeCards;



