// Arquivo adaptado para uso no frontend (React + Vite)
// - Remove importações do Prisma (@prisma/client) que pertencem ao backend
// - Mantém apenas tipos/constantes e schemas com Zod utilizados na UI
import { z } from 'zod';

// Centralized limits
export const BOOK_TITLE_MAX = 200;
export const BOOK_SYNOPSIS_MAX = 2000;
export const BOOK_FREQ_MAX = 50;

// Master genre list (single source of truth)
export const BOOK_GENRES_MASTER: readonly string[] = [
  'Ação', 'Adulto', 'Alta Fantasia', 'Aventura', 'Autoajuda', 'Baixa Fantasia', 'Biografia', 'Biopunk', 'Ciência', 'Comédia', 'Cyberpunk', 'Dieselpunk', 'Distopia', 'Documentário', 'Drama', 'Ecchi', 'Educativo', 'Espacial', 'Esportes', 'Fantasia', 'Fantasia Sombria', 'Fantasia Urbana', 'Fatos Reais', 'Ficção Científica', 'Ficção Histórica', 'Filosófico', 'Futurístico', 'GameLit', 'Gótico', 'Harém', 'Histórico', 'Horror', 'Isekai', 'LitRPG', 'Lírico', 'Mecha', 'Militar', 'Mistério', 'Não-Humano', 'Pós-Apocalíptico', 'Político', 'Psicológico', 'Romance', 'Sátira', 'Seinen', 'Shonen', 'Shoujo', 'Slice of Life', 'Sobrenatural', 'Steampunk', 'Suspense', 'Terror', 'Tragédia', 'Vida Escolar', 'Zumbi'
].sort((a, b) => a.localeCompare(b, 'pt-BR'));

// Tipos de domínio do backend (Book, Genre, User) foram removidos para evitar acoplamento.
// Caso precise tipar dados vindos da API, defina tipos simples aqui no frontend.

// Zod schema for create request (shared client/server)
export const createBookSchema = z.object({
  title: z.string().trim().min(1, 'É necessário um título').max(BOOK_TITLE_MAX),
  synopsis: z.string().trim().min(1, 'É necessário uma sinopse').max(BOOK_SYNOPSIS_MAX),
  releaseFrequency: z.string().trim().max(BOOK_FREQ_MAX).optional().or(z.literal('').transform(() => undefined)),
  coverUrl: z.string().pipe(z.url({ message: 'URL inválida' })),
  genres: z.array(z.string().min(1)).min(1, 'Selecione ao menos um gênero'),
});

export type CreateBookInput = z.infer<typeof createBookSchema>;

// Helper to normalize incoming payload before DB
export function normalizeCreateBookInput(data: CreateBookInput): CreateBookInput {
  return {
    ...data,
    title: data.title.trim(),
    synopsis: data.synopsis.trim(),
    releaseFrequency: data.releaseFrequency?.trim() || undefined,
    coverUrl: data.coverUrl.trim(),
    genres: Array.from(new Set(data.genres.map((g: string) => g.trim()))),
  };
}

export const BOOK_COVER_MIN_WIDTH = 600;
export const BOOK_COVER_MIN_HEIGHT = 800;
export const BOOK_COVER_RATIO = 600 / 800; // 0.75 expected
export const BOOK_COVER_RATIO_TOLERANCE = 0.02; // 2%

// Book status enum (mirror of Prisma enum Status)
export const BOOK_STATUS = ['ONGOING', 'COMPLETED', 'HIATUS', 'PAUSED'] as const;
export type BookStatus = typeof BOOK_STATUS[number];
export const BOOK_STATUS_LABEL: Record<BookStatus, string> = {
  ONGOING: 'Em andamento',
  COMPLETED: 'Concluído',
  HIATUS: 'Hiato',
  PAUSED: 'Pausado',
};

// Zod schema for update (edit)
export const updateBookSchema = z.object({
  title: z.string().trim().min(1, 'É necessário um título').max(BOOK_TITLE_MAX),
  synopsis: z.string().trim().min(1, 'É necessário uma sinopse').max(BOOK_SYNOPSIS_MAX),
  releaseFrequency: z.string().trim().max(BOOK_FREQ_MAX).optional().or(z.literal('').transform(() => undefined)),
  coverUrl: z.string().pipe(z.url({ message: 'URL inválida' })),
  status: z.enum(BOOK_STATUS),
  genres: z.array(z.string().min(1)).min(1, 'Selecione ao menos um gênero'),
});
export type UpdateBookInput = z.infer<typeof updateBookSchema>;

export function normalizeUpdateBookInput(data: UpdateBookInput): UpdateBookInput {
  return {
    ...data,
    title: data.title.trim(),
    synopsis: data.synopsis.trim(),
    releaseFrequency: data.releaseFrequency?.trim() || undefined,
    coverUrl: data.coverUrl.trim(),
    status: data.status,
    genres: Array.from(new Set(data.genres.map((g: string) => g.trim()))),
  };
}
