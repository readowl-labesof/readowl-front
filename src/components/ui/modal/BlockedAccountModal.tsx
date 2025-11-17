"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { signOut } from "next-auth/react";

interface BlockedAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BlockedAccountModal({ isOpen, onClose }: BlockedAccountModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleClose = async () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
    
    // Fazer logout automático
    await signOut({ redirect: false });
    window.location.href = "/login";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        className={`
          relative bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl
          transform transition-all duration-300 ease-out
          ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        `}
      >
        {/* Botão fechar */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Conteúdo */}
        <div className="text-center">
          {/* Ícone */}
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="text-red-500" size={32} />
          </div>

          {/* Título */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Conta Bloqueada
          </h2>

          {/* Mensagem */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            Sua conta foi bloqueada pelo administrador. 
          </p>

          {/* Botões */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleClose}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Entendi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}