<template>
  <Teleport to="body">
    <Transition name="popup">
      <div v-if="store.showPopup && currentAchievement" class="achievement-popup" @click="store.dismissPopup">
        <div class="popup-card">
          <div class="popup-glow"></div>
          <div class="popup-icon">🏆</div>
          <div class="popup-label">成就解锁</div>
          <h3>{{ currentAchievement.name }}</h3>
          <p>{{ currentAchievement.description }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useAchievementStore } from '@/stores/achievementStore'

const store = useAchievementStore()

const currentAchievement = computed(() => {
  return store.newUnlockQueue[0] || null
})
</script>

<style scoped>
.achievement-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  padding-top: 80px;
  pointer-events: auto;
}

.popup-card {
  position: relative;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid #c9a96e;
  border-radius: 20px;
  padding: 28px 36px;
  text-align: center;
  min-width: 280px;
  max-width: 380px;
  animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
}

.popup-glow {
  position: absolute;
  inset: -4px;
  border-radius: 22px;
  background: linear-gradient(135deg, #c9a96e, #e0c88e, #c9a96e);
  opacity: 0.3;
  filter: blur(8px);
  z-index: -1;
}

.popup-icon {
  font-size: 40px;
  margin-bottom: 6px;
}

.popup-label {
  font-size: 11px;
  color: rgba(201, 169, 110, 0.6);
  text-transform: uppercase;
  letter-spacing: 3px;
  margin-bottom: 8px;
}

.popup-card h3 {
  font-size: 20px;
  color: #c9a96e;
  margin-bottom: 8px;
}

.popup-card p {
  font-size: 14px;
  color: rgba(224, 213, 193, 0.7);
}

.popup-enter-active,
.popup-leave-active {
  transition: all 0.4s ease;
}

.popup-enter-from {
  opacity: 0;
  transform: translateY(-30px);
}

.popup-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

@keyframes popIn {
  0% { transform: scale(0.5); opacity: 0; }
  70% { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}
</style>