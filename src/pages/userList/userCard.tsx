interface User {
  id: string;
  nome?: string;
  email: string;
  avatarUrl?: string;
  role: "admin" | "user";
  descricao?: string;
  criadoEm?: string;
}

export default function UserCard({ user }: { user: User }) {
  return (
    <div className="bg-purple-600 rounded-2xl p-5 flex items-center gap-4 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]">
      {/* Avatar */}
      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white flex items-center justify-center flex-shrink-0 shadow-md">
        {user.avatarUrl ? (
          <img 
            src={user.avatarUrl} 
            alt={user.nome || user.email}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-purple-100 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-purple-600">
              <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" fill="currentColor"/>
              <path d="M12 14C8.68629 14 6 16.6863 6 20V22H18V20C18 16.6863 15.3137 14 12 14Z" fill="currentColor"/>
            </svg>
          </div>
        )}
      </div>

      {/* Info do usuário */}
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white/90 flex-shrink-0">
            <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" fill="currentColor"/>
            <path d="M12 14C8.68629 14 6 16.6863 6 20V22H18V20C18 16.6863 15.3137 14 12 14Z" fill="currentColor"/>
          </svg>
          <span className="font-semibold text-lg text-white">{user.nome || user.email}</span>
        </div>
      </div>
    </div>
  );
}