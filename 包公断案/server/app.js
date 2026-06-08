const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const gameController = require('./controllers/gameController');
const userController = require('./controllers/userController');

const app = express();

app.use(cors({ origin: config.corsOrigins, credentials: true }));
app.use(express.json());

app.use('/static', express.static(path.join(__dirname, '..', 'client', 'public')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/cases', (req, res) => {
  try {
    const list = gameController.getCaseList();
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/cases/:caseId', (req, res) => {
  try {
    const data = gameController.getCaseConfig(req.params.caseId);
    if (!data) return res.status(404).json({ success: false, message: '案件不存在' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/cases/:caseId/stages/:stageId', (req, res) => {
  try {
    const data = gameController.getCaseStage(req.params.caseId, req.params.stageId);
    if (!data) return res.status(404).json({ success: false, message: '阶段不存在' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/cases/:caseId/evidences/:evidenceId', (req, res) => {
  try {
    const data = gameController.getEvidenceDetail(req.params.caseId, req.params.evidenceId);
    if (!data) return res.status(404).json({ success: false, message: '证据不存在' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/cases/:caseId/suspects/:suspectId', (req, res) => {
  try {
    const data = gameController.getSuspectDetail(req.params.caseId, req.params.suspectId);
    if (!data) return res.status(404).json({ success: false, message: '嫌疑人不存在' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/cases/:caseId/hints', (req, res) => {
  try {
    const data = gameController.getHints(req.params.caseId);
    if (!data) return res.status(404).json({ success: false, message: '案件不存在' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/cases/:caseId/judge', (req, res) => {
  try {
    const { suspectId, evidenceIds } = req.body;
    const result = gameController.verifyJudgment(req.params.caseId, suspectId, evidenceIds);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/achievements', (req, res) => {
  try {
    const data = gameController.getAchievements();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/user/progress', userController.saveProgress);
app.get('/api/user/progress', userController.getProgress);
app.post('/api/user/achievements/verify', userController.verifyAchievement);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
  });
}

app.listen(config.port, () => {
  console.log(`包公断案后端服务已启动: http://localhost:${config.port}`);
});