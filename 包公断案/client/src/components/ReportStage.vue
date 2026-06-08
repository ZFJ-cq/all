<template>
  <div class="report-stage">
    <div class="stage-title">
      <span class="stage-icon">📜</span>
      <span>报案</span>
    </div>

    <div class="dialog-area" v-if="dialogues.length > 0 && currentIndex < dialogues.length">
      <div class="speaker-indicator" :class="currentDialogue.emotion">
        <span class="speaker-name">{{ currentDialogue.speaker }}</span>
        <span class="speaker-title">{{ currentDialogue.speakerTitle }}</span>
      </div>
      <div class="dialogue-bubble" :class="currentDialogue.emotion">
        <p>{{ displayText }}</p>
      </div>
      <div class="dialogue-controls">
        <button
          v-if="!isTyping"
          class="next-btn"
          @click="nextDialogue"
        >
          {{ currentIndex < dialogues.length - 1 ? '继续' : '开始取证' }}
        </button>
        <button
          v-else
          class="skip-btn"
          @click="skipTyping"
        >
          跳过
        </button>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>案情已了解清楚，可以开始取证调查了。</p>
      <button class="action-btn" @click="$emit('complete')">开始取证</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useGameStore } from '@/stores/gameStore'

const emit = defineEmits(['complete'])
const store = useGameStore()

const dialogues = computed(() => store.caseConfig?.stages?.report?.dialogues || [])
const currentIndex = ref(0)
const displayText = ref('')
const isTyping = ref(false)
const charIndex = ref(0)
let typingTimer = null

const currentDialogue = computed(() => dialogues.value[currentIndex.value] || {})

function getTextSpeed() {
  try {
    const settings = JSON.parse(localStorage.getItem('baogong_settings') || '{}')
    const speeds = { slow: 80, normal: 40, fast: 15 }
    return speeds[settings.textSpeed] || 40
  } catch {
    return 40
  }
}

function startTyping() {
  if (!currentDialogue.value.content) return
  isTyping.value = true
  charIndex.value = 0
  displayText.value = ''
  const text = currentDialogue.value.content
  const speed = getTextSpeed()

  function type() {
    if (charIndex.value < text.length) {
      displayText.value += text[charIndex.value]
      charIndex.value++
      typingTimer = setTimeout(type, speed)
    } else {
      isTyping.value = false
    }
  }
  type()
}

function skipTyping() {
  clearTimeout(typingTimer)
  displayText.value = currentDialogue.value.content
  isTyping.value = false
}

function nextDialogue() {
  if (currentIndex.value < dialogues.value.length - 1) {
    currentIndex.value++
  } else {
    store.markStageCompleted('report')
    emit('complete')
  }
}

onMounted(() => {
  currentIndex.value = store.currentDialogueIndex || 0
  if (dialogues.value.length > 0) {
    startTyping()
  }
})

watch(currentIndex, () => {
  store.currentDialogueIndex = currentIndex.value
  store.persistProgress()
  startTyping()
})
</script>

<style scoped>
.report-stage {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  max-width: 700px;
  margin: 0 auto;
  width: 100%;
}

.stage-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  color: #c9a96e;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(201, 169, 110, 0.15);
  margin-bottom: 20px;
}

.stage-icon { font-size: 22px; }

.dialog-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.speaker-indicator {
  padding: 10px 16px;
  background: rgba(201, 169, 110, 0.06);
  border-radius: 10px 10px 0 0;
  border: 1px solid rgba(201, 169, 110, 0.15);
  border-bottom: none;
  display: flex;
  align-items: center;
  gap: 10px;
}

.speaker-name {
  font-size: 16px;
  color: #c9a96e;
  font-weight: bold;
}

.speaker-title {
  font-size: 12px;
  color: rgba(224, 213, 193, 0.5);
  background: rgba(201, 169, 110, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
}

.dialogue-bubble {
  flex: 1;
  padding: 20px 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(201, 169, 110, 0.15);
  border-top: none;
  border-radius: 0 0 10px 10px;
  min-height: 200px;
  display: flex;
  align-items: flex-start;
}

.dialogue-bubble p {
  font-size: 17px;
  line-height: 2;
  color: #e0d5c1;
  width: 100%;
}

.dialogue-controls {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.next-btn, .skip-btn {
  padding: 12px 40px;
  border: 1px solid #c9a96e;
  border-radius: 10px;
  background: rgba(201, 169, 110, 0.15);
  color: #c9a96e;
  font-size: 16px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.next-btn:hover, .skip-btn:hover {
  background: rgba(201, 169, 110, 0.3);
}

.skip-btn {
  border-color: rgba(201, 169, 110, 0.3);
  background: transparent;
  font-size: 14px;
  padding: 8px 20px;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  color: rgba(224, 213, 193, 0.6);
}

.action-btn {
  padding: 14px 40px;
  border: 1px solid #c9a96e;
  border-radius: 10px;
  background: rgba(201, 169, 110, 0.15);
  color: #c9a96e;
  font-size: 16px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(201, 169, 110, 0.3);
}
</style>