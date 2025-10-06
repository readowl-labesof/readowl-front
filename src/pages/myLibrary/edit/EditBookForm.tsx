import { useEffect, useMemo, useState } from "react";
import {
  BOOK_GENRES_MASTER,
  BOOK_COVER_RATIO,
  BOOK_COVER_RATIO_TOLERANCE,
  BOOK_COVER_MIN_WIDTH,
  BOOK_COVER_MIN_HEIGHT,
  updateBookSchema,
  BOOK_STATUS,
} from "../../../types/book";
import BasicFieldsEdit from "./BasicFieldsEdit";
import CoverAndStatus from "./CoverAndStatus";
import GenreSelectorEdit from "./GenreSelectorEdit";

type Genre = { id: string; name: string };
type Author = {
  id: string;
  name: string | null;
  image: string | null;
  role: string;
};

interface BookInput {
  id: string;
  title: string;
  synopsis: string;
  releaseFrequency: string | null;
  coverUrl: string | null;
  status: (typeof BOOK_STATUS)[number];
  authorId: string;
  author: Author;
  genres: Genre[];
}

interface Props {
  book: BookInput;
  onSaved?: (updated: any) => void;
}

export default function EditBookForm({ book, onSaved }: Props) {
  // Defensive defaults in case `book` is partial from the API
  const safeTitle = book?.title ?? "";
  const safeSynopsis = book?.synopsis ?? "";
  const safeReleaseFrequency = book?.releaseFrequency ?? "";
  const safeCoverUrl = book?.coverUrl ?? "";
  const safeStatus =
    (book?.status as (typeof BOOK_STATUS)[number]) ?? BOOK_STATUS[0];
  const safeGenres = Array.isArray(book?.genres) ? book!.genres : [];

  const [title, setTitle] = useState<string>(safeTitle);
  const [synopsis, setSynopsis] = useState<string>(safeSynopsis);
  const [releaseFrequency, setReleaseFrequency] =
    useState<string>(safeReleaseFrequency);
  const [coverUrl, setCoverUrl] = useState<string>(safeCoverUrl);
  const [status, setStatus] =
    useState<(typeof BOOK_STATUS)[number]>(safeStatus);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    safeGenres.map((g: any) => g.name ?? String(g))
  );

  const [baseline, setBaseline] = useState(() => ({
    title: safeTitle,
    synopsis: safeSynopsis,
    releaseFrequency: safeReleaseFrequency,
    coverUrl: safeCoverUrl,
    status: safeStatus,
    genres: safeGenres.map((g: any) => g.name ?? String(g)).sort(),
  }));

  const [coverValid, setCoverValid] = useState<boolean | null>(null);
  const [coverLoading, setCoverLoading] = useState(false);
  const [genreFilter, setGenreFilter] = useState("");
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [touched, setTouched] = useState({
    title: false,
    synopsis: false,
    frequency: false,
    cover: false,
  });
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  // help modal removed for this simplified port
  const [submitting, setSubmitting] = useState(false);

  // Debug: log mount and book data so we can see if component mounted
  // removed debug console/banner in final UI

  const genres = useMemo(() => [...BOOK_GENRES_MASTER], []);
  const filteredGenres = useMemo(
    () =>
      genres.filter((g) => g.toLowerCase().includes(genreFilter.toLowerCase())),
    [genreFilter, genres]
  );
  const toggleGenre = (g: string) =>
    setSelectedGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );

  const expectedRatio = BOOK_COVER_RATIO;
  const aspectTolerance = BOOK_COVER_RATIO_TOLERANCE;
  useEffect(() => {
    if (!coverUrl) {
      setCoverValid(null);
      return;
    }
    let cancelled = false;
    setCoverLoading(true);
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
  }, [coverUrl, expectedRatio, aspectTolerance]);

  const validate = () => {
    const v: Record<string, string | undefined> = {};
    const parsed = updateBookSchema.safeParse({
      title: title.trim(),
      synopsis: synopsis.trim(),
      releaseFrequency: releaseFrequency.trim() || undefined,
      coverUrl: coverUrl.trim() || undefined,
      status,
      genres: selectedGenres,
    });
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const path = String(issue.path[0] || "");
        if (!path) continue;
        v[path] = issue.message;
      }
    }
    if (!coverUrl.trim()) v.coverUrl = "É necessário uma URL da capa.";
    else if (coverValid === false)
      v.coverUrl = `A proporção ou tamanho é inválido (mínimo ${BOOK_COVER_MIN_WIDTH}x${BOOK_COVER_MIN_HEIGHT}, proporção 3:4).`;
    else if (coverValid !== true) v.coverUrl = "Validando capa, aguarde...";
    return v;
  };

  useEffect(() => {
    setErrors(validate());
  }, [
    title,
    synopsis,
    releaseFrequency,
    coverUrl,
    coverValid,
    status,
    selectedGenres,
  ]);
  const changed = useMemo(() => {
    const current = {
      title,
      synopsis,
      releaseFrequency,
      coverUrl,
      status,
      genres: [...selectedGenres].sort(),
    };
    return JSON.stringify(current) !== JSON.stringify(baseline);
  }, [
    title,
    synopsis,
    releaseFrequency,
    coverUrl,
    status,
    selectedGenres,
    baseline,
  ]);

  const canSubmit =
    changed &&
    Object.keys(errors).length === 0 &&
    selectedGenres.length > 0 &&
    coverValid === true;

  const onSubmit = async () => {
    setAttemptedSubmit(true);
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem("readowl-token");
      const payload = {
        title: title.trim(),
        synopsis: synopsis.trim(),
        coverUrl: coverUrl.trim(),
        status,
        genres: selectedGenres,
      };
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`http://localhost:3333/books/${book.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Falha ao salvar");
      }
      const updated = await res.json();
      setBaseline({
        title: updated.title,
        synopsis: updated.synopsis,
        releaseFrequency: updated.releaseFrequency || "",
        coverUrl: updated.coverUrl || "",
        status: updated.status,
        genres: (updated.genres || []).map((g: any) => g.name).sort(),
      });
      // If parent provided an onSaved callback, call it so it can navigate/refresh.
      // Otherwise fallback to a full reload to /library.
      if (typeof onSaved === "function") {
        try {
          onSaved(updated);
        } catch (err) {
          window.location.href = "/library";
        }
      } else {
        window.location.href = "/library";
      }
    } catch (e) {
      setErrors((prev) => ({ ...prev, submit: (e as Error).message }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="edit-book-form"
      className="w-full max-w-6xl mx-auto bg-readowl-purple-medium p-8 shadow-2xl"
    >
      {/* banner removed */}
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
          EDITAR LIVRO
        </h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <CoverAndStatus
          coverUrl={coverUrl}
          coverValid={coverValid}
          coverLoading={coverLoading}
          errors={errors}
          touched={touched.cover}
          attemptedSubmit={attemptedSubmit}
          onChange={(v) => setCoverUrl(v)}
          onBlur={() => setTouched((t) => ({ ...t, cover: true }))}
          status={status}
          onStatus={(s) => setStatus(s)}
        />
        <BasicFieldsEdit
          title={title}
          synopsis={synopsis}
          releaseFrequency={releaseFrequency}
          errors={errors}
          touched={{
            title: touched.title,
            synopsis: touched.synopsis,
            frequency: touched.frequency,
          }}
          attemptedSubmit={attemptedSubmit}
          onTitle={(v) => setTitle(v)}
          onSynopsis={(v) => setSynopsis(v)}
          onFrequency={(v) => setReleaseFrequency(v)}
          onBlurTitle={() => setTouched((t) => ({ ...t, title: true }))}
          onBlurSynopsis={() => setTouched((t) => ({ ...t, synopsis: true }))}
          onBlurFrequency={() => setTouched((t) => ({ ...t, frequency: true }))}
        />
      </div>
      <GenreSelectorEdit
        filteredGenres={filteredGenres}
        genreFilter={genreFilter}
        onFilter={setGenreFilter}
        selectedGenres={selectedGenres}
        toggleGenre={toggleGenre}
        error={errors.genres}
      />

      {errors.submit && (
        <p className="text-sm text-red-300 mt-6 text-center">{errors.submit}</p>
      )}

      <div className="mt-4 flex items-center justify-center gap-6">
        <button
          onClick={() => {
            if (confirm("Descartar alterações?"))
              window.location.href = "/library";
          }}
          className="px-4 py-2 text-sm bg-white text-readowl-purple border border-readowl-purple/30 hover:bg-readowl-purple-extralight"
        >
          Cancelar
        </button>
        <button
          disabled={!canSubmit || submitting}
          onClick={onSubmit}
          className="px-4 py-2 text-sm bg-readowl-purple-light text-white hover:bg-readowl-purple disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}
