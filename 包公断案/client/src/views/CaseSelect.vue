<template>
  <div class="case-select-page">
    <div class="page-header">
      <button class="back-btn" @click="$router.push('/')">← 返回</button>
      <h2>案件卷宗</h2>
      <p class="subtitle">选择一桩案件，开始你的断案之旅</p>
    </div>

    <div v-if="loading" class="loading">正在调阅卷宗...</div>

    <div v-else class="case-grid">
      <div
        v-for="c in cases"
        :key="c.id"
        class="case-card"
        :class="{ completed: isCompleted(c.id), locked: c.difficulty > 1 && !hasCompletedPrevious(c.id) }"
        @click="startCase(c)"
      >
        <div class="case-difficulty">
          <span v-for="i in 3" :key="i" class="star" :class="{ filled: i <= c.difficulty }">★</span>
        </div>
        <h3 class="case-title">{{ c.title }}</h3>
        <p class="case-subtitle">{{ c.subtitle }}</p>
        <p class="case-desc">{{ c.description }}</p>
        <div class="case-status">
          <span v-if="isCompleted(c.id)" class="status-badge completed">✓ 已破案</span>
          <span v-else-if="hasProgress(c.id)" class="status-badge in-progress">进行中</span>
          <span v-else-if="c.difficulty > 1 && !hasCompletedPrevious(c.id)" class="status-badge locked">🔒 需先完成前一案</span>
          <span v-else class="status-badge new">新案件</span>
        </div>
        <button
          class="start-btn"
          :disabled="c.difficulty > 1 && !hasCompletedPrevious(c.id)"
        >
          {{ isCompleted(c.id) ? '重新审理' : hasProgress(c.id) ? '继续审理' : '开始审理' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchCaseList } from '@/utils/api'
import { getGameProgress } from '@/utils/storage'

const router = useRouter()
const cases = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await fetchCaseList()
    cases.value = res.data
  } catch {}
  loading.value = false
})

function isCompleted(caseId) {
  const p = getGameProgress(caseId)
  return p?.stageCompleted?.judgment || false
}

function hasProgress(caseId) {
  return !!getGameProgress(caseId)
}

function hasCompletedPrevious(caseId) {
  const num = parseInt(caseId.replace('case_', ''))
  if (num <= 1) return true
  const prevId = `case_${String(num - 1).padStart(3, '0')}`
  return isCompleted(prevId)
}

function startCase(c) {
  if (c.difficulty > 1 && !hasCompletedPrevious(c.id)) return
  router.push(`/game/${c.id}`)
}
</script>

<style scoped>
.case-select-page {
  min-height: 100vh;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  padding: 30px 0 20px;
}

.back-btn {
  position: absolute;
  left: 20px;
  top: 20px;
  padding: 8px 16px;
  border: 1px solid rgba(201, 169, 110, 0.3);
  border-radius: 8px;
  background: rgba(201, 169, 110, 0.08);
  color: #c9a96e;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
}

.back-btn:hover {
  background: rgba(201, 169, 110, 0.15);
}

.page-header h2 {
  font-size: 32px;
  color: #c9a96e;
  letter-spacing: 8px;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  color: rgba(224, 213, 193, 0.6);
}

.loading {
  text-align: center;
  padding: 60px;
  color: rgba(224, 213, 193, 0.6);
  font-size: 16px;
}

.case-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
  padding: 20px 0 40px;
}

.case-card {
  background: rgba(201, 169, 110, 0.05);
  border: 1px solid rgba(201, 169, 110, 0.15);
  border-radius: 16px;
  padding: 28px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.case-card:hover:not(.locked) {
  border-color: #c9a96e;
  background: rgba(201, 169, 110, 0.1);
  transform: translateY(-4px);
}

.case-card.locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.case-card.completed {
  border-color: rgba(72, 199, 142, 0.3);
}

.case-difficulty {
  margin-bottom: 12px;
}

.star {
  color: rgba(201, 169, 110, 0.2);
  font-size: 18px;
  margin-right: 2px;
}

.star.filled {
  color: #c9a96e;
}

.case-title {
  font-size: 22px;
  color: #e0d5c1;
  margin-bottom: 4px;
}

.case-subtitle {
  font-size: 13px;
  color: rgba(201, 169, 110, 0.6);
  margin-bottom: 12px;
}

.case-desc {
  font-size: 14px;
  color: rgba(224, 213, 193, 0.7);
  line-height: 1.8;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.case-status {
  margin-bottom: 16px;
}

.status-badge {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 12px;
}

.status-badge.completed {
  background: rgba(72, 199, 142, 0.15);
  color: #48c78e;
}

.status-badge.in-progress {
  background: rgba(201, 169, 110, 0.15);
  color: #c9a96e;
}

.status-badge.locked {
  background: rgba(150, 150, 150, 0.15);
  color: #999;
}

.status-badge.new {
  background: rgba(72, 156, 255, 0.15);
  color: #489cff;
}

.start-btn {
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(201, 169, 110, 0.3);
  border-radius: 10px;
  background: rgba(201, 169, 110, 0.1);
  color: #c9a96e;
  font-size: 15px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.start-btn:hover:not(:disabled) {
  background: rgba(201, 169, 110, 0.25);
}

.start-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>