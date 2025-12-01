"use client";
import Link from "next/link";
import { User as UserIcon, Key, Eye, EyeOff } from "lucide-react";
import InputWithIcon from "@/components/ui/input/InputWithIcon";
import Button from "@/components/ui/button/Button";
import GoogleButton from "@/components/ui/button/GoogleButton";
import BlockedAccountModal from "@/components/ui/modal/BlockedAccountModal";

import { useState } from "react";
import MagicNotification, { MagicNotificationProps } from "@/components/ui/modal/MagicNotification";
import { useBlockedLogin } from "@/lib/hooks/useBlockedLogin";
import { signIn, signOut } from "next-auth/react";

function Login() {
  // State for form fields
  const [form, setForm] = useState({ email: "", password: "" });
  // State to indicate loading during authentication
  const [loading, setLoading] = useState(false);
  // State for error messages for each field
  const [error, setError] = useState<{ email?: string; password?: string } | null>(null);
  // State for toast notifications
  const [toasts, setToasts] = useState<MagicNotificationProps[]>([]);
  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);
  // State to remember login
  const [remember, setRemember] = useState(false);

  // Hook para lidar com contas bloqueadas
  const { handleLogin, isBlocked, isLoading, setIsBlocked } = useBlockedLogin();

  // Handles input changes and resets error state
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  // Handles form submission and authentication logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    // Persist the remember preference in a cookie for server-side checks (Lax for CSRF safety)
    document.cookie = `rw_rem=${remember ? "yes" : "no"}; Path=/; SameSite=Lax; ${remember ? "Max-Age=2592000;" : ""}`;

    // Usar o hook personalizado para lidar com contas bloqueadas
    const res = await handleLogin(form.email, form.password, remember);
    
    if (res?.error === 'BLOCKED_ACCOUNT') {
      // Conta bloqueada - o modal será mostrado automaticamente
      setLoading(false);
      return;
    } else if (res?.error) {
      // Show error if authentication fails
      setError({ email: "Usuário ou senha inválidos.", password: "Usuário ou senha inválidos." });
      pushToast({ message: 'Credenciais inválidas.', icon: '🔐', bgClass: 'bg-red-600/80' });
    } else {
      // Show success and redirect after short delay
      pushToast({ message: 'Login realizado!', icon: '✅', bgClass: 'bg-green-600/80' });
      setTimeout(() => { window.location.href = "/home"; }, 400); // Allows feedback to be shown
    }
    setLoading(false);
  };

  // Removes a toast notification by id
  const removeToast = (id: string) => setToasts(t => t.filter(n => n.id !== id));
  // Adds a new toast notification
  const pushToast = (partial: Omit<MagicNotificationProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, duration: 5000, ...partial, onClose: removeToast }]);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
  <div className="bg-readowl-purple-medium shadow-lg p-8 w-full max-w-md">
        {/* Logo and title */}
        <div className="flex flex-col items-center mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.png" alt="Readowl Logo" width={64} height={64} />
          <span className="text-2xl font-bold text-white mt-2">Readowl</span>
        </div>
        {/* Google authentication button */}
        <GoogleButton
          onClick={async () => {
            document.cookie = `rw_rem=${remember ? "yes" : "no"}; Path=/; SameSite=Lax; ${remember ? "Max-Age=2592000;" : ""}`;
            // Ensure any existing NextAuth session is cleared before starting a new OAuth flow
            // This avoids reusing the previous authenticated session in the app
            try { await signOut({ redirect: false }); } catch {}
            // Force Google account picker; provider-level is set too, but we pass it explicitly here
            await signIn("google", { callbackUrl: "/home", prompt: "select_account" });
          }}
        />
        <hr />
        {/* Login form */}
        <form onSubmit={handleSubmit} className="mt-4">
          {/* Email input */}
          <InputWithIcon
            placeholder="Email"
            icon={<UserIcon className="opacity-50 w-6 h-6" />}
            name="email"
            autoComplete="username"
            value={form.email}
            onChange={handleChange}
            error={error?.email}
            hideErrorText
          />
          {/* Password input with show/hide toggle */}
          <InputWithIcon
            placeholder="Senha"
            icon={<Key className="opacity-50 w-6 h-6" />}
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            error={error?.password}
            hideErrorText
            rightIcon={
              <span onClick={() => setShowPassword(v => !v)}>
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </span>
            }
          />
          {/* Toast notifications container */}
          <div className="fixed top-4 right-4 flex flex-col gap-3 z-50 w-full max-w-sm">
            {toasts.map(t => (
              <MagicNotification key={t.id} {...t} onClose={removeToast} />
            ))}
          </div>
          {/* Remember me and forgot password */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="mr-2 accent-readowl-purple"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <label htmlFor="remember" className="text-white text-sm">Lembrar de mim</label>
            </div>
            <Link href="/forgot-password" className="text-readowl-purple-extralight underline hover:text-white text-sm">Esqueci minha senha</Link>
          </div>
          {/* Submit button */}
          <div className="flex justify-center">
            <Button type="submit" variant="primary" className="md:w-1/2 text-center" disabled={loading || isLoading}>
              {loading || isLoading ? "Logando..." : "Logar"}
            </Button>
          </div>
        </form>
        {/* Registration link */}
        <div className="text-center mt-1">
          <span className="text-white text-sm">Quero criar uma conta. </span>
          <Link href="/register" className="text-readowl-purple-extralight underline hover:text-white text-sm">Cadastrar</Link>
        </div>
        {/* Back to landing page link */}
        <div className="text-center mt-1">
          <Link href="/" className="text-xs text-readowl-purple-extralight underline hover:text-white">← Voltar para a página inicial</Link>
        </div>
      </div>
      
      {/* Modal para conta bloqueada */}
      <BlockedAccountModal 
        isOpen={isBlocked} 
        onClose={() => setIsBlocked(false)} 
      />
    </div>
  );
}

export default Login;