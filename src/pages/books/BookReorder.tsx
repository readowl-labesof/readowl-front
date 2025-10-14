import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from '../../lib/api'
import type { VolumeDTO, ChapterDTO } from '../../lib/api'
import { Breadcrumb } from '../../components/ui/Breadcrumb'
import { useAuth } from '../../hooks/useAuth'

interface ChapterRow extends ChapterDTO { tempOrder?: number }
interface VolumeRow extends VolumeDTO { tempOrder?: number }

export default function BookReorderPage() {
  const { id: bookId } = useParams<{ id: string }>()
  const { token } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const volumesQ = useQuery({ queryKey: ['book', bookId, 'volumes'], queryFn: () => api.getVolumes(bookId!), enabled: !!bookId })
  const chaptersQ = useQuery({ queryKey: ['book', bookId, 'chapters'], queryFn: () => api.getChapters(bookId!), enabled: !!bookId })

  const [volumesLocal, setVolumesLocal] = useState<VolumeRow[]>([])
  const [chaptersLocal, setChaptersLocal] = useState<ChapterRow[]>([])

  // Inicializa tempOrder quando dados carregam
  // Inicialização única baseada em dados carregados
  if (volumesQ.data && volumesLocal.length === 0) {
    setVolumesLocal(volumesQ.data.map(v=> ({ ...v, tempOrder: v.order ?? 0 })))
  }
  if (chaptersQ.data && chaptersLocal.length === 0) {
    setChaptersLocal(chaptersQ.data.map(c=> ({ ...c, tempOrder: c.order ?? 0 })))
  }

  const reorderVolumes = useMutation({
    mutationFn: async (pairs: { id: string; order: number }[]) => api.reorderVolumes(pairs, token!),
    onError: (e: unknown) => setError(e instanceof Error ? e.message : 'Erro ao reordenar volumes')
  })
  const reorderChapters = useMutation({
    mutationFn: async (groups: { volumeId?: string | null; chapters: { id: string; order: number }[] }[]) => api.reorderChapters(groups, token!),
    onError: (e: unknown) => setError(e instanceof Error ? e.message : 'Erro ao reordenar capítulos')
  })

  const saving = reorderVolumes.isPending || reorderChapters.isPending
  const disabled = !token

  const handleSave = async () => {
    if (!token) return
    setError(null)
    const volumePairs = volumesLocal.map(v=> ({ id: v.id, order: v.tempOrder ?? 0 }))
    const byVolume: Record<string, { id: string; order: number }[]> = {}
    const noVolume: { id: string; order: number }[] = []
    chaptersLocal.forEach(c => {
      const entry = { id: c.id, order: c.tempOrder ?? 0 }
      if (c.volumeId) {
        if (!byVolume[c.volumeId]) byVolume[c.volumeId] = []
        byVolume[c.volumeId].push(entry)
      } else {
        noVolume.push(entry)
      }
    })
    await reorderVolumes.mutateAsync(volumePairs)
    const groups = [
      ...Object.entries(byVolume).map(([volumeId, chapters]) => ({ volumeId, chapters })),
      { volumeId: null, chapters: noVolume }
    ]
    await reorderChapters.mutateAsync(groups)
    qc.invalidateQueries({ queryKey: ['book', bookId, 'volumes'] })
    qc.invalidateQueries({ queryKey: ['book', bookId, 'chapters'] })
    navigate(`/books/${bookId}`)
  }

  return (
    <div className="container mx-auto max-w-5xl py-6 px-4 flex flex-col gap-6">
      <Breadcrumb showHome items={[{ label: 'Livro', href: `/books/${bookId}` }, { label: 'Reordenar' }]} />
      <h1 className="text-2xl font-bold text-readowl-purple">Reordenar Volumes & Capítulos</h1>
      {!token && <p className="text-sm text-red-500">É necessário estar autenticado.</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="grid md:grid-cols-2 gap-8">
        <section className="flex flex-col gap-3">
          <h2 className="font-semibold text-readowl-purple">Volumes</h2>
          {volumesLocal.length === 0 && <p className="text-xs opacity-60">Sem volumes.</p>}
          <ul className="flex flex-col gap-2">
            {volumesLocal.sort((a,b)=>(a.tempOrder??0)-(b.tempOrder??0)).map(v => (
              <li key={v.id} className="flex items-center gap-2 text-sm bg-white rounded border p-2">
                <input type="number" value={v.tempOrder} onChange={e => setVolumesLocal(curr => curr.map(c => c.id===v.id? { ...c, tempOrder: Number(e.target.value) }: c))} className="w-16 rounded border px-2 py-1 text-xs" />
                <span className="flex-1 truncate">{v.title || v.name || 'Volume'}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="flex flex-col gap-3">
          <h2 className="font-semibold text-readowl-purple">Capítulos</h2>
          {chaptersLocal.length === 0 && <p className="text-xs opacity-60">Sem capítulos.</p>}
          <ul className="flex flex-col gap-2 max-h-[520px] overflow-auto pr-1">
            {chaptersLocal.sort((a,b)=>(a.tempOrder??0)-(b.tempOrder??0)).map(c => (
              <li key={c.id} className="flex items-center gap-2 text-sm bg-white rounded border p-2">
                <input type="number" value={c.tempOrder} onChange={e => setChaptersLocal(curr => curr.map(cc => cc.id===c.id? { ...cc, tempOrder: Number(e.target.value) }: cc))} className="w-16 rounded border px-2 py-1 text-xs" />
                <span className="flex-1 truncate">{c.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-readowl-purple-extralight/60">{c.volumeId ? 'V' : '—'}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <div className="flex justify-end gap-3">
        <Link to={`/books/${bookId}`} className="px-4 py-2 text-sm rounded border hover:bg-readowl-purple-extralight">Voltar</Link>
        <button disabled={disabled || saving} onClick={handleSave} className="px-4 py-2 text-sm rounded bg-readowl-purple text-white disabled:opacity-50">{saving? 'Salvando...' : 'Aplicar'}</button>
      </div>
      <p className="text-[11px] opacity-60">Interface simples de reordenação numérica. Valores menores aparecem primeiro. Recomenda-se distribuir (10,20,30,...) para facilitar inserções futuras.</p>
    </div>
  )
}