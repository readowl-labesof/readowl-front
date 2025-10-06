import { useCallback, useEffect, useState } from "react";

const LOCAL_KEY = "readowl-user";

export function parseLocalUser() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function useUser() {
  const [user, setUser] = useState(() => parseLocalUser());

  const saveUser = useCallback((next: any) => {
    console.log('useUser - saveUser chamado com:', next);
    if (!next) {
      localStorage.removeItem(LOCAL_KEY);
      setUser(null);
      return;
    }
    localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
    
    // Criar uma nova referência para garantir re-render
    const newUser = { ...next };
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