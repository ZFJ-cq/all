import { useRef } from 'react';
import { X, Sun, Moon, Image, Download, Upload, Trash2, Bell, BellOff, Eye, EyeOff } from 'lucide-react';
import { useStore } from '@/store';
import { exportData, importData } from '@/utils/storage';
import { useNotification } from '@/hooks/useNotification';
import { cn } from '@/lib/utils';

export default function SettingsDrawer() {
  const { showSettings, setShowSettings, settings, updateSettings, dates, addToast } = useStore();
  const { requestPermission } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!showSettings) return null;

  const handleExport = () => {
    exportData(dates, settings);
    addToast('导出成功');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importData(file);
      // Merge: add imported dates, keep existing
      const existingIds = new Set(dates.map((d) => d.id));
      const newDates = data.dates.filter((d) => !existingIds.has(d.id));
      const merged = [...dates, ...newDates];
      const { saveDates } = await import('@/utils/storage');
      saveDates(merged);
      updateSettings(data.settings);
      addToast(`导入成功，新增 ${newDates.length} 条日期`);
    } catch (err) {
      addToast((err as Error).message, 'error');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCustomBg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateSettings({ customBg: ev.target?.result as string, theme: 'custom' });
    };
    reader.readAsDataURL(file);
  };

  const handleNotificationToggle = async () => {
    if (!settings.notificationEnabled) {
      const granted = await requestPermission();
      if (!granted) {
        addToast('需要授权通知权限', 'error');
        return;
      }
    }
    updateSettings({ notificationEnabled: !settings.notificationEnabled });
  };

  return (
    <div className="fixed inset-0 z-50" onClick={() => setShowSettings(false)}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 dark:bg-black/40 animate-fade-in" />

      {/* Drawer */}
      <div
        className="absolute right-0 top-0 bottom-0 w-[320px] max-w-[85vw] bg-white dark:bg-surface-card-dark shadow-modal animate-slide-right overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-black/5 dark:border-white/5">
          <h2 className="font-display font-bold text-lg text-text-primary dark:text-text-primary-dark">
            设置
          </h2>
          <button
            onClick={() => setShowSettings(false)}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary dark:text-text-secondary-dark" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Theme */}
          <section>
            <h3 className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-3 font-body">
              主题
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'light' as const, label: '浅色', icon: Sun, bg: 'bg-surface-light', color: '#FAF8F5' },
                { value: 'dark' as const, label: '深色', icon: Moon, bg: 'bg-surface-dark', color: '#1A1A2E' },
                { value: 'custom' as const, label: '自定义', icon: Image, bg: 'bg-gradient-to-br from-morandi-blue to-morandi-pink', color: '' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    if (opt.value === 'custom' && !settings.customBg) {
                      document.getElementById('custom-bg-input')?.click();
                      return;
                    }
                    updateSettings({ theme: opt.value });
                  }}
                  className={cn(
                    'relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all',
                    settings.theme === opt.value
                      ? 'border-morandi-coral'
                      : 'border-transparent bg-black/3 dark:bg-white/5'
                  )}
                >
                  <div
                    className={cn('w-8 h-8 rounded-lg', opt.bg)}
                    style={opt.color ? { backgroundColor: opt.color } : undefined}
                  >
                    {opt.value === 'custom' && !settings.customBg && (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="w-4 h-4 text-white" />
                      </div>
                    )}
                    {opt.value === 'custom' && settings.customBg && (
                      <img src={settings.customBg} className="w-full h-full object-cover rounded-lg" alt="" />
                    )}
                  </div>
                  <span className="text-xs font-body text-text-primary dark:text-text-primary-dark">
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
            <input
              id="custom-bg-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCustomBg}
            />
          </section>

          {/* Display */}
          <section>
            <h3 className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-3 font-body">
              显示
            </h3>
            <div className="space-y-3">
              {/* Hide expired */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {settings.hideExpired ? (
                    <EyeOff className="w-4 h-4 text-text-secondary dark:text-text-secondary-dark" />
                  ) : (
                    <Eye className="w-4 h-4 text-text-secondary dark:text-text-secondary-dark" />
                  )}
                  <span className="text-sm font-body text-text-primary dark:text-text-primary-dark">
                    隐藏已过期
                  </span>
                </div>
                <button
                  onClick={() => updateSettings({ hideExpired: !settings.hideExpired })}
                  className={cn(
                    'w-10 h-6 rounded-full transition-colors relative',
                    settings.hideExpired ? 'bg-morandi-coral' : 'bg-black/10 dark:bg-white/10'
                  )}
                >
                  <div
                    className={cn(
                      'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                      settings.hideExpired ? 'translate-x-4.5' : 'translate-x-0.5'
                    )}
                  />
                </button>
              </div>

              {/* Card size */}
              <div>
                <span className="text-sm font-body text-text-primary dark:text-text-primary-dark">
                  卡片大小
                </span>
                <div className="flex gap-2 mt-2">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => updateSettings({ cardSize: size })}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                        settings.cardSize === size
                          ? 'bg-morandi-coral text-white'
                          : 'bg-black/5 dark:bg-white/5 text-text-secondary dark:text-text-secondary-dark'
                      )}
                    >
                      {size === 'small' ? '小' : size === 'medium' ? '中' : '大'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Notification */}
          <section>
            <h3 className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-3 font-body">
              通知提醒
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {settings.notificationEnabled ? (
                    <Bell className="w-4 h-4 text-morandi-coral" />
                  ) : (
                    <BellOff className="w-4 h-4 text-text-secondary dark:text-text-secondary-dark" />
                  )}
                  <span className="text-sm font-body text-text-primary dark:text-text-primary-dark">
                    桌面通知
                  </span>
                </div>
                <button
                  onClick={handleNotificationToggle}
                  className={cn(
                    'w-10 h-6 rounded-full transition-colors relative',
                    settings.notificationEnabled ? 'bg-morandi-coral' : 'bg-black/10 dark:bg-white/10'
                  )}
                >
                  <div
                    className={cn(
                      'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                      settings.notificationEnabled ? 'translate-x-4.5' : 'translate-x-0.5'
                    )}
                  />
                </button>
              </div>

              {settings.notificationEnabled && (
                <div className="flex gap-2">
                  {[
                    { value: '1' as const, label: '提前1天' },
                    { value: '3' as const, label: '提前3天' },
                    { value: 'none' as const, label: '不提醒' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => updateSettings({ notificationDays: opt.value })}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                        settings.notificationDays === opt.value
                          ? 'bg-morandi-coral text-white'
                          : 'bg-black/5 dark:bg-white/5 text-text-secondary dark:text-text-secondary-dark'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Data */}
          <section>
            <h3 className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-3 font-body">
              数据管理
            </h3>
            <div className="space-y-2">
              <button
                onClick={handleExport}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-black/3 dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/8 transition-colors text-left"
              >
                <Download className="w-4 h-4 text-morandi-blue" />
                <span className="text-sm font-body text-text-primary dark:text-text-primary-dark">
                  导出数据 (JSON)
                </span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-black/3 dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/8 transition-colors text-left"
              >
                <Upload className="w-4 h-4 text-morandi-blue" />
                <span className="text-sm font-body text-text-primary dark:text-text-primary-dark">
                  导入数据 (JSON)
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImport}
              />

              <button
                onClick={() => {
                  useStore.getState().setConfirmAction({
                    message: '确定清除所有已过期的倒数日吗？',
                    onConfirm: () => useStore.getState().deleteExpired(),
                  });
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-black/3 dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/8 transition-colors text-left"
              >
                <Trash2 className="w-4 h-4 text-morandi-pink" />
                <span className="text-sm font-body text-text-primary dark:text-text-primary-dark">
                  清除已过期日期
                </span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
