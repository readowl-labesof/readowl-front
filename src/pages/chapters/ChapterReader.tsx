import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import type { ChapterDTO } from '../../lib/api'
import { Icon } from '../../components/ui/Icon'
import { Breadcrumb } from '../../components/ui/Breadcrumb'
import { useAuth } from '../../hooks/useAuth'

interface ChapterFull extends ChapterDTO {
  content?: string
  book?: { id: string; title: string }
  volume?: { id: string; title?: string; name?: string }
}

export default function ChapterReaderPage() {
  const { id } = useParams<{ id: string }>()
  useAuth() // apenas para garantir contexto (ex: futura proteção / preferências)
  const [dark, setDark] = useState(false)

  // Carrega capítulo completo
  const chapterQ = useQuery({
    queryKey: ['chapter', id],
    queryFn: async () => {
      const data = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/chapters/${id}`).then(r => r.json()) as ChapterFull
      return data
    },
    enabled: !!id
  })

  // Lista de capítulos do livro (para prev/next)
  const chaptersListQ = useQuery({
    queryKey: ['book', chapterQ.data?.book?.id, 'chapters'],
    queryFn: () => api.getChapters(chapterQ.data!.book!.id),
    enabled: !!chapterQ.data?.book?.id
  })

  const orderedChapters = useMemo(() => chaptersListQ.data || [], [chaptersListQ.data])
  const index = useMemo(() => orderedChapters.findIndex(c => c.id === id), [orderedChapters, id])
  const prev = index > 0 ? orderedChapters[index - 1] : undefined
  const next = index >= 0 && index < orderedChapters.length - 1 ? orderedChapters[index + 1] : undefined

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  if (chapterQ.isLoading) return <div className="p-8">Carregando capítulo...</div>
  if (chapterQ.error || !chapterQ.data) return <div className="p-8 text-red-500">Erro ao carregar capítulo.</div>
  const chapter = chapterQ.data

  return (
    <div className={`min-h-screen ${dark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'} transition-colors`}>      
      <div className="container mx-auto px-4 py-4 flex items-center justify-between text-sm">
        <Breadcrumb
          items={[
            { label: chapter.book?.title || 'Livro', href: `/books/${chapter.book?.id}` },
            ...(chapter.volume ? [{ label: chapter.volume.title || chapter.volume.name || 'Volume' }]: []),
            { label: chapter.title }
          ]}
          showHome
          homeHref="/home"
          className="flex-1"
        />
        <div>
          <button onClick={() => setDark(d => !d)} className="flex items-center gap-1 px-3 py-1 rounded-full border text-xs hover:bg-white/10">
            <Icon name={dark ? 'Sun' : 'Moon'} size={14} /> {dark ? 'Claro' : 'Escuro'}
          </button>
        </div>
      </div>

      <main className="container mx-auto px-4 pb-12 flex flex-col gap-8 max-w-4xl">
        <header className="flex flex-col gap-2 mt-4">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Icon name="FileText" /> {chapter.title}</h1>
          {chapter.volume && <span className="text-xs opacity-70">{chapter.volume.title || chapter.volume.name}</span>}
        </header>
        <article className="prose dark:prose-invert max-w-none bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-sm leading-relaxed">
          {/* Conteúdo já sanitizado no backend */}
          <div dangerouslySetInnerHTML={{ __html: chapter.content || '' }} />
        </article>
        <nav className="flex items-center justify-between gap-4 text-sm">
          {prev ? (
            <Link to={`/chapters/${prev.id}`} className="flex items-center gap-2 px-4 py-2 rounded-full border hover:bg-readowl-purple-extralight/40 transition">
              <Icon name="ArrowLeft" size={16} /> {prev.title}
            </Link>
          ) : <span />}
          {next ? (
            <Link to={`/chapters/${next.id}`} className="flex items-center gap-2 px-4 py-2 rounded-full border hover:bg-readowl-purple-extralight/40 transition">
              {next.title} <Icon name="ArrowRight" size={16} />
            </Link>
          ) : <span />}
        </nav>
      </main>
    </div>
  )
}