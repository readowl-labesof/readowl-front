
type Props = {
    user?: any | null;
}

function ProfileCard({ user }: Props) {
    console.log('ProfileCard - prop user:', user);
    try {
        const userFromStorage = JSON.parse(localStorage.getItem('readowl-user') || 'null');
        console.log('ProfileCard - localStorage readowl-user:', userFromStorage);
    } catch (e) {
        console.log('ProfileCard - erro ao parsear localStorage:', e);
    }

    const displayName = user?.nome || 'Nome não disponível';
    const displayEmail = user?.email || user?.mail || 'Email não disponível';
    const displayBio = user?.bio || user?.descricao || user?.descricaoPerfil || 'Descrição não disponível';
    const displayCreated = user?.createdAt || user?.criadoEm || user?.created_at || 'Data não disponível';
    const avatar = user?.avatarUrl || user?.avatar || user?.foto || null;

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
