"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Save, ArrowLeft, Shield, Trash2 } from "lucide-react";
import Image from "next/image";
type AdminEditableUser = {
  id: string;
  name: string | null;
  email: string;
  description: string | null;
  image: string | null;
  role: "USER" | "ADMIN";
  createdAt: string | Date;
};

interface AdminEditProfileProps { user: AdminEditableUser }

export default function AdminEditProfile({ user }: AdminEditProfileProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: user.name || "", description: user.description || "", role: user.role || "USER" });
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null); setSuccess(null);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || "Erro ao atualizar usuário"); }
      setSuccess("Perfil do usuário atualizado com sucesso!");
      setTimeout(() => { router.push("/admin/users"); }, 2000);
    } catch (e) { const msg = e instanceof Error ? e.message : "Erro desconhecido"; setError(msg); } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${user.name || user.email}"? Esta ação não pode ser desfeita.`)) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || "Erro ao excluir usuário"); }
      router.push("/admin/users?message=user-deleted");
    } catch (e) { const msg = e instanceof Error ? e.message : "Erro desconhecido"; setError(msg); setLoading(false); }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-purple-700 px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-start justify-start mb-6">
          <button onClick={() => router.push("/admin/users")} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm">
            <ArrowLeft size={16} />
            <span>Voltar para lista</span>
          </button>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Editar Usuário: {user.name || user.email}</h1>
        </div>
        <div className="bg-gradient-to-b from-purple-600 to-purple-700 rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
              {user.image ? (
                <Image src={user.image} alt={user.name || user.email} width={80} height={80} className="w-full h-full object-cover" unoptimized={user.image.startsWith('data:')} />
              ) : (<User className="text-gray-400" size={32} />)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-semibold text-white">{user.name || "Sem nome"}</h2>
                {user.role === "ADMIN" && (<span className="bg-purple-800/90 text-white text-sm px-3 py-1 rounded-full flex items-center gap-2 font-medium"><Shield size={14} />Admin</span>)}
              </div>
              <p className="text-white/80 mb-1">{user.email}</p>
              <p className="text-sm text-white/60">Membro desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Nome</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all backdrop-blur-sm" placeholder="Nome do usuário" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Descrição</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all resize-none backdrop-blur-sm" placeholder="Descrição do usuário" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Tipo de Usuário</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "USER" | "ADMIN" })} className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all backdrop-blur-sm">
                <option value="USER" className="text-gray-800">Usuário</option>
                <option value="ADMIN" className="text-gray-800">Administrador</option>
              </select>
            </div>
            {error && (<div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 backdrop-blur-sm"><p className="text-red-200 text-sm">{error}</p></div>)}
            {success && (<div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4 backdrop-blur-sm"><p className="text-green-200 text-sm">{success}</p></div>)}
            <div className="flex items-center justify-between pt-6 gap-4">
              <button type="button" onClick={handleDelete} disabled={loading} className="flex items-center gap-2 px-6 py-3 bg-red-600/80 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 transition-all duration-200 font-medium backdrop-blur-sm"><Trash2 size={18} /><span>Excluir Usuário</span></button>
              <button type="submit" disabled={loading} className="flex items-center gap-2 px-8 py-3 bg-green-600/80 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 transition-all duration-200 font-medium backdrop-blur-sm"><Save size={18} /><span>{loading ? "Salvando..." : "Salvar Alterações"}</span></button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
