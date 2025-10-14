import { useState } from 'react'

// Placeholder Editor para futura integração TipTap.
// Mantém interface simples agora; depois substituir por TipTap mantendo props.
export interface ChapterEditorProps {
  value: string
  onChange: (html: string) => void
  disabled?: boolean
  className?: string
}

export function ChapterEditor({ value, onChange, disabled, className = '' }: ChapterEditorProps) {
  const [local, setLocal] = useState(value)
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-readowl-purple/70">
        <span>Editor de Capítulo (HTML simples provisório)</span>
        <span className="italic opacity-70">TipTap em breve</span>
      </div>
      <textarea
        value={local}
        onChange={e => {
          setLocal(e.target.value)
          onChange(e.target.value)
        }}
        disabled={disabled}
        className="min-h-[240px] w-full rounded border border-readowl-purple/30 bg-white/80 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-readowl-purple"
        placeholder="Escreva o conteúdo do capítulo aqui..."
      />
      <div className="text-[10px] text-right opacity-60">O conteúdo será sanitizado no backend.</div>
    </div>
  )
}

export default ChapterEditor
