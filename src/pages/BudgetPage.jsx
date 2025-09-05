import React, { useState, useEffect, useCallback } from 'react';
import { initialMaterials, categories } from '../data/materials';
import { generateAndSharePDF } from '../utils/pdfGenerator';
import CategorySection from '../components/CategorySection';
import AddMaterialModal from '../components/AddMaterialModal';
import ShareButton from '../components/ShareButton';
import LoginPage from '../components/LoginPage';
import logo from '../images/logo.png';

const BudgetPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [materials, setMaterials] = useState(initialMaterials);
  const [quantities, setQuantities] = useState(() => {
    const initialQuantities = {};
    initialMaterials.forEach(material => {
      initialQuantities[material.id] = 0;
    });
    return initialQuantities;
  });
  const [obraName, setObraName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Verificar autenticación al montar el componente
  useEffect(() => {
    checkAuthentication();
  }, []);

  // Cargar datos cuando se autentica
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Verificar si el usuario está autenticado
  const checkAuthentication = () => {
    const auth = localStorage.getItem('afs_authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  };

  // Función para manejar el login
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      localStorage.removeItem('afs_authenticated');
      setIsAuthenticated(false);
      // Limpiar datos locales
      setQuantities(() => {
        const initialQuantities = {};
        initialMaterials.forEach(material => {
          initialQuantities[material.id] = 0;
        });
        return initialQuantities;
      });
      setObraName('');
    }
  };

  const loadData = () => {
    try {
      // Intentar cargar desde localStorage
      const savedMaterials = localStorage.getItem('afs-materials');
      const savedQuantities = localStorage.getItem('afs-quantities');
      const savedObraName = localStorage.getItem('afs-obra-name');

      if (savedMaterials && savedQuantities) {
        setMaterials(JSON.parse(savedMaterials));
        setQuantities(JSON.parse(savedQuantities));
      }
      if (savedObraName) {
        setObraName(savedObraName);
      }
      // Si no hay datos guardados, usar los valores iniciales que ya están configurados
    } catch (error) {
      console.error('Error al cargar datos:', error);
      // Los valores iniciales ya están configurados en useState
    }
  };

  const saveData = useCallback(() => {
    try {
      localStorage.setItem('afs-materials', JSON.stringify(materials));
      localStorage.setItem('afs-quantities', JSON.stringify(quantities));
      localStorage.setItem('afs-obra-name', obraName);
    } catch (error) {
      console.error('Error al guardar datos:', error);
    }
  }, [materials, quantities, obraName]);

  // Guardar datos cuando cambien
  useEffect(() => {
    saveData();
  }, [saveData]);

  const handleQuantityChange = (materialId, newQuantity) => {
    setQuantities(prev => ({
      ...prev,
      [materialId]: Math.max(0, newQuantity)
    }));
  };

  const handleAddMaterial = (newMaterial) => {
    setMaterials(prev => [...prev, newMaterial]);
  };

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      await generateAndSharePDF(materials, quantities, obraName);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, intenta nuevamente.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Calcular total de materiales seleccionados
  const totalSelected = Object.values(quantities).reduce((total, qty) => total + qty, 0);

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-mobile mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo y título en la misma línea */}
            <div className="flex items-center space-x-3">
              <img
                src={logo}
                alt="AFS Logo"
                className="h-12 w-12 object-contain"
              />
              <h1 className="text-xl font-bold text-gray-900">
                Presupuestos
              </h1>
            </div>
            
            {/* Botón de Cerrar Sesión */}
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium transition duration-200"
              title="Cerrar sesión"
            >
              Salir
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-mobile mx-auto px-4 py-6">
        {/* Botón agregar material */}
        {/* Campo nombre de obra */}
        <div className="mb-4">
          <input
            type="text"
            value={obraName}
            onChange={(e) => setObraName(e.target.value)}
            className="w-full text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:border-afs-blue focus:outline-none"
            placeholder="Nombre de la obra"
          />
        </div>

        {/* Botón Agregar Material */}
        <div className="mb-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full btn-primary flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Agregar Material</span>
          </button>
        </div>

        {/* Lista de categorías */}
        <div className="space-y-4">
          {categories.map(category => (
            <CategorySection
              key={category}
              category={category}
              materials={materials}
              quantities={quantities}
              onQuantityChange={handleQuantityChange}
            />
          ))}
        </div>

        {/* Mensaje si no hay materiales */}
        {materials.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay materiales
            </h3>
            <p className="text-gray-500 mb-4">
              Agrega tu primer material para comenzar
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
            >
              Agregar Material
            </button>
          </div>
        )}

        {/* Espaciado para el botón flotante */}
        <div className="h-20"></div>
      </div>

      {/* Modal agregar material */}
      <AddMaterialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddMaterial={handleAddMaterial}
      />

      {/* Botón flotante generar PDF */}
      <ShareButton
        onGeneratePDF={handleGeneratePDF}
        disabled={isGeneratingPDF || totalSelected === 0}
      />
    </div>
  );
};

export default BudgetPage;
