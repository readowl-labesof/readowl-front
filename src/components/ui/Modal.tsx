import type { PropsWithChildren } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  widthClass?: string; // permite controlar a largura com classes Tailwind
}

// Modal simples, compatível com Vite/React. Usa Tailwind para estilização.
// Comentário: este componente encapsula o overlay e a caixa do modal.
export default function Modal({ open, onClose, title, widthClass = 'max-w-md', children }: PropsWithChildren<ModalProps>) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-white text-readowl-purple rounded-2xl shadow-xl w-[92%] ${widthClass} p-5`}>
        {title && <h2 className="text-lg font-semibold mb-3">{title}</h2>}
        {children}
        <button className="absolute top-2 right-3 text-sm text-readowl-purple/70 hover:text-readowl-purple" onClick={onClose} aria-label="Fechar">✕</button>
      </div>
    </div>
  );
}
