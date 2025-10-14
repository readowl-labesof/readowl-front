import React, { useCallback, useEffect, useMemo, useState } from "react";
import useUser from "../../hooks/useUser";
import { CoverInput } from "./coverInput";
import { BasicFields } from "./basicFields";
import { GenreSelector } from "./genreSelector";
import { createBookSchema, BOOK_GENRES_MASTER, BOOK_COVER_MIN_WIDTH, BOOK_COVER_MIN_HEIGHT, BOOK_COVER_RATIO, BOOK_COVER_RATIO_TOLERANCE } from "../../types/book";
import { api } from '../../lib/api'

// Implementação simples de Modal para Vite/React
// Observação: estilização feita com Tailwind; fecha ao clicar no backdrop ou no botão Fechar
function Modal({
  open,
  onClose,
  title,
  widthClass = "max-w-md",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  widthClass?: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className={`relative bg-white text-readowl-purple rounded shadow-xl w-full ${widthClass} mx-4`}
        role="dialog"
        aria-modal="true"
      >
        <div className="border-b px-4 py-3 flex items-center justify-between">
          <h2 className="font-semibold text-lg">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="text-sm px-2 py-1 hover:bg-black/5 rounded"
          >
            ✕
          </button>
        </div>
        <div className="p-4 text-sm">{children}</div>
      </div>
    </div>
  );
}

