import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Zap, Heart, Pencil, Droplets, Sparkles, Clock } from 'lucide-react';
import { useStore, getTotalPoints } from '@/store';
import { PET_FOODS, PET_INTERACTIONS, PET_LEVEL_EXP } from '@/types';
import type { Pet } from '@/types';
import Modal from '@/components/Modal';
import PetImage, { PetImageSmall } from '@/components/PetImage';

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// 宠物状态文案 - 按物种分类的丰富行为表现
const speciesBehaviors: Record<string, { happy: string[]; normal: string[]; hungry: string[]; sad: string[]; bored: string[] }> = {
  cat: {
    happy: ['喵~ 打滚中', '呼噜呼噜~', '蹭蹭你~', '尾巴翘高高！'],
    normal: ['慵懒地舔爪子', '眯着眼打盹', '优雅地梳理毛发'],
    hungry: ['喵呜...好饿', '盯着你看', '扒饭碗'],
    sad: ['缩成一团', '躲在角落', '低垂着耳朵'],
    bored: ['追自己的尾巴', '拍打毛线球', '想爬到高处去'],
  },
  dog: {
    happy: ['汪汪！摇尾巴~', '开心地转圈圈', '扑上来舔你！', '叼着球跑来跑去'],
    normal: ['趴着休息', '竖起耳朵听声音', '安静地守着你'],
    hungry: ['呜呜...饿了', '可怜巴巴地看着你', '扒食盆'],
    sad: ['耷拉着尾巴', '呜咽着缩在角落', '无精打采'],
    bored: ['想出去散步', '追自己的尾巴', '叼拖鞋来给你'],
  },
  rabbit: {
    happy: ['蹦蹦跳跳~', '开心地甩耳朵', '鼻子蹭蹭你', '原地转圈！'],
    normal: ['安静地啃胡萝卜', '竖起长耳朵', '软软地趴着'],
    hungry: ['嗅嗅...有吃的吗', '扒笼子', '可怜地抖耳朵'],
    sad: ['缩成毛球', '耳朵耷拉下来', '躲在角落'],
    bored: ['想挖洞', '啃笼子栏杆', '蹦来蹦去'],
  },
  hamster: {
    happy: ['跑轮转得飞快！', '塞满腮帮子~', '开心地打洞', '翻跟头！'],
    normal: ['整理毛发', '慢慢啃瓜子', '窝在木屑里'],
    hungry: ['腮帮子空了...', '到处找食物', '可怜地站起来'],
    sad: ['缩在角落发抖', '不动了', '把自己埋起来'],
    bored: ['疯狂跑轮', '想越狱', '啃笼子'],
  },
  fish: {
    happy: ['欢快地游来游去~', '吐泡泡！', '跃出水面', '鳞片闪闪发光'],
    normal: ['悠闲地游着', '吐着小泡泡', '摆摆尾巴'],
    hungry: ['浮到水面', '嘴巴一张一合', '撞击缸壁'],
    sad: ['沉在水底不动', '颜色变暗了', '躲在水草后面'],
    bored: ['绕圈游泳', '对着玻璃发呆', '想跳出鱼缸'],
  },
  bird: {
    happy: ['叽叽喳喳唱歌！', '展翅跳舞~', '学你说话！', '开心地拍翅膀'],
    normal: ['站在枝头梳理羽毛', '歪头看你', '安静地打盹'],
    hungry: ['啄空食盒', '叽叽叫不停', '用嘴敲笼子'],
    sad: ['缩起羽毛', '躲在角落', '一声不吭'],
    bored: ['想学新词', '啄镜子', '在笼子里荡秋千'],
  },
  dragon: {
    happy: ['喷出小火苗！', '威风地展翅~', '尾巴兴奋地摇摆', '龙吟一声！'],
    normal: ['盘在石头上休息', '半睁着眼打盹', '缓缓扇动翅膀'],
    hungry: ['肚子咕噜叫', '用爪子扒食盆', '低吼一声'],
    sad: ['火焰变小了', '蜷缩起来', '翅膀耷拉着'],
    bored: ['想喷火烧东西', '在洞里转圈', '用尾巴敲地面'],
  },
  turtle: {
    happy: ['慢慢伸出头来~', '开心地划水', '晒太阳！', '悠闲地爬来爬去'],
    normal: ['缩在壳里休息', '慢慢爬行', '安静地泡水'],
    hungry: ['伸长脖子', '用头撞缸壁', '眼睛盯着你'],
    sad: ['完全缩进壳里', '一动不动', '四肢都缩起来'],
    bored: ['想爬出去', '反复翻越石头', '对着墙壁发呆'],
  },
  penguin: {
    happy: ['开心地滑冰~', '拍着翅膀跳舞！', '摇摇摆摆走过来', '扑通跳进水里'],
    normal: ['站着一动不动', '整理羽毛', '安静地看风景'],
    hungry: ['张大嘴巴等吃的', '拍打翅膀', '追着鱼跑'],
    sad: ['缩起脖子', '躲在角落', '毛都炸起来了'],
    bored: ['想滑冰', '用肚子滑行', '堆小石子'],
  },
  fox: {
    happy: ['摇着大尾巴~', '机灵地转圈', '蹭蹭你~', '开心地打滚！'],
    normal: ['竖起耳朵听声音', '优雅地踱步', '眯着眼晒太阳'],
    hungry: ['嗅嗅空气', '用爪子扒食盆', '眼巴巴地看着你'],
    sad: ['尾巴垂下来', '蜷缩成一团', '耳朵贴在头上'],
    bored: ['想出去探险', '追自己的尾巴', '挖洞'],
  },
  bear: {
    happy: ['开心地拍肚皮~', '笨拙地跳舞', '给你一个熊抱！', '打滚~'],
    normal: ['坐着发呆', '慢慢舔爪子', '靠在树上休息'],
    hungry: ['肚子咕噜噜', '翻找食物', '可怜地看着你'],
    sad: ['缩成一团毛球', '不想动', '低着头'],
    bored: ['想爬树', '追蝴蝶', '在泥里打滚'],
  },
  deer: {
    happy: ['优雅地跳跃~', '开心地甩尾巴', '轻轻蹭你', '在花丛中跳舞'],
    normal: ['安静地吃草', '竖起耳朵', '优雅地站立'],
    hungry: ['到处找草吃', '轻轻顶你', '眼巴巴地看着'],
    sad: ['低垂着鹿角', '躲在树后', '安静地卧着'],
    bored: ['想奔跑', '在林间跳跃', '追萤火虫'],
  },
  unicorn: {
    happy: ['角上闪着彩虹光！', '优雅地旋转~', '撒下星星粉末', '展翅飞翔！'],
    normal: ['安静地散发微光', '优雅地踱步', '角尖闪着柔光'],
    hungry: ['角的光芒变暗了', '用角轻轻顶你', '低声嘶鸣'],
    sad: ['失去了光泽', '独自站在月光下', '角上的光熄灭了'],
    bored: ['想飞上云端', '用角画彩虹', '追逐流星'],
  },
};

