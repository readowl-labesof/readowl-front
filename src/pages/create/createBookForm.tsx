import { useCallback, useEffect, useMemo, useState } from 'react';
import Modal from '../../components/ui/Modal';
import ButtonWithIcon from '../../components/ui/buttonWithIcon';
import { CoverInput } from './coverInput';
import { BasicFields } from './basicFields';
import { GenreSelector } from './genreSelector';
import { createBookSchema, BOOK_GENRES_MASTER, BOOK_COVER_MIN_WIDTH, BOOK_COVER_MIN_HEIGHT, BOOK_COVER_RATIO, BOOK_COVER_RATIO_TOLERANCE } from '../../types/book';

interface CreateBookFormProps {
  availableGenres?: string[];
  redirectAfter?: string;
}

interface ValidationErrors {
  title?: string;
  synopsis?: string;
  coverUrl?: string;
  genres?: string;
  releaseFrequency?: string;
  submit?: string;
}

const defaultGenres = [...BOOK_GENRES_MASTER].sort((a, b) => a.localeCompare(b, 'pt-BR'));
const aspectTolerance = BOOK_COVER_RATIO_TOLERANCE;
const expectedRatio = BOOK_COVER_RATIO; // 0.75

export default function CreateBookForm({ availableGenres, redirectAfter = '/library' }: CreateBookFormProps) {
  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [releaseFrequency, setReleaseFrequency] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [coverValid, setCoverValid] = useState<boolean | null>(null);
  const [coverLoading, setCoverLoading] = useState(false);
  const [genreFilter, setGenreFilter] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [errors, setErrors] = useState<ValidationErrors>({});
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

  const genres = useMemo(() => (availableGenres && availableGenres.length > 0 ? availableGenres : defaultGenres), [availableGenres]);
  const filteredGenres = useMemo(() => genres.filter(g => g.toLowerCase().includes(genreFilter.toLowerCase())), [genreFilter, genres]);

  const toggleGenre = (g: string) => {
    setSelectedGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  // Validação e preview da capa
  useEffect(() => {
    if (!coverUrl) { setCoverValid(null); return; }
    let cancelled = false;
    setCoverLoading(true);
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const ratio = img.width / img.height;
      const ok = Math.abs(ratio - expectedRatio) < aspectTolerance && img.width >= BOOK_COVER_MIN_WIDTH && img.height >= BOOK_COVER_MIN_HEIGHT;
      setCoverValid(ok);
      setCoverLoading(false);
    };
    img.onerror = () => { if (!cancelled) { setCoverValid(false); setCoverLoading(false); } };
    img.src = coverUrl;
    return () => { cancelled = true; };
  }, [coverUrl]);

  const validate = useCallback((): ValidationErrors => {
    const v: ValidationErrors = {};
    const parsed = createBookSchema.safeParse({
      title: title.trim(),
      synopsis: synopsis.trim(),
      releaseFrequency: releaseFrequency.trim() || undefined,
      coverUrl: coverUrl.trim() || undefined,
      genres: selectedGenres
    });
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const path = issue.path[0] as keyof ValidationErrors | undefined;
        if (!path) continue;
        v[path] = issue.message;
      }
    }
    if (!coverUrl.trim()) v.coverUrl = 'É necessário uma URL da capa.';
    else if (coverValid === false) v.coverUrl = `A proporção ou tamanho é inválido (mínimo ${BOOK_COVER_MIN_WIDTH}x${BOOK_COVER_MIN_HEIGHT}, proporção 3:4).`;
    else if (coverValid !== true) v.coverUrl = 'Validando capa, aguarde...';
    return v;
  }, [title, synopsis, releaseFrequency, coverUrl, coverValid, selectedGenres]);

  useEffect(() => { setErrors(validate()); }, [title, synopsis, releaseFrequency, coverUrl, coverValid, selectedGenres, validate]);

  const canSubmit = Object.keys(errors).length === 0 && !!title.trim() && !!synopsis.trim() && selectedGenres.length > 0 && coverValid === true;

  const handleSubmit = async () => {
    setAttemptedSubmit(true);
    setConfirmSaveOpen(false);
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;

    try {
      setSubmitting(true);
      // Comentário: aqui você chamaria sua API real do backend
      await new Promise(res => setTimeout(res, 600));
      setSuccessModal(true);
    } catch (e) {
      setErrors(prev => ({ ...prev, submit: (e as Error).message }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-readowl-purple-medium rounded-3xl p-8 shadow-2xl mt-10">
      <h1 className="text-3xl font-yusei text-center mb-8 text-white">Cadastrar Novo Livro</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <CoverInput
          coverUrl={coverUrl}
          coverValid={coverValid}
          coverLoading={coverLoading}
          errors={errors}
          touched={touchedCover}
          attemptedSubmit={attemptedSubmit}
          onChange={v => setCoverUrl(v)}
          onBlur={() => setTouchedCover(true)}
          onHelp={() => setHelpOpen(true)}
        />
        <BasicFields
          title={title}
          synopsis={synopsis}
          releaseFrequency={releaseFrequency}
          errors={errors}
          touched={{ title: touchedTitle, synopsis: touchedSynopsis, frequency: touchedFrequency }}
          attemptedSubmit={attemptedSubmit}
          onTitle={v => setTitle(v)}
          onSynopsis={v => setSynopsis(v)}
          onFrequency={v => setReleaseFrequency(v)}
          onBlurTitle={() => setTouchedTitle(true)}
          onBlurSynopsis={() => setTouchedSynopsis(true)}
          onBlurFrequency={() => setTouchedFrequency(true)}
        />
      </div>
      <GenreSelector
        filteredGenres={filteredGenres}
        genreFilter={genreFilter}
        onFilter={v => setGenreFilter(v)}
        selectedGenres={selectedGenres}
        toggleGenre={toggleGenre}
        error={errors.genres}
      />

      {errors.submit && <p className="text-sm text-red-300 mt-6 text-center">{errors.submit}</p>}

      <div className="mt-4 flex items-center justify-center gap-6">
        <ButtonWithIcon
          variant="secondary"
          onClick={() => setConfirmCancelOpen(true)}
          iconUrl="/img/svg/generics/cancel2.svg"
        >Cancelar</ButtonWithIcon>
        <ButtonWithIcon
          variant="primary"
          disabled={!canSubmit || submitting}
          onClick={() => setConfirmSaveOpen(true)}
          iconUrl="/img/svg/book/checkbook.svg"
        >{submitting ? 'Salvando...' : 'Registrar'}</ButtonWithIcon>
      </div>

      {/* Modal de ajuda */}
      <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title="Como adicionar a capa" widthClass="max-w-lg">
        <p>Hospede sua imagem em um serviço (ex.: imgur), copie a URL direta e cole no campo. Tamanho mínimo {BOOK_COVER_MIN_WIDTH}x{BOOK_COVER_MIN_HEIGHT} e proporção 3:4.</p>
      </Modal>

      {/* Confirmar cancelamento */}
      <Modal open={confirmCancelOpen} onClose={() => setConfirmCancelOpen(false)} title="Cancelar criação do livro?" widthClass="max-w-sm" >
        <p>Você perderá os dados preenchidos.</p>
        <div className="flex gap-3 justify-end mt-6">
          <button onClick={() => setConfirmCancelOpen(false)} className="px-4 py-2 rounded-full text-sm bg-white text-readowl-purple border border-readowl-purple/30 hover:bg-readowl-purple-extralight">Voltar</button>
          <a href={redirectAfter} className="px-4 py-2 rounded-full text-sm bg-red-500 text-white hover:bg-red-600">Descartar</a>
        </div>
      </Modal>

      {/* Confirmar salvar */}
      <Modal open={confirmSaveOpen} onClose={() => setConfirmSaveOpen(false)} title="Confirmar registro" widthClass="max-w-sm" >
        <p>Deseja salvar este novo livro?</p>
        <div className="flex gap-3 justify-end mt-6">
          <button onClick={() => setConfirmSaveOpen(false)} className="px-4 py-2 rounded-full text-sm bg-white text-readowl-purple border border-readowl-purple/30 hover:bg-readowl-purple-extralight">Voltar</button>
          <button disabled={submitting} onClick={handleSubmit} className="px-4 py-2 rounded-full text-sm bg-readowl-purple-light text-white hover:bg-readowl-purple disabled:opacity-60 disabled:cursor-not-allowed">{submitting ? 'Salvando...' : 'Confirmar'}</button>
        </div>
      </Modal>

      {/* Sucesso */}
      <Modal open={successModal} onClose={() => { setSuccessModal(false); window.location.href = redirectAfter; }} title="Livro criado!" widthClass="max-w-sm" >
        <p>Seu livro foi criado com sucesso.</p>
        <div className="flex justify-end mt-6">
          <button onClick={() => { setSuccessModal(false); window.location.href = redirectAfter; }} className="px-4 py-2 rounded-full text-sm bg-readowl-purple-light text-white hover:bg-readowl-purple">Ir para biblioteca</button>
        </div>
      </Modal>
    </div>
  );
}
