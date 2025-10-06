import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../../components/footer";
import NavbarProfile from "./navbarprofile";
import ProfileCard from "./profilecard";
import EditProfileForm from "./editProfileForm";
import ChangePassword from "./changepassword";
import AuthorSection from "./authorSection";

import useUser from "../../hooks/useUser";

function Profile() {
  const { user, isAdmin } = useUser();
  const [open, setOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Função para forçar atualização
  const forceRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Callback para quando o perfil for atualizado
  const handleProfileUpdate = () => {
    forceRefresh();
    setOpen(false);
  };

  // Listener para mudanças do usuário
  useEffect(() => {
    const handleUserUpdate = (event: any) => {
      console.log('Profile - evento userUpdated recebido:', event.detail);
      forceRefresh();
    };

    window.addEventListener('userUpdated', handleUserUpdate);
    return () => window.removeEventListener('userUpdated', handleUserUpdate);
  }, []);

  // Monitorar mudanças no user
  useEffect(() => {
    console.log('Profile - useEffect detectou mudança no user:', user);
    console.log('Profile - descrição atual:', user?.descricao);
    forceRefresh();
  }, [user]);

  return (
    <div className="flex flex-col min-h-screen">
      <NavbarProfile />
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
              <Link to="/userList">
                <button
                  className="bg-purple-600 text-white px-4 py-1 rounded-full border border-purple-700 flex items-center gap-2 shadow hover:bg-purple-700 transition-colors"
                  aria-label="Lista de usuários"
                >
                  <span className="text-sm">👥</span>
                  <span className="text-sm">Lista de usuários</span>
                </button>
              </Link>
            )}
          </div>
          
          <ProfileCard key={`profile-${refreshKey}-${user?.id || 'no-user'}`} user={user} />
          
          {/* Seção de Autoria */}
          <AuthorSection user={user} />
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
                onBack={() => setShowChangePassword(false)} 
              />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default Profile;
