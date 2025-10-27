"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ProfileCard from "./profilecard";
import EditProfileForm from "./editProfileForm";
import ChangePassword from "./changepassword";
import BookCarousel from "@/components/book/BookCarousel";
import type { SafeUser } from "@/types/user";

interface ProfileProps {
  currentUser: SafeUser | null;
  userBooks?: Array<{ id: string; title: string; coverUrl: string | null; }>;
}

export default function Profile({ currentUser, userBooks = [] }: ProfileProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Usar dados do servidor (mais atualizados) ao invés da sessão
  const user: SafeUser | null = currentUser;
  const isAdmin = user?.role === "ADMIN";

  const handleProfileUpdate = () => {
    setOpen(false);
    router.refresh(); // Recarregar dados do servidor para atualizar imagem no card
  };

  const handlePasswordChange = () => {
    setShowChangePassword(false);
    // Recarregar a página após mudança de senha
    router.refresh();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-center mb-4 gap-3">
            <button
              onClick={() => setOpen(true)}
              className="bg-white text-purple-700 px-4 py-1 rounded-full border border-purple-300 flex items-center gap-2 shadow"
              aria-label="Editar conta"
            >
              <span className="text-sm">✎</span>
              <span className="text-sm">Editar conta</span>
            </button>
            
            {isAdmin && (
              <button
                onClick={() => router.push("/admin/users")}
                className="bg-purple-600 text-white px-4 py-1 rounded-full border border-purple-700 flex items-center gap-2 shadow hover:bg-purple-700 transition-colors"
                aria-label="Lista de usuários"
              >
                <span className="text-sm">👥</span>
                <span className="text-sm">Lista de usuários</span>
              </button>
            )}
          </div>
          
          <ProfileCard user={user} />
          
          {/* Seção de Livros do Usuário usando BookCarousel */}
          <BookCarousel
            books={userBooks}
            title={`📚 Autoria de ${user?.name || 'Usuário'}!`}
            iconSrc="/img/svg/book/author.svg"
            itemsPerView={5}
            emptyMessage={`${user?.name || 'Usuário'} não possui obras de autoria registradas no Readowl.`}
          />
        </div>

        {open && (
          <div 
            className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 pt-4"
            onClick={() => setOpen(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <EditProfileForm 
                onClose={handleProfileUpdate}
                onChangePassword={() => setShowChangePassword(true)}
                currentUser={user}
              />
            </div>
          </div>
        )}

        {showChangePassword && (
          <div 
            className="fixed inset-0 bg-black/60 flex items-start justify-center z-[60] pt-4"
            onClick={() => setShowChangePassword(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <ChangePassword 
                onBack={handlePasswordChange} 
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
