import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sharePDF } from '../utils/pdf/generator';
import BudgetForm from '../components/budgets/BudgetForm';
import AddBudgetModal from '../components/budgets/AddBudgetModal';
import Footer from '../components/Footer';
import AppHeader from '../components/AppHeader';

const BudgetsPage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGeneratingBudgetPDF, setIsGeneratingBudgetPDF] = useState(false);
  const [works, setWorks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      setIsAuthenticated(false);
      navigate('/login', { replace: true });
    }
  };

  const handleGenerateBudgetPDF = async (obraName, direccion, works, total) => {
    setIsGeneratingBudgetPDF(true);
    try {
      await sharePDF('budget', { obraName, direccion, works, total });
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader title="PRESUPUESTOS" onLogout={handleLogout} homePath="/" />

      <div className="w-full max-w-[400px] mx-auto px-4 py-6">
        <BudgetForm 
          onGeneratePDF={handleGenerateBudgetPDF}
          isGeneratingPDF={isGeneratingBudgetPDF}
          onAddWork={handleAddWork}
          works={works}
          total={total}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
        <div className="h-4"></div>
      </div>

      <AddBudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddWork={handleAddWorkSubmit}
        selectedCategory={selectedCategory}
      />

      <Footer />
    </div>
  );
};

export default BudgetsPage;


