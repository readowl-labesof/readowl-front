import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { ChapterEditor } from '../../components/chapter/ChapterEditor'
import { Breadcrumb } from '../../components/ui/Breadcrumb'
import { useAuth } from '../../hooks/useAuth'

export default function ChapterCreatePage() {
  const { id: bookId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { token } = useAuth()
  const qc = useQueryClient()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [volumeId, setVolumeId] = useState<string | ''>('')
  const [error, setError] = useState<string | null>(null)

  const volumesQ = useQuery({ queryKey: ['book', bookId, 'volumes'], queryFn: () => api.getVolumes(bookId!), enabled: !!bookId })

  const createChapter = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error('Sem autenticação')
      return api.createChapter({ bookId: bookId!, title: title.trim(), volumeId: volumeId || undefined, content }, token)
    },
    onSuccess: (ch) => {
      qc.invalidateQueries({ queryKey: ['book', bookId, 'chapters'] })
      navigate(`/chapters/${ch.id}`)
    },
    onError: (e: unknown) => setError(e instanceof Error ? e.message : 'Erro ao criar capítulo')
  })

  const canSave = title.trim().length > 0

  // Atalho Ctrl/Cmd+S para salvar
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault()
        if (canSave && !createChapter.isPending) {
          // chama a mutação atual evitando capturar referencia instável
          createChapter.mutate()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [canSave, createChapter])

  return (
    <div className="container mx-auto max-w-4xl py-6 px-4 flex flex-col gap-6">
      <Breadcrumb showHome items={[{ label: 'Livro', href: `/books/${bookId}` }, { label: 'Novo Capítulo' }]} />
      <h1 className="text-2xl font-bold text-readowl-purple">Novo Capítulo</h1>
      <form onSubmit={e => { e.preventDefault(); if (canSave) createChapter.mutate() }} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Título</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-readowl-purple" placeholder="Título do capítulo" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Volume (opcional)</label>
          <select value={volumeId} onChange={e => setVolumeId(e.target.value)} className="rounded border px-3 py-2 text-sm bg-white">
            <option value="">— Sem volume —</option>
            {volumesQ.data?.sort((a,b)=>(a.order||0)-(b.order||0)).map(v => (
              <option key={v.id} value={v.id}>{v.title || v.name || 'Volume'}</option>
            ))}
          </select>
        </div>
        <ChapterEditor value={content} onChange={setContent} />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 text-sm rounded border hover:bg-readowl-purple-extralight">Cancelar</button>
          <button disabled={!canSave || createChapter.isPending} className="px-4 py-2 text-sm rounded bg-readowl-purple text-white disabled:opacity-60">{createChapter.isPending ? 'Salvando...' : 'Salvar'}</button>
        </div>
      </form>
    </div>
  )
}
