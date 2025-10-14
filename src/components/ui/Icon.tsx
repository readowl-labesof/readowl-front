import * as Icons from 'lucide-react'
import type { ComponentType } from 'react'
import type { LucideProps } from 'lucide-react'

// Componente de ícone unificado para facilitar troca futura e padronização de tamanho/cor
export interface IconProps {
  name: keyof typeof Icons
  size?: number
  className?: string
  strokeWidth?: number
}

export function Icon({ name, size = 20, className = '', strokeWidth = 2 }: IconProps) {
  const Comp = Icons[name] as unknown as ComponentType<LucideProps>
  if (!Comp) return null
  return <Comp size={size} strokeWidth={strokeWidth} className={className} />
}
