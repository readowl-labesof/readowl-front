import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Icon } from '../ui/Icon'

interface Props {
  bookId: string
  token?: string | null
  summary?: { average: number; total: number; distribution: Record<string, number> }
}

export function RatingSummary({ bookId, token, summary }: Props) {
  const qc = useQueryClient()
  const mutation = useMutation({
    mutationFn: async (value: number) => {
      if (!token) throw new Error('Precisa logar')
      return api.rate(bookId, value, token)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['book', bookId, 'rating'] })
    }
  })

  if (!summary) return null
  const avg = summary.average?.toFixed(1) || '0.0'

  // Criar lista ordenada 5..1
  const rows = [5,4,3,2,1].map(star => {
    const count = summary.distribution?.[String(star)] || 0
    const percent = summary.total ? (count / summary.total) * 100 : 0
    return { star, count, percent }
  })

  return (
    <div className="bg-white rounded-lg border p-4 w-full max-w-md">
      <div className="flex items-center gap-4 mb-4">
        <div className="text-3xl font-bold text-readowl-purple">{avg}</div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Icon key={i} name={i < Math.round(summary.average) ? 'Star' : 'Star'} size={20} className={i < Math.round(summary.average) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
          ))}
        </div>
        <span className="text-xs text-gray-500">{summary.total} avaliações</span>
      </div>
      <div className="flex flex-col gap-1 mb-4">
        {rows.map(r => (
          <div key={r.star} className="flex items-center gap-2 text-xs">
            <span className="w-5">{r.star}</span>
            <div className="flex-1 h-2 bg-gray-200 rounded">
              <div className="h-2 bg-yellow-500 rounded" style={{ width: `${r.percent}%` }} />
            </div>
            <span className="w-8 text-right">{r.count}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-1">
        {[1,2,3,4,5].map(v => (
          <button
            key={v}
            onClick={() => mutation.mutate(v)}
            disabled={mutation.isPending || !token}
            className={`p-2 rounded hover:bg-yellow-100 transition ${!token ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={`Avaliar ${v}`}
          >
            <Icon name="Star" size={22} className={v <= Math.round(summary.average) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
          </button>
        ))}
      </div>
    </div>
  )
}
