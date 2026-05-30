import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

const ToastContext = createContext(null)

function buildToast(message, type) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    message,
    type,
  }
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef(new Map())

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))

    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
  }, [])

  const pushToast = useCallback(
    (type, message, duration = 3500) => {
      if (!message) return

      const toast = buildToast(message, type)
      setToasts((current) => [...current, toast])

      const timer = setTimeout(() => {
        removeToast(toast.id)
      }, duration)

      timersRef.current.set(toast.id, timer)
    },
    [removeToast]
  )

  const value = useMemo(
    () => ({
      success: (message, duration) => pushToast('success', message, duration),
      error: (message, duration) => pushToast('error', message, duration),
      info: (message, duration) => pushToast('info', message, duration),
    }),
    [pushToast]
  )

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer))
      timersRef.current.clear()
    }
  }, [])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-2xl shadow-black/30 backdrop-blur transition-all duration-300 ${
              toast.type === 'success'
                ? 'border-emerald-400/20 bg-emerald-500/15 text-emerald-100'
                : toast.type === 'error'
                  ? 'border-red-400/20 bg-red-500/15 text-red-100'
                  : 'border-cyan-400/20 bg-cyan-500/15 text-cyan-100'
            }`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium leading-6">{toast.message}</p>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="rounded-full px-2 text-lg leading-none opacity-70 transition hover:opacity-100"
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used inside a ToastProvider')
  }

  return context
}