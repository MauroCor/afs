import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateAndShareBudgetPDF } from '../utils/pdfGenerator';
import BudgetForm from '../components/BudgetForm';
import AddBudgetModal from '../components/AddBudgetModal';
import Footer from '../components/Footer';
import logo from '../images/logo.png';

const BudgetPage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGeneratingBudgetPDF, setIsGeneratingBudgetPDF] = useState(false);
  const [works, setWorks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Verificar autenticación al montar el componente
  useEffect(() => {
    const auth = localStorage.getItem('afs_authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // Función para cerrar sesión
  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      localStorage.removeItem('afs_authenticated');
      setIsAuthenticated(false);
      navigate('/login', { replace: true });
    }
  };

  const handleGenerateBudgetPDF = async (obraName, direccion, works, total) => {
    setIsGeneratingBudgetPDF(true);
    
    try {
      await generateAndShareBudgetPDF(obraName, direccion, works, total);
    } catch (error) {
      console.error('Error al generar PDF de presupuesto:', error);
      alert('Error al generar el PDF de presupuesto. Por favor, intenta nuevamente.');
    } finally {
      setIsGeneratingBudgetPDF(false);
    }
  };

  const handleAddWork = () => {
    setIsModalOpen(true);
  };

  const handleAddWorkSubmit = (newWork) => {
    setWorks(prev => [...prev, newWork]);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const total = works.reduce((sum, work) => sum + work.monto, 0);

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
            
            {/* Logo con título centrado - clickeable */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center hover:opacity-80 transition-opacity duration-200 w-64"
              title="Volver al inicio"
            >
              <img
                src={logo}
                alt="AFS Logo"
                className="h-16 w-16 object-contain flex-shrink-0 mr-3"
              />
              <h1 className="text-lg font-bold text-gray-900">
                Presupuestos
              </h1>
            </button>
            
            {/* Botón de Cerrar Sesión */}
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
      <div className="w-full max-w-[400px] mx-auto px-4 py-6">
        {/* Formulario de presupuesto */}
        <BudgetForm 
          onGeneratePDF={handleGenerateBudgetPDF}
          isGeneratingPDF={isGeneratingBudgetPDF}
          onAddWork={handleAddWork}
          works={works}
          total={total}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        {/* Espaciado para el footer */}
        <div className="h-4"></div>
      </div>

      {/* Modal agregar trabajo */}
      <AddBudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddWork={handleAddWorkSubmit}
        selectedCategory={selectedCategory}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default BudgetPage;