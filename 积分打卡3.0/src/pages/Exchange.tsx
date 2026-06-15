import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { formatDateTimeCN } from '@/utils';
import { Coins, Gift, Clock, Trash2, MinusCircle, ArrowLeft, TrendingUp, TrendingDown, CheckCircle2, Circle, Plus, X, CheckCircle, AlertTriangle } from 'lucide-react';
import AnimatedNumber from '@/components/AnimatedNumber';
import Modal from '@/components/Modal';

const ACCENT_COLORS = [
  { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', gradient: 'from-amber-400 to-amber-500', dot: '#F59E0B', bar: '#F59E0B' },
  { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', gradient: 'from-orange-400 to-orange-500', dot: '#FF8C42', bar: '#FF8C42' },
  { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', gradient: 'from-red-400 to-orange-500', dot: '#EF4444', bar: '#EF4444' },
  { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-600', gradient: 'from-violet-400 to-violet-500', dot: '#8B5CF6', bar: '#8B5CF6' },
  { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', gradient: 'from-blue-400 to-blue-500', dot: '#3B82F6', bar: '#3B82F6' },
  { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', gradient: 'from-emerald-400 to-emerald-500', dot: '#10B981', bar: '#10B981' },
  { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-600', gradient: 'from-pink-400 to-pink-500', dot: '#EC4899', bar: '#EC4899' },
  { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-600', gradient: 'from-teal-400 to-teal-500', dot: '#14B8A6', bar: '#14B8A6' },
];

function getAccent(index: number) {
  return ACCENT_COLORS[index % ACCENT_COLORS.length];
}

type ConfirmAction = {
  title: string;
  message: string;
  confirmText: string;
  danger?: boolean;
  onConfirm: () => void;
} | null;

export default function Exchange() {
  const navigate = useNavigate();
  const checkins = useStore((s) => s.checkins);
  const exchanges = useStore((s) => s.exchanges);
  const exchangeItems = useStore((s) => s.exchangeItems);
  const config = useStore((s) => s.config);
  const exchangeFn = useStore((s) => s.exchange);
  const clearExchanges = useStore((s) => s.clearExchanges);
  const markExchangeUsed = useStore((s) => s.markExchangeUsed);
  const addExchangeItem = useStore((s) => s.addExchangeItem);
  const deleteExchangeItem = useStore((s) => s.deleteExchangeItem);

  const [pointsDetailOpen, setPointsDetailOpen] = useState(false);
  const [detailTab, setDetailTab] = useState<'earn' | 'spend'>('earn');
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [newPoints, setNewPoints] = useState('');
  const [newLabel, setNewLabel] = useState('');

  // 兑换确认弹窗状态
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState<{ points: number; label: string } | null>(null);

  // 通用确认弹窗状态
  const [actionConfirm, setActionConfirm] = useState<ConfirmAction>(null);

  const [recordFilter, setRecordFilter] = useState<'all' | 'unused' | 'used'>('all');

  // Toast 状态
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2200);
  }, []);

  const showConfirm = useCallback((action: Omit<NonNullable<ConfirmAction>, 'onConfirm'> & { onConfirm: () => void }) => {
    setActionConfirm(action);
  }, []);

  const handleActionConfirm = () => {
    if (actionConfirm) {
      actionConfirm.onConfirm();
      setActionConfirm(null);
    }
  };

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

  const filteredExchanges = useMemo(() => {
    if (recordFilter === 'unused') return sortedExchanges.filter((r) => !r.usedAt);
    if (recordFilter === 'used') return sortedExchanges.filter((r) => !!r.usedAt);
    return sortedExchanges;
  }, [sortedExchanges, recordFilter]);

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

  const handleExchangeClick = (points: number, label: string) => {
    if (totalPoints < points) {
      showToast(`积分不足，还差 ${points - totalPoints} 积分`, 'error');
      return;
    }
    setConfirmData({ points, label });
    setConfirmOpen(true);
  };

  const handleConfirmExchange = () => {
    if (!confirmData) return;
    exchangeFn(confirmData.points, confirmData.label);
    setConfirmOpen(false);
    showToast(`兑换成功！已获得 ${confirmData.label}`, 'success');
    setConfirmData(null);
  };

  const handleAddItem = () => {
    const points = parseInt(newPoints);
    if (!points || points <= 0) {
      showToast('请输入有效的积分数量', 'error');
      return;
    }
    if (!newLabel.trim()) {
      showToast('请输入物品名称', 'error');
      return;
    }
    addExchangeItem({ points, label: newLabel.trim() });
    setNewPoints('');
    setNewLabel('');
    setAddItemOpen(false);
    showToast('添加成功', 'success');
  };

  return (
    <div className="min-h-screen px-4 pb-8 pt-6" style={{ backgroundColor: '#FFF9F2' }}>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="rounded-xl p-1.5 active:bg-gray-100">
            <ArrowLeft size={22} style={{ color: '#1A1B3A' }} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1A1B3A' }}>积分兑换</h1>
            <div className="mt-1.5 h-[3px] w-16 rounded-full" style={{ background: 'linear-gradient(90deg, #FF8C42, #FFB87A)' }} />
          </div>
        </div>
        <div
          className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5"
          style={{ background: 'linear-gradient(135deg, #FF8C42, #F59E0B)' }}
        >
          <Coins size={14} className="text-white" />
          <span className="text-sm font-semibold text-white">{totalPoints}</span>
        </div>
      </div>

      {/* Available Points Card */}
      <div
        onClick={() => setPointsDetailOpen(true)}
        className="relative mb-6 overflow-hidden rounded-2xl p-6 shadow-lg cursor-pointer active:scale-[0.98] transition-transform"
        style={{ background: 'linear-gradient(135deg, #FF8C42, #F59E0B)' }}
      >
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

      {/* Exchange Items Grid */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-base font-semibold" style={{ color: '#1A1B3A' }}>
            <Gift size={18} style={{ color: '#FF8C42' }} />
            积分兑换
          </h2>
          <button
            onClick={() => setAddItemOpen(true)}
            className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg, #FF8C42, #F59E0B)', color: 'white' }}
          >
            <Plus size={14} />
            添加
          </button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {exchangeItems.map((item, index) => {
            const accent = getAccent(index);
            const canAfford = totalPoints >= item.points;

            return (
              <div
                key={item.id}
                className="relative flex flex-col items-center rounded-2xl bg-white p-3 shadow-sm transition-shadow hover:shadow-md active:scale-[0.97] transition-transform"
                style={{
                  borderTop: `3px solid ${accent.bar}`,
                  opacity: canAfford ? 1 : 0.65,
                }}
              >
                {/* 删除按钮 - 仅自定义项显示 */}
                {!item.id.startsWith('default-') && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      showConfirm({
                        title: '删除兑换项',
                        message: `确认删除「${item.label}」？`,
                        confirmText: '删除',
                        danger: true,
                        onConfirm: () => {
                          deleteExchangeItem(item.id);
                          showToast('已删除', 'info');
                        },
                      });
                    }}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 shadow-sm active:scale-90 transition-transform"
                  >
                    <X size={10} style={{ color: '#9CA3AF' }} />
                  </button>
                )}
                <span className="text-lg font-bold leading-tight" style={{ color: accent.dot }}>{item.points}</span>
                <span className="text-[10px] font-medium mt-0.5" style={{ color: '#9CA3AF' }}>积分</span>
                <span
                  className={`mt-1.5 rounded-full bg-gradient-to-r ${accent.gradient} px-2 py-0.5 text-[10px] font-semibold text-white text-center leading-tight`}
                >
                  {item.label}
                </span>
                <button
                  onClick={() => handleExchangeClick(item.points, item.label)}
                  className={`mt-2 w-full rounded-lg py-1.5 text-xs font-semibold transition-all active:scale-95 ${
                    canAfford
                      ? 'bg-gradient-to-r from-orange-400 to-amber-400 text-white shadow-sm'
                      : 'cursor-not-allowed bg-gray-100 text-gray-400'
                  }`}
                >
                  {canAfford ? '兑换' : '不足'}
                </button>
              </div>
            );
          })}
        </div>
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
              onClick={() => {
                showConfirm({
                  title: '清空兑换记录',
                  message: '确认清空所有兑换记录？此操作不可恢复。',
                  confirmText: '清空',
                  danger: true,
                  onConfirm: () => {
                    clearExchanges();
                    showToast('已清空兑换记录', 'info');
                  },
                });
              }}
              className="flex items-center gap-1 text-xs transition-colors active:text-red-400"
              style={{ color: '#9CA3AF' }}
            >
              <Trash2 size={14} />
              清空记录
            </button>
          )}
        </div>

        <div className="mb-3 flex rounded-xl bg-gray-100 p-1">
          {[
            { key: 'all' as const, label: '全部' },
            { key: 'unused' as const, label: '未使用' },
            { key: 'used' as const, label: '已使用' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setRecordFilter(tab.key)}
              className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-all ${
                recordFilter === tab.key ? 'bg-white text-[#FF8C42] shadow-sm' : 'text-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filteredExchanges.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-10">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: '#FFF3E8' }}>
              <Clock size={28} style={{ color: '#FFB87A' }} />
            </div>
            <p className="text-sm" style={{ color: '#9CA3AF' }}>暂无兑换记录</p>
          </div>
        ) : (
          <div className="relative">
            <div
              className="absolute left-[5px] top-3 bottom-3 w-[2px]"
              style={{ background: 'linear-gradient(to bottom, #FF8C42, #D1D5DB)' }}
            />
            <div className="space-y-0">
              {filteredExchanges.map((record, index) => {
                const isUsed = !!record.usedAt;
                return (
                  <div key={record.id} className="relative flex gap-3">
                    <div className="relative z-10 flex flex-col items-center pt-3">
                      <div
                        className="h-3 w-3 shrink-0 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: isUsed ? '#9CA3AF' : '#FF8C42' }}
                      />
                    </div>
                    <div
                      onClick={() => {
                        if (isUsed) return;
                        showConfirm({
                          title: '确认使用',
                          message: `是否确认使用「${record.note || `${record.tier}积分兑换`}」？`,
                          confirmText: '确认使用',
                          onConfirm: () => {
                            markExchangeUsed(record.id);
                            showToast('已标记为已使用', 'success');
                          },
                        });
                      }}
                      className={`mb-3 flex-1 rounded-xl bg-white p-3.5 shadow-sm transition-all ${isUsed ? 'opacity-60' : 'cursor-pointer active:scale-[0.98]'} ${index === filteredExchanges.length - 1 ? 'mb-0' : ''}`}
                      style={{ borderLeft: `3px solid ${isUsed ? '#9CA3AF' : '#FF8C42'}` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${isUsed ? 'text-gray-400' : 'text-orange-600'}`}>
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

      {/* Toast */}
      {toast && (
        <div
          className="fixed left-1/2 top-12 z-[60] -translate-x-1/2"
          style={{
            animation: 'toastIn 0.3s ease-out, toastOut 0.3s ease-in 1.9s forwards',
          }}
        >
          <div
            className="flex items-center gap-2 rounded-2xl px-5 py-3 shadow-lg"
            style={{
              backgroundColor: toast.type === 'success' ? '#10B981' : toast.type === 'error' ? '#EF4444' : '#3B82F6',
            }}
          >
            {toast.type === 'success' && <CheckCircle size={18} className="text-white" />}
            {toast.type === 'error' && <AlertTriangle size={18} className="text-white" />}
            {toast.type === 'info' && <CheckCircle2 size={18} className="text-white" />}
            <span className="text-sm font-medium text-white">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Exchange Confirm Modal */}
      <Modal isOpen={confirmOpen} onClose={() => { setConfirmOpen(false); setConfirmData(null); }} title="确认兑换">
        {confirmData && (
          <div className="pb-6">
            <div
              className="mb-5 rounded-2xl p-5"
              style={{ background: 'linear-gradient(135deg, #FF8C42, #F59E0B)' }}
            >
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                  <Gift size={24} className="text-white" />
                </div>
              </div>
              <p className="text-center text-2xl font-bold text-white">{confirmData.label}</p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <Coins size={16} className="text-white/80" />
                <span className="text-lg font-semibold text-white">{confirmData.points} 积分</span>
              </div>
            </div>

            <div className="mb-5 rounded-xl bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: '#6B7280' }}>当前积分</span>
                <span className="text-sm font-semibold" style={{ color: '#1A1B3A' }}>{totalPoints}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: '#6B7280' }}>消耗积分</span>
                <span className="text-sm font-semibold text-red-400">-{confirmData.points}</span>
              </div>
              <div className="h-px bg-gray-100 my-2" />
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: '#6B7280' }}>剩余积分</span>
                <span className="text-sm font-bold" style={{ color: '#1A1B3A' }}>{totalPoints - confirmData.points}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setConfirmOpen(false); setConfirmData(null); }}
                className="flex-1 rounded-xl py-3 text-sm font-semibold bg-gray-100 active:scale-[0.98] transition-transform"
                style={{ color: '#6B7280' }}
              >
                取消
              </button>
              <button
                onClick={handleConfirmExchange}
                className="flex-1 rounded-xl py-3 text-sm font-semibold text-white shadow-md active:scale-[0.98] transition-transform"
                style={{ background: 'linear-gradient(135deg, #FF8C42, #F59E0B)' }}
              >
                确认兑换
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Action Confirm Modal (通用确认弹窗) */}
      <Modal isOpen={!!actionConfirm} onClose={() => setActionConfirm(null)} title={actionConfirm?.title || '确认'}>
        {actionConfirm && (
          <div className="pb-6">
            <div className="mb-5 flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${actionConfirm.danger ? 'bg-red-50' : 'bg-orange-50'}`}>
                <AlertTriangle size={20} style={{ color: actionConfirm.danger ? '#EF4444' : '#FF8C42' }} />
              </div>
              <p className="text-sm" style={{ color: '#374151' }}>{actionConfirm.message}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setActionConfirm(null)}
                className="flex-1 rounded-xl py-3 text-sm font-semibold bg-gray-100 active:scale-[0.98] transition-transform"
                style={{ color: '#6B7280' }}
              >
                取消
              </button>
              <button
                onClick={handleActionConfirm}
                className={`flex-1 rounded-xl py-3 text-sm font-semibold text-white shadow-md active:scale-[0.98] transition-transform ${actionConfirm.danger ? 'bg-red-500' : ''}`}
                style={!actionConfirm.danger ? { background: 'linear-gradient(135deg, #FF8C42, #F59E0B)' } : undefined}
              >
                {actionConfirm.confirmText}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Exchange Item Modal */}
      <Modal isOpen={addItemOpen} onClose={() => setAddItemOpen(false)} title="添加兑换项">
        <div className="pb-6">
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium" style={{ color: '#1A1B3A' }}>所需积分</label>
            <input
              type="number"
              value={newPoints}
              onChange={(e) => setNewPoints(e.target.value)}
              placeholder="输入积分数量"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-colors"
              min="1"
            />
          </div>
          <div className="mb-5">
            <label className="mb-1.5 block text-sm font-medium" style={{ color: '#1A1B3A' }}>物品/优惠</label>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="输入物品或优惠名称"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-colors"
            />
          </div>
          <button
            onClick={handleAddItem}
            className="w-full rounded-xl py-3 text-sm font-semibold text-white shadow-md active:scale-[0.98] transition-transform"
            style={{ background: 'linear-gradient(135deg, #FF8C42, #F59E0B)' }}
          >
            确认添加
          </button>
        </div>
      </Modal>

      {/* Points Detail Modal */}
      <Modal isOpen={pointsDetailOpen} onClose={() => setPointsDetailOpen(false)} title="积分明细">
        <div className="pb-6">
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

    </div>
  );
}
