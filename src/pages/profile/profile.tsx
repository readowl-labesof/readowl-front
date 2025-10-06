import { useEffect, useState } from "react";
import Footer from "../../components/footer";
import NavbarProfile from "./navbarprofile";
import ProfileCard from "./profilecard";
import EditProfileForm from "./editProfileForm";
import ChangePassword from "./changepassword";

import useUser from "../../hooks/useUser";

function Profile() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [localUser, setLocalUser] = useState(user);

  // Função para forçar atualização
  const forceRefresh = () => {
    console.log('Profile - forceRefresh chamado, refreshKey atual:', refreshKey);
    setRefreshKey(prev => prev + 1);
    setLocalUser({...user}); // Força uma nova referência
  };

  // Atualizar quando user mudar
  useEffect(() => {
    console.log('Profile - useEffect detectou mudança no user:', user);
    setLocalUser({...user}); // Cria nova referência do objeto
    forceRefresh();
  }, [user]);

  // Listener para evento customizado de atualização
  useEffect(() => {
    const handleUserUpdate = (event: any) => {
      console.log('Profile - evento userUpdated recebido:', event.detail);
      setLocalUser({...event.detail});
      forceRefresh();
    };

    window.addEventListener('userUpdated', handleUserUpdate);
    return () => window.removeEventListener('userUpdated', handleUserUpdate);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <NavbarProfile />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-center mb-4">
            <button
              onClick={() => setOpen(true)}
              className="bg-white text-purple-700 px-4 py-1 rounded-full border border-purple-300 flex items-center gap-2 shadow"
              aria-label="Editar conta"
            >
              <span className="text-sm">✎</span>
              <span className="text-sm">Editar conta</span>
            </button>
          </div>
          <ProfileCard key={`profile-${refreshKey}-${JSON.stringify(localUser)}`} user={localUser} />
        </div>

        {open && (
          <div 
            className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 pt-4"
            onClick={() => setOpen(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <EditProfileForm 
                onClose={() => { setOpen(false); forceRefresh(); }} 
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
                onBack={() => { setShowChangePassword(false); forceRefresh(); }} 
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
