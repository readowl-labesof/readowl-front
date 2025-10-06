
import { useState, useEffect } from "react";

type Props = {
    user?: any | null;
}

function ProfileCard({ user }: Props) {
    console.log('ProfileCard - renderização iniciada');
    console.log('ProfileCard - prop user recebida:', user);
    
    // Sempre pegar os dados mais atuais do localStorage
    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const userFromStorage = JSON.parse(localStorage.getItem('readowl-user') || 'null');
            console.log('ProfileCard - dados do localStorage:', userFromStorage);
            return userFromStorage || user;
        } catch (e) {
            console.log('ProfileCard - erro ao parsear localStorage:', e);
            return user;
        }
    });

    // Atualizar quando a prop user mudar
    useEffect(() => {
        if (user) {
            console.log('ProfileCard - atualizando currentUser com:', user);
            setCurrentUser(user);
        }
    }, [user]);

    // Listener para mudanças no localStorage
    useEffect(() => {
        const handleStorageChange = () => {
            try {
                const userFromStorage = JSON.parse(localStorage.getItem('readowl-user') || 'null');
                console.log('ProfileCard - localStorage mudou:', userFromStorage);
                if (userFromStorage) {
                    setCurrentUser(userFromStorage);
                }
            } catch (e) {
                console.log('ProfileCard - erro ao parsear localStorage:', e);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('userUpdated', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('userUpdated', handleStorageChange);
        };
    }, []);

    const displayName = currentUser?.nome || 'Nome não disponível';
    const displayEmail = currentUser?.email || currentUser?.mail || 'Email não disponível';
    const displayBio = currentUser?.bio || currentUser?.descricao || currentUser?.descricaoPerfil || 'Descrição não disponível';
    const displayCreated = currentUser?.createdAt || currentUser?.criadoEm || currentUser?.created_at || 'Data não disponível';
    const avatar = currentUser?.avatarUrl || currentUser?.avatar || currentUser?.foto || null;
    
    console.log('ProfileCard - displayBio final:', displayBio);
    console.log('ProfileCard - currentUser.descricao:', currentUser?.descricao);

    return (
        <div className="bg-readowl-purple-medium rounded-2xl shadow-lg p-8 flex flex-col items-center w-full max-w-2xl mx-auto mt-6">
            <h2 className="text-2xl font-bold text-white mb-4">Informações de Usuário</h2>
            <div className="flex flex-row items-center w-full">
                {/* Avatar */}
                <div className="bg-white rounded-lg p-4 mr-8 flex items-center justify-center" style={{ minWidth: 160, minHeight: 160 }}>
                    {avatar ? (
                        <img src={avatar} alt="avatar" className="object-cover h-full w-full rounded" />
                    ) : (
                        <span className="material-symbols-outlined text-6xl text-gray-400">person</span>
                    )}
                </div>
                {/* Informações */}
                <div className="flex flex-col text-white">
                    <span className="flex items-center mb-2">
                        <span className="material-symbols-outlined mr-2">person</span>
                        <span className="font-semibold text-lg">{displayName}</span>
                    </span>
                    <span className="flex items-center mb-2">
                        <span className="material-symbols-outlined mr-2">mail</span>
                        <span>{displayEmail}</span>
                    </span>
                    <span className="flex items-center mb-2">
                        <span className="material-symbols-outlined mr-2">description</span>
                        <span>{displayBio}</span>
                    </span>
                    <span className="flex items-center mb-2">
                        <span className="material-symbols-outlined mr-2">calendar_month</span>
                        <span>{displayCreated}</span>
                    </span>
                </div>
            </div>
        </div>
    );
}

export default ProfileCard;
