import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false
}: ConfirmationDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <div className="p-6">
        <div className="flex items-start mb-6">
          <AlertTriangle className={`${isDanger ? 'text-red-500' : 'text-yellow-500'} mr-4 shrink-0`} size={32} />
          <div className="text-gray-700 text-lg">
            {message}
          </div>
        </div>
        <div className="flex justify-end space-x-4 mt-8 pt-4 border-t border-gray-100">
          <Button variant="ghost" onClick={onCancel} size="lg">
            {cancelText}
          </Button>
          <Button variant={isDanger ? 'danger' : 'primary'} onClick={onConfirm} size="lg">
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
