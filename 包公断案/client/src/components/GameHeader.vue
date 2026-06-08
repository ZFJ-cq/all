<template>
  <header class="game-header">
    <div class="header-left">
      <button class="home-btn" @click="goHome" title="返回首页">⚖️</button>
      <span class="case-title" v-if="store.caseConfig">{{ store.caseConfig.title }}</span>
    </div>
    <div class="header-right">
      <div class="header-stat" v-if="store.currentStage === 'investigation'">
        📋 {{ store.collectedCount }}/{{ store.totalEvidenceCount }}
      </div>
      <div class="header-stat" v-if="store.hintsUsed > 0">
        💡 {{ store.hintsUsed }}
      </div>
      <button class="icon-btn" @click="$router.push('/achievements')" title="成就">🏆</button>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'

const router = useRouter()
const store = useGameStore()

function goHome() {
  store.persistProgressImmediate()
  router.push('/')
}
</script>

<style scoped>
.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: rgba(0, 0, 0, 0.5);
  border-bottom: 1px solid rgba(201, 169, 110, 0.1);
  backdrop-filter: blur(10px);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.home-btn {
  width: 36px;
  height: 36px;
  border: 1px solid rgba(201, 169, 110, 0.3);
  border-radius: 50%;
  background: rgba(201, 169, 110, 0.08);
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.home-btn:hover {
  background: rgba(201, 169, 110, 0.2);
}

.case-title {
  font-size: 15px;
  color: #c9a96e;
  font-weight: bold;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-stat {
  font-size: 12px;
  color: rgba(224, 213, 193, 0.6);
  padding: 4px 10px;
  background: rgba(201, 169, 110, 0.06);
  border-radius: 12px;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: rgba(201, 169, 110, 0.1);
}
</style>