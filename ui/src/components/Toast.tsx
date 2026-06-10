import { create } from 'zustand'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  title: string
  description?: string
  type: ToastType
}

interface ToastStore {
  toasts: Toast[]
  toast: (title: string, description?: string, type?: ToastType) => void
  dismiss: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  toast: (title, description, type = 'info') => {
    const id = Math.random().toString(36).slice(2, 9)
    set((state) => ({ toasts: [...state.toasts, { id, title, description, type }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }))
    }, 5000)
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }))
}))

export const ToastProvider = () => {
  const { toasts, dismiss } = useToastStore()

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto bg-card border border-border rounded-xl shadow-lg p-4 flex gap-4 items-start w-full relative"
          >
            <div className="mt-0.5 flex-shrink-0">
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
              {t.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-indigo-500" />}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold display-text">{t.title}</h4>
              {t.description && <p className="text-sm text-muted-foreground mt-1 leading-snug">{t.description}</p>}
            </div>
            <button 
              onClick={() => dismiss(t.id)} 
              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              aria-label="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
