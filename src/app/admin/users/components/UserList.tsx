"use client";
import { useRouter } from "next/navigation";
import UserCard from "./UserCard";
import AdminCard from "./AdminCard";
import type { SafeUser } from "@/types/user";

interface UserListProps { users: SafeUser[] }

export default function UserList({ users }: UserListProps) {
  const router = useRouter();
  const adminUsers = users.filter((u) => u.role === "ADMIN");
  const regularUsers = users.filter((u) => u.role === "USER");
  return (
    <div className="flex-1">
      <div className="flex justify-between items-center pt-6 pb-4 px-8">
        <button onClick={() => router.push("/user")} className="bg-white/20 text-white px-6 py-2 rounded-full flex items-center gap-2 border border-white/30 hover:bg-white/30 transition-colors backdrop-blur-sm">
          <span>←</span><span>Voltar ao perfil</span>
        </button>
        <h1 className="text-white text-3xl font-bold">Gerenciar Usuários</h1>
        <div className="w-32" />
      </div>
      <div className="grid md:grid-cols-2 gap-8 px-8 pb-8">
        <div>
          <h2 className="text-white text-xl font-bold mb-6">Usuários ({regularUsers.length})</h2>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto">
            {regularUsers.length > 0 ? regularUsers.map((u) => (<UserCard key={u.id} user={u} />)) : (<p className="text-white/70 text-center py-8">Nenhum usuário encontrado</p>)}
          </div>
        </div>
        <div>
          <h2 className="text-white text-xl font-bold mb-6">Administradores ({adminUsers.length})</h2>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto">
            {adminUsers.length > 0 ? adminUsers.map((u) => (<AdminCard key={u.id} user={u} />)) : (<p className="text-white/70 text-center py-8">Nenhum administrador encontrado</p>)}
          </div>
        </div>
      </div>
    </div>
  );
}
