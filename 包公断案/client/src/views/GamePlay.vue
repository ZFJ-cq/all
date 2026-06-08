<template>
  <div class="gameplay-page">
    <div v-if="loading" class="loading-screen">
      <div class="loading-text">正在调阅卷宗...</div>
    </div>

    <template v-else-if="store.caseConfig">
      <div class="stage-indicator">
        <div class="stages-track">
          <div
            v-for="s in stages"
            :key="s.id"
            class="stage-dot"
            :class="{
              active: store.currentStage === s.id,
              completed: store.stageCompleted[s.id]
            }"
            @click="switchStage(s.id)"
          >
            <span class="dot"></span>
            <span class="stage-label">{{ s.name }}</span>
          </div>
          <div class="stage-line"></div>
        </div>
      </div>

      <div class="game-area">
        <ReportStage
          v-if="store.currentStage === 'report'"
          @complete="handleStageComplete('report')"
        />

        <InvestigationStage
          v-if="store.currentStage === 'investigation'"
          @complete="handleStageComplete('investigation')"
        />

        <InterrogationStage
          v-if="store.currentStage === 'interrogation'"
          @complete="handleStageComplete('interrogation')"
        />

        <JudgmentStage
          v-if="store.currentStage === 'judgment'"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'
import { useAchievementStore } from '@/stores/achievementStore'
import { getStats, updateStats } from '@/utils/storage'

const ReportStage = defineAsyncComponent(() => import('@/components/ReportStage.vue'))
const InvestigationStage = defineAsyncComponent(() => import('@/components/InvestigationStage.vue'))
const InterrogationStage = defineAsyncComponent(() => import('@/components/InterrogationStage.vue'))
const JudgmentStage = defineAsyncComponent(() => import('@/components/JudgmentStage.vue'))

const route = useRoute()
const router = useRouter()
const store = useGameStore()
const achievementStore = useAchievementStore()
const loading = ref(true)

const stages = [
  { id: 'report', name: '报案' },
  { id: 'investigation', name: '取证' },
  { id: 'interrogation', name: '审讯' },
  { id: 'judgment', name: '断案' }
]

onMounted(async () => {
  const caseId = route.params.caseId
  if (!caseId) {
    router.push('/cases')
    return
  }
  achievementStore.init()
  await store.startCase(caseId)

  const stats = getStats()
  if (!stats.caseAttempts) stats.caseAttempts = {}
  stats.caseAttempts[caseId] = (stats.caseAttempts[caseId] || 0) + 1
  updateStats({ caseAttempts: stats.caseAttempts })

  loading.value = false
})

onBeforeUnmount(() => {
  store.persistProgressImmediate()
})

function handleStageComplete(stageId) {
  store.markStageCompleted(stageId)
  const stageOrder = ['report', 'investigation', 'interrogation', 'judgment']
  const idx = stageOrder.indexOf(stageId)
  if (idx < stageOrder.length - 1) {
    const nextStage = stageOrder[idx + 1]
    store.loadStage(nextStage)
  }
}

function switchStage(stageId) {
  if (!store.stageCompleted[stageId]) return
  store.loadStage(stageId)
}
</script>

<style scoped>
.gameplay-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.loading-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-text {
  font-size: 18px;
  color: rgba(224, 213, 193, 0.6);
  animation: blink 1.5s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.stage-indicator {
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.4);
  border-bottom: 1px solid rgba(201, 169, 110, 0.1);
}

.stages-track {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  max-width: 600px;
  margin: 0 auto;
}

.stage-line {
  position: absolute;
  top: 14px;
  left: 40px;
  right: 40px;
  height: 1px;
  background: rgba(201, 169, 110, 0.15);
  z-index: 0;
}

.stage-dot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: default;
  position: relative;
  z-index: 1;
  padding: 0 16px;
}

.stage-dot.completed {
  cursor: pointer;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(201, 169, 110, 0.15);
  border: 2px solid rgba(201, 169, 110, 0.2);
  transition: all 0.3s;
}

.stage-dot.active .dot {
  background: #c9a96e;
  border-color: #c9a96e;
  box-shadow: 0 0 8px rgba(201, 169, 110, 0.4);
}

.stage-dot.completed .dot {
  background: #48c78e;
  border-color: #48c78e;
}

.stage-label {
  font-size: 11px;
  color: rgba(224, 213, 193, 0.4);
  white-space: nowrap;
  transition: color 0.3s;
}

.stage-dot.active .stage-label {
  color: #c9a96e;
}

.stage-dot.completed .stage-label {
  color: #48c78e;
}

.game-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>