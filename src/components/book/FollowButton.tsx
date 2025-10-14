import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Icon } from '../ui/Icon'

interface Props {
  bookId: string
  token?: string | null
  following: boolean
}

export function FollowButton({ bookId, token, following }: Props) {
  const qc = useQueryClient()
  const mutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error('Precisa logar')
      if (following) return api.unfollow(bookId, token)
      return api.follow(bookId, token)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['book', bookId, 'follow'] })
    }
  })

  return (
    <button
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending || !token}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition border ${following ? 'bg-readowl-purple-extralight text-readowl-purple border-readowl-purple' : 'bg-white text-readowl-purple border-readowl-purple hover:bg-readowl-purple-extralight/40'}`}
    >
      <Icon name={following ? 'UserMinus' : 'UserPlus'} size={18} />
      {following ? 'Seguindo' : 'Seguir'}
    </button>
  )
}
