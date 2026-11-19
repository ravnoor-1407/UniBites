import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useCart } from '../../context/CartContext';
import { AlertCircle } from 'lucide-react';

const OutletConflictModal = () => {
  const { conflictModal, setConflictModal, replaceCartWithNewOutlet, activeOutlet } = useCart();

  if (!conflictModal) return null;

  const { newItem, newOutlet } = conflictModal;

  return (
    <Modal
      isOpen={Boolean(conflictModal)}
      onClose={() => setConflictModal(null)}
      title="Replace items already in cart?"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 bg-warning/10 border border-warning/30 rounded-xl text-warning">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-xs text-text leading-relaxed">
            Your cart already contains items from <strong className="font-bold text-text">{activeOutlet?.name}</strong>. Campus pre-orders must be from a single outlet so you receive one counter pickup token.
          </p>
        </div>

        <p className="text-sm text-text-muted">
          Do you want to clear your current cart and start a new order with <strong className="text-text">{newItem.name}</strong> from <strong className="text-text">{newOutlet.name}</strong>?
        </p>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => setConflictModal(null)}
          >
            Keep Current Cart
          </Button>
          <Button
            variant="primary"
            onClick={replaceCartWithNewOutlet}
          >
            Clear & Add New
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default OutletConflictModal;
