import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { UserDTO } from '../lib/api'

// Hook central de autenticação
export function useAuth() {
  const [user, setUser] = useState<UserDTO | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Carrega token de storage
  useEffect(() => {
    const stored = localStorage.getItem('readowl-token') || sessionStorage.getItem('readowl-token')
    if (stored) {
      setToken(stored)
    } else {
      setLoading(false)
    }
  }, [])

  // Busca /me quando tiver token
  useEffect(() => {
    async function fetchMe() {
      if (!token) return
      try {
        const me = await api.me(token)
        setUser(me)
      } catch {
        // token inválido -> limpar
        logout()
      } finally {
        setLoading(false)
      }
    }
    fetchMe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const login = useCallback(async (email: string, password: string, remember?: boolean) => {
    const { token: tk, user: u } = await api.login(email, password, remember)
    const storage = remember ? localStorage : sessionStorage
    storage.setItem('readowl-token', tk)
    storage.setItem('readowl-user', JSON.stringify(u))
    setToken(tk)
    setUser(u)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('readowl-token')
    sessionStorage.removeItem('readowl-token')
    localStorage.removeItem('readowl-user')
    sessionStorage.removeItem('readowl-user')
    setUser(null)
    setToken(null)
  }, [])

  return { user, token, loading, login, logout }
}
