"use client";
import { useState } from "react";
import { Ban, Check, Loader2 } from "lucide-react";

interface BlockButtonProps {
  userId: string;
  isBlocked: boolean;
  onToggle: (newStatus: boolean) => void;
}

export default function BlockButton({ userId, isBlocked, onToggle }: BlockButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleBlock = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Impede que o clique no card seja ativado
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blocked: !isBlocked
        }),
      });

      if (response.ok) {
        onToggle(!isBlocked);
      } else {
        console.error('Erro ao atualizar status do usuário');
        // Aqui você pode adicionar uma notificação de erro
      }
    } catch (error) {
      console.error('Erro de rede:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleBlock}
      disabled={isLoading}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
        transition-all duration-200 min-w-[100px] justify-center
        ${isBlocked 
          ? 'bg-green-500 hover:bg-green-600 text-white' 
          : 'bg-red-500 hover:bg-red-600 text-white'
        }
        ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'}
      `}
      title={isBlocked ? "Clique para desbloquear" : "Clique para bloquear"}
    >
      {isLoading ? (
        <Loader2 size={12} className="animate-spin" />
      ) : isBlocked ? (
        <>
          <Check size={12} />
          <span>Desbloquear</span>
        </>
      ) : (
        <>
          <Ban size={12} />
          <span>Bloquear</span>
        </>
      )}
    </button>
  );
}