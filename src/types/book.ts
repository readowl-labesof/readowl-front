import { z } from 'zod';

// Comentário: Este arquivo centraliza constantes e validações do domínio "Livro" para uso no frontend.

// Limites de texto
export const BOOK_TITLE_MAX = 200;
export const BOOK_SYNOPSIS_MAX = 1000;
export const BOOK_FREQ_MAX = 50;

// Validação de capa (proporção 3:4 com tolerância leve)
export const BOOK_COVER_MIN_WIDTH = 600;
export const BOOK_COVER_MIN_HEIGHT = 800;
export const BOOK_COVER_RATIO = 3 / 4; // 0.75
export const BOOK_COVER_RATIO_TOLERANCE = 0.02; // 2%

// Lista mestra de gêneros (ajuste conforme necessário)
export const BOOK_GENRES_MASTER: readonly string[] = [
  'Ação', 'Adulto', 'Alta Fantasia', 'Aventura', 'Autoajuda', 'Baixa Fantasia', 'Biografia', 'Biopunk', 'Ciência', 'Comédia', 'Cyberpunk', 'Dieselpunk', 'Distopia', 'Documentário', 'Drama', 'Ecchi', 'Educativo', 'Espacial', 'Esportes', 'Fantasia', 'Fantasia Sombria', 'Fantasia Urbana', 'Fatos Reais', 'Ficção Científica', 'Ficção Histórica', 'Filosófico', 'Futurístico', 'GameLit', 'Gótico', 'Harém', 'Histórico', 'Horror', 'Isekai', 'LitRPG', 'Lírico', 'Mecha', 'Militar', 'Mistério', 'Não-Humano', 'Pós-Apocalíptico', 'Político', 'Psicológico', 'Romance', 'Sátira', 'Seinen', 'Shonen', 'Shoujo', 'Slice of Life', 'Sobrenatural', 'Steampunk', 'Suspense', 'Terror', 'Tragédia', 'Vida Escolar', 'Zumbi'
].sort((a, b) => a.localeCompare(b, 'pt-BR'));

// Esquema de validação para criação de livro
export const createBookSchema = z.object({
  title: z.string().trim().min(1, 'Título é obrigatório').max(BOOK_TITLE_MAX),
  synopsis: z.string().trim().min(1, 'Sinopse é obrigatória').max(BOOK_SYNOPSIS_MAX),
  releaseFrequency: z.string().trim().max(BOOK_FREQ_MAX).optional(),
  coverUrl: z.string().url({ message: 'URL inválida' }).optional(),
  genres: z.array(z.string().min(1)).min(1, 'Selecione pelo menos um gênero'),
});

export type CreateBookInput = z.infer<typeof createBookSchema>;