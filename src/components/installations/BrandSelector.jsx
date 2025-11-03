import React from 'react';

const BrandSelector = ({ category, brand, onBrandChange, quickBrands = [] }) => {
  const handleBrandChange = (e) => {
    const newBrand = e.target.value;
    if (onBrandChange) {
      onBrandChange(category, newBrand);
    }
  };

  const handleBrandButtonClick = (brandName) => {
    if (onBrandChange) {
      onBrandChange(category, brandName);
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
      {quickBrands.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          {quickBrands.map((quickBrand) => (
            <button
              key={quickBrand}
              type="button"
              onClick={() => handleBrandButtonClick(quickBrand)}
              className="flex-1 text-sm font-medium bg-white hover:bg-blue-50 border-2 border-gray-300 hover:border-blue-400 text-gray-800 px-4 py-2.5 rounded-lg transition-all shadow-sm hover:shadow"
            >
              {quickBrand}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center space-x-3">
        <label htmlFor={`brand-${category}`} className="text-sm font-medium text-gray-700 whitespace-nowrap">
          Marca:
        </label>
        <input
          type="text"
          id={`brand-${category}`}
          value={brand || ''}
          onChange={handleBrandChange}
          className="flex-1 text-sm bg-white border border-gray-300 rounded-lg px-3 py-2 focus:border-afs-blue focus:outline-none"
          placeholder="Ingrese marca"
        />
      </div>
    </div>
  );
};

export default BrandSelector;

