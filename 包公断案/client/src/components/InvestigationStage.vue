<template>
  <div class="investigation-stage">
    <div class="stage-header">
      <div class="stage-title">
        <span class="stage-icon">🔎</span>
        <span>取证调查</span>
      </div>
      <div class="evidence-counter">
        已收集证据: {{ store.collectedCount }} / {{ store.totalEvidenceCount }}
      </div>
    </div>

    <div class="scene-tabs">
      <button
        v-for="scene in scenes"
        :key="scene.id"
        class="scene-tab"
        :class="{ active: activeScene === scene.id }"
        @click="activeScene = scene.id"
      >
        {{ scene.name }}
      </button>
    </div>

    <div class="scene-content" v-if="currentScene">
      <div class="scene-description">
        <p>{{ currentScene.description }}</p>
      </div>

      <div class="scene-hints" v-if="currentScene.searchHints?.length">
        <span class="hint-label">调查提示：</span>
        <span v-for="(h, i) in currentScene.searchHints" :key="i" class="hint-tag">{{ h }}</span>
      </div>

      <div class="evidence-grid">
        <div
          v-for="ev in sceneEvidences"
          :key="ev.id"
          class="evidence-card"
          :class="{ collected: isCollected(ev.id), key: ev.isKey }"
          @click="collectEvidenceItem(ev)"
        >
          <div class="evidence-icon">{{ getEvidenceIcon(ev.icon) }}</div>
          <div class="evidence-info">
            <h4>{{ ev.name }}</h4>
            <p v-if="isCollected(ev.id) && getDetail(ev.id)" class="evidence-clue">
              {{ getDetail(ev.id).clue || getDetail(ev.id).description }}
            </p>
            <p v-else class="evidence-hint">点击调查</p>
          </div>
          <div class="collect-status">
            <span v-if="isCollected(ev.id)" class="collected-badge">✓ 已收集</span>
            <span v-else class="uncollected-badge">?</span>
          </div>
        </div>
      </div>
    </div>

    <div class="action-bar">
      <button class="hint-btn" :disabled="noMoreHints" @click="useHint">
        💡 提示 ({{ hintsLeft }})
      </button>
      <button class="complete-btn" @click="finishInvestigation">
        完成取证，开始审讯
      </button>
    </div>

    <div v-if="hintMessage" class="hint-popup">
      <p>{{ hintMessage }}</p>
      <button @click="hintMessage = ''">知道了</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'

const emit = defineEmits(['complete'])
const store = useGameStore()

const activeScene = ref('')
const hintMessage = ref('')

const scenes = computed(() => store.caseConfig?.stages?.investigation?.scenes || [])
const currentScene = computed(() => scenes.value.find(s => s.id === activeScene.value))
const allEvidences = computed(() => store.caseConfig?.stages?.investigation?.evidences || [])
const sceneEvidences = computed(() => allEvidences.value.filter(e => e.sceneId === activeScene.value))

const hintsLeft = computed(() => {
  const total = store.hintsAvailable.length
  return Math.max(0, total - store.hintsUsed)
})
const noMoreHints = computed(() => hintsLeft.value <= 0)

onMounted(() => {
  if (scenes.value.length > 0) {
    activeScene.value = scenes.value[0].id
  }
})

const iconMap = {
  cloth: '👕', package: '📦', note: '📝', bone: '🦴',
  knife: '🔪', witness: '👤', seal: '🔖', grain: '🌾',
  book: '📖', money: '💰', wheel: '🛞', warehouse: '🏭'
}

function getEvidenceIcon(icon) {
  return iconMap[icon] || '📌'
}

function isCollected(evidenceId) {
  return store.collectedEvidences.includes(evidenceId)
}

function getDetail(evidenceId) {
  return store.evidenceDetails[evidenceId] || null
}

async function collectEvidenceItem(ev) {
  if (isCollected(ev.id)) return
  await store.collectEvidence(ev.id)
}

async function useHint() {
  if (noMoreHints.value) return
  const hint = await store.useHint()
  if (hint) {
    hintMessage.value = hint.content
  }
}

function finishInvestigation() {
  store.markStageCompleted('investigation')
  emit('complete')
}
</script>

