import React from "react";
import {
  BOOK_COVER_MIN_HEIGHT,
  BOOK_COVER_MIN_WIDTH,
  BOOK_STATUS,
  BOOK_STATUS_LABEL,
} from "../../../types/book";

export interface CoverAndStatusProps {
  coverUrl: string;
  coverValid: boolean | null;
  coverLoading: boolean;
  errors: { coverUrl?: string };
  touched: boolean;
  attemptedSubmit: boolean;
  onChange: (v: string) => void;
  onBlur: () => void;
  onHelp?: () => void;
  status: (typeof BOOK_STATUS)[number];
  onStatus: (s: (typeof BOOK_STATUS)[number]) => void;
}

export const CoverAndStatus: React.FC<CoverAndStatusProps> = ({
  coverUrl,
  coverValid,
  coverLoading,
  errors,
  touched,
  attemptedSubmit,
  onChange,
  onBlur,
  onHelp,
  status,
  onStatus,
}) => {
  return (
    <div>
      <label className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
        URL da Capa
        <button
          type="button"
          onClick={onHelp}
          className="w-5 h-5 bg-readowl-purple-dark text-white text-xs flex items-center justify-center"
        >
          ?
        </button>
      </label>

      <div
        className={`relative w-full aspect-[3/4] border-2 border-dashed flex items-center justify-center overflow-hidden text-center text-readowl-purple-dark bg-white ${
          coverValid === false ? "border-red-400" : "border-none"
        }`}
      >
        {coverUrl && coverValid !== null && !coverLoading ? (
          <img
            src={coverUrl}
            alt="Preview capa"
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="text-xs opacity-70 select-none px-4">
            Insira a URL da imagem para ver a capa aqui <br />
            (proporção 3:4, mín {BOOK_COVER_MIN_WIDTH}x{BOOK_COVER_MIN_HEIGHT})
          </span>
        )}
        {coverLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 text-readowl-purple font-semibold text-sm">
            Carregando...
          </div>
        )}
      </div>

      <input
        type="url"
        placeholder="https://..."
        value={coverUrl}
        onChange={(e) => onChange(e.target.value.trim())}
        onBlur={onBlur}
        className="mt-2.5 w-full bg-white focus:ring-readowl-purple-dark px-4 py-2 text-sm text-readowl-purple placeholder-readowl-purple/50 border"
      />
      {errors.coverUrl && (touched || attemptedSubmit) && (
        <p className="text-xs text-red-300 mt-1">{errors.coverUrl}</p>
      )}

      <div className="mt-3">
        <div className="relative inline-block">
          <select
            value={status}
            onChange={(e) =>
              onStatus(e.target.value as (typeof BOOK_STATUS)[number])
            }
            className="appearance-none pr-8 pl-10 py-1.5 text-sm bg-white border-2 border-white/60 focus:ring-2 focus:ring-readowl-purple-dark text-readowl-purple"
          >
            {BOOK_STATUS.map((s) => (
              <option key={s} value={s}>
                {BOOK_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-readowl-purple">
            ▼
          </span>
        </div>
      </div>
    </div>
  );
};

export default CoverAndStatus;
