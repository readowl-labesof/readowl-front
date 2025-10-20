"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import PasswordStrengthBar from "@/components/animation/PasswordStrengthBar";

interface ChangePasswordProps {
  onBack: () => void;
}

export default function ChangePassword({ onBack }: ChangePasswordProps) {
  const { data: session } = useSession();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    if (error) setError(null);
  }

  function validatePasswordStrength(password: string) {
    const checks = {
      minLength: password.length >= 6,
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSymbol: /[^A-Za-z0-9]/.test(password),
      isLong: password.length >= 10,
    };

    let score = 0;
    if (checks.minLength) score += 1;
    if (checks.hasUpper) score += 1;
    if (checks.hasNumber) score += 1;
    if (checks.hasSymbol) score += 1;
    if (checks.isLong) score += 1;

    return { score, checks };
  }

  function validate() {
    if (!form.currentPassword.trim()) return "Senha atual obrigatória.";
    if (!form.newPassword.trim()) return "Nova senha obrigatória.";
    
    const { score, checks } = validatePasswordStrength(form.newPassword);
    
    if (!checks.minLength) return "Nova senha deve ter pelo menos 6 caracteres.";
    if (!checks.hasUpper) return "Nova senha deve conter pelo menos uma letra maiúscula.";
    if (!checks.hasNumber) return "Nova senha deve conter pelo menos um número.";
    if (!checks.hasSymbol) return "Nova senha deve conter pelo menos um símbolo (!@#$%^&*).";
    
    if (score < 3) return "Nova senha muito fraca. Use uma combinação mais forte de caracteres.";
    
    if (form.newPassword !== form.confirmNewPassword) return "Senhas não conferem.";
    
    if (form.currentPassword === form.newPassword) return "A nova senha deve ser diferente da senha atual.";
    
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const v = validate();
    if (v) return setError(v);
    if (!session?.user) return setError("Usuário não encontrado.");
    
    setLoading(true);
    try {
      const payload = {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      };
      
      const res = await fetch("/api/user/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Erro ao alterar senha");
      }
      
      setSuccess("Senha alterada com sucesso!");
      
      setTimeout(() => {
        onBack();
      }, 2000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const { score } = validatePasswordStrength(form.newPassword);
  const isPasswordValid = score >= 3 && form.newPassword.length >= 6;

  return (
    <div style={{
      background: '#8d6ccf',
      borderRadius: '16px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      color: '#fff',
      width: '100%',
      maxWidth: '420px',
      position: 'relative'
    }}>
      {/* Header */}
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

      {/* Messages */}
      {error && (
        <div style={{ 
          color: '#ff6b6b', 
          marginBottom: 8, 
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
          marginBottom: 8, 
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

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Campo Senha Atual */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '18px', width: '24px' }}>🔐</span>
          <div style={{ flex: 1, position: 'relative' }}>
            <input 
              name="currentPassword" 
              type={showCurrentPassword ? "text" : "password"}
              value={form.currentPassword} 
              onChange={handleChange} 
              placeholder="Senha atual..." 
              disabled={loading}
              style={{ 
                width: '100%',
                borderRadius: 8, 
                border: 'none', 
                padding: '8px 40px 8px 12px', 
                background: '#ede7f6', 
                color: '#7c5cbf', 
                fontWeight: 500, 
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box'
              }} 
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#7c5cbf',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {showCurrentPassword ? (
                <Eye size={16} />
              ) : (
                <EyeOff size={16} />
              )}
            </button>
          </div>
        </div>

        {/* Campo Nova Senha */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '18px', width: '24px' }}>🔑</span>
          <div style={{ flex: 1, position: 'relative' }}>
            <input 
              name="newPassword" 
              type={showNewPassword ? "text" : "password"}
              value={form.newPassword} 
              onChange={handleChange} 
              placeholder="Nova senha (forte e segura)..." 
              disabled={loading}
              style={{ 
                width: '100%',
                borderRadius: 8, 
                border: 'none', 
                padding: '8px 40px 8px 12px', 
                background: '#ede7f6', 
                color: '#7c5cbf', 
                fontWeight: 500, 
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box'
              }} 
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#7c5cbf',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {showNewPassword ? (
                <Eye size={16} />
              ) : (
                <EyeOff size={16} />
              )}
            </button>
          </div>
        </div>

        {/* Barra de Força da Senha */}
        {form.newPassword && (
          <div style={{ marginLeft: '32px' }}>
            <PasswordStrengthBar 
              password={form.newPassword} 
              tipTextColor="text-white"
              showPercent={true}
            />
          </div>
        )}

        {/* Requisitos de Senha */}
        {form.newPassword && (
          <div style={{ 
            fontSize: '12px', 
            color: '#e1bee7', 
            background: 'rgba(255,255,255,0.1)',
            padding: '8px',
            borderRadius: '6px',
            marginLeft: '32px'
          }}>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>Requisitos da senha:</div>
            {(() => {
              const { checks } = validatePasswordStrength(form.newPassword);
              return (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '11px' }}>
                  <span style={{ color: checks.minLength ? '#51cf66' : '#ff9f9f' }}>
                    {checks.minLength ? '✓' : '✗'} Mín. 6 caracteres
                  </span>
                  <span style={{ color: checks.hasUpper ? '#51cf66' : '#ff9f9f' }}>
                    {checks.hasUpper ? '✓' : '✗'} Letra maiúscula
                  </span>
                  <span style={{ color: checks.hasNumber ? '#51cf66' : '#ff9f9f' }}>
                    {checks.hasNumber ? '✓' : '✗'} Número
                  </span>
                  <span style={{ color: checks.hasSymbol ? '#51cf66' : '#ff9f9f' }}>
                    {checks.hasSymbol ? '✓' : '✗'} Símbolo (!@#$%)
                  </span>
                </div>
              );
            })()}
          </div>
        )}

        {/* Campo Confirmar Senha */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '18px', width: '24px' }}>✔️</span>
          <div style={{ flex: 1, position: 'relative' }}>
            <input 
              name="confirmNewPassword" 
              type={showConfirmPassword ? "text" : "password"}
              value={form.confirmNewPassword} 
              onChange={handleChange} 
              placeholder="Confirmar nova senha..." 
              disabled={loading}
              style={{ 
                width: '100%',
                borderRadius: 8, 
                border: 'none', 
                padding: '8px 40px 8px 12px', 
                background: '#ede7f6', 
                color: '#7c5cbf', 
                fontWeight: 500, 
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
                borderLeft: form.confirmNewPassword && form.newPassword !== form.confirmNewPassword ? '3px solid #ff6b6b' : 'none'
              }} 
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#7c5cbf',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {showConfirmPassword ? (
                <Eye size={16} />
              ) : (
                <EyeOff size={16} />
              )}
            </button>
          </div>
        </div>

        {/* Indicador de confirmação */}
        {form.confirmNewPassword && (
          <div style={{ 
            fontSize: '12px', 
            color: form.newPassword === form.confirmNewPassword ? '#51cf66' : '#ff9f9f',
            marginLeft: '32px'
          }}>
            {form.newPassword === form.confirmNewPassword ? '✓ Senhas coincidem' : '✗ Senhas não coincidem'}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: 16, justifyContent: 'center' }}>
          <button 
            type="submit" 
            disabled={loading || !isPasswordValid || form.newPassword !== form.confirmNewPassword}
            style={{
              background: loading || !isPasswordValid || form.newPassword !== form.confirmNewPassword ? '#b39ddb' : '#7c5cbf',
              color: '#fff',
              borderRadius: 12,
              padding: '10px 24px',
              fontWeight: 600,
              fontSize: 14,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              opacity: loading || !isPasswordValid || form.newPassword !== form.confirmNewPassword ? 0.6 : 1,
              display: 'flex', 
              alignItems: 'center', 
              gap: 6,
              cursor: loading || !isPasswordValid || form.newPassword !== form.confirmNewPassword ? 'not-allowed' : 'pointer',
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
              padding: '10px 24px',
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
    </div>
  );
}