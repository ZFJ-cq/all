import { useStore } from '@/store';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog() {
  const { confirmAction, setConfirmAction } = useStore();

  if (!confirmAction) return null;

  const handleConfirm = () => {
    confirmAction.onConfirm();
    setConfirmAction(null);
  };

  const handleCancel = () => {
    setConfirmAction(null);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={handleCancel}>
      <div className="absolute inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm animate-fade-in" />
      <div
        className="relative w-full max-w-sm bg-white dark:bg-surface-card-dark rounded-modal shadow-modal animate-scale-in p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-morandi-pink/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-morandi-pink-dark" />
          </div>
          <p className="text-sm font-body text-text-primary dark:text-text-primary-dark">
            {confirmAction.message}
          </p>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-black/5 dark:bg-white/5 text-text-secondary dark:text-text-secondary-dark hover:bg-black/8 dark:hover:bg-white/8 transition-colors font-body"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-morandi-coral text-white hover:bg-morandi-coral-dark transition-colors font-body"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}
