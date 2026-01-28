import React, { useEffect } from 'react';
import './Modal.css';

export type ModalVariant = 'success' | 'danger' | 'info';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: React.ReactNode;
  variant?: ModalVariant;
  /** Botão principal (Excluir, OK, etc.). Se não definido em modo confirm, usa "OK" */
  confirmLabel?: string;
  /** Só em modo confirmação: botão cancelar */
  cancelLabel?: string;
  /** Em modo confirmação: chamado ao clicar no botão principal */
  onConfirm?: () => void;
}

/**
 * Modal reutilizável.
 * - Um botão (OK): quando onConfirm não é passado; onClose é usado ao clicar em OK.
 * - Dois botões (Cancelar + Confirmar): quando onConfirm é passado; onConfirm ao confirmar, onClose ao cancelar.
 */
export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  message,
  variant = 'info',
  confirmLabel = 'OK',
  cancelLabel = 'Cancelar',
  onConfirm,
}) => {
  const isConfirm = typeof onConfirm === 'function';

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleConfirm = () => {
    if (isConfirm) onConfirm!();
    else onClose();
  };

  return (
    <div
      className="modal-overlay modal-overlay-app"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`modal-box modal-box--${variant}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">
            {title}
          </h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="modal-message">{message}</div>
        </div>
        <div className="modal-footer">
          {isConfirm && (
            <button type="button" className="modal-btn modal-btn--secondary" onClick={onClose}>
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            className={`modal-btn modal-btn--primary modal-btn--${variant}`}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