// Botão com ícone simples (substitui o componente do Next)
function ButtonWithIcon({
  iconUrl,
  variant = "primary",
  disabled,
  onClick,
  children,
}: {
  iconUrl?: string;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const base =
    "inline-flex items-center gap-2 px-4 py-2 text-sm rounded transition disabled:opacity-60 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-readowl-purple-light text-white hover:bg-readowl-purple"
      : "bg-white text-readowl-purple border border-readowl-purple/30 hover:bg-readowl-purple-extralight";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles}`}
    >
      {iconUrl && (
        <img src={iconUrl} alt="" className="w-5 h-5" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}

interface CreateBookFormProps {
  availableGenres?: string[]; // optional preset list; can be empty to allow on-the-fly create
  redirectAfter?: string; // path to redirect after success
}

interface ValidationErrors {
  title?: string;
  synopsis?: string;
  coverUrl?: string;
  genres?: string;
  releaseFrequency?: string;
  submit?: string;
}

// Lista oficial de gêneros (origem centralizada em /types/book)
const defaultGenres = [...BOOK_GENRES_MASTER].sort((a, b) =>
  a.localeCompare(b, "pt-BR")
);

const aspectTolerance = BOOK_COVER_RATIO_TOLERANCE;
const expectedRatio = BOOK_COVER_RATIO; // 0.75

export default function CreateBookForm({
  availableGenres,
  redirectAfter = "/library",
}: CreateBookFormProps) {
  const [title, setTitle] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [releaseFrequency, setReleaseFrequency] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [coverValid, setCoverValid] = useState<boolean | null>(null); // null => untouched
  const [coverLoading, setCoverLoading] = useState(false);
  const [genreFilter, setGenreFilter] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [errors, setErrors] = useState<ValidationErrors>({});
  // touched controls to avoid early error animation
  const [touchedTitle, setTouchedTitle] = useState(false);
  const [touchedSynopsis, setTouchedSynopsis] = useState(false);
  const [touchedFrequency, setTouchedFrequency] = useState(false);
  const [touchedCover, setTouchedCover] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const genres = useMemo(
    () =>
      availableGenres && availableGenres.length > 0
        ? availableGenres
        : defaultGenres,
    [availableGenres]
  );

  const filteredGenres = useMemo(
    () =>
      genres.filter((g) => g.toLowerCase().includes(genreFilter.toLowerCase())),
    [genreFilter, genres]
  );

  const toggleGenre = (g: string) => {
    setSelectedGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  // Cover Preview Validation
  useEffect(() => {
    if (!coverUrl) {
      setCoverValid(null);
      return;
    }
    let cancelled = false;
    setCoverLoading(true);
    // Usa window.Image para evitar problemas de SSR e fornece tipagem ampla
    const ImgCtor =
      typeof window !== "undefined"
        ? (window as unknown as { Image: { new (): HTMLImageElement } }).Image
        : null;
    if (!ImgCtor) {
      setCoverValid(null);
      setCoverLoading(false);
      return;
    }
    const img = new ImgCtor();
    img.onload = () => {
      if (cancelled) return;
      const ratio = img.width / img.height;
      const ok =
        Math.abs(ratio - expectedRatio) < aspectTolerance &&
        img.width >= BOOK_COVER_MIN_WIDTH &&
        img.height >= BOOK_COVER_MIN_HEIGHT;
      setCoverValid(ok);
      setCoverLoading(false);
    };
    img.onerror = () => {
      if (!cancelled) {
        setCoverValid(false);
        setCoverLoading(false);
      }
    };
    img.src = coverUrl;
    return () => {
      cancelled = true;
    };
  }, [coverUrl]);

  const validate = useCallback((): ValidationErrors => {
    const v: ValidationErrors = {};
    // Base schema validation (ignora cover ratio - tratamos manualmente)
    const parsed = createBookSchema.safeParse({
      title: title.trim(),
      synopsis: synopsis.trim(),
      releaseFrequency: releaseFrequency.trim() || undefined,
      coverUrl: coverUrl.trim() || undefined,
      genres: selectedGenres,
    });
    if (!parsed.success) {
      const issues = parsed.error.issues;
      for (const issue of issues) {
        const path = issue.path[0];
        if (!path) continue;
        switch (path) {
          case "title":
            v.title = issue.message;
            break;
          case "synopsis":
            v.synopsis = issue.message;
            break;
          case "releaseFrequency":
            v.releaseFrequency = issue.message;
            break;
          case "coverUrl":
            v.coverUrl = issue.message;
            break;
          case "genres":
            v.genres = issue.message;
            break;
        }
      }
    }
    // Cover specific async dimension validation messages override generic ones
    if (!coverUrl.trim()) {
      v.coverUrl = "É necessário uma URL da capa.";
    } else if (coverValid === false) {
      v.coverUrl = `A proporção ou tamanho é inválido (mínimo ${BOOK_COVER_MIN_WIDTH}x${BOOK_COVER_MIN_HEIGHT}, proporção 3:4).`;
    } else if (coverValid !== true) {
      v.coverUrl = "Validando capa, aguarde...";
    }
    return v;
  }, [title, synopsis, releaseFrequency, coverUrl, coverValid, selectedGenres]);

  useEffect(() => {
    // Atualiza erros mas evita animação automática (shake) antes de interação
    setErrors(validate());
  }, [
    title,
    synopsis,
    releaseFrequency,
    coverUrl,
    coverValid,
    selectedGenres,
    validate,
  ]);

  const untouched =
    !title &&
    !synopsis &&
    !releaseFrequency &&
    !coverUrl &&
    selectedGenres.length === 0;
  const canSubmit =
    Object.keys(errors).length === 0 &&
    !!title.trim() &&
    !!synopsis.trim() &&
    selectedGenres.length > 0 &&
    coverValid === true;

  // Dentro do seu componente CreateBookForm

  // Dentro do seu componente CreateBookForm

  // Usa o hook corretamente
  const { user, isLogged } = useUser();

  const handleSubmit = async () => {
    setAttemptedSubmit(true);
    setConfirmSaveOpen(false);
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    if (!isLogged || !user?.id) {
      setErrors((prev) => ({ ...prev, submit: "Você não está autenticado. Por favor, faça login novamente." }));
      return;
    }

    try {
      setSubmitting(true);

      // --- INÍCIO DAS ALTERAÇÕES ---

      // 1. Obter o token de autenticação (exemplo: do localStorage)
      // Em ambiente de desenvolvimento permitimos criar livros sem token;
      // incluímos o header Authorization apenas se o token existir.
      const token = localStorage.getItem("readowl-token");

      // 2. Montar o corpo da requisição.
      // O campo 'genres' no frontend é um array, mas no nosso backend é uma string simples.
      // Vamos juntar os gêneros em uma string separada por vírgulas.
      // O campo 'releaseFrequency' não existe no nosso backend, então o removeremos.
      // Monta o payload garantindo que coverUrl só vai se não estiver vazia
      const bookData: { title: string; synopsis: string; gender: string; coverUrl?: string } = {
        title: title.trim(),
        synopsis: synopsis.trim(),
        gender: selectedGenres.join(", "), // Ex: "Fantasia, Aventura"
      }
      const coverTrim = coverUrl.trim()
      if (coverTrim) {
        bookData.coverUrl = coverTrim
      }

      // 3. Fazer a requisição para o endpoint correto do nosso backend
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      const baseToken = token || (localStorage.getItem('readowl-token') || '')
      if (!baseToken) throw new Error('Token ausente; faça login novamente.')
  await api.createBook(bookData, baseToken)
      setSuccessModal(true);
    } catch (e) {
      setErrors((prev) => ({ ...prev, submit: (e as Error).message }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-readowl-purple-medium p-8 shadow-2xl">
      {/* Cabeçalho da página */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <img
          src="/img/svg/book/checkbook.svg"
          alt="Livro"
          width={50}
          height={50}
          className="w-10 h-10 mt-0.4"
          aria-hidden="true"
        />
        <h1 className="text-3xl font-yusei text-center font-semibold text-white">
          CADASTRAR NOVO LIVRO
        </h1>
      </div>

      {/* Grid principal: capa + campos básicos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <CoverInput
          coverUrl={coverUrl}
          coverValid={coverValid}
          coverLoading={coverLoading}
          errors={errors}
          touched={touchedCover}
          attemptedSubmit={attemptedSubmit}
          onChange={(v) => setCoverUrl(v)}
          onBlur={() => setTouchedCover(true)}
          onHelp={() => setHelpOpen(true)}
        />

        <BasicFields
          title={title}
          synopsis={synopsis}
          releaseFrequency={releaseFrequency}
          errors={errors}
          touched={{
            title: touchedTitle,
            synopsis: touchedSynopsis,
            frequency: touchedFrequency,
          }}
          attemptedSubmit={attemptedSubmit}
          onTitle={(v) => setTitle(v)}
          onSynopsis={(v) => setSynopsis(v)}
          onFrequency={(v) => setReleaseFrequency(v)}
          onBlurTitle={() => setTouchedTitle(true)}
          onBlurSynopsis={() => setTouchedSynopsis(true)}
          onBlurFrequency={() => setTouchedFrequency(true)}
        />
      </div>

      {/* Seletor de gêneros */}
      <GenreSelector
        filteredGenres={filteredGenres}
        genreFilter={genreFilter}
        onFilter={(v) => setGenreFilter(v)}
        selectedGenres={selectedGenres}
        toggleGenre={toggleGenre}
        error={errors.genres}
      />

      {/* Erro geral de submissão */}
      {errors.submit && (
        <p className="text-sm text-red-300 mt-6 text-center">{errors.submit}</p>
      )}

      {/* Ações */}
      <div className="mt-4 flex items-center justify-center gap-6">
        <ButtonWithIcon
          variant="secondary"
          onClick={() =>
            untouched
              ? window.location.assign(redirectAfter)
              : setConfirmCancelOpen(true)
          }
          iconUrl="/img/svg/generics/cancel2.svg"
        >
          Cancelar
        </ButtonWithIcon>
        <ButtonWithIcon
          variant="primary"
          disabled={!canSubmit || submitting}
          onClick={() => setConfirmSaveOpen(true)}
          iconUrl="/img/svg/book/checkbook.svg"
        >
          {submitting ? "Salvando..." : "Registrar"}
        </ButtonWithIcon>
      </div>

      {/* Modal de ajuda */}
      <Modal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="Como adicionar a capa"
        widthClass="max-w-lg"
      >
        <p>
          Para adicionar a capa, hospede sua imagem em um site como{" "}
          <strong>imgur.com</strong>, clique com o botão direito na imagem,
          selecione <em>Copiar endereço da imagem</em> e cole o link no campo. A
          imagem deve ter{" "}
          <strong>
            mínimo {BOOK_COVER_MIN_WIDTH}px de largura por{" "}
            {BOOK_COVER_MIN_HEIGHT}px de altura
          </strong>{" "}
          e proporção aproximada de 3:4.
        </p>
        <p>Dica: Use imagens em formato JPG ou PNG otimizadas.</p>
      </Modal>

      {/* Confirmar cancelamento */}
      <Modal
        open={confirmCancelOpen}
        onClose={() => setConfirmCancelOpen(false)}
        title="Cancelar criação do livro?"
        widthClass="max-w-sm"
      >
        <p>Você perderá todos os dados preenchidos.</p>
        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={() => setConfirmCancelOpen(false)}
            className="px-4 py-2 text-sm bg-white text-readowl-purple border border-readowl-purple/30 hover:bg-readowl-purple-extralight"
          >
            Voltar
          </button>
          <a
            href={redirectAfter}
            className="px-4 py-2 text-sm bg-red-500 text-white hover:bg-red-600"
          >
            Descartar
          </a>
        </div>
      </Modal>

      {/* Confirmar salvar */}
      <Modal
        open={confirmSaveOpen}
        onClose={() => setConfirmSaveOpen(false)}
        title="Confirmar registro"
        widthClass="max-w-sm"
      >
        <p>Deseja salvar este novo livro?</p>
        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={() => setConfirmSaveOpen(false)}
            className="px-4 py-2 text-sm bg-white text-readowl-purple border border-readowl-purple/30 hover:bg-readowl-purple-extralight"
          >
            Voltar
          </button>
          <button
            disabled={submitting}
            onClick={handleSubmit}
            className="px-4 py-2 text-sm bg-readowl-purple-light text-white hover:bg-readowl-purple disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Salvando..." : "Confirmar"}
          </button>
        </div>
      </Modal>

      {/* Sucesso */}
      <Modal
        open={successModal}
        onClose={() => {
          setSuccessModal(false);
          window.location.href = redirectAfter;
        }}
        title="Livro criado!"
        widthClass="max-w-sm"
      >
        <p>Seu livro foi criado com sucesso.</p>
        <div className="flex justify-end mt-6 gap-3">
          <button
            onClick={() => {
              // Reset simples para cadastrar outro livro
              setSuccessModal(false);
              setTitle("");
              setSynopsis("");
              setReleaseFrequency("");
              setCoverUrl("");
              setSelectedGenres([]);
              setCoverValid(null);
              setAttemptedSubmit(false);
            }}
            className="px-4 py-2 text-sm bg-white text-readowl-purple border border-readowl-purple/30 hover:bg-readowl-purple-extralight"
          >
            Criar outro
          </button>
          <button
            onClick={() => {
              setSuccessModal(false);
              window.location.href = redirectAfter;
            }}
            className="px-4 py-2 text-sm bg-readowl-purple-light text-white hover:bg-readowl-purple"
          >
            Ir para biblioteca
          </button>
        </div>
      </Modal>

      {/* Notificações específicas removidas nesta conversão */}
    </div>
  );
}
