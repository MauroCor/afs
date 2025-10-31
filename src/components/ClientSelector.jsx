import React, { useState, useEffect, useRef } from 'react';
import { searchClients, findClientByName, addClient, updateClient } from '../utils/clientsStorage';
import Modal from './Modal';

const ClientSelector = ({ onSelectClient, selectedClient, required = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [editingDireccion, setEditingDireccion] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const searchInputRef = useRef(null);
  const resultsRef = useRef(null);

  // Actualizar campos de edición cuando cambia selectedClient
  useEffect(() => {
    if (selectedClient) {
      setEditingName(selectedClient.name || '');
      setEditingDireccion(selectedClient.address || '');
      setSearchTerm(selectedClient.name || '');
      setIsEditing(false);
    } else {
      setEditingName('');
      setEditingDireccion('');
      setSearchTerm('');
      setIsEditing(false);
    }
  }, [selectedClient]);

  // Búsqueda en tiempo real
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      setShowResults(false);
      setIsCreating(false);
      return;
    }

    const results = searchClients(searchTerm);

    if (results.length > 0) {
      setSearchResults(results);
      setShowResults(true);
      setIsCreating(false);
    } else {
      // No hay resultados, ofrecer crear nuevo
      setSearchResults([]);
      setIsCreating(true);
      setShowResults(true);
    }
  }, [searchTerm]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value.toUpperCase();
    setSearchTerm(value);
    
    // Si hay cliente seleccionado y se modifica, limpiarlo
    if (selectedClient && value !== selectedClient.name) {
      onSelectClient(null);
    }
  };

  const handleSelectCliente = (client) => {
    onSelectClient(client);
    setSearchTerm(client.name);
    setShowResults(false);
    setIsEditing(false);
  };

  const handleCreateNew = () => {
    if (searchTerm.trim() === '') return;

    const existingClient = findClientByName(searchTerm);
    if (existingClient) {
      // Si ya existe, seleccionarlo
      handleSelectCliente(existingClient);
      return;
    }

    // Crear nuevo cliente
    const newClient = addClient({
      name: searchTerm,
      address: ''
    });

    handleSelectCliente(newClient);
    setIsEditing(true); // Activar edición para completar dirección
  };

  const handleSaveEdit = () => {
    if (!selectedClient || !editingName.trim()) return;

    const updatedClient = updateClient(selectedClient.id, {
      name: editingName,
      address: editingDireccion
    });

    if (updatedClient) {
      onSelectClient(updatedClient);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    if (selectedClient) {
      setEditingName(selectedClient.name);
      setEditingDireccion(selectedClient.address || '');
    }
    setIsEditing(false);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSelectClient(null);
    setShowResults(false);
    setIsEditing(false);
  };

  return (
    <div className="mb-4 w-full relative">
      {/* Input de búsqueda o visualización */}
      {selectedClient ? (
        // Modo visualización con opción de editar
        <div className="space-y-2">
          <div className="bg-white border border-gray-300 rounded-lg px-3 py-2">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {selectedClient.name}
                </div>
                {selectedClient.address && (
                  <div className="text-xs text-gray-500 truncate">
                    {selectedClient.address}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 ml-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs text-gray-500 hover:text-gray-700"
                  title="Cambiar cliente"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Modo búsqueda
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => {
              if (searchTerm.trim()) {
                setShowResults(true);
              }
            }}
            className="w-full text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:border-afs-blue focus:outline-none"
            placeholder={"Buscar cliente..."}
            autoComplete="off"
          />
          
          {/* Dropdown de resultados */}
          {showResults && (
            <div
              ref={resultsRef}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              {searchResults.length > 0 && (
                <div className="py-1">
                  {searchResults.map((client) => (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => handleSelectCliente(client)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {client.name}
                      </div>
                      {client.address && (
                        <div className="text-xs text-gray-500">
                          {client.address}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Opción crear nuevo */}
              {isCreating && searchTerm.trim() !== '' && (
                <div className="border-t border-gray-200 py-1">
                  <button
                    type="button"
                    onClick={handleCreateNew}
                    className="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors flex items-center space-x-2"
                  >
                    <span className="text-lg">+</span>
                    <span className="text-sm font-medium text-blue-600">
                      Crear: "{searchTerm}"
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal de edición */}
      {selectedClient && isEditing && (
        <Modal
          title="Editar Cliente"
          onClose={handleCancelEdit}
          primaryText="Guardar"
          onPrimary={handleSaveEdit}
          primaryDisabled={!editingName.trim()}
          secondaryText="Cancelar"
          onSecondary={handleCancelEdit}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre:
              </label>
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value.toUpperCase())}
                className="w-full text-sm bg-white border border-gray-300 rounded-lg px-3 py-2 focus:border-afs-blue focus:outline-none"
                placeholder="Nombre del cliente"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección:
              </label>
              <input
                type="text"
                value={editingDireccion}
                onChange={(e) => setEditingDireccion(e.target.value.toUpperCase())}
                className="w-full text-sm bg-white border border-gray-300 rounded-lg px-3 py-2 focus:border-afs-blue focus:outline-none"
                placeholder="Dirección (opcional)"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ClientSelector;

