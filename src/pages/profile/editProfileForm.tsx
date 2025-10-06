import React, { useEffect, useState } from "react";
import useUser from "../../hooks/useUser";

export default function EditProfileForm({ onClose, onChangePassword }: { onClose?: () => void; onChangePassword?: () => void }) {
  const { user, saveUser } = useUser();
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    descricao: "",
    avatarUrl: ""
  });
  const [criadoEm, setCriadoEm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      nome: user.nome || user.username || "",
      email: user.email || "",
      senha: "",
      descricao: user.descricao || user.bio || "",
      avatarUrl: user.avatarUrl || user.foto || ""
    });
    setCriadoEm(user.criadoEm || user.createdAt || "");
  }, [user]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    if (name === "criadoEm") {
      setCriadoEm(value);
    } else {
      setForm((s) => ({ ...s, [name]: value }));
    }
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      // Apenas preview local, não faz upload real
      const reader = new FileReader();
      reader.onload = () => {
        setForm((s) => ({ ...s, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  }

  function validate() {
    if (!form.nome.trim()) return "Nome obrigatório.";
    if (!form.email.trim()) return "Email obrigatório.";
    if (!form.senha.trim()) return "Senha obrigatória para confirmar as alterações.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const v = validate();
    if (v) return setError(v);
    if (!user) return setError("Usuário não encontrado.");
    
    // Verificar se a senha informada está correta
    if (form.senha !== user.senha) {
      return setError("Senha atual incorreta. Digite sua senha atual para confirmar as alterações.");
    }
    
    setLoading(true);
    try {
      const payload = {
        nome: form.nome,
        email: form.email,
        descricao: form.descricao,
        avatarUrl: form.avatarUrl,
        criadoEm,
        senha: form.senha // Sempre incluir a senha
      };
      const res = await fetch(`http://localhost:3000/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Erro ao atualizar usuário");
      const updated = await res.json();
      console.log('EditProfileForm - dados atualizados do servidor:', updated);
      
      // Garantir que os dados estão completos
      const completeUser = {
        ...user,
        ...updated,
        // Garantir que a descrição atualizada seja preservada
        descricao: payload.descricao
      };
      
      console.log('EditProfileForm - dados completos para salvar:', completeUser);
      saveUser(completeUser);
      setSuccess("Dados atualizados com sucesso!");
      
      // Aguardar um pouco para o usuário ver a mensagem de sucesso, depois fechar
      setTimeout(() => { 
        onClose?.(); 
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  function handleDelete() {
    if (!user) return;
    if (!window.confirm("Tem certeza que deseja deletar sua conta?")) return;
    fetch(`http://localhost:3000/users/${user.id}`, { method: "DELETE" })
      .then(() => {
        saveUser(null);
        setSuccess("Conta deletada.");
        setTimeout(() => { onClose?.(); }, 800);
      });
  }

  function handleChangePassword() {
    onChangePassword?.();
  }

  // Remover a lógica do showPasswordScreen já que agora é gerenciado no profile.tsx

  return (
    <>
      <form onSubmit={handleSubmit} style={{
        background: '#7c5cbf',
        borderRadius: '20px',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 2px 8px #0002',
        color: '#fff',
        maxWidth: '500px',
        margin: '0 auto',
        position: 'relative',
      }}>
        {/* Botão X para fechar */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '18px',
            cursor: 'pointer',
            transition: 'background 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
        >
          ✕
        </button>
        
        <h3 style={{ fontSize: '2rem', fontWeight: 600, textAlign: 'center', marginBottom: '8px', color: '#fff' }}>Editar conta</h3>
        {error && <div style={{ color: '#e53935', marginBottom: 8, textAlign: 'center' }}>{error}</div>}
        {success && <div style={{ color: '#43a047', marginBottom: 8, textAlign: 'center' }}>{success}</div>}

        <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src={form.avatarUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt="avatar" style={{ width: 110, height: 110, borderRadius: '16px', background: '#fff', border: '4px solid #fff', marginBottom: 8 }} />
            <label style={{ fontSize: 12, color: '#7c5cbf', background: '#fff', borderRadius: 8, padding: '4px 12px', marginTop: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, boxShadow: '0 1px 4px #0001' }}>
              <span role="img" aria-label="foto">📷</span> Inserir nova foto
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
            </label>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span role="img" aria-label="user">👤</span>
              <input name="nome" value={form.nome} onChange={handleChange} placeholder="Nome" style={{ flex: 1, borderRadius: 12, border: 'none', padding: '8px 16px', background: '#ede7f6', color: '#7c5cbf', fontWeight: 500, fontSize: 16 }} />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span role="img" aria-label="email">📧</span>
              <input name="email" value={form.email} onChange={handleChange} placeholder="Email" style={{ flex: 1, borderRadius: 12, border: 'none', padding: '8px 16px', background: '#ede7f6', color: '#7c5cbf', fontWeight: 500, fontSize: 16 }} />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span role="img" aria-label="data">📅</span>
              <input
                name="criadoEm"
                type="date"
                value={criadoEm}
                onChange={handleChange}
                style={{
                  flex: 1,
                  borderRadius: 12,
                  border: 'none',
                  padding: '8px 16px',
                  background: '#ede7f6',
                  color: '#7c5cbf',
                  fontWeight: 500,
                  fontSize: 16,
                }}
              />
              {!criadoEm && <span style={{ color: '#fff', fontSize: 16, marginLeft: 8 }}>Data não disponível</span>}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span role="img" aria-label="senha">🔒</span>
              <input 
                name="senha" 
                type="password" 
                value={form.senha} 
                onChange={handleChange} 
                placeholder="Digite sua senha atual para confirmar" 
                required
                style={{ 
                  flex: 1, 
                  borderRadius: 12, 
                  border: 'none', 
                  padding: '8px 16px', 
                  background: '#ede7f6', 
                  color: '#7c5cbf', 
                  fontWeight: 500, 
                  fontSize: 16 
                }} 
              />
            </label>
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <textarea name="descricao" value={form.descricao} onChange={handleChange} rows={3} placeholder="Descrição..." style={{ flex: 1, borderRadius: 12, border: 'none', padding: '8px 16px', background: '#ede7f6', color: '#7c5cbf', fontWeight: 500, fontSize: 16, resize: 'none' }} />
        </label>

        {/* Botões principais: Salvar e Cancelar */}
        <div style={{ display: 'flex', gap: 16, marginTop: 16, justifyContent: 'center' }}>
          <button 
            type="submit" 
            disabled={loading}
            style={{
              background: loading ? '#b39ddb' : '#51cf66',
              color: '#fff',
              borderRadius: 12,
              padding: '12px 32px',
              fontWeight: 600,
              fontSize: 16,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              display: 'flex', 
              alignItems: 'center', 
              gap: 8,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? '⏳ Salvando...' : '✓ Salvar'}
          </button>
          
          <button 
            type="button" 
            onClick={onClose}
            disabled={loading}
            style={{
              background: '#6c757d',
              color: '#fff',
              borderRadius: 12,
              padding: '12px 32px',
              fontWeight: 600,
              fontSize: 16,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              display: 'flex', 
              alignItems: 'center', 
              gap: 8,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            ✕ Cancelar
          </button>
        </div>

        {/* Botões secundários: Alterar senha e Deletar */}
        <div style={{ display: 'flex', gap: 16, marginTop: 8, justifyContent: 'space-between' }}>
          <button type="button" onClick={handleChangePassword} style={{
            background: '#ffe600',
            color: '#222',
            borderRadius: 8,
            padding: '8px 24px',
            fontWeight: 700,
            fontSize: 16,
            border: 'none',
            boxShadow: '0 1px 4px #0002',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            🟡 Alterar senha
          </button>
          <button type="button" onClick={handleDelete} style={{
            background: '#e53935',
            color: '#fff',
            borderRadius: 8,
            padding: '8px 24px',
            fontWeight: 700,
            fontSize: 16,
            border: 'none',
            boxShadow: '0 1px 4px #0002',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            🗑 Deletar conta
          </button>
        </div>
      </form>
    </>
  );
}