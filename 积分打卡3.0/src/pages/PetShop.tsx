import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, ShoppingBag } from 'lucide-react';
import { useStore, getTotalPoints } from '@/store';
import { DEFAULT_PET_SHOP_ITEMS } from '@/types';
import PetImage from '@/components/PetImage';

export default function PetShop() {
  const navigate = useNavigate();
  const state = useStore();
  const totalPoints = getTotalPoints(state);
  const pets = useStore((s) => s.pets);
  const buyPet = useStore((s) => s.buyPet);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmBuy, setConfirmBuy] = useState<number | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  };

  const handleBuy = (index: number) => {
    const item = DEFAULT_PET_SHOP_ITEMS[index];
    if (!item) return;

    // 检查是否已拥有同种宠物
    if (pets.some((p) => p.species === item.species)) {
      showToast('你已经拥有该种宠物了', 'error');
      setConfirmBuy(null);
      return;
    }

    if (totalPoints < item.price) {
      showToast('积分不足', 'error');
      setConfirmBuy(null);
      return;
    }

    const success = buyPet(index);
    if (success) {
      showToast(`领养成功！-${item.price}积分`, 'success');
    } else {
      showToast('领养失败', 'error');
    }
    setConfirmBuy(null);
  };

  return (
    <div className="animate-fade-in min-h-screen bg-[#FFF9F2]">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-[#FFF9F2]/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="rounded-xl p-1.5 active:bg-gray-100">
            <ArrowLeft size={22} className="text-[#1A1B3A]" />
          </button>
          <h1 className="text-lg font-bold text-[#1A1B3A]">宠物商店</h1>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-[#FFF3E8] px-3 py-1.5">
          <Zap size={14} className="text-[#FF8C42]" />
          <span className="text-sm font-bold text-[#FF8C42]">{totalPoints}</span>
        </div>
      </div>

      <div className="px-4 pb-8 pt-2">
        {/* 已领养数量 */}
        <div className="mb-4 rounded-xl bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6B7280]">已领养宠物</span>
            <span className="text-sm font-bold text-[#FF8C42]">{pets.length} 只</span>
          </div>
        </div>

        {/* 商品列表 */}
        <div className="grid grid-cols-2 gap-3">
          {DEFAULT_PET_SHOP_ITEMS.map((item, index) => {
            const canAfford = totalPoints >= item.price;
            const owned = pets.some((p) => p.species === item.species);
            return (
              <div
                key={index}
                className={`flex flex-col items-center rounded-2xl bg-white p-4 shadow-sm ${owned ? 'opacity-60' : ''}`}
              >
                <div className="relative">
                  <PetImage species={item.species} size={72} className="rounded-xl" />
                  {owned && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/30">
                      <span className="text-xs font-bold text-white">已拥有</span>
                    </div>
                  )}
                </div>
                <h3 className="mt-2 text-sm font-bold text-[#1A1B3A]">{item.name}</h3>
                <p className="mt-0.5 text-[11px] text-[#9CA3AF]">{item.description}</p>
                <div className="mt-2 flex items-center gap-1">
                  <Zap size={12} className="text-[#FF8C42]" />
                  <span className="text-sm font-bold text-[#FF8C42]">{item.price}</span>
                  <span className="text-[11px] text-[#9CA3AF]">积分</span>
                </div>
                {confirmBuy === index ? (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleBuy(index)}
                      className="rounded-lg bg-gradient-to-r from-[#FF8C42] to-[#FF6B6B] px-4 py-1.5 text-xs font-semibold text-white active:scale-95"
                    >
                      确认
                    </button>
                    <button
                      onClick={() => setConfirmBuy(null)}
                      className="rounded-lg bg-gray-100 px-4 py-1.5 text-xs font-semibold text-[#6B7280] active:scale-95"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmBuy(index)}
                    disabled={!canAfford || owned}
                    className="mt-3 w-full rounded-lg bg-gradient-to-r from-[#FF8C42] to-[#FF6B6B] py-1.5 text-xs font-semibold text-white disabled:opacity-40 active:scale-95"
                  >
                    {owned ? '已拥有' : canAfford ? '领养' : '积分不足'}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* 前往喂养 */}
        {pets.length > 0 && (
          <button
            onClick={() => navigate('/pet-feeding')}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-semibold text-[#FF8C42] shadow-sm active:scale-[0.98]"
          >
            <ShoppingBag size={16} />
            前往喂养我的宠物
          </button>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed left-1/2 top-16 z-50 -translate-x-1/2 rounded-xl px-5 py-2.5 text-sm font-medium shadow-lg animate-fade-in ${
            toast.type === 'success' ? 'bg-[#34D399] text-white' : 'bg-[#EF4444] text-white'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
