import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { initialMaterials, categories } from '../data/materials';
import { generateAndSharePDF } from '../utils/pdfGenerator';
import CategorySection from '../components/CategorySection';
import AddMaterialModal from '../components/AddMaterialModal';
import Footer from '../components/Footer';
import logo from '../images/logo.png';

const InstallationsPage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [materials, setMaterials] = useState(initialMaterials);
  const [quantities, setQuantities] = useState(() => {
    const initialQuantities = {};
    initialMaterials.forEach(material => {
      initialQuantities[material.id] = 0;
    });
    return initialQuantities;
  });
  const [brands, setBrands] = useState({});
  const [obraName, setObraName] = useState('');
  const [direccion, setDireccion] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Verificar autenticación al montar el componente
  useEffect(() => {
    const auth = localStorage.getItem('afs_authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // Función para resetear quantities
  const resetQuantities = () => {
    const initialQuantities = {};
    initialMaterials.forEach(material => {
      initialQuantities[material.id] = 0;
    });
    return initialQuantities;
  };

  // Función para manejar cambio de marca
  const handleBrandChange = (category, brand) => {
    setBrands(prev => ({
      ...prev,
      [category]: brand
    }));
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      localStorage.removeItem('afs_authenticated');
      setIsAuthenticated(false);
      setQuantities(resetQuantities());
      setObraName('');
      setDireccion('');
      navigate('/login', { replace: true });
    }
  };

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
      await generateAndSharePDF(materials, quantities, obraName, brands, direccion);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, intenta nuevamente.');
    } finally {
      setIsGeneratingPDF(false);
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
                Instalaciones
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
        {/* Campo nombre de obra */}
        <div className="mb-4">
          <input
            type="text"
            value={obraName}
            onChange={(e) => setObraName(e.target.value)}
            className="w-full text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:border-afs-blue focus:outline-none"
            placeholder="Obra de..."
          />
        </div>

        {/* Campo dirección */}
        <div className="mb-4">
          <input
            type="text"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            className="w-full text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:border-afs-blue focus:outline-none"
            placeholder="Dirección..."
          />
        </div>

        {/* Lista de categorías */}
        <div className="space-y-4 w-full min-w-0">
          {categories.map(category => (
            <CategorySection
              key={category}
              category={category}
              materials={materials}
              quantities={quantities}
              onQuantityChange={handleQuantityChange}
              onBrandChange={handleBrandChange}
              onAddMaterial={category === 'OTROS MATERIALES' ? () => setIsModalOpen(true) : null}
            />
          ))}
          
          {/* Botón generar PDF */}
          <div className="flex justify-center">
            <button
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
              className="btn-primary text-base py-3 px-6 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center space-x-2">
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                  />
                </svg>
                <span>Generar PDF</span>
              </div>
            </button>
          </div>
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
              Agregar material
            </button>
          </div>
        )}

        {/* Espaciado para el footer */}
        <div className="h-4"></div>
      </div>

      {/* Modal agregar material */}
      <AddMaterialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddMaterial={handleAddMaterial}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default InstallationsPage;
