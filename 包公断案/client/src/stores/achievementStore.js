import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getAchievements, saveAchievement, getStats } from '@/utils/storage'
import { fetchAchievements } from '@/utils/api'

export const useAchievementStore = defineStore('achievement', () => {
  const achievementConfigs = ref([])
  const unlockedAchievements = ref({})
  const newUnlockQueue = ref([])
  const showPopup = ref(false)

  const unlockedList = computed(() => {
    return achievementConfigs.value.filter(a => unlockedAchievements.value[a.id])
  })

  const totalCount = computed(() => achievementConfigs.value.length)
  const unlockedCount = computed(() => unlockedList.value.length)

  async function loadAchievementConfigs() {
    try {
      const res = await fetchAchievements()
      achievementConfigs.value = res.data.achievements || []
    } catch {}
  }

  function loadLocalAchievements() {
    unlockedAchievements.value = getAchievements()
  }

  function init() {
    loadLocalAchievements()
    loadAchievementConfigs()
  }

  function checkAndUnlock(condition) {
    const newlyUnlocked = []
    for (const ach of achievementConfigs.value) {
      if (unlockedAchievements.value[ach.id]) continue
      let shouldUnlock = false
      const c = ach.condition

      switch (c.type) {
        case 'caseCompleted': {
          const stats = getStats()
          shouldUnlock = (stats.totalCasesCompleted || 0) >= c.count
          break
        }
        case 'allEvidenceCollected': {
          if (condition.evidenceCollected && condition.totalEvidence) {
            shouldUnlock = condition.evidenceCollected >= condition.totalEvidence
          }
          break
        }
        case 'correctJudgmentFirstTry': {
          shouldUnlock = !!condition.firstTryCorrect
          break
        }
        case 'allCasesCompleted': {
          const stats = getStats()
          shouldUnlock = (stats.totalCasesCompleted || 0) >= c.count
          break
        }
        case 'noHintCompleted': {
          shouldUnlock = condition.noHintsUsed && condition.caseCompleted
          break
        }
        case 'speedRun': {
          if (condition.elapsedTime && c.timeLimit) {
            shouldUnlock = condition.elapsedTime <= c.timeLimit && condition.caseCompleted
          }
          break
        }
        case 'totalEvidenceCollected': {
          const stats = getStats()
          shouldUnlock = (stats.totalEvidenceCollected || 0) >= c.count
          break
        }
        case 'retryCount': {
          const stats = getStats()
          const maxAttempts = Math.max(...Object.values(stats.caseAttempts || {}), 0)
          shouldUnlock = maxAttempts >= c.count
          break
        }
      }

      if (shouldUnlock) {
        const isNew = saveAchievement(ach.id)
        if (isNew) {
          unlockedAchievements.value[ach.id] = { unlocked: true }
          newlyUnlocked.push(ach)
          newUnlockQueue.value.push(ach)
        }
      }
    }

    if (newUnlockQueue.value.length > 0 && !showPopup.value) {
      showNextUnlock()
    }

    return newlyUnlocked
  }

  function showNextUnlock() {
    if (newUnlockQueue.value.length === 0) {
      showPopup.value = false
      return
    }
    showPopup.value = true
    setTimeout(() => {
      newUnlockQueue.value.shift()
      if (newUnlockQueue.value.length > 0) {
        showNextUnlock()
      } else {
        showPopup.value = false
      }
    }, 3000)
  }

  function dismissPopup() {
    newUnlockQueue.value = []
    showPopup.value = false
  }

  return {
    achievementConfigs,
    unlockedAchievements,
    newUnlockQueue,
    showPopup,
    unlockedList,
    totalCount,
    unlockedCount,
    init,
    checkAndUnlock,
    dismissPopup,
    loadLocalAchievements
  }
})