"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";

export function useBlockedLogin() {
  const [isBlocked, setIsBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (email: string, password: string, remember: boolean = false) => {
    setIsLoading(true);
    setIsBlocked(false);

    try {
      // Primeiro, verificar se o usuário existe e está bloqueado
      const checkResponse = await fetch('/api/auth/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (checkResponse.ok) {
        const userData = await checkResponse.json();
        if (userData.blocked) {
          setIsBlocked(true);
          setIsLoading(false);
          return { error: 'BLOCKED_ACCOUNT' };
        }
      }

      // Prosseguir com login normal se não estiver bloqueado
      const result = await signIn("credentials", {
        email,
        password,
        remember: remember.toString(),
        redirect: false,
      });

      setIsLoading(false);
      return result;
    } catch {
      setIsLoading(false);
      return { error: 'NETWORK_ERROR' };
    }
  };

  return { handleLogin, isBlocked, isLoading, setIsBlocked };
}