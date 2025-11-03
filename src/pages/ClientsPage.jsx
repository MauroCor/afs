import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import Footer from '../components/Footer';
import { getClients } from '../utils/clientsStorage';

const ClientsPage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const auth = localStorage.getItem('afs_authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const list = getClients();
    setClients(list);
  }, [isAuthenticated]);

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      localStorage.removeItem('afs_authenticated');
      navigate('/login', { replace: true });
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const filteredClients = clients.filter((c) => {
    const term = searchTerm.trim().toUpperCase();
    if (!term) return true;
    const name = (c.name || '').toUpperCase();
    const address = (c.address || '').toUpperCase();
    return name.includes(term) || address.includes(term);
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader title="CLIENTES" onLogout={handleLogout} homePath="/" />

      <div className="w-full max-w-[400px] mx-auto px-4 py-6">
        {/* Buscador */}
        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:border-afs-blue focus:outline-none"
            placeholder="Buscar cliente por nombre o dirección..."
          />
        </div>

        {filteredClients.length === 0 ? (
          <div className="text-center text-gray-600">Sin clientes aún.</div>
        ) : (
          <div className="space-y-2">
            {filteredClients.map((c) => (
              <div key={c.id} className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="text-sm font-semibold text-gray-900">{c.name}</div>
                {c.address ? (
                  <div className="text-xs text-gray-600">{c.address}</div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ClientsPage;


