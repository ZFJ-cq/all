import { useStore } from '@/store';
import { cn } from '@/lib/utils';

export default function Toast() {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'px-5 py-2.5 rounded-xl shadow-card text-sm font-body font-medium animate-toast-in pointer-events-auto',
            toast.type === 'success' && 'bg-morandi-blue-dark text-white',
            toast.type === 'error' && 'bg-morandi-pink-dark text-white',
            toast.type === 'info' && 'bg-surface-card-dark text-text-primary-dark',
          )}
          onClick={() => removeToast(toast.id)}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
