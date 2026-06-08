import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getGameProgress,
  saveGameProgress,
  saveGameProgressImmediate,
  getStats,
  updateStats
} from '@/utils/storage'
import {
  fetchCaseConfig,
  fetchCaseStage,
  fetchEvidenceDetail,
  fetchSuspectDetail,
  fetchHints,
  submitJudgment,
  preloadCase
} from '@/utils/api'

export const useGameStore = defineStore('game', () => {
  const currentCaseId = ref(null)
  const caseConfig = ref(null)
  const currentStage = ref('report')
  const loading = ref(false)
  const collectedEvidences = ref([])
  const evidenceDetails = ref({})
  const interrogatedSuspects = ref([])
  const suspectDetails = ref({})
  const hintsUsed = ref(0)
  const hintsAvailable = ref([])
  const caseStartTime = ref(null)
  const judgmentResult = ref(null)
  const currentDialogueIndex = ref(0)
  const stageCompleted = ref({})

  const currentStageData = computed(() => {
    if (!caseConfig.value || !caseConfig.value.stages) return null
    return caseConfig.value.stages[currentStage.value] || null
  })

  const collectedCount = computed(() => collectedEvidences.value.length)
  const totalEvidenceCount = computed(() => {
    if (!caseConfig.value?.stages?.investigation) return 0
    return caseConfig.value.stages.investigation.evidences.length
  })

  function resetCase() {
    currentCaseId.value = null
    caseConfig.value = null
    currentStage.value = 'report'
    collectedEvidences.value = []
    evidenceDetails.value = {}
    interrogatedSuspects.value = []
    suspectDetails.value = {}
    hintsUsed.value = 0
    hintsAvailable.value = []
    caseStartTime.value = null
    judgmentResult.value = null
    currentDialogueIndex.value = 0
    stageCompleted.value = {}
  }

  async function startCase(caseId) {
    resetCase()
    currentCaseId.value = caseId
    loading.value = true
    caseStartTime.value = Date.now()

    const fromCache = getGameProgress(caseId)
    if (fromCache) {
      currentStage.value = fromCache.currentStage || 'report'
      collectedEvidences.value = fromCache.collectedEvidences || []
      evidenceDetails.value = fromCache.evidenceDetails || {}
      interrogatedSuspects.value = fromCache.interrogatedSuspects || []
      suspectDetails.value = fromCache.suspectDetails || {}
      hintsUsed.value = fromCache.hintsUsed || 0
      currentDialogueIndex.value = fromCache.currentDialogueIndex || 0
      stageCompleted.value = fromCache.stageCompleted || {}
    }

    try {
      const res = await fetchCaseConfig(caseId)
      caseConfig.value = res.data
      if (!fromCache) {
        hintsAvailable.value = res.data.hints || []
      }
      persistProgress()
    } catch (err) {
      console.error('加载案件失败:', err)
    } finally {
      loading.value = false
    }
  }

  async function loadStage(stageId) {
    if (!currentCaseId.value) return
    currentStage.value = stageId
    currentDialogueIndex.value = 0
    loading.value = true
    try {
      const res = await fetchCaseStage(currentCaseId.value, stageId)
      if (res.data) {
        if (stageId === 'investigation' && !hintsAvailable.value.length) {
          hintsAvailable.value = res.data.hints || []
        }
      }
    } catch (err) {
      console.error('加载阶段失败:', err)
    } finally {
      loading.value = false
    }
    persistProgress()
  }

  async function collectEvidence(evidenceId) {
    if (collectedEvidences.value.includes(evidenceId)) return
    collectedEvidences.value.push(evidenceId)
    try {
      const res = await fetchEvidenceDetail(currentCaseId.value, evidenceId)
      evidenceDetails.value[evidenceId] = res.data
    } catch {}
    const stats = getStats()
    stats.totalEvidenceCollected = (stats.totalEvidenceCollected || 0) + 1
    updateStats({ totalEvidenceCollected: stats.totalEvidenceCollected })
    persistProgress()
  }

  async function interrogateSuspect(suspectId) {
    if (interrogatedSuspects.value.includes(suspectId)) return
    interrogatedSuspects.value.push(suspectId)
    try {
      const res = await fetchSuspectDetail(currentCaseId.value, suspectId)
      suspectDetails.value[suspectId] = res.data
    } catch {}
    persistProgress()
  }

  async function useHint() {
    if (hintsUsed.value >= hintsAvailable.value.length) return null
    const hint = hintsAvailable.value[hintsUsed.value]
    hintsUsed.value++
    const stats = getStats()
    stats.totalHintsUsed = (stats.totalHintsUsed || 0) + 1
    updateStats({ totalHintsUsed: stats.totalHintsUsed })
    persistProgress()
    return hint
  }

  async function judge(suspectId) {
    loading.value = true
    try {
      const res = await submitJudgment(currentCaseId.value, suspectId, collectedEvidences.value)
      judgmentResult.value = res.data
      if (res.data.verdict === 'correct') {
        const stats = getStats()
        stats.totalCasesCompleted = (stats.totalCasesCompleted || 0) + 1
        updateStats({ totalCasesCompleted: stats.totalCasesCompleted })

        const elapsed = Math.floor((Date.now() - caseStartTime.value) / 1000)
        markStageCompleted('judgment')
        persistProgress()
      }
      return res.data
    } catch (err) {
      console.error('断案提交失败:', err)
      return { success: false, message: '提交失败，请重试' }
    } finally {
      loading.value = false
    }
  }

  function markStageCompleted(stageId) {
    stageCompleted.value[stageId] = true
    persistProgress()
  }

  function persistProgress() {
    if (!currentCaseId.value) return
    saveGameProgress(currentCaseId.value, {
      currentStage: currentStage.value,
      collectedEvidences: [...collectedEvidences.value],
      evidenceDetails: { ...evidenceDetails.value },
      interrogatedSuspects: [...interrogatedSuspects.value],
      suspectDetails: { ...suspectDetails.value },
      hintsUsed: hintsUsed.value,
      currentDialogueIndex: currentDialogueIndex.value,
      stageCompleted: { ...stageCompleted.value },
      caseStartTime: caseStartTime.value
    })
  }

  function persistProgressImmediate() {
    if (!currentCaseId.value) return
    saveGameProgressImmediate(currentCaseId.value, {
      currentStage: currentStage.value,
      collectedEvidences: [...collectedEvidences.value],
      evidenceDetails: { ...evidenceDetails.value },
      interrogatedSuspects: [...interrogatedSuspects.value],
      suspectDetails: { ...suspectDetails.value },
      hintsUsed: hintsUsed.value,
      currentDialogueIndex: currentDialogueIndex.value,
      stageCompleted: { ...stageCompleted.value },
      caseStartTime: caseStartTime.value
    })
  }

  async function preloadNextCase() {
    if (!caseConfig.value) return
    const caseNumber = parseInt(currentCaseId.value.replace('case_', ''))
    const nextId = `case_${String(caseNumber + 1).padStart(3, '0')}`
    try {
      await preloadCase(nextId)
    } catch {}
  }

  function getElapsedTime() {
    if (!caseStartTime.value) return 0
    return Math.floor((Date.now() - caseStartTime.value) / 1000)
  }

  return {
    currentCaseId,
    caseConfig,
    currentStage,
    loading,
    collectedEvidences,
    evidenceDetails,
    interrogatedSuspects,
    suspectDetails,
    hintsUsed,
    hintsAvailable,
    caseStartTime,
    judgmentResult,
    currentDialogueIndex,
    stageCompleted,
    currentStageData,
    collectedCount,
    totalEvidenceCount,
    resetCase,
    startCase,
    loadStage,
    collectEvidence,
    interrogateSuspect,
    useHint,
    judge,
    markStageCompleted,
    persistProgress,
    persistProgressImmediate,
    preloadNextCase,
    getElapsedTime
  }
})