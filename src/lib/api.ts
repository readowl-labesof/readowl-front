// src/lib/api.ts
// Cliente API centralizado (NPM only). Ajuste a URL base via variável de ambiente VITE_API_URL.
// Comentários PT-BR para clareza.

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3333'

// Tipo mínimo de usuário (expandir conforme backend)
export interface UserDTO {
  id: string
  name?: string
  nome?: string
  email: string
  role?: string
}

// Tipos mínimos para livros / volumes / capítulos (expandir conforme necessidade)
export interface BookDTO {
  id: string
  title: string
  synopsis?: string
  coverUrl?: string
  status?: string
}
export interface VolumeDTO {
  id: string
  name?: string
  title?: string
  order?: number
}
export interface ChapterDTO {
  id: string
  title: string
  order?: number
  volumeId?: string | null
  bookId?: string
}

interface AuthResponse {
  token: string
  user: UserDTO
  remember?: boolean
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(API_BASE + path, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options,
  })
  if (!res.ok) {
    let msg = 'Erro na requisição'
    try {
      const data: unknown = await res.json()
      if (typeof data === 'object' && data && 'message' in data) {
        const maybeMsg = (data as { message?: string }).message
        if (maybeMsg) msg = maybeMsg
      }
    } catch {
      // Silencia erros de parse JSON (respostas vazias ou texto simples)
    }
    throw new Error(msg)
  }
  // Alguns endpoints podem não retornar JSON (ex.: 204). Tentar parse seguro.
  try { return await res.json() as T } catch { return undefined as unknown as T }
}

export const api = {
  // --- Autenticação ---
  login: (email: string, senha: string, remember?: boolean) =>
    request<AuthResponse>('/sessions', { method: 'POST', body: JSON.stringify({ email, password: senha, rememberMe: remember }) }),
  register: (data: { nome: string; email: string; senha: string }) =>
    request<AuthResponse>('/users', { method: 'POST', body: JSON.stringify({ name: data.nome, email: data.email, password: data.senha }) }),
  me: (token: string) => request<UserDTO>('/me', { headers: { Authorization: `Bearer ${token}` } }),

  // --- Password Reset ---
  passwordForgot: (email: string) => request<{ message: string }>('/password/forgot', { method: 'POST', body: JSON.stringify({ email }) }),
  passwordReset: (token: string, password: string) => request<{ message: string }>('/password/reset', { method: 'POST', body: JSON.stringify({ token, password }) }),

  // --- Google OAuth ---
  googleAuthUrl: () => request<{ url: string }>('/oauth/google/url'),

  // --- Livros ---
  listBooks: () => request<BookDTO[]>('/books'),
  getBook: (id: string) => request<BookDTO>(`/books/${id}`),
  createBook: (data: Partial<BookDTO> & { title: string; synopsis?: string; coverUrl?: string; gender?: string }, token: string) =>
    request<BookDTO>('/books', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  updateBook: (id: string, data: Partial<BookDTO>, token: string) =>
    request<BookDTO>(`/books/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  deleteBook: (id: string, token: string) =>
    request<{ message?: string }>(`/books/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),

  // --- Volumes & Capítulos ---
  getVolumes: (bookId: string) => request<VolumeDTO[]>(`/books/${bookId}/volumes`),
  getChapters: (bookId: string) => request<ChapterDTO[]>(`/books/${bookId}/chapters`),
  createVolume: (data: { bookId: string; title?: string; name?: string }, token: string) =>
    request<VolumeDTO>('/volumes', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  updateVolume: (id: string, data: Partial<VolumeDTO>, token: string) =>
    request<VolumeDTO>(`/volumes/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  reorderVolumes: (pairs: { id: string; order: number }[], token: string) =>
    request<{ message?: string }>('/volumes/reorder', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ volumes: pairs }) }),
  deleteVolume: (id: string, token: string) =>
    request<{ message?: string }>(`/volumes/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),

  createChapter: (data: { bookId: string; title: string; volumeId?: string | null; content?: string }, token: string) =>
    request<ChapterDTO>('/chapters', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  updateChapter: (id: string, data: Partial<{ title: string; content: string; volumeId: string | null }>, token: string) =>
    request<ChapterDTO>(`/chapters/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  reorderChapters: (groups: { volumeId?: string | null; chapters: { id: string; order: number }[] }[], token: string) =>
    request<{ message?: string }>('/chapters/reorder', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ groups }) }),
  deleteChapter: (id: string, token: string) =>
    request<{ message?: string }>(`/chapters/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),

  // --- Follow ---
  followStatus: (bookId: string, token: string) => request<{ following: boolean }>(`/books/${bookId}/follow`, { headers: { Authorization: `Bearer ${token}` } }),
  follow: (bookId: string, token: string) => request<{ message?: string }>(`/books/${bookId}/follow`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }),
  unfollow: (bookId: string, token: string) => request<{ message?: string }>(`/books/${bookId}/follow`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),

  // --- Ratings ---
  ratingSummary: (bookId: string) => request<{ average: number; total: number; distribution: Record<string, number> }>(`/books/${bookId}/ratings/summary`),
  rate: (bookId: string, value: number, token: string) => request<{ message?: string }>(`/books/${bookId}/ratings`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ value }) }),
}
