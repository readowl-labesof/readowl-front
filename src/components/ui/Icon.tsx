import * as Icons from 'lucide-react'

// Componente de ícone unificado para facilitar troca futura e padronização de tamanho/cor
export interface IconProps {
  name: keyof typeof Icons
  size?: number
  className?: string
  strokeWidth?: number
}

export function Icon({ name, size = 20, className = '', strokeWidth = 2 }: IconProps) {
  const LucideIcon = Icons[name]
  if (!LucideIcon) return null
  return <LucideIcon size={size} strokeWidth={strokeWidth} className={className} />
}

// Helper para mapear nomes antigos para novos, se necessário no futuro
export const legacyIconMap: Record<string, keyof typeof Icons> = {
  home: 'Home',
  search: 'Search',
  book: 'BookOpen',
  user: 'User',
  star: 'Star',
  login: 'LogIn',
  logout: 'LogOut',
  edit: 'Pencil',
  delete: 'Trash2',
  plus: 'Plus',
}
