import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { initialMaterials } from '../data/materials';
import { sharePDF } from '../utils/pdf/generator';
import CategorySection from '../components/installations/InstallationsCategorySection';
import AddMaterialModal from '../components/installations/AddMaterialModal';
import InstallationTypeCards from '../components/installations/InstallationTypeCards';
import ClientSelector from '../components/ClientSelector';
import Footer from '../components/Footer';
import AppHeader from '../components/AppHeader';
import ShareButton from '../components/ShareButton';

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
  const [selectedClient, setSelectedClient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modalCategory, setModalCategory] = useState(null);

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
      setSelectedClient(null);
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

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
  };

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      const obraName = selectedClient?.name || '';
      const direccion = selectedClient?.address || '';
      await sharePDF('installation', { materials, quantities, obraName, brands, direccion });
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
      <AppHeader title="INSTALACIONES" onLogout={handleLogout} homePath="/" />

      {/* Contenido principal */}
      <div className="w-full max-w-[400px] mx-auto px-4 py-6">
        {!selectedCategory ? (
          /* Vista de selección de tipo de instalación */
          <InstallationTypeCards onSelectType={handleSelectCategory} />
        ) : (
          /* Vista de materiales */
          <>
            {/* Botón volver */}
            <button
              onClick={() => setSelectedCategory(null)}
              className="mb-4 text-sm text-gray-600 hover:text-gray-900 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </button>

            {/* Selector de cliente */}
            <ClientSelector
              onSelectClient={setSelectedClient}
              selectedClient={selectedClient}
              required={true}
            />

            {/* Lista de categorías: solo la seleccionada */}
            <div className="space-y-4 w-full min-w-0">
              <CategorySection
                category={selectedCategory}
                materials={materials}
                quantities={quantities}
                onQuantityChange={handleQuantityChange}
                onBrandChange={handleBrandChange}
                onAddMaterial={() => {
                  setModalCategory(selectedCategory);
                  setIsModalOpen(true);
                }}
              />
              
              {/* Botón generar PDF */}
              <ShareButton
                onGeneratePDF={handleGeneratePDF}
                disabled={!selectedClient}
                loading={isGeneratingPDF}
                label="Generar PDF"
              />
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
                  onClick={() => {
                    setModalCategory(selectedCategory);
                    setIsModalOpen(true);
                  }}
                  className="btn-primary"
                >
                  Agregar material
                </button>
              </div>
            )}
          </>
        )}

        {/* Espaciado para el footer */}
        <div className="h-4"></div>
      </div>

      {/* Modal agregar material */}
      <AddMaterialModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setModalCategory(null);
        }}
        onAddMaterial={handleAddMaterial}
        category={modalCategory}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default InstallationsPage;
