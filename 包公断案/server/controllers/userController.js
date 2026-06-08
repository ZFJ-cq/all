function saveProgress(req, res) {
  const { caseId, progress } = req.body;
  if (!caseId || !progress) {
    return res.status(400).json({ success: false, message: '参数不完整' });
  }

  if (!progress.stage || !['report', 'investigation', 'interrogation', 'judgment'].includes(progress.stage)) {
    return res.status(400).json({ success: false, message: '无效的游戏阶段' });
  }

  return res.json({
    success: true,
    message: '进度数据已保存（请在客户端同步到本地存储）',
    data: { caseId, progress, savedAt: new Date().toISOString() }
  });
}

function getProgress(req, res) {
  const { caseId } = req.query;
  return res.json({
    success: true,
    message: '请从本地存储获取进度数据',
    data: { caseId }
  });
}

function verifyAchievement(req, res) {
  const { achievementId, userData } = req.body;
  if (!achievementId || !userData) {
    return res.status(400).json({ success: false, message: '参数不完整' });
  }

  return res.json({
    success: true,
    message: '成就验证请在客户端完成',
    data: { achievementId }
  });
}

module.exports = { saveProgress, getProgress, verifyAchievement };