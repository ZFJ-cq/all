<template>
  <div class="achievements-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.push('/')">← 返回</button>
      <h2>成就殿堂</h2>
      <p class="progress-text">{{ store.unlockedCount }} / {{ store.totalCount }} 已解锁</p>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
    </div>

    <div class="achievement-grid">
      <div
        v-for="ach in store.achievementConfigs"
        :key="ach.id"
        class="achievement-card"
        :class="{ unlocked: store.unlockedAchievements[ach.id] }"
      >
        <div class="ach-icon">{{ getIcon(ach.icon) }}</div>
        <div class="ach-info">
          <h3>{{ ach.name }}</h3>
          <p>{{ ach.description }}</p>
        </div>
        <div class="ach-status">
          <span v-if="store.unlockedAchievements[ach.id]" class="unlocked-badge">✓ 已解锁</span>
          <span v-else class="locked-badge">🔒</span>
        </div>
      </div>
    </div>

    <button class="back-menu-btn" @click="$router.push('/')">返回主菜单</button>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAchievementStore } from '@/stores/achievementStore'

const store = useAchievementStore()

onMounted(() => {
  store.init()
})

const progressPercent = computed(() => {
  if (store.totalCount === 0) return 0
  return Math.round((store.unlockedCount / store.totalCount) * 100)
})

const iconMap = {
  star: '⭐',
  eye: '🔍',
  judge: '⚖️',
  crown: '👑',
  detective: '🕵️',
  lightning: '⚡',
  evidence: '📋',
  persist: '💪'
}

function getIcon(icon) {
  return iconMap[icon] || '🏅'
}
</script>

<style scoped>
.achievements-page {
  min-height: 100vh;
  padding: 20px;
  max-width: 700px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  padding: 30px 0 20px;
  position: relative;
}

.back-btn {
  position: absolute;
  left: 0;
  top: 30px;
  padding: 8px 16px;
  border: 1px solid rgba(201, 169, 110, 0.3);
  border-radius: 8px;
  background: rgba(201, 169, 110, 0.08);
  color: #c9a96e;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
}

.page-header h2 {
  font-size: 30px;
  color: #c9a96e;
  letter-spacing: 6px;
  margin-bottom: 8px;
}

.progress-text {
  font-size: 14px;
  color: rgba(224, 213, 193, 0.6);
  margin-bottom: 10px;
}

.progress-bar {
  height: 6px;
  background: rgba(201, 169, 110, 0.1);
  border-radius: 3px;
  overflow: hidden;
  max-width: 300px;
  margin: 0 auto;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #c9a96e, #e0c88e);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.achievement-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 30px 0;
}

.achievement-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  background: rgba(201, 169, 110, 0.04);
  border: 1px solid rgba(201, 169, 110, 0.1);
  border-radius: 12px;
  transition: all 0.3s;
  opacity: 0.5;
}

.achievement-card.unlocked {
  opacity: 1;
  border-color: rgba(201, 169, 110, 0.3);
  background: rgba(201, 169, 110, 0.08);
}

.ach-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.ach-info {
  flex: 1;
}

.ach-info h3 {
  font-size: 16px;
  color: #e0d5c1;
  margin-bottom: 4px;
}

.ach-info p {
  font-size: 13px;
  color: rgba(224, 213, 193, 0.6);
}

.ach-status {
  flex-shrink: 0;
}

.unlocked-badge {
  color: #48c78e;
  font-size: 13px;
}

.locked-badge {
  color: rgba(150, 150, 150, 0.5);
  font-size: 16px;
}

.back-menu-btn {
  display: block;
  margin: 0 auto 40px;
  padding: 14px 40px;
  border: 1px solid rgba(201, 169, 110, 0.3);
  border-radius: 10px;
  background: rgba(201, 169, 110, 0.08);
  color: #c9a96e;
  font-size: 16px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.back-menu-btn:hover {
  background: rgba(201, 169, 110, 0.15);
}
</style>