<style scoped>
.investigation-stage {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  max-width: 700px;
  margin: 0 auto;
  width: 100%;
}

.stage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(201, 169, 110, 0.15);
  margin-bottom: 16px;
}

.stage-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  color: #c9a96e;
}

.stage-icon { font-size: 22px; }

.evidence-counter {
  font-size: 13px;
  color: rgba(224, 213, 193, 0.6);
  background: rgba(201, 169, 110, 0.08);
  padding: 6px 14px;
  border-radius: 20px;
}

.scene-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.scene-tab {
  padding: 8px 20px;
  border: 1px solid rgba(201, 169, 110, 0.2);
  border-radius: 8px;
  background: transparent;
  color: rgba(224, 213, 193, 0.7);
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.scene-tab.active {
  background: rgba(201, 169, 110, 0.15);
  border-color: #c9a96e;
  color: #c9a96e;
}

.scene-tab:hover {
  border-color: rgba(201, 169, 110, 0.4);
}

.scene-content {
  flex: 1;
  overflow-y: auto;
}

.scene-description {
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  margin-bottom: 14px;
  font-size: 14px;
  color: rgba(224, 213, 193, 0.7);
  line-height: 1.8;
}

.scene-hints {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.hint-label {
  font-size: 12px;
  color: rgba(201, 169, 110, 0.6);
}

.hint-tag {
  font-size: 12px;
  padding: 3px 10px;
  background: rgba(201, 169, 110, 0.06);
  border: 1px solid rgba(201, 169, 110, 0.15);
  border-radius: 12px;
  color: rgba(224, 213, 193, 0.5);
}

.evidence-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.evidence-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: rgba(201, 169, 110, 0.04);
  border: 1px solid rgba(201, 169, 110, 0.1);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.evidence-card:hover:not(.collected) {
  border-color: rgba(201, 169, 110, 0.4);
  background: rgba(201, 169, 110, 0.08);
}

.evidence-card.collected {
  border-color: rgba(72, 199, 142, 0.3);
  background: rgba(72, 199, 142, 0.05);
}

.evidence-card.key {
  border-left: 3px solid rgba(201, 169, 110, 0.3);
}

.evidence-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.evidence-info {
  flex: 1;
  min-width: 0;
}

.evidence-info h4 {
  font-size: 15px;
  color: #e0d5c1;
  margin-bottom: 4px;
}

.evidence-clue {
  font-size: 13px;
  color: rgba(72, 199, 142, 0.8);
  line-height: 1.6;
}

.evidence-hint {
  font-size: 12px;
  color: rgba(224, 213, 193, 0.35);
}

.collect-status {
  flex-shrink: 0;
}

.collected-badge {
  font-size: 12px;
  color: #48c78e;
}

.uncollected-badge {
  font-size: 16px;
  color: rgba(224, 213, 193, 0.2);
}

.action-bar {
  display: flex;
  gap: 12px;
  padding: 20px 0;
  justify-content: center;
}

.hint-btn {
  padding: 12px 24px;
  border: 1px solid rgba(201, 169, 110, 0.3);
  border-radius: 10px;
  background: transparent;
  color: rgba(224, 213, 193, 0.7);
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.hint-btn:hover:not(:disabled) {
  border-color: #c9a96e;
}

.hint-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.complete-btn {
  padding: 12px 32px;
  border: 1px solid #c9a96e;
  border-radius: 10px;
  background: rgba(201, 169, 110, 0.15);
  color: #c9a96e;
  font-size: 15px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.complete-btn:hover {
  background: rgba(201, 169, 110, 0.3);
}

.hint-popup {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid #c9a96e;
  border-radius: 12px;
  padding: 16px 24px;
  max-width: 400px;
  z-index: 100;
  animation: slideUp 0.3s ease;
}

.hint-popup p {
  font-size: 14px;
  color: #e0d5c1;
  line-height: 1.8;
  margin-bottom: 12px;
}

.hint-popup button {
  padding: 6px 20px;
  border: 1px solid rgba(201, 169, 110, 0.3);
  border-radius: 6px;
  background: rgba(201, 169, 110, 0.1);
  color: #c9a96e;
  font-family: inherit;
  cursor: pointer;
  font-size: 13px;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateX(-50%) translateY(20px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}
</style>