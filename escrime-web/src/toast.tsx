import { useState, useCallback } from 'react'

export type ToastType = 'error' | 'warning' | 'success' | 'info'

export interface Toast {
  id: number
  message: string
  type: ToastType
}

let nextId = 0

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++nextId
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toasts, addToast, removeToast }
}

const ICONS: Record<ToastType, string> = {
  error:   '✖',
  warning: '⚠',
  success: '✔',
  info:    'ℹ',
}

interface ToasterProps {
  toasts: Toast[]
  onRemove: (id: number) => void
}

export function Toaster({ toasts, onRemove }: ToasterProps) {
  return (
    <div className="toaster" aria-live="polite">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`toast toast--${toast.type}`}
          role="alert"
        >
          <span className="toast__icon">{ICONS[toast.type]}</span>
          <span className="toast__message">{toast.message}</span>
          <button
            className="toast__close"
            onClick={() => onRemove(toast.id)}
            aria-label="Fermer"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
