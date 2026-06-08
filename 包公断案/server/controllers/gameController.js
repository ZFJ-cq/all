const fs = require('fs');
const path = require('path');
const cache = require('../middleware/cache');

const DATA_DIR = path.join(__dirname, '..', 'data', 'cases');

function loadCaseFromFile(caseId) {
  const filePath = path.join(DATA_DIR, `${caseId}.json`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function getCaseConfig(caseId) {
  const cacheKey = cache.getCacheKey('case', caseId);
  let caseData = cache.getFromCache(cacheKey);
  if (!caseData) {
    caseData = loadCaseFromFile(caseId);
    if (caseData) {
      cache.setToCache(cacheKey, caseData);
    }
  }
  return caseData;
}

function getCaseList() {
  const cacheKey = cache.getCacheKey('case', 'list');
  let list = cache.getFromCache(cacheKey);
  if (!list) {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
    list = files.map(file => {
      const raw = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
      const data = JSON.parse(raw);
      return {
        id: data.id,
        title: data.title,
        subtitle: data.subtitle,
        difficulty: data.difficulty,
        description: data.description
      };
    });
    cache.setToCache(cacheKey, list);
  }
  return list;
}

function getCaseStage(caseId, stageId) {
  const caseData = getCaseConfig(caseId);
  if (!caseData) return null;
  const stage = caseData.stages[stageId];
  if (!stage) return null;

  if (stageId === 'investigation') {
    return {
      id: stage.id,
      name: stage.name,
      scenes: stage.scenes,
      evidenceCount: stage.evidences.length,
      evidences: stage.evidences.map(e => ({
        id: e.id,
        name: e.name,
        icon: e.icon,
        sceneId: e.sceneId
      }))
    };
  }

  if (stageId === 'interrogation') {
    return {
      id: stage.id,
      name: stage.name,
      suspects: stage.suspects.map(s => ({
        id: s.id,
        name: s.name,
        role: s.role,
        description: s.description
      }))
    };
  }

  return stage;
}

function getEvidenceDetail(caseId, evidenceId) {
  const caseData = getCaseConfig(caseId);
  if (!caseData || !caseData.stages.investigation) return null;
  const evidence = caseData.stages.investigation.evidences.find(e => e.id === evidenceId);
  if (!evidence) return null;
  return evidence;
}

function getSuspectDetail(caseId, suspectId) {
  const caseData = getCaseConfig(caseId);
  if (!caseData || !caseData.stages.interrogation) return null;
  const suspect = caseData.stages.interrogation.suspects.find(s => s.id === suspectId);
  if (!suspect) return null;
  return suspect;
}

function getHints(caseId) {
  const caseData = getCaseConfig(caseId);
  if (!caseData) return null;
  return caseData.hints || [];
}

function verifyJudgment(caseId, suspectId, evidenceIds) {
  const caseData = getCaseConfig(caseId);
  if (!caseData || !caseData.stages.judgment) {
    return { success: false, message: '案件配置不存在' };
  }

  const judgment = caseData.stages.judgment;
  const correctSuspect = judgment.correctSuspectId;
  const requiredEvidences = judgment.requiredEvidenceIds;

  const suspectCorrect = suspectId === correctSuspect;

  const evidenceSet = new Set(evidenceIds || []);
  const requiredSet = new Set(requiredEvidences);
  const allRequiredFound = requiredEvidences.every(id => evidenceSet.has(id));

  let result;
  if (suspectCorrect && allRequiredFound) {
    result = {
      success: true,
      verdict: 'correct',
      message: judgment.judgmentText.correct,
      correctSuspectId: correctSuspect,
      requiredEvidenceIds: requiredEvidences
    };
  } else if (suspectCorrect && !allRequiredFound) {
    const missing = requiredEvidences.filter(id => !evidenceSet.has(id));
    result = {
      success: false,
      verdict: 'partial',
      message: judgment.judgmentText.partial,
      correctSuspectId: correctSuspect,
      missingEvidenceIds: missing
    };
  } else {
    result = {
      success: false,
      verdict: 'wrong',
      message: judgment.judgmentText.wrong
    };
  }

  return result;
}

function getAchievements() {
  const cacheKey = cache.getCacheKey('achievements', 'all');
  let data = cache.getFromCache(cacheKey);
  if (!data) {
    const filePath = path.join(__dirname, '..', 'data', 'achievements.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    data = JSON.parse(raw);
    cache.setToCache(cacheKey, data);
  }
  return data;
}

module.exports = {
  getCaseList,
  getCaseConfig,
  getCaseStage,
  getEvidenceDetail,
  getSuspectDetail,
  getHints,
  verifyJudgment,
  getAchievements
};