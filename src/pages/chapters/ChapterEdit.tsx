import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { ChapterEditor } from '../../components/chapter/ChapterEditor'
import { Breadcrumb } from '../../components/ui/Breadcrumb'
import { useAuth } from '../../hooks/useAuth'

interface ChapterFull { id: string; title: string; content?: string; volumeId?: string | null; bookId?: string }

export default function ChapterEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { token } = useAuth()
  const qc = useQueryClient()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [volumeId, setVolumeId] = useState<string | ''>('')
  const [error, setError] = useState<string | null>(null)

  const chapterQ = useQuery({ queryKey: ['chapter', id], queryFn: async (): Promise<ChapterFull> => {
    const data = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/chapters/${id}`).then(r=>r.json())
    return data
  }, enabled: !!id })

  const volumesQ = useQuery({ queryKey: ['book', chapterQ.data?.bookId, 'volumes'], queryFn: () => api.getVolumes(chapterQ.data!.bookId!), enabled: !!chapterQ.data?.bookId })

  useEffect(()=>{
    if (chapterQ.data) {
      setTitle(chapterQ.data.title)
      setContent(chapterQ.data.content || '')
      setVolumeId(chapterQ.data.volumeId || '')
    }
  },[chapterQ.data])

  const updateChapter = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error('Sem autenticação')
      return api.updateChapter(id!, { title: title.trim(), content, volumeId: volumeId || null }, token)
    },
    onSuccess: (ch) => {
      qc.invalidateQueries({ queryKey: ['chapter', id] })
      qc.invalidateQueries({ queryKey: ['book', ch.bookId, 'chapters'] })
      navigate(`/chapters/${id}`)
    },
    onError: (e: unknown) => setError(e instanceof Error ? e.message : 'Erro ao salvar capítulo')
  })

  const canSave = title.trim().length > 0

  if (chapterQ.isLoading) return <div className="p-8">Carregando...</div>
  if (chapterQ.error || !chapterQ.data) return <div className="p-8 text-red-500">Erro ao carregar capítulo.</div>

  return (
    <div className="container mx-auto max-w-4xl py-6 px-4 flex flex-col gap-6">
      <Breadcrumb showHome items={[{ label: 'Livro', href: `/books/${chapterQ.data.bookId}` }, { label: chapterQ.data.title, href: `/chapters/${chapterQ.data.id}` }, { label: 'Editar' }]} />
      <h1 className="text-2xl font-bold text-readowl-purple">Editar Capítulo</h1>
      <form onSubmit={e => { e.preventDefault(); if (canSave) updateChapter.mutate() }} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Título</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-readowl-purple" />
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
          <button disabled={!canSave || updateChapter.isPending} className="px-4 py-2 text-sm rounded bg-readowl-purple text-white disabled:opacity-60">{updateChapter.isPending ? 'Salvando...' : 'Salvar alterações'}</button>
        </div>
      </form>
    </div>
  )
}
