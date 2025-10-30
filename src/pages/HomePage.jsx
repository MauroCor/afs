import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import logo from '../images/logo.png';

const HomePage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar autenticación al montar el componente
  useEffect(() => {
    const auth = localStorage.getItem('afs_authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      localStorage.removeItem('afs_authenticated');
      window.location.reload();
    }
  };

  const cards = [
    {
      id: 'instalaciones',
      title: 'Instalaciones',
      description: 'Planilla de materiales',
      icon: '🔧',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    },
    {
      id: 'presupuesto',
      title: 'Presupuestos',
      description: 'Crear presupuestos',
      icon: '🧾',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600'
    },
    {
      id: 'entregas',
      title: 'Entregas',
      description: 'Control de cobranzas',
      icon: '💰',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600'
    }
  ];

  const handleCardClick = (cardId) => {
    switch (cardId) {
      case 'instalaciones':
        navigate('/instalaciones');
        break;
      case 'presupuesto':
        navigate('/presupuesto');
        break;
      case 'entregas':
        navigate('/entregas');
        break;
      default:
        break;
    }
  };

  // No renderizar si no está autenticado
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-mobile mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div></div>
            
            <div className="flex items-center w-64">
              <img
                src={logo}
                alt="AFS Logo"
                className="h-16 w-16 object-contain flex-shrink-0 mr-3"
              />
              <h1 className="text-lg font-bold text-gray-900">
                Gestión de obras
              </h1>
            </div>
            
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition duration-200"
              title="Cerrar sesión"
            >
              Salir
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-mobile mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡ Bienvenido !
          </h2>
          <p className="text-gray-600">
            Selecciona una opción para continuar
          </p>
        </div>

        {/* Tarjetas */}
        <div className="grid gap-6">
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`${card.color} ${card.hoverColor} text-white rounded-lg p-6 cursor-pointer transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl`}
            >
              <div className="flex items-center space-x-4">
                <div className="text-4xl">
                  {card.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">
                    {card.title}
                  </h3>
                  <p className="text-white/90">
                    {card.description}
                  </p>
                </div>
                <div className="text-2xl">
                  →
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
