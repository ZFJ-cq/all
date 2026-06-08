import { useItemStore } from '@/store'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

export default function ToastContainer() {
  const toasts = useItemStore((s) => s.toasts)
  const removeToast = useItemStore((s) => s.removeToast)

  if (toasts.length === 0) return null

  const iconMap = {
    success: <CheckCircle size={16} className="text-emerald-500" />,
    error: <XCircle size={16} className="text-red-400" />,
    info: <Info size={16} className="text-primary" />,
  }

  const bgMap = {
    success: 'bg-emerald-50 border-emerald-200/60',
    error: 'bg-red-50 border-red-200/60',
    info: 'bg-primary-50 border-primary-200/60',
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border shadow-lg animate-fade-in-up ${bgMap[toast.type]}`}
        >
          {iconMap[toast.type]}
          <span className="text-sm font-medium text-gray-700">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-1 w-5 h-5 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors"
          >
            <X size={12} className="text-gray-400" />
          </button>
        </div>
      ))}
    </div>
  )
}
