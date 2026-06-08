const API_BASE = '/api'

async function request(url, options = {}) {
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options
  }
  try {
    const response = await fetch(`${API_BASE}${url}`, config)
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || '请求失败')
    }
    return data
  } catch (err) {
    console.error('API请求错误:', err)
    throw err
  }
}

export function fetchCaseList() {
  return request('/cases')
}

export function fetchCaseConfig(caseId) {
  return request(`/cases/${caseId}`)
}

export function fetchCaseStage(caseId, stageId) {
  return request(`/cases/${caseId}/stages/${stageId}`)
}

export function fetchEvidenceDetail(caseId, evidenceId) {
  return request(`/cases/${caseId}/evidences/${evidenceId}`)
}

export function fetchSuspectDetail(caseId, suspectId) {
  return request(`/cases/${caseId}/suspects/${suspectId}`)
}

export function fetchHints(caseId) {
  return request(`/cases/${caseId}/hints`)
}

export function submitJudgment(caseId, suspectId, evidenceIds) {
  return request(`/cases/${caseId}/judge`, {
    method: 'POST',
    body: JSON.stringify({ suspectId, evidenceIds })
  })
}

export function fetchAchievements() {
  return request('/achievements')
}

let preloadCache = {}

export async function preloadCase(caseId) {
  if (preloadCache[caseId]) return preloadCache[caseId]
  try {
    const result = await fetchCaseConfig(caseId)
    preloadCache[caseId] = result
    return result
  } catch {
    return null
  }
}

export function getPreloadedCase(caseId) {
  return preloadCache[caseId] || null
}