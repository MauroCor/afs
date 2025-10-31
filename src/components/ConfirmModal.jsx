import React from 'react';
import Modal from './Modal';

const ConfirmModal = ({ title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', onConfirm, onCancel }) => {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      secondaryText={cancelText}
      onSecondary={onCancel}
      primaryText={confirmText}
      onPrimary={onConfirm}
      primaryClassName="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
    >
      <p className="text-sm text-gray-700">{message}</p>
    </Modal>
  );
};

export default ConfirmModal;


