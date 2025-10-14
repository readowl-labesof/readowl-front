import Modal from './modal'
import type { PropsWithChildren, ReactNode } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title?: string
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  confirmType?: 'danger' | 'primary'
  loading?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({ open, title = 'Confirmar', description, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', confirmType = 'primary', loading, onConfirm, onClose }: PropsWithChildren<ConfirmDialogProps>) {
  return (
    <Modal open={open} onClose={onClose} title={title} widthClass="max-w-sm">
      <div className="flex flex-col gap-4">
        {description && <div className="text-sm leading-relaxed">{description}</div>}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs rounded border border-readowl-purple/30 bg-white text-readowl-purple hover:bg-readowl-purple-extralight">{cancelLabel}</button>
          <button disabled={loading} onClick={onConfirm} className={`px-4 py-2 text-xs rounded text-white disabled:opacity-60 ${confirmType==='danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-readowl-purple-light hover:bg-readowl-purple'}`}>{loading ? '...' : confirmLabel}</button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