function getPetStatusText(pet: Pet): string {
  const behaviors = speciesBehaviors[pet.species] || speciesBehaviors.cat;
  const pool = pet.hunger < 20 ? behaviors.hungry
    : pet.mood < 20 ? behaviors.sad
    : pet.mood < 40 ? behaviors.bored
    : pet.hunger > 80 && pet.mood > 80 ? behaviors.happy
    : behaviors.normal;
  return pool[Math.floor(Date.now() / 5000) % pool.length];
}

// 宠物表情动画
function getPetAnimation(pet: Pet): string {
  if (pet.hunger > 80 && pet.mood > 80) return 'animate-bounce';
  if (pet.hunger < 20 || pet.mood < 20) return 'animate-pulse-soft';
  return '';
}

// 宠物背景色
function getPetBgColor(pet: Pet): string {
  if (pet.hunger > 80 && pet.mood > 80) return 'from-[#FEF3C7] to-[#FDE68A]';
  if (pet.hunger < 20) return 'from-[#FEF2F2] to-[#FECACA]';
  if (pet.mood < 20) return 'from-[#EFF6FF] to-[#BFDBFE]';
  return 'from-[#FFF3E8] to-[#FFDDB5]';
}

function PetAvatar({ pet }: { pet: Pet }) {
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setBounce(true);
      setTimeout(() => setBounce(false), 600);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative">
      {/* 光晕 */}
      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${getPetBgColor(pet)} opacity-60 blur-xl scale-125`} />
      {/* 宠物主体 */}
      <div className={`relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br ${getPetBgColor(pet)} shadow-lg transition-transform duration-300 ${bounce ? 'scale-110' : ''} ${getPetAnimation(pet)}`}>
        <PetImage species={pet.species} size={96} mood={pet.mood > 60 ? 'happy' : pet.mood > 30 ? 'normal' : 'sad'} />
        {/* 等级徽章 */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#FF8C42] to-[#FF6B6B] px-2.5 py-0.5 shadow-md">
          <span className="text-[10px] font-bold text-white">Lv.{pet.level}</span>
        </div>
      </div>
      {/* 状态气泡 */}
      <div className="absolute -right-2 -top-2 rounded-2xl bg-white px-2.5 py-1 text-[11px] font-medium text-[#1A1B3A] shadow-md">
        {getPetStatusText(pet)}
      </div>
    </div>
  );
}

function StatusBar({ label, value, icon, color, bgColor }: {
  label: string; value: number; icon: React.ReactNode; color: string; bgColor: string;
}) {
  const statusText = value > 80 ? '极佳' : value > 60 ? '良好' : value > 40 ? '一般' : value > 20 ? '偏低' : '危急';
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg" style={{ backgroundColor: bgColor }}>
            {icon}
          </div>
          <span className="text-xs font-medium text-[#6B7280]">{label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs" style={{ color }}>{statusText}</span>
          <span className="text-sm font-bold" style={{ color }}>{value}%</span>
        </div>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full progress-animated transition-all duration-500"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, ${color}, ${color}88)`,
          }}
        />
      </div>
    </div>
  );
}

