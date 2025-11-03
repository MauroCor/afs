import React from 'react';

const BudgetTypeCards = ({ onSelectType }) => {
  const types = [
    { id: 'GAS', name: 'GAS', color: 'bg-amber-500', hoverColor: 'hover:bg-amber-600' },
    { id: 'AGUA PLUVIAL', name: 'AGUA PLUVIAL', color: 'bg-sky-500', hoverColor: 'hover:bg-sky-600' },
    { id: 'SANITARIO', name: 'SANITARIO', color: 'bg-slate-600', hoverColor: 'hover:bg-slate-700' },
    { id: 'CALEFACCION', name: 'CALEFACCION', color: 'bg-rose-500', hoverColor: 'hover:bg-rose-600' }
  ];

  return (
    <div className="space-y-3">
      {types.map(type => (
        <button
          key={type.id}
          onClick={() => onSelectType(type.id)}
          className={`w-full ${type.color} ${type.hoverColor} text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 px-4 py-6 text-center`}
        >
          <h2 className="text-lg font-semibold">{type.name}</h2>
        </button>
      ))}
    </div>
  );
};

export default BudgetTypeCards;


