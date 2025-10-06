import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useUser from "../../hooks/useUser";
import Footer from "../../components/footer";

interface User {
  id: string;
  nome?: string;
  email: string;
  avatarUrl?: string;
  role: "admin" | "user";
  descricao?: string;
  criadoEm?: string;
}

export default function ListUser() {
  const { user: currentUser, isAdmin } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect se não for admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-purple-700 flex items-center justify-center">
        <div className="text-white text-xl">Acesso negado. Apenas administradores podem ver esta página.</div>
      </div>
    );
  }

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:3000/users");
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const adminUsers = users.filter(u => u.role === "admin");
  const regularUsers = users.filter(u => u.role === "user");

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-700 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-700">
      {/* Header */}
      <div className="bg-purple-600 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
              <span className="text-purple-600 font-bold">🦉</span>
            </div>
            <span className="text-white font-bold text-xl">Readowl</span>
          </div>
          
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Pesquisar..."
                className="w-full px-4 py-2 rounded-full border-0 outline-none"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                🔍
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Botão Voltar ao perfil */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-center mb-6">
          <Link to="/profile">
            <button className="bg-white text-purple-700 px-4 py-2 rounded-full flex items-center gap-2 shadow hover:bg-gray-50 transition-colors">
              <span>←</span>
              <span>Voltar ao perfil</span>
            </button>
          </Link>
        </div>

        {/* Título */}
        <h1 className="text-white text-2xl font-bold text-center mb-8">Lista de Usuários</h1>

        {/* Grid de usuários */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Coluna Usuários */}
          <div>
            <h2 className="text-white text-xl font-semibold mb-4">Usuários</h2>
            <div className="space-y-3">
              {regularUsers.map(user => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          </div>

          {/* Coluna Administradores */}
          <div>
            <h2 className="text-white text-xl font-semibold mb-4">Administradores:</h2>
            <div className="space-y-3">
              {adminUsers.map(user => (
                <UserCard key={user.id} user={user} isAdmin />
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function UserCard({ user, isAdmin = false }: { user: User; isAdmin?: boolean }) {
  return (
    <div className="bg-purple-500 rounded-lg p-4 flex items-center gap-3 text-white">
      {/* Avatar */}
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-white flex items-center justify-center">
        {user.avatarUrl ? (
          <img 
            src={user.avatarUrl} 
            alt={user.nome || user.email}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-purple-600 text-xl">👤</span>
        )}
      </div>

      {/* Info do usuário */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm">👤</span>
          <span className="font-medium">{user.nome || user.email}</span>
          {isAdmin && (
            <span className="bg-purple-700 text-white text-xs px-2 py-1 rounded-full">
              🛡️ Administrador
            </span>
          )}
        </div>
      </div>
    </div>
  );
}