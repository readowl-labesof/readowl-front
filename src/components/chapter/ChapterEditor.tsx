import { useEffect } from 'react'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'

export interface ChapterEditorProps {
  value: string
  onChange: (html: string) => void
  disabled?: boolean
  className?: string
  maxChars?: number
}

export function ChapterEditor({ value, onChange, disabled, className = '', maxChars = 50000 }: ChapterEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2,3,4] },
      }),
      Link.configure({ openOnClick: true, HTMLAttributes: { rel: 'noopener noreferrer', class: 'text-readowl-purple underline' } }),
      Placeholder.configure({ placeholder: 'Escreva o conteúdo do capítulo...' }),
      CharacterCount.configure({ limit: maxChars })
    ],
    content: value || '',
    editable: !disabled,
    // onUpdate tipagem simplificada: Editor vem de @tiptap/react
    onUpdate({ editor }: { editor: Editor }) {
      const html = editor.getHTML()
      onChange(html)
    }
  })

  // Sincroniza mudanças externas (ex: carregar capítulo existente)
  useEffect(()=> {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false)
    }
  }, [value, editor])

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex flex-wrap items-center gap-2 rounded border border-readowl-purple/30 bg-white/70 p-2">
        <ToolbarButton editor={editor} command={()=> editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')} label="B" />
        <ToolbarButton editor={editor} command={()=> editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')} label="I" />
        <ToolbarButton editor={editor} command={()=> editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')} label="• Lista" />
        <ToolbarButton editor={editor} command={()=> editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')} label="1. Lista" />
        <ToolbarButton editor={editor} command={()=> editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive('heading', { level: 2 })} label="H2" />
        <ToolbarButton editor={editor} command={()=> editor?.chain().focus().toggleHeading({ level: 3 }).run()} active={editor?.isActive('heading', { level: 3 })} label="H3" />
        <ToolbarButton editor={editor} command={()=> editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive('blockquote')} label="❝" />
        <ToolbarButton editor={editor} command={()=> editor?.chain().focus().setHorizontalRule().run()} label="HR" />
        <ToolbarButton editor={editor} command={()=> editor?.chain().focus().undo().run()} label="↺" />
        <ToolbarButton editor={editor} command={()=> editor?.chain().focus().redo().run()} label="↻" />
        <ToolbarButton editor={editor} command={()=> {
          const url = window.prompt('URL do link:')
          if (url) editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
        }} active={editor?.isActive('link')} label="Link" />
        {editor && (
          <span className="ml-auto text-[10px] text-readowl-purple/60">
            {editor.storage.characterCount.characters()}/{maxChars}
          </span>
        )}
      </div>
      <div className="min-h-[260px] rounded border border-readowl-purple/30 bg-white/90 p-3 prose prose-sm max-w-none focus:outline-none">
        <EditorContent editor={editor} />
      </div>
      <div className="text-[10px] text-right opacity-60">O conteúdo é sanitizado no backend. Limite de {maxChars.toLocaleString('pt-BR')} caracteres.</div>
    </div>
  )
}

interface ToolbarButtonProps { editor: Editor | null; command: ()=>void; label: string; active?: boolean }
function ToolbarButton({ editor, command, label, active }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={command}
      disabled={!editor}
      className={`px-2 py-1 text-[11px] rounded border border-readowl-purple/30 hover:bg-readowl-purple-extralight transition ${active ? 'bg-readowl-purple text-white border-readowl-purple' : 'bg-white text-readowl-purple'}`}
    >{label}</button>
  )
}

export default ChapterEditor
