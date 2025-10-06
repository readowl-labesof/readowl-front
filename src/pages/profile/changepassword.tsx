import React, { useState } from "react";
import useUser from "../../hooks/useUser";

interface ChangePasswordProps {
  onBack: () => void;
}

export default function ChangePassword({ onBack }: ChangePasswordProps) {
  const { user, saveUser } = useUser();
  const [form, setForm] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmarNovaSenha: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function validate() {
    if (!form.senhaAtual.trim()) return "Senha atual obrigatória.";
    if (!form.novaSenha.trim()) return "Nova senha obrigatória.";
    if (form.novaSenha !== form.confirmarNovaSenha) return "Senhas não conferem.";
    if (form.novaSenha.length < 6) return "Nova senha deve ter pelo menos 6 caracteres.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const v = validate();
    if (v) return setError(v);
    if (!user) return setError("Usuário não encontrado.");
    
    // Verificar se senha atual está correta
    if (user.senha !== form.senhaAtual) {
      return setError("Senha atual incorreta.");
    }

    setLoading(true);
    try {
      const payload = {
        ...user,
        senha: form.novaSenha
      };
      
      const res = await fetch(`http://localhost:3000/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) throw new Error("Erro ao alterar senha");
      
      const updated = await res.json();
      saveUser(updated);
      setSuccess("Senha alterada com sucesso!");
      
      setTimeout(() => {
        onBack(); // Volta para a tela de editar conta
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{
      background: '#8d6ccf',
      borderRadius: '16px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      color: '#fff',
      width: '100%',
      maxWidth: '380px',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        <button 
          type="button" 
          onClick={onBack}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: '20px',
            cursor: 'pointer',
            marginRight: '12px',
            padding: '4px'
          }}
        >
          ← 
        </button>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 600, 
          textAlign: 'center', 
          color: '#fff',
          flex: 1,
          margin: 0
        }}>
          Alterar senha de usuário
        </h2>
      </div>

      {error && (
        <div style={{ 
          color: '#ff6b6b', 
          marginBottom: 12, 
          textAlign: 'center',
          background: 'rgba(255, 107, 107, 0.1)',
          padding: '8px',
          borderRadius: '6px',
          border: '1px solid rgba(255, 107, 107, 0.3)',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{ 
          color: '#51cf66', 
          marginBottom: 12, 
          textAlign: 'center',
          background: 'rgba(81, 207, 102, 0.1)',
          padding: '8px',
          borderRadius: '6px',
          border: '1px solid rgba(81, 207, 102, 0.3)',
          fontSize: '14px'
        }}>
          {success}
        </div>
      )}

      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span role="img" aria-label="user" style={{ fontSize: '18px' }}>👤</span>
        <input 
          name="senhaAtual" 
          type="password" 
          value={form.senhaAtual} 
          onChange={handleChange} 
          placeholder="Senha atual..." 
          disabled={loading}
          style={{ 
            flex: 1, 
            borderRadius: 8, 
            border: 'none', 
            padding: '8px 12px', 
            background: '#ede7f6', 
            color: '#7c5cbf', 
            fontWeight: 500, 
            fontSize: 14,
            outline: 'none'
          }} 
        />
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span role="img" aria-label="nova" style={{ fontSize: '18px' }}>🔑</span>
        <input 
          name="novaSenha" 
          type="password" 
          value={form.novaSenha} 
          onChange={handleChange} 
          placeholder="Nova senha..." 
          disabled={loading}
          style={{ 
            flex: 1, 
            borderRadius: 8, 
            border: 'none', 
            padding: '8px 12px', 
            background: '#ede7f6', 
            color: '#7c5cbf', 
            fontWeight: 500, 
            fontSize: 14,
            outline: 'none'
          }} 
        />
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span role="img" aria-label="confirmar" style={{ fontSize: '18px' }}>✔️</span>
        <input 
          name="confirmarNovaSenha" 
          type="password" 
          value={form.confirmarNovaSenha} 
          onChange={handleChange} 
          placeholder="Confirmar nova senha..." 
          disabled={loading}
          style={{ 
            flex: 1, 
            borderRadius: 8, 
            border: 'none', 
            padding: '8px 12px', 
            background: '#ede7f6', 
            color: '#7c5cbf', 
            fontWeight: 500, 
            fontSize: 14,
            outline: 'none'
          }} 
        />
      </label>

      <div style={{ display: 'flex', gap: 12, marginTop: 12, justifyContent: 'center' }}>
        <button 
          type="submit" 
          disabled={loading}
          style={{
            background: loading ? '#b39ddb' : '#b39ddb',
            color: '#fff',
            borderRadius: 12,
            padding: '8px 24px',
            fontWeight: 600,
            fontSize: 14,
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            opacity: loading ? 0.6 : 1,
            display: 'flex', 
            alignItems: 'center', 
            gap: 6,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {loading ? '⏳ Salvando...' : '✔ Salvar'}
        </button>
        
        <button 
          type="button" 
          onClick={onBack}
          disabled={loading}
          style={{
            background: '#ede7f6',
            color: '#7c5cbf',
            borderRadius: 12,
            padding: '8px 24px',
            fontWeight: 600,
            fontSize: 14,
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex', 
            alignItems: 'center', 
            gap: 6,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          ✖ Cancelar
        </button>
      </div>
    </form>
  );
}