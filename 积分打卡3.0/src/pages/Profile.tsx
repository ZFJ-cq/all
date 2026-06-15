import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListTodo, History, BarChart3, Gift, ShoppingBag, ChevronRight, Trophy, Settings, Download, Upload, Smartphone, Trash2, AlertTriangle, CheckCircle, CheckCircle2, Pencil, TrendingUp, TrendingDown } from 'lucide-react';
import { useStore, getTotalPoints } from '@/store';
import { ACHIEVEMENTS } from '@/types';
import Modal from '@/components/Modal';
import { PetImageSmall } from '@/components/PetImage';

const menuItems = [
  { path: '/tasks', label: '我的任务', icon: ListTodo, color: '#FF8C42', bg: '#FFF3E8' },
  { path: '/history', label: '我的历史记录', icon: History, color: '#3B82F6', bg: '#EFF6FF' },
  { path: '/stats', label: '我的统计', icon: BarChart3, color: '#8B5CF6', bg: '#F3F0FF' },
  { path: '/exchange', label: '我的兑换', icon: Gift, color: '#EF4444', bg: '#FEF2F2' },
];

type ConfirmAction = {
  title: string;
  message: string;
  confirmText: string;
  danger?: boolean;
  onConfirm: () => void;
} | null;

// 积分明细条目类型
type PointsDetailItem = {
  id: string;
  type: 'earn' | 'spend';
  points: number;
  description: string;
  date: string;
  sortKey: string;
};

