<template>
  <div class="judgment-stage">
    <div class="stage-header">
      <div class="stage-title">
        <span class="stage-icon">⚖️</span>
        <span>升堂断案</span>
      </div>
    </div>

    <div class="judgment-guide">
      <p>请根据已收集的证据，指认真凶。</p>
    </div>

    <div class="judgment-content">
      <div class="section">
        <h3 class="section-title">选择真凶</h3>
        <div class="suspect-options">
          <div
            v-for="sus in suspects"
            :key="sus.id"
            class="suspect-option"
            :class="{ selected: selectedSuspect === sus.id }"
            @click="selectedSuspect = sus.id"
          >
            <div class="radio" :class="{ checked: selectedSuspect === sus.id }"></div>
            <div class="suspect-name">{{ sus.name }}</div>
            <div class="suspect-role">{{ sus.role }}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">已收集的证据</h3>
        <div class="evidence-list">
          <div
            v-for="evId in store.collectedEvidences"
            :key="evId"
            class="evidence-item"
            :class="{ key: isKeyEvidence(evId) }"
          >
            <span class="ev-name">{{ getEvidenceName(evId) }}</span>
          </div>
          <div v-if="store.collectedEvidences.length === 0" class="no-evidence">
            尚未收集任何证据，请先返回取证阶段
          </div>
        </div>
      </div>

      <button
        class="submit-btn"
        :disabled="!selectedSuspect || submitting"
        @click="submitJudgment"
      >
        {{ submitting ? '正在审理...' : '✋ 惊堂木一拍——升堂！' }}
      </button>

      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    </div>

    <div v-if="result" class="judgment-result-overlay" @click="goToResult">
      <div class="result-card" :class="result.verdict">
        <div class="result-icon">{{ verdictIcon }}</div>
        <h2>{{ verdictTitle }}</h2>
        <p class="result-message">{{ result.message }}</p>
        <button class="result-btn" @click.stop="goToResult">
          {{ result.verdict === 'correct' ? '查看结案陈词' : '重新审理' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'
import { useAchievementStore } from '@/stores/achievementStore'

const router = useRouter()
const store = useGameStore()
const achievementStore = useAchievementStore()

const selectedSuspect = ref(null)
const submitting = ref(false)
const result = ref(null)
const errorMessage = ref('')

const suspects = computed(() => store.caseConfig?.stages?.interrogation?.suspects || [])
const allEvidences = computed(() => store.caseConfig?.stages?.investigation?.evidences || [])

const verdictIcon = computed(() => {
  if (!result.value) return ''
  if (result.value.verdict === 'correct') return '🎉'
  if (result.value.verdict === 'partial') return '🤔'
  return '❌'
})

const verdictTitle = computed(() => {
  if (!result.value) return ''
  if (result.value.verdict === 'correct') return '铁面无私，断案如神！'
  if (result.value.verdict === 'partial') return '证据不足，尚需查证'
  return '断案有误！'
})

function getEvidenceName(evId) {
  const ev = allEvidences.value.find(e => e.id === evId)
  return ev ? ev.name : evId
}

function isKeyEvidence(evId) {
  const ev = allEvidences.value.find(e => e.id === evId)
  return ev?.isKey || false
}

async function submitJudgment() {
  if (!selectedSuspect.value) {
    errorMessage.value = '请先指认真凶！'
    return
  }
  submitting.value = true
  errorMessage.value = ''
  try {
    const res = await store.judge(selectedSuspect.value)
    result.value = res

    achievementStore.checkAndUnlock({
      firstTryCorrect: res.verdict === 'correct',
      caseCompleted: res.verdict === 'correct',
      noHintsUsed: store.hintsUsed === 0 && res.verdict === 'correct',
      elapsedTime: store.getElapsedTime()
    })

    if (res.verdict === 'correct') {
      store.preloadNextCase()
    }
  } catch (err) {
    errorMessage.value = '审理失败，请重试'
  } finally {
    submitting.value = false
  }
}

function goToResult() {
  store.markStageCompleted('judgment')
  store.persistProgressImmediate()
  router.push(`/judgment/${store.currentCaseId}`)
}
</script>

<style scoped>
.judgment-stage {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  max-width: 700px;
  margin: 0 auto;
  width: 100%;
}

.stage-header {
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

.judgment-guide p {
  font-size: 15px;
  color: rgba(224, 213, 193, 0.7);
  margin-bottom: 20px;
}

.judgment-content {
  flex: 1;
  overflow-y: auto;
}

.section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  color: #c9a96e;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(201, 169, 110, 0.1);
}

.suspect-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suspect-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(201, 169, 110, 0.04);
  border: 1px solid rgba(201, 169, 110, 0.1);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.suspect-option:hover {
  border-color: rgba(201, 169, 110, 0.4);
}

.suspect-option.selected {
  border-color: #c9a96e;
  background: rgba(201, 169, 110, 0.12);
}

.radio {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid rgba(201, 169, 110, 0.3);
  flex-shrink: 0;
  transition: all 0.2s;
}

.radio.checked {
  border-color: #c9a96e;
  background: #c9a96e;
  box-shadow: 0 0 0 2px rgba(201, 169, 110, 0.3);
}

.suspect-name {
  font-size: 16px;
  color: #e0d5c1;
  flex: 1;
}

.suspect-role {
  font-size: 12px;
  color: rgba(224, 213, 193, 0.5);
}

.evidence-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.evidence-item {
  padding: 6px 14px;
  background: rgba(72, 199, 142, 0.08);
  border: 1px solid rgba(72, 199, 142, 0.2);
  border-radius: 20px;
  font-size: 13px;
  color: #48c78e;
}

.evidence-item.key {
  border-color: rgba(201, 169, 110, 0.3);
  background: rgba(201, 169, 110, 0.08);
  color: #c9a96e;
}

.no-evidence {
  font-size: 14px;
  color: rgba(224, 213, 193, 0.4);
  padding: 20px;
  text-align: center;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  border: 2px solid #c9a96e;
  border-radius: 12px;
  background: rgba(201, 169, 110, 0.15);
  color: #c9a96e;
  font-size: 18px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 8px;
}

.submit-btn:hover:not(:disabled) {
  background: rgba(201, 169, 110, 0.3);
  transform: translateY(-2px);
}

.submit-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.error-message {
  text-align: center;
  padding: 12px;
  color: #f08080;
  font-size: 14px;
}

.judgment-result-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.3s ease;
}

.result-card {
  background: #1a1a2e;
  border: 2px solid rgba(201, 169, 110, 0.3);
  border-radius: 20px;
  padding: 30px 24px;
  max-width: 440px;
  width: 90%;
  text-align: center;
}

.result-card.partial {
  border-color: rgba(240, 180, 60, 0.4);
}

.result-card.wrong {
  border-color: rgba(220, 80, 80, 0.3);
}

.result-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.result-card h2 {
  font-size: 22px;
  color: #c9a96e;
  margin-bottom: 12px;
}

.result-card.correct h2 { color: #48c78e; }
.result-card.wrong h2 { color: #f08080; }

.result-message {
  font-size: 14px;
  color: rgba(224, 213, 193, 0.7);
  line-height: 1.8;
  margin-bottom: 20px;
}

.result-btn {
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

.result-btn:hover {
  background: rgba(201, 169, 110, 0.3);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>