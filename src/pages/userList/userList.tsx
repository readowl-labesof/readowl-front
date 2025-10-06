import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useUser from "../../hooks/useUser";
import Footer from "../../components/footer";
import NavbarUserList from "./navbarUserList";
import UserCard from "./userCard";
import AdminCard from "./adminCard";

interface User {
  id: string;
  nome?: string;
  email: string;
  avatarUrl?: string;
  role: "admin" | "user";
  descricao?: string;
  criadoEm?: string;
}

export default function UserList() {
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
        console.log('UserList - Iniciando fetch dos usuários...');
        const response = await fetch("http://localhost:3000/users");
        console.log('UserList - Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('UserList - Dados recebidos:', data);
        setUsers(data);
      } catch (error) {
        console.error("UserList - Erro ao buscar usuários:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const adminUsers = users.filter(u => u.role === "admin");
  const regularUsers = users.filter(u => u.role === "user");

  console.log('UserList - Total de usuários:', users.length);
  console.log('UserList - Usuários regulares:', regularUsers.length);
  console.log('UserList - Administradores:', adminUsers.length);
  console.log('UserList - Lista de usuários:', users);

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-700 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <NavbarUserList />
      <main className="flex-1 bg-white">
        {/* Botão Voltar ao perfil */}
        <div className="flex justify-center pt-6 pb-4">
          <Link to="/profile">
            <button className="bg-purple-100 text-purple-700 px-6 py-2 rounded-full flex items-center gap-2 border border-purple-300 hover:bg-purple-50 transition-colors">
              <span>←</span>
              <span>Voltar ao perfil</span>
            </button>
          </Link>
        </div>

        {/* Título */}
        <h1 className="text-gray-800 text-3xl font-bold text-center mb-8">Lista de Usuários</h1>

        {/* Grid de usuários */}
        <div className="grid md:grid-cols-2 gap-8 px-8 pb-8">
          {/* Coluna Usuários */}
          <div>
            <h2 className="text-gray-800 text-xl font-bold mb-6">Usuários</h2>
            <div className="space-y-3">
              {regularUsers.map(user => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          </div>

          {/* Coluna Administradores */}
          <div>
            <h2 className="text-gray-800 text-xl font-bold mb-6">Administradores:</h2>
            <div className="space-y-3">
              {adminUsers.map(user => (
                <AdminCard key={user.id} user={user} />
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}