export default function Profile() {
  const navigate = useNavigate();
  const state = useStore();
  const totalPoints = getTotalPoints(state);
  const pets = useStore((s) => s.pets);
  const config = useStore((s) => s.config);
  const checkins = useStore((s) => s.checkins);
  const exchanges = useStore((s) => s.exchanges);
  const exportBackup = useStore((s) => s.exportBackup);
  const importBackup = useStore((s) => s.importBackup);
  const resetAllData = useStore((s) => s.resetAllData);
  const updateNickname = useStore((s) => s.updateNickname);
  const achievements = useStore((s) => s.achievements);
  const checkAchievements = useStore((s) => s.checkAchievements);

  const [activeTab, setActiveTab] = useState<'menu' | 'pet'>('menu');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [actionConfirm, setActionConfirm] = useState<ConfirmAction>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 昵称编辑
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [nicknameValue, setNicknameValue] = useState('');

  // 积分明细弹窗
  const [showPointsDetail, setPointsDetailOpen] = useState(false);
  const [detailTab, setDetailTab] = useState<'all' | 'earn' | 'spend'>('all');

  // 成就弹窗
  const [achievementOpen, setAchievementOpen] = useState(false);

  // 组件加载时检查成就
  useEffect(() => {
    checkAchievements();
  }, [checkAchievements]);

  // 构建积分明细列表
  const pointsDetails = useMemo<PointsDetailItem[]>(() => {
    const items: PointsDetailItem[] = [];

    // 获得积分：从打卡记录
    for (const [, records] of Object.entries(checkins)) {
      for (const r of records) {
        if (r.completed && r.pointsEarned > 0) {
          items.push({
            id: `earn-${r.id}`,
            type: 'earn',
            points: r.pointsEarned,
            description: r.taskName + (r.isRetro ? '（补卡）' : ''),
            date: r.date + (r.checkinTime ? ` ${r.checkinTime}` : ''),
            sortKey: `${r.date}${r.checkinTime || ''}`,
          });
        }
      }
    }

    // 消耗积分：从兑换记录
    for (const e of exchanges) {
      const d = new Date(e.exchangedAt);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      items.push({
        id: `spend-${e.id}`,
        type: 'spend',
        points: e.pointsCost,
        description: e.note || `${e.pointsCost}积分兑换`,
        date: `${dateStr} ${timeStr}`,
        sortKey: `${dateStr}${timeStr}`,
      });
    }

    // 按日期降序排列
    items.sort((a, b) => b.sortKey.localeCompare(a.sortKey));
    return items;
  }, [checkins, exchanges]);

  const filteredDetails = useMemo(() => {
    if (detailTab === 'all') return pointsDetails;
    return pointsDetails.filter((d) => d.type === detailTab);
  }, [pointsDetails, detailTab]);

  const totalEarned = useMemo(() => pointsDetails.filter((d) => d.type === 'earn').reduce((s, d) => s + d.points, 0), [pointsDetails]);
  const totalSpent = useMemo(() => pointsDetails.filter((d) => d.type === 'spend').reduce((s, d) => s + d.points, 0), [pointsDetails]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2200);
  }, []);

  // PWA 安装引导弹窗
  const [showPwaGuide, setShowPwaGuide] = useState(false);

  const nickname = config.nickname || '打卡达人';

  return (
    <div className="animate-fade-in px-4 pt-6 pb-4">
      {/* 用户信息卡片 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FF8C42] to-[#FF6B6B] p-5 text-white shadow-lg">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
        <div className="absolute -right-2 bottom-0 h-16 w-16 rounded-full bg-white/10" />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold">{nickname}</h2>
            <button
              onClick={() => {
                setNicknameValue(nickname);
                setShowNicknameModal(true);
              }}
              className="rounded-lg bg-white/20 p-1 backdrop-blur-sm active:bg-white/30"
            >
              <Pencil size={12} />
            </button>
          </div>
          <p className="mt-1 text-sm text-white/80">
            已领养 {pets.length} 只宠物 · 坚持打卡第 {Math.max(1, Math.ceil((Date.now() - new Date(config.startDate).getTime()) / 86400000))} 天
          </p>
          {/* 积分卡片 */}
          <button
            onClick={() => setPointsDetailOpen(true)}
            className="mt-4 flex w-full items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 backdrop-blur-sm active:bg-white/25 transition-colors"
          >
            <Trophy size={18} />
            <span className="text-sm">可用积分</span>
            <span className="ml-auto text-xl font-bold">{totalPoints}</span>
            <ChevronRight size={16} className="opacity-60" />
          </button>
        </div>
      </div>

      {/* Tab 切换 */}
      <div className="mt-5 flex rounded-xl bg-gray-100 p-1">
        <button
          onClick={() => setActiveTab('menu')}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
            activeTab === 'menu' ? 'bg-white text-[#FF8C42] shadow-sm' : 'text-gray-500'
          }`}
        >
          功能
        </button>
        <button
          onClick={() => setActiveTab('pet')}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${
            activeTab === 'pet' ? 'bg-white text-[#10B981] shadow-sm' : 'text-gray-500'
          }`}
        >
          宠物
        </button>
      </div>

      {activeTab === 'menu' ? (
        <>
          {/* 菜单列表 */}
          <div className="mt-4 rounded-2xl bg-white p-1 shadow-sm">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 transition-all duration-150 active:scale-[0.98] active:bg-gray-50 ${
                    index !== menuItems.length - 1 ? 'mb-0.5' : ''
                  }`}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: item.bg }}
                  >
                    <Icon size={20} style={{ color: item.color }} />
                  </div>
                  <span className="flex-1 text-left text-[15px] font-medium text-[#1A1B3A]">
                    {item.label}
                  </span>
                  <ChevronRight size={18} className="text-[#9CA3AF]" />
                </button>
              );
            })}
            {/* 成就入口 */}
            <button
              onClick={() => setAchievementOpen(true)}
              className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 transition-all duration-150 active:scale-[0.98] active:bg-gray-50 mb-0.5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FEF3C7]">
                <span className="text-lg">🏆</span>
              </div>
              <span className="flex-1 text-left text-[15px] font-medium text-[#1A1B3A]">我的成就</span>
              <span className="text-xs text-[#9CA3AF]">{achievements.length}/{ACHIEVEMENTS.length}</span>
              <ChevronRight size={18} className="text-[#9CA3AF]" />
            </button>
            {/* 设置按钮 */}
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 transition-all duration-150 active:scale-[0.98] active:bg-gray-50 mb-0.5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F4F6]">
                <Settings size={20} style={{ color: '#6B7280' }} />
              </div>
              <span className="flex-1 text-left text-[15px] font-medium text-[#1A1B3A]">设置</span>
              <ChevronRight size={18} className="text-[#9CA3AF]" />
            </button>
          </div>
        </>
      ) : (
        <>
          {/* 宠物 Tab */}
          {pets.length > 0 ? (
            <div className="mt-4">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#1A1B3A]">我的宠物</h3>
                  <button
                    onClick={() => navigate('/pet-feeding')}
                    className="text-xs text-[#FF8C42]"
                  >
                    去喂养
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {pets.map((pet) => (
                    <div
                      key={pet.id}
                      className="flex flex-col items-center gap-1.5 rounded-xl bg-[#FFF9F2] px-3 py-3"
                    >
                      <span className="text-2xl"><PetImageSmall species={pet.species} size={36} /></span>
                      <span className="text-xs font-medium text-[#1A1B3A]">{pet.name}</span>
                      <span className="text-[10px] text-[#9CA3AF]">Lv.{pet.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex flex-col items-center justify-center rounded-2xl bg-white py-12 shadow-sm">
              <span className="text-5xl">🐾</span>
              <p className="mt-3 text-sm text-[#9CA3AF]">还没有宠物</p>
              <button
                onClick={() => navigate('/pet-shop')}
                className="mt-3 flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF8C42] to-[#FF6B6B] px-5 py-2.5 text-sm font-semibold text-white active:scale-95"
              >
                <ShoppingBag size={16} />
                去商店领养
              </button>
            </div>
          )}

          {/* 宠物商店入口 */}
          <button
            onClick={() => navigate('/pet-shop')}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-semibold text-[#FF8C42] shadow-sm active:scale-[0.98]"
          >
            <ShoppingBag size={16} />
            宠物商店
          </button>
        </>
      )}

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

      {/* 通用确认弹窗 */}
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
                onClick={() => {
                  if (actionConfirm) {
                    actionConfirm.onConfirm();
                    setActionConfirm(null);
                  }
                }}
                className={`flex-1 rounded-xl py-3 text-sm font-semibold text-white shadow-md active:scale-[0.98] transition-transform ${actionConfirm.danger ? 'bg-red-500' : ''}`}
                style={!actionConfirm.danger ? { background: 'linear-gradient(135deg, #FF8C42, #F59E0B)' } : undefined}
              >
                {actionConfirm.confirmText}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* 昵称修改弹窗 */}
      <Modal isOpen={showNicknameModal} onClose={() => setShowNicknameModal(false)} title="修改昵称">
        <div className="px-1 pt-2 pb-4">
          <input
            value={nicknameValue}
            onChange={(e) => setNicknameValue(e.target.value)}
            placeholder="输入昵称"
            maxLength={12}
            className="w-full rounded-xl border border-[#F3E8DC] bg-[#FFF9F2] px-4 py-3 text-sm outline-none focus:border-[#FF8C42]"
          />
          <button
            onClick={() => {
              if (nicknameValue.trim()) {
                updateNickname(nicknameValue.trim());
                setShowNicknameModal(false);
                showToast('昵称已更新', 'success');
              }
            }}
            disabled={!nicknameValue.trim()}
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#FF8C42] to-[#FF6B6B] py-3 text-sm font-semibold text-white disabled:opacity-50 active:scale-[0.98]"
          >
            确认修改
          </button>
        </div>
      </Modal>

      {/* 积分明细弹窗 */}
      <Modal isOpen={showPointsDetail} onClose={() => setPointsDetailOpen(false)} title="积分明细">
        <div className="pb-4">
          {/* 汇总 */}
          <div className="mb-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-[#FFF3E8] p-3 text-center">
              <div className="text-xs text-[#9CA3AF]">可用</div>
              <div className="mt-0.5 text-lg font-bold text-[#FF8C42]">{totalPoints}</div>
            </div>
            <div className="rounded-xl bg-[#ECFDF5] p-3 text-center">
              <div className="text-xs text-[#9CA3AF]">累计获得</div>
              <div className="mt-0.5 text-lg font-bold text-[#34D399]">{totalEarned}</div>
            </div>
            <div className="rounded-xl bg-[#FEF2F2] p-3 text-center">
              <div className="text-xs text-[#9CA3AF]">累计消耗</div>
              <div className="mt-0.5 text-lg font-bold text-[#EF4444]">{totalSpent}</div>
            </div>
          </div>

          {/* Tab */}
          <div className="mb-3 flex rounded-lg bg-gray-100 p-0.5">
            {([['all', '全部'], ['earn', '获得'], ['spend', '消耗']] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setDetailTab(key)}
                className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all ${
                  detailTab === key ? 'bg-white text-[#1A1B3A] shadow-sm' : 'text-[#9CA3AF]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 明细列表 */}
          <div className="max-h-[50vh] overflow-y-auto">
            {filteredDetails.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#9CA3AF]">暂无记录</div>
            ) : (
              filteredDetails.map((item) => (
                <div key={item.id} className="flex items-center gap-3 border-b border-gray-50 py-2.5 px-1">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    item.type === 'earn' ? 'bg-[#ECFDF5]' : 'bg-[#FEF2F2]'
                  }`}>
                    {item.type === 'earn'
                      ? <TrendingUp size={14} className="text-[#34D399]" />
                      : <TrendingDown size={14} className="text-[#EF4444]" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm text-[#1A1B3A]">{item.description}</div>
                    <div className="text-[11px] text-[#9CA3AF]">{item.date}</div>
                  </div>
                  <span className={`shrink-0 text-sm font-bold ${
                    item.type === 'earn' ? 'text-[#34D399]' : 'text-[#EF4444]'
                  }`}>
                    {item.type === 'earn' ? '+' : '-'}{item.points}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* Settings Modal */}
      <Modal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} title="设置">
        <div className="pb-6">
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
                if (success) {
                  showToast('导入成功！', 'success');
                  setSettingsOpen(false);
                } else {
                  showToast('导入失败，请检查文件格式', 'error');
                }
              };
              reader.readAsText(file);
              e.target.value = '';
            }}
          />

          <div className="h-px bg-gray-100 mx-2" />

          <button
            onClick={() => {
              if (window.matchMedia('(display-mode: standalone)').matches) {
                showToast('已安装为独立应用', 'success');
                return;
              }
              const deferredPrompt = (window as any).deferredPWAPrompt;
              if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((result: any) => {
                  if (result.outcome === 'accepted') {
                    showToast('安装成功！', 'success');
                  }
                });
              } else {
                setShowPwaGuide(true);
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

          <button
            onClick={() => {
              setActionConfirm({
                title: '删除全部数据',
                message: '所有任务、打卡记录、积分数据将被永久删除，不可恢复！建议先导出备份。',
                confirmText: '删除全部',
                danger: true,
                onConfirm: () => {
                  resetAllData();
                  setSettingsOpen(false);
                  showToast('已清空全部数据', 'info');
                },
              });
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

      {/* PWA 安装引导弹窗 */}
      <Modal isOpen={showPwaGuide} onClose={() => setShowPwaGuide(false)} title="安装到主屏幕">
        <div className="pb-4">
          <p className="text-sm text-[#6B7280] mb-4">让积分打卡应用像原生App一样使用</p>
          <div className="space-y-2.5">
            <div className="rounded-xl bg-[#F9FAFB] p-3 text-left text-sm text-[#374151]">
              <strong>iOS Safari:</strong><br />点击底部「分享」→ 选择「添加到主屏幕」
            </div>
            <div className="rounded-xl bg-[#F9FAFB] p-3 text-left text-sm text-[#374151]">
              <strong>Android Chrome:</strong><br />点击右上角「⋮」→ 选择「安装应用」
            </div>
          </div>
          <button
            onClick={() => setShowPwaGuide(false)}
            className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#FF8C42] to-[#FF6B6B] py-3 text-sm font-semibold text-white active:scale-[0.98]"
          >
            知道了
          </button>
        </div>
      </Modal>

      {/* 成就弹窗 */}
      <Modal isOpen={achievementOpen} onClose={() => setAchievementOpen(false)} title="我的成就">
        <div className="pb-6">
          <div className="mb-4 text-center">
            <span className="text-2xl">🏆</span>
            <p className="mt-1 text-sm text-[#9CA3AF]">已解锁 {achievements.length} / {ACHIEVEMENTS.length}</p>
          </div>
          <div className="space-y-2">
            {ACHIEVEMENTS.map((ach) => {
              const isUnlocked = achievements.includes(ach.id);
              return (
                <div
                  key={ach.id}
                  className={`flex items-center gap-3 rounded-xl p-3 ${isUnlocked ? 'bg-[#FFF9F2]' : 'bg-gray-50'}`}
                >
                  <span className={`text-2xl ${isUnlocked ? '' : 'grayscale opacity-40'}`}>{ach.emoji}</span>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${isUnlocked ? 'text-[#1A1B3A]' : 'text-gray-400'}`}>{ach.name}</p>
                    <p className={`text-xs ${isUnlocked ? 'text-[#9CA3AF]' : 'text-gray-300'}`}>{ach.description}</p>
                  </div>
                  {isUnlocked && (
                    <span className="text-xs font-medium text-[#FF8C42]">已解锁</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Modal>
    </div>
  );
}
