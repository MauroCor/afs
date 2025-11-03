import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import Footer from '../components/Footer';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import IconTrash from '../components/IconTrash';
import ClientTypeCards from '../components/clients/ClientTypeCards';
import { getClients, updateClient, deleteClient, getClientPdfs, deleteClientPdf } from '../utils/clientsStorage';


const ClientsPage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedClient, setSelectedClient] = useState(null);
  const [step, setStep] = useState('list');

  const [confirmDeleteClient, setConfirmDeleteClient] = useState({ open: false, clientId: null });
  const [confirmDeletePdf, setConfirmDeletePdf] = useState({ open: false, pdfId: null });
  const [selectedSection, setSelectedSection] = useState(null);
  

  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [editingAddress, setEditingAddress] = useState('');

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

  const filteredClients = useMemo(() => {
    const term = searchTerm.trim().toUpperCase();
    if (!term) return clients;
    return clients.filter((c) => {
      const name = (c.name || '').toUpperCase();
      const address = (c.address || '').toUpperCase();
      return name.includes(term) || address.includes(term);
    });
  }, [clients, searchTerm]);

  const pdfs = (!selectedClient || !selectedSection) ? [] : getClientPdfs(selectedClient.id, selectedSection);

  const canShare = typeof navigator !== 'undefined' && navigator.share;
  const handleSharePdf = async (pdf) => {
    try {
      if (canShare && navigator.canShare) {
        const res = await fetch(pdf.dataUrl);
        const blob = await res.blob();
        const file = new File([blob], pdf.filename, { type: 'application/pdf' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ title: pdf.filename, files: [file] });
          return;
        }
      }
      const a = document.createElement('a');
      a.href = pdf.dataUrl;
      a.download = pdf.filename;
      document.body.appendChild(a);
      try { a.click(); } finally { document.body.removeChild(a); }
    } catch {}
  };

  const handleViewPdf = async (pdf) => {
    try {
      // Generar un ObjectURL a partir del dataUrl para mayor compatibilidad
      const response = await fetch(pdf.dataUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      window.open(url, '_blank', 'noopener,noreferrer');
      // Revocar luego de un tiempo para evitar cortar la carga en pestañas lentas
      setTimeout(() => {
        try { URL.revokeObjectURL(url); } catch {}
      }, 30000);
    } catch (e) {
      // Fallback: intentar abrir directamente el dataUrl
      try { window.open(pdf.dataUrl, '_blank', 'noopener,noreferrer'); } catch {}
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  const sectionStyle = (section) => {
    if (section === 'installations') return { label: 'INSTALACIONES', color: 'bg-blue-500' };
    if (section === 'budgets') return { label: 'PRESUPUESTOS', color: 'bg-green-500' };
    if (section === 'receipts') return { label: 'RECIBOS', color: 'bg-orange-500' };
    return { label: '', color: 'bg-gray-500' };
  };

  const openEditModal = (client) => {
    setEditingName(client.name || '');
    setEditingAddress(client.address || '');
    setSelectedClient(client);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!selectedClient || !editingName.trim()) return;
    const updated = updateClient(selectedClient.id, {
      name: editingName,
      address: editingAddress,
    });
    if (updated) {
      const list = getClients();
      setClients(list);
      setSelectedClient(updated);
      setIsEditing(false);
    }
  };

  const askDeleteClient = (clientId) => setConfirmDeleteClient({ open: true, clientId });
  const confirmDeleteClientAction = () => {
    if (!confirmDeleteClient.clientId) return;
    deleteClient(confirmDeleteClient.clientId);
    const list = getClients();
    setClients(list);
    if (selectedClient?.id === confirmDeleteClient.clientId) {
      setSelectedClient(null);
      setSelectedSection(null);
    }
    setConfirmDeleteClient({ open: false, clientId: null });
  };

  const askDeletePdf = (pdfId) => setConfirmDeletePdf({ open: true, pdfId });
  const confirmDeletePdfAction = () => {
    if (!selectedClient || !selectedSection || !confirmDeletePdf.pdfId) return;
    deleteClientPdf(selectedClient.id, selectedSection, confirmDeletePdf.pdfId);
    setConfirmDeletePdf({ open: false, pdfId: null });
    // Refrescar lista de PDFs releyendo desde storage al recalcular `pdfs`
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader title="CLIENTES" onLogout={handleLogout} homePath="/" />

      <div className="w-full max-w-[400px] mx-auto px-4 py-6">
        {step === 'list' && (
          <>
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
                  <div
                    key={c.id}
                    className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow transition"
                    onClick={() => { setSelectedClient(c); setSelectedSection(null); setStep('types'); }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-2">
                        <div className="text-sm font-semibold text-gray-900">{c.name}</div>
                        {c.address ? (
                          <div className="text-xs text-gray-600">{c.address}</div>
                        ) : null}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); openEditModal(c); }}
                          className="text-blue-600 hover:text-blue-700 text-xs font-semibold"
                          aria-label={`Editar cliente ${c.name}`}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); askDeleteClient(c.id); }}
                          className="ml-2 text-red-500 hover:text-red-700 transition-colors"
                          aria-label={`Eliminar cliente ${c.name}`}
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {step === 'types' && selectedClient && (
          <>
            <button
              onClick={() => { setStep('list'); setSelectedClient(null); setSelectedSection(null); }}
              className="mb-4 text-sm text-gray-600 hover:text-gray-900 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </button>
            <ClientTypeCards onSelect={(key) => { setSelectedSection(key); setStep('pdfs'); }} />
          </>
        )}

        {step === 'pdfs' && selectedClient && selectedSection && (
          <div className="mt-4">
            <button
              onClick={() => setStep('types')}
              className="mb-4 text-sm text-gray-600 hover:text-gray-900 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </button>

            <div className={`${sectionStyle(selectedSection).color} text-white rounded-lg shadow-md px-4 py-3 text-center mb-3`}>
              <h2 className="text-base font-semibold">
                {sectionStyle(selectedSection).label}: {selectedClient.name}
              </h2>
            </div>
            {pdfs.length === 0 ? (
              <div className="text-center text-gray-600 text-sm">Sin PDFs en esta sección.</div>
            ) : (
              <div className="space-y-2">
                {pdfs.map((pdf) => (
                  <div
                    key={pdf.id}
                    className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow transition"
                    onClick={() => handleViewPdf(pdf)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-gray-600 whitespace-nowrap">{formatDate(pdf.date)}</div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleSharePdf(pdf); }}
                          className="text-blue-600 hover:text-blue-700"
                          title="Compartir"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98"/><path d="M15.41 6.51L8.59 10.49"/></svg>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); askDeletePdf(pdf.id); }}
                          className="text-red-500 hover:text-red-700"
                          title="Eliminar"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <svg className="w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6" fill="#fff" opacity=".4"/></svg>
                      <div className="text-sm font-semibold text-gray-900 break-all">{pdf.filename}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />

      {confirmDeleteClient.open && (
        <ConfirmModal
          title="Eliminar cliente"
          message={"¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer."}
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={confirmDeleteClientAction}
          onCancel={() => setConfirmDeleteClient({ open: false, clientId: null })}
        />
      )}

      {confirmDeletePdf.open && (
        <ConfirmModal
          title="Eliminar PDF"
          message={"¿Estás seguro de eliminar este PDF? Esta acción no se puede deshacer."}
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={confirmDeletePdfAction}
          onCancel={() => setConfirmDeletePdf({ open: false, pdfId: null })}
        />
      )}

      {isEditing && selectedClient && (
        <Modal
          title="Editar Cliente"
          onClose={() => setIsEditing(false)}
          primaryText="Guardar"
          onPrimary={saveEdit}
          primaryDisabled={!editingName.trim()}
          secondaryText="Cancelar"
          onSecondary={() => setIsEditing(false)}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre:</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Dirección:</label>
              <input
                type="text"
                value={editingAddress}
                onChange={(e) => setEditingAddress(e.target.value.toUpperCase())}
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

export default ClientsPage;

