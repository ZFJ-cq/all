<template>
  <div class="judgment-page">
    <div v-if="!store.judgmentResult" class="no-result">
      <p>暂无断案结果</p>
      <button @click="$router.push('/cases')">返回案件列表</button>
    </div>

    <template v-else>
      <div class="result-header" :class="store.judgmentResult.verdict">
        <div class="result-icon">{{ verdictIcon }}</div>
        <h1>{{ verdictTitle }}</h1>
      </div>

      <div class="result-content" v-if="store.caseConfig">
        <div class="case-info">
          <span class="case-badge">{{ store.caseConfig.title }}</span>
          <span class="case-badge">{{ store.caseConfig.subtitle }}</span>
        </div>

        <div class="judgment-text" v-if="store.judgmentResult.verdict === 'correct'">
          <h3>📜 结案陈词</h3>
          <p>{{ store.judgmentResult.message }}</p>
        </div>

        <div class="stats-section" v-if="store.judgmentResult.verdict === 'correct'">
          <h3>📊 案件统计</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-value">{{ store.collectedCount }}</span>
              <span class="stat-label">收集证据</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ store.interrogatedSuspects.length }}</span>
              <span class="stat-label">审讯嫌犯</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ store.hintsUsed }}</span>
              <span class="stat-label">使用提示</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ formattedTime }}</span>
              <span class="stat-label">用时</span>
            </div>
          </div>
        </div>

        <div class="evidence-review" v-if="store.judgmentResult.verdict !== 'correct'">
          <h3>🔍 需要补充调查</h3>
          <div v-if="store.judgmentResult.missingEvidenceIds?.length">
            <p class="review-hint">以下关键证据尚未收集：</p>
            <div class="missing-list">
              <span v-for="eid in store.judgmentResult.missingEvidenceIds" :key="eid" class="missing-tag">
                {{ getEvidenceName(eid) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="action-buttons">
        <button v-if="store.judgmentResult.verdict === 'correct'" class="action-btn" @click="$router.push('/cases')">
          继续下一个案件
        </button>
        <button v-if="store.judgmentResult.verdict !== 'correct'" class="action-btn primary" @click="retry">
          重新审理
        </button>
        <button class="action-btn" @click="$router.push('/cases')">
          返回案件列表
        </button>
        <button class="action-btn" @click="$router.push('/achievements')">
          查看成就
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/gameStore'
import { useAchievementStore } from '@/stores/achievementStore'

const router = useRouter()
const store = useGameStore()
const achievementStore = useAchievementStore()

const verdictIcon = computed(() => {
  const v = store.judgmentResult?.verdict
  if (v === 'correct') return '🎉'
  if (v === 'partial') return '🤔'
  return '❌'
})

const verdictTitle = computed(() => {
  const v = store.judgmentResult?.verdict
  if (v === 'correct') return '铁面无私，断案如神！'
  if (v === 'partial') return '证据不足，尚需查证'
  return '断案有误，请重新审理'
})

const formattedTime = computed(() => {
  const secs = store.getElapsedTime()
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}分${s}秒`
})

onMounted(() => {
  if (!store.judgmentResult) return
  achievementStore.checkAndUnlock({
    firstTryCorrect: store.judgmentResult.verdict === 'correct',
    caseCompleted: store.judgmentResult.verdict === 'correct',
    noHintsUsed: store.hintsUsed === 0 && store.judgmentResult.verdict === 'correct',
    elapsedTime: store.getElapsedTime()
  })
})

function getEvidenceName(eid) {
  const evs = store.caseConfig?.stages?.investigation?.evidences || []
  const ev = evs.find(e => e.id === eid)
  return ev ? ev.name : eid
}

function retry() {
  store.currentStage = 'investigation'
  store.persistProgressImmediate()
  router.push(`/game/${store.currentCaseId}`)
}
</script>

<style scoped>
.judgment-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 20px;
  max-width: 700px;
  margin: 0 auto;
  width: 100%;
}

.no-result {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  color: rgba(224, 213, 193, 0.6);
}

.no-result button {
  padding: 12px 32px;
  border: 1px solid rgba(201, 169, 110, 0.3);
  border-radius: 10px;
  background: rgba(201, 169, 110, 0.1);
  color: #c9a96e;
  font-family: inherit;
  cursor: pointer;
  font-size: 15px;
}

.result-header {
  text-align: center;
  padding: 40px 20px 30px;
}

.result-header.correct {
  background: radial-gradient(ellipse at center, rgba(72, 199, 142, 0.1) 0%, transparent 70%);
}

.result-header.partial {
  background: radial-gradient(ellipse at center, rgba(240, 180, 60, 0.1) 0%, transparent 70%);
}

.result-header.wrong {
  background: radial-gradient(ellipse at center, rgba(220, 80, 80, 0.1) 0%, transparent 70%);
}

.result-icon {
  font-size: 56px;
  margin-bottom: 12px;
  animation: bounceIn 0.5s ease;
}

.result-header h1 {
  font-size: 28px;
  margin: 0;
}

.result-header.correct h1 { color: #48c78e; }
.result-header.partial h1 { color: #e0b83e; }
.result-header.wrong h1 { color: #f08080; }

@keyframes bounceIn {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.result-content {
  flex: 1;
}

.case-info {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
  justify-content: center;
}

.case-badge {
  padding: 4px 14px;
  background: rgba(201, 169, 110, 0.08);
  border: 1px solid rgba(201, 169, 110, 0.15);
  border-radius: 20px;
  font-size: 13px;
  color: #c9a96e;
}

.judgment-text {
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(201, 169, 110, 0.15);
  border-radius: 12px;
  margin-bottom: 20px;
}

.judgment-text h3 {
  font-size: 16px;
  color: #c9a96e;
  margin-bottom: 12px;
}

.judgment-text p {
  font-size: 15px;
  color: #e0d5c1;
  line-height: 2;
  text-indent: 2em;
}

.stats-section {
  margin-bottom: 20px;
}

.stats-section h3,
.evidence-review h3 {
  font-size: 16px;
  color: #c9a96e;
  margin-bottom: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.stat-item {
  text-align: center;
  padding: 14px 8px;
  background: rgba(201, 169, 110, 0.04);
  border: 1px solid rgba(201, 169, 110, 0.1);
  border-radius: 10px;
}

.stat-value {
  display: block;
  font-size: 20px;
  color: #c9a96e;
  font-weight: bold;
}

.stat-label {
  display: block;
  font-size: 11px;
  color: rgba(224, 213, 193, 0.5);
  margin-top: 4px;
}

.evidence-review {
  padding: 16px;
  background: rgba(240, 180, 60, 0.05);
  border: 1px solid rgba(240, 180, 60, 0.2);
  border-radius: 10px;
  margin-bottom: 20px;
}

.review-hint {
  font-size: 13px;
  color: rgba(224, 213, 193, 0.6);
  margin-bottom: 10px;
}

.missing-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.missing-tag {
  padding: 5px 12px;
  background: rgba(240, 180, 60, 0.1);
  border: 1px solid rgba(240, 180, 60, 0.3);
  border-radius: 16px;
  font-size: 12px;
  color: #e0b83e;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px 0 40px;
}

.action-btn {
  padding: 14px;
  border: 1px solid rgba(201, 169, 110, 0.3);
  border-radius: 10px;
  background: rgba(201, 169, 110, 0.08);
  color: #c9a96e;
  font-size: 15px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(201, 169, 110, 0.18);
}

.action-btn.primary {
  background: rgba(201, 169, 110, 0.2);
  border-color: #c9a96e;
}
</style>