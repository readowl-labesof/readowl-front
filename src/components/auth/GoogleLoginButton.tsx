import { api } from '../../lib/api'
import { Icon } from '../ui/Icon'

interface Props {
  className?: string
  label?: string
}

export function GoogleLoginButton({ className = '', label = 'Entrar com Google' }: Props) {
  async function handleClick() {
    try {
      const { url } = await api.googleAuthUrl()
      window.location.href = url
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao iniciar OAuth')
    }
  }
  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex items-center justify-center gap-2 w-full rounded-full border border-readowl-purple bg-white text-readowl-purple font-medium py-2 hover:bg-readowl-purple-light/10 transition ${className}`}
    >
      <Icon name="Mail" size={18} />
      {label}
    </button>
  )
}
