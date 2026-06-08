<template>
  <div class="interrogation-stage">
    <div class="stage-header">
      <div class="stage-title">
        <span class="stage-icon">🏛️</span>
        <span>审讯嫌犯</span>
      </div>
    </div>

    <div v-if="!activeSuspect" class="suspect-select">
      <p class="guide-text">请选择要审讯的嫌犯：</p>
      <div class="suspect-grid">
        <div
          v-for="sus in suspects"
          :key="sus.id"
          class="suspect-card"
          :class="{ interrogated: isInterrogated(sus.id) }"
          @click="startInterrogation(sus)"
        >
          <div class="suspect-avatar">{{ getAvatar(sus.role) }}</div>
          <div class="suspect-info">
            <h3>{{ sus.name }}</h3>
            <p class="suspect-role">{{ sus.role }}</p>
            <p class="suspect-desc">{{ sus.description }}</p>
          </div>
          <div class="interrogate-status">
            <span v-if="isInterrogated(sus.id)" class="done">✓ 已审讯</span>
            <span v-else class="todo">点击审讯</span>
          </div>
        </div>
      </div>
      <button
        class="finish-btn"
        @click="finishInterrogation"
      >
        完成审讯，前往断案
      </button>
    </div>

    <div v-else class="interrogation-active">
      <button class="back-btn" @click="activeSuspect = null">← 返回嫌犯列表</button>
      <div class="suspect-header">
        <div class="suspect-avatar large">{{ getAvatar(activeSuspect.role) }}</div>
        <div>
          <h3>{{ activeSuspect.name }}</h3>
          <p class="suspect-role">{{ activeSuspect.role }}</p>
        </div>
      </div>

      <div class="dialog-area">
        <div v-for="(d, i) in currentDialogues" :key="i" class="dialogue-line" :class="d.emotion">
          <span class="dl-speaker">{{ d.speaker }}：</span>
          <span class="dl-content">{{ d.content }}</span>
        </div>
      </div>

      <div v-if="activeSuspectDetail" class="suspect-conclusion">
        <p v-if="activeSuspectDetail.hint" class="conclusion-hint">
          💡 {{ activeSuspectDetail.hint }}
        </p>
        <p v-if="activeSuspectDetail.isGuilty !== undefined" class="conclusion-verdict" :class="{ guilty: activeSuspectDetail.isGuilty }">
          {{ activeSuspectDetail.isGuilty ? '⚠️ 此人嫌疑重大！' : '✅ 此人似乎并非主谋' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'

const emit = defineEmits(['complete'])
const store = useGameStore()

const activeSuspect = ref(null)
const activeSuspectDetail = ref(null)

const suspects = computed(() => store.caseConfig?.stages?.interrogation?.suspects || [])
const currentDialogues = computed(() => activeSuspectDetail.value?.dialogues || [])

const avatarMap = {
  '窑户': '🧑‍🏭', '赵大之妻': '👩', '钦差大臣': '👲', '粮商': '💰', '仓管': '🧑‍💼'
}

function getAvatar(role) {
  return avatarMap[role] || '👤'
}

function isInterrogated(suspectId) {
  return store.interrogatedSuspects.includes(suspectId)
}

async function startInterrogation(sus) {
  if (isInterrogated(sus.id)) return
  activeSuspect.value = sus
  await store.interrogateSuspect(sus.id)
  activeSuspectDetail.value = store.suspectDetails[sus.id] || null
}

function finishInterrogation() {
  store.markStageCompleted('interrogation')
  emit('complete')
}
</script>

<style scoped>
.interrogation-stage {
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

.suspect-select {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.guide-text {
  font-size: 15px;
  color: rgba(224, 213, 193, 0.7);
  margin-bottom: 16px;
}

.suspect-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  overflow-y: auto;
}

.suspect-card {
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

.suspect-card:hover:not(.interrogated) {
  border-color: rgba(201, 169, 110, 0.4);
  background: rgba(201, 169, 110, 0.08);
}

.suspect-card.interrogated {
  border-color: rgba(72, 199, 142, 0.2);
}

.suspect-avatar {
  font-size: 32px;
  flex-shrink: 0;
}

.suspect-avatar.large {
  font-size: 48px;
}

.suspect-info {
  flex: 1;
  min-width: 0;
}

.suspect-info h3 {
  font-size: 16px;
  color: #e0d5c1;
}

.suspect-role {
  font-size: 12px;
  color: rgba(201, 169, 110, 0.6);
  margin: 2px 0 4px;
}

.suspect-desc {
  font-size: 13px;
  color: rgba(224, 213, 193, 0.6);
}

.interrogate-status {
  flex-shrink: 0;
}

.done {
  font-size: 12px;
  color: #48c78e;
}

.todo {
  font-size: 12px;
  color: rgba(224, 213, 193, 0.35);
}

.finish-btn {
  width: 100%;
  padding: 14px;
  margin-top: 16px;
  border: 1px solid #c9a96e;
  border-radius: 10px;
  background: rgba(201, 169, 110, 0.15);
  color: #c9a96e;
  font-size: 15px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.finish-btn:hover {
  background: rgba(201, 169, 110, 0.3);
}

.interrogation-active {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.back-btn {
  align-self: flex-start;
  padding: 6px 14px;
  border: 1px solid rgba(201, 169, 110, 0.3);
  border-radius: 8px;
  background: transparent;
  color: rgba(224, 213, 193, 0.7);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  margin-bottom: 12px;
}

.suspect-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(201, 169, 110, 0.15);
  margin-bottom: 16px;
}

.dialog-area {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
}

.dialogue-line {
  padding: 10px 14px;
  margin-bottom: 6px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  border-left: 3px solid rgba(201, 169, 110, 0.2);
  line-height: 1.8;
}

.dialogue-line.fear, .dialogue-line.nervous, .dialogue-line.panic {
  border-left-color: rgba(220, 180, 80, 0.4);
}

.dialogue-line.angry {
  border-left-color: rgba(220, 80, 80, 0.4);
}

.dialogue-line.surrender, .dialogue-line.defeated {
  border-left-color: rgba(72, 199, 142, 0.4);
}

.dl-speaker {
  color: #c9a96e;
  font-size: 14px;
  font-weight: bold;
}

.dl-content {
  font-size: 14px;
  color: #e0d5c1;
}

.suspect-conclusion {
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  margin-top: 12px;
}

.conclusion-hint {
  font-size: 14px;
  color: rgba(224, 213, 193, 0.7);
  line-height: 1.8;
}

.conclusion-verdict {
  font-size: 15px;
  padding-top: 8px;
  color: rgba(224, 213, 193, 0.8);
}

.conclusion-verdict.guilty {
  color: #f0a060;
}
</style>