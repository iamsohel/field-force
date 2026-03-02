import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const typeColors = {
    danger: {
      button: 'btn-danger',
      icon: 'text-red-600',
      bg: 'bg-red-50',
    },
    warning: {
      button: 'btn-warning',
      icon: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    info: {
      button: 'btn-primary',
      icon: 'text-blue-600',
      bg: 'bg-blue-50',
    },
  };

  const colors = typeColors[type] || typeColors.danger;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`btn ${colors.button}`}
          >
            {confirmText}
          </button>
        </>
      }
    >
      <div className={`${colors.bg} rounded-lg p-4 mb-4`}>
        <div className="flex items-start gap-3">
          <AlertTriangle className={`w-6 h-6 ${colors.icon} flex-shrink-0 mt-0.5`} />
          <div className="flex-1">
            <p className="text-sm text-gray-700">{message}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmModal;
