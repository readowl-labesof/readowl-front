import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'
import { FollowButton } from '../../components/book/FollowButton'
import { RatingSummary } from '../../components/book/RatingSummary'
import { Icon } from '../../components/ui/Icon'
import { Breadcrumb } from '../../components/ui/Breadcrumb'
import { Link, useNavigate } from 'react-router-dom'

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { token } = useAuth()
  const navigate = useNavigate()

  const bookQ = useQuery({ queryKey: ['book', id], queryFn: () => api.getBook(id!) , enabled: !!id })
  const volumesQ = useQuery({ queryKey: ['book', id, 'volumes'], queryFn: () => api.getVolumes(id!), enabled: !!id })
  const chaptersQ = useQuery({ queryKey: ['book', id, 'chapters'], queryFn: () => api.getChapters(id!), enabled: !!id })
  const followQ = useQuery({ queryKey: ['book', id, 'follow'], queryFn: () => api.followStatus(id!, token!), enabled: !!id && !!token })
  const ratingQ = useQuery({ queryKey: ['book', id, 'rating'], queryFn: () => api.ratingSummary(id!), enabled: !!id })

  if (bookQ.isLoading) return <div className="p-8">Carregando...</div>
  if (bookQ.error) return <div className="p-8 text-red-500">Erro ao carregar livro</div>

  const book = bookQ.data
  const following = !!followQ.data?.following
  const summary = ratingQ.data

  // Capítulos sem volume
  const chaptersNoVolume = (chaptersQ.data || []).filter(c => !c.volumeId)

  return (
    <div className="container mx-auto py-8 px-4 flex flex-col gap-8">
      <Breadcrumb
        items={[{ label: book?.title || 'Livro' }]}
        showHome
        homeHref="/home"
        className="mt-2"
      />
      {token && (
        <div className="flex flex-wrap gap-3 items-center text-sm">
          <Link to={`/books/${id}/chapters/new`} className="px-3 py-1 rounded bg-readowl-purple text-white hover:bg-readowl-purple-dark transition">Novo Capítulo</Link>
          <Link to={`/books/${id}/reorder`} className="px-3 py-1 rounded border border-readowl-purple/40 hover:bg-readowl-purple-extralight transition">Reordenar</Link>
          <button onClick={()=> navigate(`/library/${id}/edit`)} className="px-3 py-1 rounded border border-readowl-purple/40 hover:bg-readowl-purple-extralight transition">Editar Livro</button>
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-56">
          {book?.coverUrl ? (
            <img src={book.coverUrl} alt={book.title} className="rounded-lg shadow" />
          ) : (
            <div className="w-full aspect-[3/4] bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
              <Icon name="BookOpen" size={64} />
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-readowl-purple">{book?.title || 'Livro'}</h1>
          <div className="flex flex-wrap gap-3 items-center">
            <FollowButton bookId={id!} token={token} following={following} />
          </div>
          {book?.synopsis && (
            <div className="prose max-w-none text-sm leading-relaxed bg-white/60 p-4 rounded">
              {book.synopsis}
            </div>
          )}
          <RatingSummary bookId={id!} token={token} summary={summary} />
        </div>
      </div>

      {/* Volumes */}
      <div className="flex flex-col gap-4">
        {volumesQ.data && volumesQ.data.length > 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-readowl-purple">Volumes</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {volumesQ.data.sort((a,b)=> (a.order||0) - (b.order||0)).map(v => {
                const vc = (chaptersQ.data||[]).filter(c => c.volumeId === v.id).sort((a,b)=>(a.order||0)-(b.order||0))
                return (
                  <div key={v.id} className="bg-white rounded-lg border p-4 flex flex-col gap-2 group">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium">{v.title || v.name || 'Volume'}</div>
                      {token && (
                        <button onClick={async ()=> { try { await api.deleteVolume(v.id, token); volumesQ.refetch(); chaptersQ.refetch() } catch(e){ console.error(e) } }} className="opacity-0 group-hover:opacity-100 text-[10px] px-2 py-1 rounded bg-red-600 text-white transition">Excluir</button>
                      )}
                    </div>
                    {vc.length === 0 && <div className="text-xs text-gray-500">Este volume ainda não possui capítulos.</div>}
                    <ul className="flex flex-col gap-1 text-sm">
                      {vc.map(ch => (
                        <li key={ch.id} className="flex items-center gap-2 group">
                          <Icon name="FileText" size={16} className="text-readowl-purple" />
                          <a className="hover:underline flex-1" href={`/chapters/${ch.id}`}>{ch.title}</a>
                          {token && (
                            <button onClick={async ()=> { try { await api.deleteChapter(ch.id, token); chaptersQ.refetch() } catch(e){ console.error(e) } }} className="opacity-0 group-hover:opacity-100 text-[10px] px-2 py-0.5 rounded bg-red-600 text-white transition">Del</button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Capítulos sem volume */}
        {chaptersNoVolume.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-readowl-purple">Capítulos</h2>
            <ul className="flex flex-col gap-1 text-sm bg-white rounded-lg border p-4">
              {chaptersNoVolume.sort((a,b)=>(a.order||0)-(b.order||0)).map(ch => (
                <li key={ch.id} className="flex items-center gap-2 group">
                  <Icon name="FileText" size={16} className="text-readowl-purple" />
                  <a className="hover:underline flex-1" href={`/chapters/${ch.id}`}>{ch.title}</a>
                  {token && (
                    <button onClick={async ()=> { try { await api.deleteChapter(ch.id, token); chaptersQ.refetch() } catch(e){ console.error(e) } }} className="opacity-0 group-hover:opacity-100 text-[10px] px-2 py-0.5 rounded bg-red-600 text-white transition">Del</button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
