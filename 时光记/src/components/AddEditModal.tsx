import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { CATEGORIES } from '@/types';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';

interface FormData {
  title: string;
  type: 'countdown' | 'anniversary';
  date: string;
  category: string;
  note: string;
}

const defaultForm: FormData = {
  title: '',
  type: 'countdown',
  date: '',
  category: 'life',
  note: '',
};

export default function AddEditModal() {
  const { showAddModal, setShowAddModal, editingItem, setEditingItem, addDate, updateDate, settings, addCustomCategory } = useStore();
  const [form, setForm] = useState<FormData>(defaultForm);
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setForm({
        title: editingItem.title,
        type: editingItem.type,
        date: editingItem.date,
        category: editingItem.category,
        note: editingItem.note,
      });
    } else {
      setForm(defaultForm);
    }
    setCustomInput('');
    setShowCustomInput(false);
  }, [editingItem, showAddModal]);

  if (!showAddModal) return null;

  const isEdit = !!editingItem;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) return;

    if (isEdit) {
      updateDate(editingItem.id, {
        title: form.title.trim(),
        type: form.type,
        date: form.date,
        category: form.category,
        note: form.note.trim(),
      });
    } else {
      addDate({
        title: form.title.trim(),
        type: form.type,
        date: form.date,
        category: form.category,
        note: form.note.trim(),
      });
    }
    handleClose();
  };

  const handleClose = () => {
    setShowAddModal(false);
    setEditingItem(null);
    setForm(defaultForm);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm animate-fade-in" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md bg-white dark:bg-surface-card-dark rounded-modal shadow-modal animate-scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 className="font-display font-bold text-lg text-text-primary dark:text-text-primary-dark">
            {isEdit ? '编辑日期' : '添加日期'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary dark:text-text-secondary-dark" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6">
          {/* Type toggle */}
          <div className="flex gap-2 mb-5">
            <button
              type="button"
              onClick={() => setForm({ ...form, type: 'countdown' })}
              className={cn(
                'flex-1 py-2.5 rounded-xl text-sm font-display font-semibold transition-all',
                form.type === 'countdown'
                  ? 'bg-morandi-blue text-white shadow-sm'
                  : 'bg-morandi-blue/10 dark:bg-morandi-blue/20 text-morandi-blue-dark dark:text-morandi-blue-light'
              )}
            >
              倒数日
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, type: 'anniversary' })}
              className={cn(
                'flex-1 py-2.5 rounded-xl text-sm font-display font-semibold transition-all',
                form.type === 'anniversary'
                  ? 'bg-morandi-pink text-white shadow-sm'
                  : 'bg-morandi-pink/10 dark:bg-morandi-pink/20 text-morandi-pink-dark dark:text-morandi-pink-light'
              )}
            >
              纪念日
            </button>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label htmlFor="modal-title" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1.5 font-body">
              标题
            </label>
            <input
              id="modal-title"
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="给这个日期起个名字"
              className="w-full px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-transparent text-text-primary dark:text-text-primary-dark placeholder:text-text-secondary/50 focus:outline-none focus:border-morandi-blue dark:focus:border-morandi-blue-light focus:ring-2 focus:ring-morandi-blue/20 transition-all font-body text-sm"
              required
            />
          </div>

          {/* Date */}
          <div className="mb-4">
            <label htmlFor="modal-date" className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1.5 font-body">
              日期
            </label>
            <input
              id="modal-date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-transparent text-text-primary dark:text-text-primary-dark focus:outline-none focus:border-morandi-blue dark:focus:border-morandi-blue-light focus:ring-2 focus:ring-morandi-blue/20 transition-all font-body text-sm"
              required
            />
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1.5 font-body">
              分类
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.filter((c) => c.id !== 'all' && c.id !== 'custom').map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => { setForm({ ...form, category: cat.id }); setShowCustomInput(false); }}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                    form.category === cat.id
                      ? 'text-white shadow-sm'
                      : 'text-text-secondary dark:text-text-secondary-dark bg-black/5 dark:bg-white/5'
                  )}
                  style={
                    form.category === cat.id
                      ? { backgroundColor: cat.color }
                      : undefined
                  }
                >
                  {cat.label}
                </button>
              ))}
              {/* Custom categories */}
              {settings.customCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => { setForm({ ...form, category: cat.id }); setShowCustomInput(false); }}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                    form.category === cat.id
                      ? 'text-white shadow-sm'
                      : 'text-text-secondary dark:text-text-secondary-dark bg-black/5 dark:bg-white/5'
                  )}
                  style={
                    form.category === cat.id
                      ? { backgroundColor: cat.color }
                      : undefined
                  }
                >
                  {cat.label}
                </button>
              ))}
              {/* Add custom button */}
              <button
                type="button"
                onClick={() => setShowCustomInput(!showCustomInput)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1',
                  showCustomInput
                    ? 'bg-morandi-coral text-white shadow-sm'
                    : 'text-text-secondary dark:text-text-secondary-dark bg-black/5 dark:bg-white/5'
                )}
              >
                <Plus className="w-3 h-3" />
                自定义
              </button>
            </div>
            {/* Custom category input */}
            {showCustomInput && (
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="输入自定义分类名称"
                  className="flex-1 px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-transparent text-text-primary dark:text-text-primary-dark placeholder:text-text-secondary/50 focus:outline-none focus:border-morandi-blue dark:focus:border-morandi-blue-light text-xs font-body"
                  maxLength={10}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customInput.trim()) {
                      e.preventDefault();
                      const newCat = addCustomCategory(customInput.trim());
                      setForm({ ...form, category: newCat.id });
                      setCustomInput('');
                      setShowCustomInput(false);
                    }
                  }}
                />
                <button
                  type="button"
                  disabled={!customInput.trim()}
                  onClick={() => {
                    if (customInput.trim()) {
                      const newCat = addCustomCategory(customInput.trim());
                      setForm({ ...form, category: newCat.id });
                      setCustomInput('');
                      setShowCustomInput(false);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-morandi-coral text-white text-xs font-medium disabled:opacity-40 transition-all"
                >
                  添加
                </button>
              </div>
            )}
          </div>

          {/* Note */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-1.5 font-body">
              备注
            </label>
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="添加备注（可选）"
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-transparent text-text-primary dark:text-text-primary-dark placeholder:text-text-secondary/50 focus:outline-none focus:border-morandi-blue dark:focus:border-morandi-blue-light focus:ring-2 focus:ring-morandi-blue/20 transition-all font-body text-sm resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl font-display font-bold text-white bg-morandi-coral hover:bg-morandi-coral-dark shadow-fab hover:shadow-fab-hover transition-all active:scale-[0.98]"
          >
            {isEdit ? '保存修改' : '添加日期'}
          </button>
        </form>
      </div>
    </div>
  );
}
