// Componente convertido de Next.js para React + Vite
// - Remove a diretiva "use client" (própria do Next)
// - Substitui next/image por <img /> nativo
// - Ajusta o import com caminho relativo (sem alias "@/")
import React from 'react';
import { BOOK_COVER_MIN_WIDTH, BOOK_COVER_MIN_HEIGHT } from '../../types/book';

export interface CoverInputProps {
  coverUrl: string;
  coverValid: boolean | null;
  coverLoading: boolean;
  errors: { coverUrl?: string };
  touched: boolean;
  attemptedSubmit: boolean;
  onChange: (v: string) => void;
  onBlur: () => void;
  onHelp: () => void;
}

export const CoverInput: React.FC<CoverInputProps> = ({ coverUrl, coverValid, coverLoading, errors, touched, attemptedSubmit, onChange, onBlur, onHelp }) => {
  return (
    <div>
      <label className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
        {/* Em Vite usamos <img /> diretamente para ícones estáticos em /public */}
        <img src="/img/svg/book/book2.svg" alt="Capa" width={18} height={18} className="opacity-80" />
        URL da Capa
  <button type="button" aria-label="Ajuda capa" onClick={onHelp} className="w-5 h-5 bg-readowl-purple-dark text-white text-xs flex items-center justify-center">?</button>
      </label>
  <div className={`relative w-full aspect-[3/4] border-2 border-dashed flex items-center justify-center overflow-hidden text-center text-readowl-purple-dark bg-white ${coverValid === false ? 'border-red-400' : 'border-none'}`}>
        {coverUrl && coverValid !== null && !coverLoading ? (
          // Em Vite/React não há regra do Next para <img/>, então apenas renderizamos
          <img src={coverUrl} alt="Preview capa" className="object-cover w-full h-full" />
        ) : (
          <span className="text-xs opacity-70 select-none px-4">Insira a URL da imagem para ver a capa aqui <br></br>(proporção 3:4, mín {BOOK_COVER_MIN_WIDTH}x{BOOK_COVER_MIN_HEIGHT})</span>
        )}
        {coverLoading && <div className="absolute inset-0 flex items-center justify-center bg-white/60 text-readowl-purple font-semibold text-sm">Carregando...</div>}
      </div>
      <input
        type="url"
        placeholder="https://..."
        value={coverUrl}
        onChange={e => onChange(e.target.value.trim())}
        onBlur={onBlur}
  className="mt-2.5 w-full bg-white focus:ring-readowl-purple-dark px-4 py-2 text-sm text-readowl-purple placeholder-readowl-purple/50 border"
      />
      {errors.coverUrl && (touched || attemptedSubmit) && <p className="text-xs text-red-300 mt-1">{errors.coverUrl}</p>}
    </div>
  );
};
