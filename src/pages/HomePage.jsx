import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import AppHeader from '../components/AppHeader';

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
      title: 'INSTALACIONES',
      description: 'Planilla de materiales',
      icon: '🔧',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    },
    {
      id: 'presupuesto',
      title: 'PRESUPUESTOS',
      description: 'Crear presupuestos',
      icon: '🧾',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600'
    },
    {
      id: 'recibos',
      title: 'RECIBOS',
      description: 'Control de cobranzas',
      icon: '💰',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600'
    },
    {
      id: 'clientes',
      title: 'CLIENTES',
      description: 'Historial de PDFs',
      icon: '👥',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600'
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
      case 'recibos':
        navigate('/recibos');
        break;
      case 'clientes':
        navigate('/clientes');
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
      <AppHeader title="¡BIENVENIDO!" onLogout={handleLogout} homePath="/" />

      {/* Contenido principal */}
      <div className="max-w-mobile mx-auto px-4 py-8">
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
