import { useCallback, useEffect, useState } from "react";

type Role = 'admin' | 'user' | 'editor' | string
export interface LocalUser {
  id: string
  name?: string
  email?: string
  role?: Role
  token?: string
  [key: string]: unknown
}

const LOCAL_KEY = "readowl-user";

export function parseLocalUser(): LocalUser | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as LocalUser) : null;
  } catch {
    return null;
  }
}

export default function useUser() {
  const [user, setUser] = useState<LocalUser | null>(() => parseLocalUser());

  const saveUser = useCallback((next: LocalUser | null) => {
    console.log('useUser - saveUser chamado com:', next);
    if (!next) {
      localStorage.removeItem(LOCAL_KEY);
      setUser(null);
      return;
    }
    localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
    
    // Criar uma nova referência para garantir re-render
    const newUser: LocalUser = { ...next };
    setUser(newUser);
    
    console.log('useUser - usuário salvo e estado atualizado');
    
    // Disparar evento customizado para notificar mudanças
    window.dispatchEvent(new CustomEvent('userUpdated', { detail: newUser }));
  }, []);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === LOCAL_KEY) setUser(parseLocalUser());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Verificar se o usuário é admin
  const isAdmin = user?.role === 'admin';

  return { user, saveUser, isLogged: !!user, isAdmin };
}