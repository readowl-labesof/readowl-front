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
    console.log('saveUser chamado com:', next);
    if (!next) {
      localStorage.removeItem(LOCAL_KEY);
      setUser(null);
      return;
    }
    localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
    
    // Criar uma nova referência do objeto para forçar re-render
    const newUser = { ...next };
    setUser(newUser);
    
    console.log('saveUser - usuário salvo e estado atualizado');
    
    // Disparar evento customizado para notificar outros componentes
    window.dispatchEvent(new CustomEvent('userUpdated', { detail: newUser }));
  }, []);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === LOCAL_KEY) setUser(parseLocalUser());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return { user, saveUser, isLogged: !!user };
}