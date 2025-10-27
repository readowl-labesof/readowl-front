"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { SafeUser } from "@/types/user";
import ProfileImageUpload from "./ProfileImageUpload";

interface EditProfileFormProps {
  onClose?: () => void; 
  onChangePassword?: () => void;
  currentUser?: SafeUser | null; // Receber dados atualizados do servidor
}

export default function EditProfileForm({ onClose, onChangePassword, currentUser }: EditProfileFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    description: "",
    image: "",
    currentPassword: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Usar dados do servidor se disponíveis, senão usar da sessão
    const userData = currentUser || session?.user;
    if (!userData) return;
    
    setForm({
      name: userData.name || "",
      email: userData.email || "",
      description: (userData as SafeUser).description || "",
      image: userData.image || "",
      currentPassword: "" // Sempre vazio por segurança
    });
  }, [currentUser, session]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  // async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
  //   const file = e.target.files?.[0];
  //   if (!file) return;
  //   if (!file.type.startsWith('image/')) {
  //     setError("Selecione uma imagem válida");
  //     return;
  //   }
  //   if (file.size > 1 * 1024 * 1024) {
  //     setError("Imagem muito grande (máximo 1MB)");
  //     return;
  //   }
  //   setLoading(true);
  //   try {
  //     const imageUrl = await uploadProfileImage(file);
  //     if (imageUrl) {
  //       setForm((s) => ({ ...s, image: imageUrl }));
  //       setSuccess("Imagem atualizada!");
  //     }
  //   } catch (err: any) {
  //     setError(err?.toString() || "Erro ao atualizar imagem");
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  function validate() {
    if (!form.name.trim()) return "Nome obrigatório.";
    if (!form.email.trim()) return "Email obrigatório.";
    if (!form.currentPassword.trim()) return "Senha atual obrigatória para confirmar as alterações.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const v = validate();
    if (v) return setError(v);
    
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        description: form.description,
        image: form.image,
        currentPassword: form.currentPassword
      };

      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao atualizar usuário");
      }

      setSuccess("Dados atualizados com sucesso!");
      router.refresh(); // Atualiza a página com os dados mais recentes
      setTimeout(() => { 
        onClose?.(); // O componente pai irá chamar router.refresh()
      }, 1000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!session?.user?.id) return;
    if (!window.confirm("Tem certeza que deseja deletar sua conta?")) return;
    
    try {
      const res = await fetch("/api/user/profile", { 
        method: "DELETE" 
      });
      
      if (res.ok) {
        setSuccess("Conta deletada.");
        setTimeout(() => { 
          router.push("/landing");
        }, 800);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao deletar conta";
      setError(errorMessage);
    }
  }

  function handleChangePassword() {
    onChangePassword?.();
  }

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
          <ProfileImageUpload />
            {/* <Image 
              src={form.image || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
              alt="avatar" 
              width={128}
              height={128}
              style={{ 
                borderRadius: '16px', 
                background: '#fff', 
                border: '4px solid #fff', 
                marginBottom: 8,
                objectFit: 'cover',
                aspectRatio: '1/1'
              }}
              unoptimized={form.image?.startsWith('data:')}
            />
            <label style={{ fontSize: 12, color: '#7c5cbf', background: '#fff', borderRadius: 8, padding: '4px 12px', marginTop: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, boxShadow: '0 1px 4px #0001' }}>
              <span role="img" aria-label="foto">📷</span> Inserir nova foto
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
            </label> */}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span role="img" aria-label="user">👤</span>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Nome" style={{ flex: 1, borderRadius: 12, border: 'none', padding: '8px 16px', background: '#ede7f6', color: '#7c5cbf', fontWeight: 500, fontSize: 16 }} />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span role="img" aria-label="email">📧</span>
              <input name="email" value={form.email} onChange={handleChange} placeholder="Email" style={{ flex: 1, borderRadius: 12, border: 'none', padding: '8px 16px', background: '#ede7f6', color: '#7c5cbf', fontWeight: 500, fontSize: 16 }} />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span role="img" aria-label="senha">🔒</span>
              <input 
                name="currentPassword" 
                type="password" 
                value={form.currentPassword} 
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
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Descrição..." style={{ flex: 1, borderRadius: 12, border: 'none', padding: '8px 16px', background: '#ede7f6', color: '#7c5cbf', fontWeight: 500, fontSize: 16, resize: 'none' }} />
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

async function uploadProfileImage(file: File): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const response = await fetch("/api/user/profile-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageData: base64 }),
        });
        const data = await response.json();
        if (response.ok && data.imageUrl) {
          resolve(data.imageUrl); // URL da imagem salva no backend
        } else {
          reject(data.error || "Erro ao salvar imagem");
        }
      } catch (err) {
        reject("Erro ao enviar imagem");
      }
    };
    reader.onerror = () => reject("Erro ao ler arquivo");
    reader.readAsDataURL(file);
  });
}