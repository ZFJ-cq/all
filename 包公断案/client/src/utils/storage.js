const STORAGE_PREFIX = 'baogong_'

const KEYS = {
  GAME_PROGRESS: STORAGE_PREFIX + 'game_progress',
  ACHIEVEMENTS: STORAGE_PREFIX + 'achievements',
  SETTINGS: STORAGE_PREFIX + 'settings',
  STATS: STORAGE_PREFIX + 'stats'
}

export function getStorage(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.warn('本地存储写入失败:', e)
  }
}

export function removeStorage(key) {
  try {
    localStorage.removeItem(key)
  } catch {}
}

let debounceTimers = {}

export function setStorageDebounced(key, value, delay = 500) {
  if (debounceTimers[key]) {
    clearTimeout(debounceTimers[key])
  }
  debounceTimers[key] = setTimeout(() => {
    setStorage(key, value)
    delete debounceTimers[key]
  }, delay)
}

export function getGameProgress(caseId) {
  const allProgress = getStorage(KEYS.GAME_PROGRESS) || {}
  return allProgress[caseId] || null
}

export function saveGameProgress(caseId, progress) {
  const allProgress = getStorage(KEYS.GAME_PROGRESS) || {}
  allProgress[caseId] = {
    ...progress,
    updatedAt: new Date().toISOString()
  }
  setStorageDebounced(KEYS.GAME_PROGRESS, allProgress)
}

export function saveGameProgressImmediate(caseId, progress) {
  const allProgress = getStorage(KEYS.GAME_PROGRESS) || {}
  allProgress[caseId] = {
    ...progress,
    updatedAt: new Date().toISOString()
  }
  setStorage(KEYS.GAME_PROGRESS, allProgress)
}

export function getAchievements() {
  return getStorage(KEYS.ACHIEVEMENTS) || {}
}

export function saveAchievement(achievementId) {
  const achievements = getAchievements()
  if (!achievements[achievementId]) {
    achievements[achievementId] = {
      unlocked: true,
      unlockedAt: new Date().toISOString()
    }
    setStorage(KEYS.ACHIEVEMENTS, achievements)
    return true
  }
  return false
}

export function getStats() {
  return getStorage(KEYS.STATS) || {
    totalCasesCompleted: 0,
    totalEvidenceCollected: 0,
    totalHintsUsed: 0,
    caseAttempts: {}
  }
}

export function updateStats(updates) {
  const stats = getStats()
  Object.assign(stats, updates)
  setStorageDebounced(KEYS.STATS, stats, 800)
}

export function getSettings() {
  return getStorage(KEYS.SETTINGS) || {
    soundEnabled: true,
    textSpeed: 'normal'
  }
}

export function saveSettings(settings) {
  setStorage(KEYS.SETTINGS, { ...getSettings(), ...settings })
}

export function exportAllData() {
  return {
    gameProgress: getStorage(KEYS.GAME_PROGRESS) || {},
    achievements: getStorage(KEYS.ACHIEVEMENTS) || {},
    stats: getStorage(KEYS.STATS) || {},
    settings: getStorage(KEYS.SETTINGS) || {},
    exportedAt: new Date().toISOString(),
    version: '1.0'
  }
}

export function importAllData(data) {
  if (!data || !data.version) return false
  if (data.gameProgress) setStorage(KEYS.GAME_PROGRESS, data.gameProgress)
  if (data.achievements) setStorage(KEYS.ACHIEVEMENTS, data.achievements)
  if (data.stats) setStorage(KEYS.STATS, data.stats)
  if (data.settings) setStorage(KEYS.SETTINGS, data.settings)
  return true
}

export function clearAllData() {
  Object.values(KEYS).forEach(key => removeStorage(key))
}

export { KEYS }