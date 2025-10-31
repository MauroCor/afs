import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../images/logo.png';

const AppHeader = ({ title, onLogout, homePath = '/' }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-mobile mx-auto px-4 py-4">
        <div className="grid grid-cols-3 items-center">
          {/* Izquierda: botón home con logo */}
          <button
            onClick={() => navigate(homePath)}
            className="flex items-center hover:opacity-80 transition-opacity duration-200 justify-self-start"
            title="Volver al inicio"
          >
            <img
              src={logo}
              alt="AFS Logo"
              className="h-16 w-16 object-contain flex-shrink-0"
            />
          </button>

          {/* Centro: título */}
          <h1 className="text-lg font-bold text-gray-900 text-center justify-self-center whitespace-nowrap">
            {title}
          </h1>

          {/* Derecha: salir */}
          <button
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition duration-200 justify-self-end"
            title="Cerrar sesión"
          >
            Salir
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppHeader;


