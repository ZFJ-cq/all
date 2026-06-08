import { useMemo, useRef, useState } from 'react';
import { useStore } from '@/store';
import { EXCHANGE_TIERS } from '@/types';
import { formatDateTimeCN } from '@/utils';
import { Coins, Gift, Clock, Trash2, Lock, MinusCircle, Flame, Settings, Download, Upload, Smartphone, TrendingUp, TrendingDown, CheckCircle2, Circle } from 'lucide-react';
import AnimatedNumber from '@/components/AnimatedNumber';
import Modal from '@/components/Modal';

const TIER_ACCENTS: Record<number, { bg: string; border: string; text: string; gradient: string; dot: string; bar: string }> = {
  100: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-600',
    gradient: 'from-amber-400 to-amber-500',
    dot: '#F59E0B',
    bar: '#F59E0B',
  },
  300: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-600',
    gradient: 'from-orange-400 to-orange-500',
    dot: '#FF8C42',
    bar: '#FF8C42',
  },
  500: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-600',
    gradient: 'from-red-400 to-orange-500',
    dot: '#EF4444',
    bar: '#EF4444',
  },
};

export default function Exchange() {
  const checkins = useStore((s) => s.checkins);
  const exchanges = useStore((s) => s.exchanges);
  const config = useStore((s) => s.config);
  const exchangeFn = useStore((s) => s.exchange);
  const clearExchanges = useStore((s) => s.clearExchanges);
  const markExchangeUsed = useStore((s) => s.markExchangeUsed);
  const getStreakInfo = useStore((s) => s.getStreakInfo);
  const renewStreak = useStore((s) => s.renewStreak);
  const exportBackup = useStore((s) => s.exportBackup);
  const importBackup = useStore((s) => s.importBackup);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pointsDetailOpen, setPointsDetailOpen] = useState(false);
  const [detailTab, setDetailTab] = useState<'earn' | 'spend'>('earn');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetAllData = useStore((s) => s.resetAllData);

  const totalPoints = useMemo(() => {
    let total = 0;
    for (const records of Object.values(checkins)) {
      total += records.filter((r) => r.completed).reduce((sum, r) => sum + r.pointsEarned, 0);
    }
    total -= config.totalPointsSpent || 0;
    return Math.max(0, total);
  }, [checkins, config.totalPointsSpent]);

  const sortedExchanges = useMemo(() => {
    return [...exchanges].sort(
      (a, b) => new Date(b.exchangedAt).getTime() - new Date(a.exchangedAt).getTime()
    );
  }, [exchanges]);

  // 积分获得记录
  const earnRecords = useMemo(() => {
    const records: { id: string; name: string; points: number; date: string; time: string }[] = [];
    for (const [date, dayRecords] of Object.entries(checkins)) {
      for (const r of dayRecords) {
        if (r.completed && r.pointsEarned > 0) {
          records.push({
            id: r.id,
            name: r.taskName,
            points: r.pointsEarned,
            date,
            time: r.checkinTime,
          });
        }
      }
    }
    return records.sort((a, b) => {
      const dateDiff = b.date.localeCompare(a.date);
      if (dateDiff !== 0) return dateDiff;
      return b.time.localeCompare(a.time);
    });
  }, [checkins]);

  // 积分使用记录
  const spendRecords = useMemo(() => {
    return [...exchanges]
      .map((r) => ({
        id: r.id,
        name: r.note || `${r.tier}积分兑换`,
        points: r.pointsCost,
        date: r.exchangedAt,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [exchanges]);

  const totalEarned = useMemo(() => earnRecords.reduce((sum, r) => sum + r.points, 0), [earnRecords]);
  const totalSpent = config.totalPointsSpent;

  const handleExchange = (tier: number, label: string) => {
    if (totalPoints < tier) return;
    const confirmed = window.confirm(`确认使用 ${tier} 积分兑换 ${label}？`);
    if (confirmed) {
      exchangeFn(tier);
      alert(`兑换成功！已获得 ${label}`);
    }
  };

  const handleClear = () => {
    if (exchanges.length === 0) return;
    const confirmed = window.confirm('确认清空所有兑换记录？');
    if (confirmed) {
      clearExchanges();
      alert('已清空兑换记录');
    }
  };

  return (
    <div className="min-h-screen px-4 pb-8 pt-6" style={{ backgroundColor: '#FFF9F2' }}>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1A1B3A' }}>积分兑换</h1>
          <div className="mt-1.5 h-[3px] w-16 rounded-full" style={{ background: 'linear-gradient(90deg, #FF8C42, #FFB87A)' }} />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white shadow-sm active:scale-95 transition-transform"
          >
            <Settings size={18} style={{ color: '#9CA3AF' }} />
          </button>
          <div
            className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5"
            style={{ background: 'linear-gradient(135deg, #FF8C42, #F59E0B)' }}
          >
            <Coins size={14} className="text-white" />
            <span className="text-sm font-semibold text-white">{totalPoints}</span>
          </div>
        </div>
      </div>

      {/* Available Points Card */}
      <div
        onClick={() => setPointsDetailOpen(true)}
        className="relative mb-6 overflow-hidden rounded-2xl p-6 shadow-lg cursor-pointer active:scale-[0.98] transition-transform"
        style={{ background: 'linear-gradient(135deg, #FF8C42, #F59E0B)' }}
      >
        {/* Decorative circles overlay */}
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
        <div className="absolute right-12 bottom-[-10px] h-20 w-20 rounded-full bg-white/10" />
        <div className="absolute left-1/2 top-[-8px] h-12 w-12 rounded-full bg-white/5" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Coins size={30} className="text-white" />
          </div>
          <div>
            <p className="mb-1 text-sm font-medium text-white/80">可用积分</p>
            <p className="text-[48px] font-bold leading-none text-white"><AnimatedNumber value={totalPoints} /></p>
            <p className="mt-1 text-xs text-white/50">点击查看明细</p>
          </div>
        </div>
      </div>

      {/* Streak Renewal Section */}
      {(() => {
        const streakInfo = getStreakInfo();
        if (!streakInfo.isBroken) return null;
        return (
          <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm" style={{ borderLeft: '4px solid #EF4444' }}>
            <div className="flex items-center gap-2 mb-2">
              <Flame size={20} style={{ color: '#EF4444' }} />
              <h2 className="text-base font-semibold" style={{ color: '#1A1B3A' }}>断签续签</h2>
            </div>
            <p className="mb-3 text-sm" style={{ color: '#6B7280' }}>
              上次连续 <span className="font-bold" style={{ color: '#EF4444' }}>{streakInfo.brokenStreak}</span> 天
            </p>
            <button
              onClick={() => {
                const confirmed = window.confirm('确认消耗50积分续签？');
                if (confirmed) {
                  const success = renewStreak();
                  if (success) {
                    alert('续签成功！已恢复连续打卡天数');
                  } else {
                    alert('续签失败，积分不足或无需续签');
                  }
                }
              }}
              disabled={totalPoints < 50}
              className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-all active:scale-95 ${
                totalPoints >= 50
                  ? 'bg-gradient-to-r from-red-400 to-orange-400 text-white shadow-md'
                  : 'cursor-not-allowed bg-gray-200 text-gray-400'
              }`}
            >
              消耗50积分续签
            </button>
          </div>
        );
      })()}

      {/* Exchange Tiers */}
      <div className="mb-6 space-y-3">
        <h2 className="flex items-center gap-1.5 text-base font-semibold" style={{ color: '#1A1B3A' }}>
          <Gift size={18} style={{ color: '#FF8C42' }} />
          兑换等级
        </h2>
        {EXCHANGE_TIERS.map(({ tier, label }) => {
          const accent = TIER_ACCENTS[tier];
          const canAfford = totalPoints >= tier;

          return (
            <div
              key={tier}
              className="relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              style={{
                borderTop: `4px solid ${accent.bar}`,
                opacity: canAfford ? 1 : 0.65,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg font-bold" style={{ color: accent.dot }}>{tier}积分</span>
                    <span
                      className={`rounded-full bg-gradient-to-r ${accent.gradient} px-2.5 py-0.5 text-xs font-semibold text-white`}
                    >
                      {label}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm" style={{ color: '#9CA3AF' }}>
                    消耗 <span className="font-medium" style={{ color: '#6B7280' }}>{tier}</span> 积分
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!canAfford && (
                    <Lock size={16} style={{ color: '#D1D5DB' }} />
                  )}
                  <button
                    onClick={() => {
                      if (!canAfford) {
                        alert(`积分不足，还差 ${tier - totalPoints} 积分`);
                        return;
                      }
                      handleExchange(tier, label);
                    }}
                    className={`rounded-full px-5 py-2 text-sm font-semibold transition-all active:scale-95 ${
                      canAfford
                        ? 'bg-gradient-to-r from-orange-400 to-amber-400 text-white shadow-md'
                        : 'cursor-not-allowed bg-gray-200 text-gray-400'
                    }`}
                  >
                    {canAfford ? '兑换' : '积分不足'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Exchange Records */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-base font-semibold" style={{ color: '#1A1B3A' }}>
            <Clock size={18} style={{ color: '#FF8C42' }} />
            兑换记录
            {exchanges.length > 0 && (
              <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: '#FFF3E8', color: '#FF8C42' }}>
                {exchanges.length}
              </span>
            )}
          </h2>
          {exchanges.length > 0 && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1 text-xs transition-colors active:text-red-400"
              style={{ color: '#9CA3AF' }}
            >
              <Trash2 size={14} />
              清空记录
            </button>
          )}
        </div>

        {sortedExchanges.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-10">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: '#FFF3E8' }}>
              <Clock size={28} style={{ color: '#FFB87A' }} />
            </div>
            <p className="text-sm" style={{ color: '#9CA3AF' }}>暂无兑换记录</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline gradient line */}
            <div
              className="absolute left-[5px] top-3 bottom-3 w-[2px]"
              style={{ background: 'linear-gradient(to bottom, #FF8C42, #D1D5DB)' }}
            />
            <div className="space-y-0">
              {sortedExchanges.map((record, index) => {
                const accent = TIER_ACCENTS[record.tier];
                const isUsed = !!record.usedAt;
                return (
                  <div key={record.id} className="relative flex gap-3">
                    {/* Timeline dot */}
                    <div className="relative z-10 flex flex-col items-center pt-3">
                      <div
                        className="h-3 w-3 shrink-0 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: isUsed ? '#9CA3AF' : (accent?.dot || '#FF8C42') }}
                      />
                    </div>
                    {/* Content card */}
                    <div
                      onClick={() => {
                        if (isUsed) return;
                        const confirmed = window.confirm('确认标记为已使用？');
                        if (confirmed) markExchangeUsed(record.id);
                      }}
                      className={`mb-3 flex-1 rounded-xl bg-white p-3.5 shadow-sm transition-all ${isUsed ? 'opacity-60' : 'cursor-pointer active:scale-[0.98]'} ${index === sortedExchanges.length - 1 ? 'mb-0' : ''}`}
                      style={{ borderLeft: `3px solid ${isUsed ? '#9CA3AF' : (accent?.dot || '#FF8C42')}` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${isUsed ? 'text-gray-400' : (accent?.text || 'text-orange-600')}`}>
                            {record.note || `${record.tier}积分兑换`}
                          </span>
                          {isUsed ? (
                            <span className="flex items-center gap-0.5 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                              <CheckCircle2 size={12} />
                              已使用
                            </span>
                          ) : (
                            <span className="flex items-center gap-0.5 rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium" style={{ color: '#FF8C42' }}>
                              <Circle size={12} />
                              未使用
                            </span>
                          )}
                        </div>
                        <span className={`flex items-center gap-1 text-sm font-medium ${isUsed ? 'text-gray-300' : 'text-red-400'}`}>
                          <MinusCircle size={14} />
                          {record.pointsCost}
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Clock size={12} style={{ color: '#D1D5DB' }} />
                          <p className="text-xs" style={{ color: '#9CA3AF' }}>
                            兑换：{formatDateTimeCN(record.exchangedAt)}
                          </p>
                        </div>
                        {isUsed && record.usedAt && (
                          <div className="flex items-center gap-1">
                            <CheckCircle2 size={12} style={{ color: '#9CA3AF' }} />
                            <p className="text-xs" style={{ color: '#9CA3AF' }}>
                              使用：{formatDateTimeCN(record.usedAt)}
                            </p>
                          </div>
                        )}
                      </div>
                      {!isUsed && (
                        <p className="mt-1.5 text-xs text-gray-300">点击标记为已使用</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Points Detail Modal */}
      <Modal isOpen={pointsDetailOpen} onClose={() => setPointsDetailOpen(false)} title="积分明细">
        <div className="pb-6">
          {/* Summary */}
          <div className="mb-4 flex gap-3">
            <div className="flex-1 rounded-xl bg-green-50 p-3 text-center">
              <p className="text-xs text-green-600">累计获得</p>
              <p className="text-lg font-bold text-green-700">+{totalEarned.toLocaleString()}</p>
            </div>
            <div className="flex-1 rounded-xl bg-red-50 p-3 text-center">
              <p className="text-xs text-red-600">累计消耗</p>
              <p className="text-lg font-bold text-red-700">-{totalSpent.toLocaleString()}</p>
            </div>
          </div>

          {/* Tab */}
          <div className="mb-3 flex rounded-xl bg-gray-100 p-1">
            <button
              onClick={() => setDetailTab('earn')}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                detailTab === 'earn' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              <TrendingUp size={14} className="inline mr-1" />
              获得记录
            </button>
            <button
              onClick={() => setDetailTab('spend')}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                detailTab === 'spend' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              <TrendingDown size={14} className="inline mr-1" />
              使用记录
            </button>
          </div>

          {/* Records List */}
          <div className="max-h-[50vh] overflow-y-auto">
            {detailTab === 'earn' ? (
              earnRecords.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">暂无获得记录</div>
              ) : (
                <div className="space-y-2">
                  {earnRecords.map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5 shadow-sm">
                      <div>
                        <p className="text-sm font-medium text-[#1A1B3A]">{r.name}</p>
                        <p className="text-xs text-gray-400">{r.date} {r.time}</p>
                      </div>
                      <span className="text-sm font-semibold text-green-600">+{r.points}</span>
                    </div>
                  ))}
                </div>
              )
            ) : (
              spendRecords.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">暂无使用记录</div>
              ) : (
                <div className="space-y-2">
                  {spendRecords.map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5 shadow-sm">
                      <div>
                        <p className="text-sm font-medium text-[#1A1B3A]">{r.name}</p>
                        <p className="text-xs text-gray-400">{formatDateTimeCN(r.date)}</p>
                      </div>
                      <span className="text-sm font-semibold text-red-500">-{r.points}</span>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </Modal>

      {/* Settings Modal */}
      <Modal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} title="设置">
        <div className="pb-6">
          {/* 导出备份 */}
          <button
            onClick={() => {
              const json = exportBackup();
              const blob = new Blob([json], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `积分打卡备份_${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="w-full flex items-center gap-3 px-2 py-3.5 text-left rounded-xl transition-colors hover:bg-gray-50 active:bg-gray-100"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF3E8]">
              <Download size={18} style={{ color: '#FF8C42' }} />
            </div>
            <div>
              <span className="text-sm font-medium text-[#1A1B3A]">导出备份</span>
              <p className="text-[11px] text-[#9CA3AF]">将数据导出为JSON文件</p>
            </div>
          </button>

          <div className="h-px bg-gray-100 mx-2" />

          {/* 导入备份 */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-3 px-2 py-3.5 text-left rounded-xl transition-colors hover:bg-gray-50 active:bg-gray-100"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF]">
              <Upload size={18} style={{ color: '#3B82F6' }} />
            </div>
            <div>
              <span className="text-sm font-medium text-[#1A1B3A]">导入备份</span>
              <p className="text-[11px] text-[#9CA3AF]">从JSON文件恢复数据</p>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                const content = reader.result as string;
                const success = importBackup(content);
                alert(success ? '导入成功！' : '导入失败，请检查文件格式。');
                if (success) setSettingsOpen(false);
              };
              reader.readAsText(file);
              e.target.value = '';
            }}
          />

          <div className="h-px bg-gray-100 mx-2" />

          {/* 安装到桌面 */}
          <button
            onClick={() => {
              if (window.matchMedia('(display-mode: standalone)').matches) {
                alert('✅ 已安装为独立应用');
                return;
              }
              const deferredPrompt = (window as any).deferredPWAPrompt;
              if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((result: any) => {
                  if (result.outcome === 'accepted') {
                    alert('🎉 安装成功！');
                  }
                });
              } else {
                const guide = document.createElement('div');
                guide.innerHTML = `
                  <style>
                    .pwa-guide-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; }
                    .pwa-guide-card { background: white; border-radius: 20px; padding: 24px; max-width: 320px; text-align: center; }
                    .pwa-guide-icon { width: 64px; height: 64px; margin: 0 auto 16px; background: linear-gradient(135deg, #8B5CF6, #6366F1); border-radius: 16px; display: flex; align-items: center; justify-content: center; }
                    .pwa-guide-title { font-size: 18px; font-weight: 600; color: #1A1B3A; margin-bottom: 8px; }
                    .pwa-guide-desc { font-size: 14px; color: #6B7280; margin-bottom: 20px; }
                    .pwa-guide-step { text-align: left; padding: 12px; background: #F9FAFB; border-radius: 12px; margin-bottom: 8px; font-size: 13px; color: #374151; }
                    .pwa-guide-close { margin-top: 16px; padding: 12px 32px; background: #FF8C42; color: white; border: none; border-radius: 12px; font-weight: 500; }
                  </style>
                  <div class="pwa-guide-overlay" onclick="this.remove()">
                    <div class="pwa-guide-card" onclick="event.stopPropagation()">
                      <div class="pwa-guide-icon">📱</div>
                      <div class="pwa-guide-title">安装到主屏幕</div>
                      <div class="pwa-guide-desc">让积分打卡应用像原生App一样使用</div>
                      <div class="pwa-guide-step"><strong>iOS Safari:</strong><br/>点击底部「分享」→ 选择「添加到主屏幕」</div>
                      <div class="pwa-guide-step"><strong>Android Chrome:</strong><br/>点击右上角「⋮」→ 选择「安装应用」</div>
                      <button class="pwa-guide-close" onclick="document.querySelector('.pwa-guide-overlay').remove()">知道了</button>
                    </div>
                  </div>
                `;
                document.body.appendChild(guide);
              }
            }}
            className="w-full flex items-center gap-3 px-2 py-3.5 text-left rounded-xl transition-colors hover:bg-gray-50 active:bg-gray-100"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F0FF]">
              <Smartphone size={18} style={{ color: '#8B5CF6' }} />
            </div>
            <div>
              <span className="text-sm font-medium text-[#1A1B3A]">安装到桌面</span>
              <p className="text-[11px] text-[#9CA3AF]">添加到主屏幕，全屏使用</p>
            </div>
          </button>

          <div className="h-px bg-gray-100 mx-2" />

          {/* 删除全部数据 */}
          <button
            onClick={() => {
              const confirmed = window.confirm('⚠️ 确定删除全部缓存数据？此操作不可恢复！建议先导出备份。');
              if (!confirmed) return;
              const confirmed2 = window.confirm('再次确认：所有任务、打卡记录、积分数据将被永久删除！');
              if (!confirmed2) return;
              resetAllData();
              setSettingsOpen(false);
              alert('已清空全部数据');
            }}
            className="w-full flex items-center gap-3 px-2 py-3.5 text-left rounded-xl transition-colors hover:bg-red-50 active:bg-red-100"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FEF2F2]">
              <Trash2 size={18} style={{ color: '#EF4444' }} />
            </div>
            <div>
              <span className="text-sm font-medium text-[#EF4444]">删除全部数据</span>
              <p className="text-[11px] text-[#9CA3AF]">清空所有缓存数据，不可恢复</p>
            </div>
          </button>
        </div>
      </Modal>
    </div>
  );
}