export default function PetFeeding() {
  const navigate = useNavigate();
  const state = useStore();
  const totalPoints = getTotalPoints(state);
  const pets = useStore((s) => s.pets);
  const feedPet = useStore((s) => s.feedPet);
  const interactPet = useStore((s) => s.interactPet);
  const renamePet = useStore((s) => s.renamePet);

  const [selectedPetId, setSelectedPetId] = useState<string>(pets[0]?.id || '');
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [feedAnimation, setFeedAnimation] = useState<string | null>(null);

  const selectedPet = pets.find((p) => p.id === selectedPetId);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  };

  const handleFeed = (foodId: string) => {
    if (!selectedPetId || !selectedPet) {
      showToast('请先选择一只宠物', 'error');
      return;
    }
    // 满状态提示
    if (selectedPet.hunger >= 100 && selectedPet.mood >= 100) {
      showToast('宠物状态已满，无需喂养', 'info' as 'success');
      return;
    }
    const food = PET_FOODS.find((f) => f.id === foodId);
    if (!food) return;

    if (totalPoints < food.price) {
      showToast('积分不足', 'error');
      return;
    }

    const success = feedPet(selectedPetId, foodId);
    if (success) {
      setFeedAnimation(food.emoji);
      setTimeout(() => setFeedAnimation(null), 800);
      showToast(`喂养成功！-${food.price}积分`, 'success');
    } else {
      showToast('喂养失败', 'error');
    }
  };

  const handleInteract = (interactionId: string) => {
    if (!selectedPetId || !selectedPet) {
      showToast('请先选择一只宠物', 'error');
      return;
    }
    if (selectedPet.mood >= 100) {
      showToast('宠物心情已满，无需互动' as 'success', 'info' as 'success');
      return;
    }
    const interaction = PET_INTERACTIONS.find((i) => i.id === interactionId);
    if (!interaction) return;

    const success = interactPet(selectedPetId, interactionId);
    if (success) {
      setFeedAnimation(interaction.emoji);
      setTimeout(() => setFeedAnimation(null), 800);
      showToast(`互动成功！心情+${interaction.moodRestore} 经验+${interaction.expGain}`, 'success');
    } else {
      showToast('互动失败', 'error');
    }
  };

  const handleRename = () => {
    if (!selectedPetId || !renameValue.trim()) return;
    renamePet(selectedPetId, renameValue.trim());
    setShowRenameModal(false);
    setRenameValue('');
    showToast('改名成功', 'success');
  };

  if (pets.length === 0) {
    return (
      <div className="animate-fade-in min-h-screen bg-[#FFF9F2]">
        <div className="sticky top-0 z-10 flex items-center justify-between bg-[#FFF9F2]/90 px-4 py-3 backdrop-blur-md">
          <h1 className="text-lg font-bold text-[#1A1B3A]">我的宠物</h1>
          <div className="flex items-center gap-1.5 rounded-full bg-[#FFF3E8] px-3 py-1.5">
            <Zap size={14} className="text-[#FF8C42]" />
            <span className="text-sm font-bold text-[#FF8C42]">{totalPoints}</span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center px-8 pt-32">
          <span className="text-6xl">🐾</span>
          <p className="mt-4 text-base text-[#6B7280]">还没有宠物</p>
          <button
            onClick={() => navigate('/pet-shop')}
            className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF8C42] to-[#FF6B6B] px-6 py-3 text-sm font-semibold text-white active:scale-95"
          >
            <ShoppingBag size={16} />
            去商店领养
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in min-h-screen bg-[#FFF9F2]">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-[#FFF9F2]/90 px-4 py-3 backdrop-blur-md">
        <h1 className="text-lg font-bold text-[#1A1B3A]">我的宠物</h1>
        <div className="flex items-center gap-1.5 rounded-full bg-[#FFF3E8] px-3 py-1.5">
          <Zap size={14} className="text-[#FF8C42]" />
          <span className="text-sm font-bold text-[#FF8C42]">{totalPoints}</span>
        </div>
      </div>

      <div className="px-4 pb-8">
        {/* 宠物选择 */}
        <div className="flex gap-2 overflow-x-auto pb-2 pt-2">
          {pets.map((pet) => (
            <button
              key={pet.id}
              onClick={() => setSelectedPetId(pet.id)}
              className={`shrink-0 rounded-xl px-3 py-2 text-center transition-all ${
                selectedPetId === pet.id
                  ? 'bg-[#FF8C42] text-white shadow-md'
                  : 'bg-white text-[#1A1B3A] shadow-sm'
              }`}
            >
              <span className="text-xl"><PetImageSmall species={pet.species} size={28} /></span>
              <div className="mt-0.5 text-xs font-medium">{pet.name}</div>
            </button>
          ))}
        </div>

        {/* 选中宠物详情 */}
        {selectedPet && (
          <div className="mt-4">
            {/* 宠物展示区 */}
            <div className="relative flex flex-col items-center rounded-2xl bg-white p-6 shadow-sm">
              {/* 喂养动画 */}
              {feedAnimation && (
                <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 text-4xl animate-float-up z-10 pointer-events-none">
                  {feedAnimation}
                </div>
              )}
              <PetAvatar pet={selectedPet} />
              {/* 名字 + 改名 */}
              <div className="mt-4 flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#1A1B3A]">{selectedPet.name}</h3>
                <button
                  onClick={() => {
                    setRenameValue(selectedPet.name);
                    setShowRenameModal(true);
                  }}
                  className="rounded-lg p-1 active:bg-gray-100"
                >
                  <Pencil size={14} className="text-[#9CA3AF]" />
                </button>
              </div>
              {/* 经验条 */}
              <div className="mt-3 w-full max-w-[240px]">
                <div className="flex items-center justify-between text-[11px] text-[#9CA3AF]">
                  <span className="flex items-center gap-1">
                    <Sparkles size={10} className="text-[#FF8C42]" />
                    经验
                  </span>
                  <span>{selectedPet.exp}/{PET_LEVEL_EXP[selectedPet.level + 1] || selectedPet.exp}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#FF8C42] to-[#FF6B6B] progress-animated"
                    style={{
                      width: `${selectedPet.level >= 10 ? 100 : Math.round(((selectedPet.exp - (PET_LEVEL_EXP[selectedPet.level] || 0)) / ((PET_LEVEL_EXP[selectedPet.level + 1] || Infinity) - (PET_LEVEL_EXP[selectedPet.level] || 0))) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              {/* 领养时间 */}
              <p className="mt-2 text-[11px] text-[#9CA3AF]">
                领养于 {new Date(selectedPet.adoptedAt).toLocaleDateString('zh-CN')}
                {selectedPet.lastFedAt && ` · 上次喂养 ${new Date(selectedPet.lastFedAt).toLocaleDateString('zh-CN')}`}
              </p>
            </div>

            {/* 饱食度 & 心情 */}
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <StatusBar
                label="饱食度"
                value={selectedPet.hunger}
                icon={<Droplets size={12} className="text-[#3B82F6]" />}
                color={selectedPet.hunger > 60 ? '#34D399' : selectedPet.hunger > 30 ? '#F59E0B' : '#EF4444'}
                bgColor="#EFF6FF"
              />
              <StatusBar
                label="心情"
                value={selectedPet.mood}
                icon={<Heart size={12} className="text-[#EC4899]" />}
                color={selectedPet.mood > 60 ? '#8B5CF6' : selectedPet.mood > 30 ? '#F59E0B' : '#EF4444'}
                bgColor="#FDF2F8"
              />
            </div>
          </div>
        )}

        {/* 互动 */}
        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#1A1B3A]">互动</h3>
            <span className="flex items-center gap-1 text-[11px] text-[#9CA3AF]">
              <Clock size={11} />
              每种每天1次
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {PET_INTERACTIONS.map((interaction) => {
              const dailyInteractions = selectedPet?.dailyInteractions || {};
              const usedToday = dailyInteractions[interaction.id] === getTodayStr();
              return (
                <button
                  key={interaction.id}
                  onClick={() => handleInteract(interaction.id)}
                  disabled={!selectedPetId || usedToday}
                  className={`flex flex-col items-center gap-1 rounded-xl p-3 shadow-sm transition-all active:scale-95 disabled:opacity-50 ${
                    usedToday ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  <span className="text-2xl">{interaction.emoji}</span>
                  <span className="text-xs font-medium text-[#1A1B3A]">{interaction.name}</span>
                  {usedToday ? (
                    <span className="text-[10px] text-[#9CA3AF]">已互动</span>
                  ) : (
                    <div className="flex flex-col items-center text-[10px] text-[#6B7280]">
                      <span className="text-[#34D399] font-semibold">免费</span>
                      <span>心情+{interaction.moodRestore}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 喂养食物 */}
        <div className="mt-5">
          <h3 className="mb-3 text-sm font-semibold text-[#1A1B3A]">选择食物喂养</h3>
          <div className="grid grid-cols-2 gap-2.5">
            {PET_FOODS.map((food) => (
              <button
                key={food.id}
                onClick={() => handleFeed(food.id)}
                disabled={!selectedPetId}
                className="flex flex-col items-center gap-1.5 rounded-xl bg-white p-3.5 shadow-sm transition-all active:scale-95 disabled:opacity-50"
              >
                <span className="text-2xl">{food.emoji}</span>
                <span className="text-sm font-medium text-[#1A1B3A]">{food.name}</span>
                <div className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                  <Zap size={10} className="text-[#FF8C42]" />
                  <span className="font-semibold text-[#FF8C42]">{food.price}</span>
                  <span>积分</span>
                </div>
                <div className="flex gap-2 text-[10px] text-[#6B7280]">
                  {food.hungerRestore > 0 && <span>饱食+{food.hungerRestore}</span>}
                  {food.moodRestore > 0 && <span>心情+{food.moodRestore}</span>}
                  <span>经验+{food.expGain}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 改名弹窗 */}
      <Modal isOpen={showRenameModal} onClose={() => setShowRenameModal(false)} title="给宠物改名">
        <div className="px-1 pt-2">
          <input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            placeholder="输入新名字"
            maxLength={10}
            className="w-full rounded-xl border border-[#F3E8DC] bg-[#FFF9F2] px-4 py-3 text-sm outline-none focus:border-[#FF8C42]"
          />
          <button
            onClick={handleRename}
            disabled={!renameValue.trim()}
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#FF8C42] to-[#FF6B6B] py-3 text-sm font-semibold text-white disabled:opacity-50 active:scale-[0.98]"
          >
            确认改名
          </button>
        </div>
      </Modal>

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
