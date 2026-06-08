const express = require('express');
const cors = require('cors');
const path = require('path');
const os = require('os');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, '.')));

const rateLimitMap = {};
function rateLimit(key, maxRequests, windowMs) {
  return function (req, res, next) {
    const now = Date.now();
    if (!rateLimitMap[key]) rateLimitMap[key] = {};
    const ip = req.ip || req.connection.remoteAddress;
    if (!rateLimitMap[key][ip]) rateLimitMap[key][ip] = [];
    rateLimitMap[key][ip] = rateLimitMap[key][ip].filter(t => now - t < windowMs);
    if (rateLimitMap[key][ip].length >= maxRequests) {
      return res.status(429).json({ ok: false, msg: '请求过于频繁，请稍后再试' });
    }
    rateLimitMap[key][ip].push(now);
    next();
  };
}

setInterval(() => {
  const now = Date.now();
  for (const key in rateLimitMap) {
    for (const ip in rateLimitMap[key]) {
      rateLimitMap[key][ip] = rateLimitMap[key][ip].filter(t => now - t < 60000);
      if (rateLimitMap[key][ip].length === 0) delete rateLimitMap[key][ip];
    }
  }
}, 60000);

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return '127.0.0.1';
}

function sanitize(str) {
  return String(str || '').replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' })[c]).trim();
}

const VALID_DIFFICULTIES = ['easy', 'medium', 'hard', 'mix'];
const VALID_MODES = ['rounds', 'questions', 'time'];
const VALID_GAMEMODES = ['normal', 'race'];
const VALID_RANGES = [20, 50, 100];

function sanitizeRoomForResponse(room) {
  const safe = Object.assign({}, room);
  delete safe.password;
  delete safe._timers;
  if (safe.events && safe.events.length > 50) {
    safe.events = safe.events.slice(-30);
  }
  return safe;
}

const rooms = {};
const EPS = 1e-9;
const ANSWER_TIMEOUT = 60;
const MAX_PLAYERS = 6;

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function solve24(nums) {
  const ops = ['+', '-', '*', '/'];
  const opSymbols = { '+': '＋', '-': '－', '*': '×', '/': '÷' };
  let result = null;
  function helper(numbers, expressions) {
    if (result) return;
    if (numbers.length === 1) {
      if (Math.abs(numbers[0] - 24) < EPS) result = expressions[0];
      return;
    }
    for (let i = 0; i < numbers.length; i++) {
      for (let j = 0; j < numbers.length; j++) {
        if (i === j) continue;
        const remaining = [], remainingExpr = [];
        for (let k = 0; k < numbers.length; k++) {
          if (k !== i && k !== j) { remaining.push(numbers[k]); remainingExpr.push(expressions[k]); }
        }
        for (const op of ops) {
          let val;
          if (op === '+') val = numbers[i] + numbers[j];
          else if (op === '-') val = numbers[i] - numbers[j];
          else if (op === '*') val = numbers[i] * numbers[j];
          else { if (Math.abs(numbers[j]) < EPS) continue; val = numbers[i] / numbers[j]; }
          const expr = `(${expressions[i]}${opSymbols[op]}${expressions[j]})`;
          remaining.push(val);
          remainingExpr.push(expr);
          helper(remaining, remainingExpr);
          remaining.pop(); remainingExpr.pop();
          if (result) return;
        }
      }
    }
  }
  helper(nums, nums.map(String));
  return result;
}

function generateQuestion(difficulty, range) {
  const max = Math.max(10, range || 20);
  if (difficulty === 'hard') {
    let nums, sol, att = 0;
    do {
      nums = [randInt(1, 13), randInt(1, 13), randInt(1, 13), randInt(1, 13)];
      sol = solve24(nums);
      att++;
    } while (!sol && att < 200);
    if (!sol) { const pool = [[1,2,3,4],[1,3,4,6],[2,3,4,6],[1,2,6,6],[3,3,8,8],[1,4,5,6],[2,4,6,8],[4,5,6,7]]; nums = [...pool[randInt(0,pool.length-1)]]; sol = solve24(nums); }
    return { numbers: nums, answer: 24, solution: sol || '' };
  } else if (difficulty === 'easy') {
    const op = Math.random() > 0.5 ? '+' : '-';
    let a, b, ans;
    if (op === '+') { a = randInt(1, max); b = randInt(1, max); ans = a + b; }
    else { a = randInt(1, max); b = randInt(1, a); ans = a - b; }
    return { numbers: [a, b], operator: op === '+' ? '＋' : '－', answer: ans };
  } else {
    const t = randInt(0, 3); let a, b, op, ans;
    if (t === 0) { a = randInt(1, max); b = randInt(1, max); op = '+'; ans = a + b; }
    else if (t === 1) { a = randInt(1, max); b = randInt(1, a); op = '-'; ans = a - b; }
    else if (t === 2) { a = randInt(1, 12); b = randInt(1, 12); op = '*'; ans = a * b; }
    else { b = randInt(1, 12); ans = randInt(1, 12); a = b * ans; op = '/'; }
    const opSym = { '+': '＋', '-': '－', '*': '×', '/': '÷' };
    return { numbers: [a, b], operator: opSym[op], answer: ans };
  }
}

function generateRoomId() {
  let id; do { id = String(randInt(100000, 999999)); } while (rooms[id]);
  return id;
}

const PLAYER_COLORS = ['#6c5ce7', '#fd79a8', '#0984e3', '#00b894', '#e17055', '#d63031'];
function autoSubmitTimeout(roomId) {
  const room = rooms[roomId];
  if (!room) return;
  const timeout = room.timeLimit || ANSWER_TIMEOUT;
  const timerId = setTimeout(() => {
    if (!room._timers) room._timers = [];
    room._timers = room._timers.filter(id => id !== timerId);
    const r = rooms[roomId];
    if (!r || r.phase !== 'playing') return;
    r.players.forEach(p => {
      const hasSubmitted = r.roundAnswers.some(a => a.playerId === p.id);
      if (!hasSubmitted) {
        p.wrong++; p.totalTime += timeout;
        r.roundAnswers.push({ playerId: p.id, playerName: p.name, correct: false, time: timeout, timeout: true });
      }
    });
    checkRoundComplete(roomId);
  }, timeout * 1000);
  if (!room._timers) room._timers = [];
  room._timers.push(timerId);
}

function clearRoomTimers(roomId) {
  const room = rooms[roomId];
  if (room && room._timers) {
    room._timers.forEach(id => clearTimeout(id));
    room._timers = [];
  }
}

function checkRoundComplete(roomId) {
  const room = rooms[roomId];
  if (!room) return;
  const allSubmitted = room.players.every(p => room.roundAnswers.some(a => a.playerId === p.id));
  if (allSubmitted) {
    if (room.mode === 'questions') room.totalQuestions++;
    const isLastRound = (room.mode === 'rounds' && room.currentRound >= room.modeValue) ||
      (room.mode === 'questions' && room.totalQuestions >= room.modeValue) ||
      (room.mode === 'time' && room.startTime > 0 && (Date.now() - room.startTime) / 1000 >= room.modeValue);
    if (isLastRound) {
      room.phase = 'finished';
      finishGame(roomId);
    } else if (room.gameMode === 'race') {
      clearRoomTimers(roomId);
      room.roundAnswers = [];
      room.roundStartTime = 0;
      room.currentRound++;
      room.currentQuestion = generateQuestion(room.difficulty, room.range);
      room.phase = 'playing';
      room.roundStartTime = Date.now();
      autoSubmitTimeout(roomId);
    } else {
      room.phase = 'roundEnd';
    }
    room.lastActive = Date.now();
  }
}

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/api/serverInfo', rateLimit('serverInfo', 30, 60000), (req, res) => res.json({ ok: true, ip: getLocalIP(), port: PORT }));
app.get('/api/room/:roomId', rateLimit('roomGet', 30, 60000), (req, res) => {
  const room = rooms[req.params.roomId];
  if (!room) return res.json({ ok: false, msg: '房间不存在' });
  room.lastActive = Date.now();
  res.json({ ok: true, room: sanitizeRoomForResponse(room) });
});
app.post('/api/getRoom', rateLimit('getRoom', 30, 60000), (req, res) => {
  const { roomId } = req.body;
  if (!roomId || typeof roomId !== 'string') return res.json({ ok: false, msg: '参数错误' });
  const room = rooms[roomId];
  if (!room) return res.json({ ok: false, msg: '房间不存在' });
  room.lastActive = Date.now();
  res.json({ ok: true, room: sanitizeRoomForResponse(room) });
});
app.post('/api/getQuestion', rateLimit('getQuestion', 20, 60000), (req, res) => {
  const { difficulty, range } = req.body;
  const diff = VALID_DIFFICULTIES.includes(difficulty) ? difficulty : 'easy';
  const rng = Math.max(10, Math.min(parseInt(range) || 20, 100));
  const q = generateQuestion(diff, rng);
  res.json({ ok: true, question: q });
});

app.post('/api/createRoom', rateLimit('createRoom', 5, 60000), (req, res) => {
  const { playerName, difficulty, range, totalRounds, password, mode, modeValue, timeLimit, totalTime, gameMode } = req.body;
  const name = sanitize(playerName);
  if (!name) return res.json({ ok: false, msg: '昵称不能为空' });
  const diff = VALID_DIFFICULTIES.includes(difficulty) ? difficulty : 'easy';
  const rng = VALID_RANGES.includes(parseInt(range)) ? parseInt(range) : 20;
  const gm = VALID_GAMEMODES.includes(gameMode) ? gameMode : 'normal';
  const roomId = generateRoomId();
  const playerId = 'p_' + Math.random().toString(36).slice(2, 10);
  const isRace = gm === 'race';
  const finalMode = isRace ? 'time' : (VALID_MODES.includes(mode) ? mode : 'rounds');
  const finalModeValue = isRace ? (parseInt(totalTime) || 180) : (modeValue ? parseInt(modeValue) : (finalMode === 'time' ? 300 : 10));
  const finalTimeLimit = Math.max(5, Math.min(parseInt(timeLimit) || ANSWER_TIMEOUT, 300));
  const finalTotalTime = Math.max(60, Math.min(parseInt(totalTime) || 600, 3600));
  const pw = String(password || '').slice(0, 6);
  rooms[roomId] = {
    id: roomId, owner: playerId, phase: 'waiting', difficulty: diff, range: rng,
    totalRounds: parseInt(totalRounds) || 5, currentRound: 0, currentQuestion: null, roundAnswers: [], roundStartTime: 0,
    players: [{ id: playerId, name: name.slice(0, 10), correct: 0, wrong: 0, totalTime: 0, ready: true, color: PLAYER_COLORS[0] }],
    password: pw, lastActive: Date.now(), events: [],
    mode: finalMode,
    modeValue: finalModeValue,
    totalQuestions: 0, startTime: 0,
    timeLimit: finalTimeLimit,
    totalTime: finalTotalTime,
    gameMode: gm
  };
  res.json({ ok: true, roomId, playerId });
});

app.post('/api/joinRoom', rateLimit('joinRoom', 10, 60000), (req, res) => {
  const { roomId, playerName, password } = req.body;
  if (!roomId || typeof roomId !== 'string') return res.json({ ok: false, msg: '参数错误' });
  const room = rooms[roomId];
  if (!room) return res.json({ ok: false, msg: '房间不存在' });
  if (room.phase !== 'waiting') return res.json({ ok: false, msg: '游戏已开始，不能加入' });
  if (room.players.length >= MAX_PLAYERS) return res.json({ ok: false, msg: '房间已满' });
  if (room.password && room.password !== String(password || '')) return res.json({ ok: false, msg: '密码错误' });
  const name = sanitize(playerName);
  if (!name) return res.json({ ok: false, msg: '昵称不能为空' });
  const playerId = 'p_' + Math.random().toString(36).slice(2, 10);
  room.players.push({ id: playerId, name: name.slice(0, 10), correct: 0, wrong: 0, totalTime: 0, ready: true, color: PLAYER_COLORS[room.players.length % PLAYER_COLORS.length] });
  room.events.push({ type: 'join', playerName: name.slice(0, 10), time: Date.now() });
  room.lastActive = Date.now();
  console.log(`${name.slice(0, 10)} 加入房间 ${roomId}`);
  res.json({ ok: true, playerId });
});

app.post('/api/setReady', rateLimit('setReady', 20, 60000), (req, res) => {
  const { roomId, playerId, ready } = req.body;
  if (!roomId || !playerId) return res.json({ ok: false, msg: '参数错误' });
  const room = rooms[roomId];
  if (!room) return res.json({ ok: false, msg: '房间不存在' });
  const player = room.players.find(p => p.id === playerId);
  if (!player) return res.json({ ok: false, msg: '玩家不在房间' });
  player.ready = !!ready;
  room.lastActive = Date.now();
  res.json({ ok: true });
});

app.post('/api/startGame', rateLimit('startGame', 5, 60000), (req, res) => {
  const { roomId, playerId } = req.body;
  if (!roomId || !playerId) return res.json({ ok: false, msg: '参数错误' });
  const room = rooms[roomId];
  if (!room) return res.json({ ok: false, msg: '房间不存在' });
  if (room.owner !== playerId) return res.json({ ok: false, msg: '只有房主才能开始' });
  if (room.phase !== 'waiting') return res.json({ ok: false, msg: '当前状态不允许' });
  if (room.players.length < 2) return res.json({ ok: false, msg: '至少需要2名玩家' });
  if (!room.players.every(p => p.id === room.owner || p.ready)) return res.json({ ok: false, msg: '请等待所有玩家准备' });
  room.phase = 'countdown'; room.countdownAt = Date.now(); room.lastActive = Date.now();
  const cdTimer = setTimeout(() => { const r = rooms[roomId]; if (r && r.phase === 'countdown') startRound(roomId); }, 3000);
  if (!room._timers) room._timers = [];
  room._timers.push(cdTimer);
  res.json({ ok: true });
});

function startRound(roomId) {
  const room = rooms[roomId]; if (!room) return;
  room.phase = 'playing'; room.roundStartTime = Date.now();
  if (room.mode === 'time' && !room.startTime) room.startTime = Date.now();
  if (room.mode === 'rounds') room.currentRound++;
  room.currentQuestion = generateQuestion(room.difficulty, room.range);
  room.roundAnswers = []; room.players.forEach(p => p.ready = false);
  room.lastActive = Date.now(); autoSubmitTimeout(roomId);
}

app.post('/api/submitAnswer', rateLimit('submitAnswer', 30, 60000), (req, res) => {
  const { roomId, playerId, answer, time, is24Correct, steps } = req.body;
  if (!roomId || !playerId) return res.json({ ok: false, msg: '参数错误' });
  const room = rooms[roomId]; if (!room || room.phase !== 'playing') return res.json({ ok: false, msg: '房间不存在或当前不能答题' });
  if (room.roundAnswers.some(a => a.playerId === playerId)) return res.json({ ok: false, msg: '你已经提交了答案' });
  const player = room.players.find(p => p.id === playerId); if (!player) return res.json({ ok: false, msg: '玩家不在房间' });
  let isCorrect = false;
  if (room.difficulty === 'hard') isCorrect = !!is24Correct;
  else {
    const ans = parseFloat(answer);
    if (isNaN(ans)) return res.json({ ok: false, msg: '答案格式错误' });
    isCorrect = Math.abs(ans - room.currentQuestion.answer) < EPS;
  }
  const clampedTime = Math.min(Math.max(parseInt(time) || 0, 0), room.timeLimit || ANSWER_TIMEOUT);
  if (isCorrect) player.correct++; else player.wrong++; player.totalTime += clampedTime;
  room.roundAnswers.push({ playerId, playerName: player.name, correct: isCorrect, time: clampedTime, steps: steps || null });
  room.lastActive = Date.now();
  checkRoundComplete(roomId);
  res.json({ ok: true, isCorrect, score: isCorrect ? 100 : 0, correctAnswer: room.currentQuestion.answer });
});

app.post('/api/nextRound', rateLimit('nextRound', 10, 60000), (req, res) => {
  const { roomId, playerId } = req.body;
  if (!roomId || !playerId) return res.json({ ok: false, msg: '参数错误' });
  const room = rooms[roomId];
  if (!room) return res.json({ ok: false, msg: '房间不存在' });
  if (room.owner !== playerId) return res.json({ ok: false, msg: '只有房主才能操作' });
  if (room.phase !== 'roundEnd') return res.json({ ok: false, msg: '当前状态不允许操作' });

  if (room.mode === 'time' && room.startTime > 0) {
    const elapsed = (Date.now() - room.startTime) / 1000;
    if (elapsed >= room.modeValue) {
      room.phase = 'finished'; finishGame(roomId); res.json({ ok: true, finished: true }); return;
    }
  }

  if (room.mode === 'questions' && room.totalQuestions >= room.modeValue) {
    room.phase = 'finished'; finishGame(roomId); res.json({ ok: true, finished: true }); return;
  } else if (room.mode === 'time') {
    const elapsed = (Date.now() - room.startTime) / 1000;
    if (elapsed >= room.modeValue) { room.phase = 'finished'; finishGame(roomId); res.json({ ok: true, finished: true }); return; }
  } else if (room.mode === 'rounds' && room.currentRound >= room.modeValue) {
    room.phase = 'finished'; finishGame(roomId); res.json({ ok: true, finished: true }); return;
  }

  const othersReady = room.players.every(p => p.id === playerId || p.ready);
  if (room.players.length > 1 && !othersReady) return res.json({ ok: false, msg: '其他玩家还未准备' });

  room.players.forEach(p => { p.ready = false; });
  room.phase = 'countdown'; room.countdownAt = Date.now(); room.lastActive = Date.now();
  const cdTimer = setTimeout(() => startRound(roomId), 3000);
  if (!room._timers) room._timers = [];
  room._timers.push(cdTimer);
  res.json({ ok: true, finished: false });
});

function finishGame(roomId) {
  const room = rooms[roomId]; if (!room) return;
  room._rankedPlayers = [...room.players].sort((a, b) => { if (b.correct !== a.correct) return b.correct - a.correct; return a.totalTime - b.totalTime; });
  room.lastActive = Date.now();
}

app.post('/api/kickPlayer', rateLimit('kickPlayer', 10, 60000), (req, res) => {
  const { roomId, playerId, targetPlayerId } = req.body;
  if (!roomId || !playerId || !targetPlayerId) return res.json({ ok: false, msg: '参数错误' });
  const room = rooms[roomId];
  if (!room) return res.json({ ok: false, msg: '房间不存在' });
  if (room.owner !== playerId) return res.json({ ok: false, msg: '只有房主才能踢人' });
  if (targetPlayerId === playerId) return res.json({ ok: false, msg: '不能踢自己' });
  const targetIdx = room.players.findIndex(p => p.id === targetPlayerId);
  if (targetIdx === -1) return res.json({ ok: false, msg: '该玩家不在房间' });
  const kicked = room.players.splice(targetIdx, 1)[0];
  room.events.push({ type: 'kick', playerName: kicked.name, time: Date.now() });
  room.lastActive = Date.now();
  if (room.phase === 'playing') { checkRoundComplete(roomId); }
  if (room.phase === 'countdown' && room.players.length < 2) {
    clearRoomTimers(roomId);
    room.phase = 'waiting';
    room.players.forEach(p => p.ready = false);
  }
  console.log(`${kicked.name} 被踢出房间 ${roomId}`);
  res.json({ ok: true, kickedName: kicked.name });
});

app.post('/api/sendEmoji', rateLimit('sendEmoji', 30, 60000), (req, res) => {
  const { roomId, playerId, emoji } = req.body;
  if (!roomId || !playerId) return res.json({ ok: false, msg: '参数错误' });
  const room = rooms[roomId];
  if (!room) return res.json({ ok: false, msg: '房间不存在' });
  const player = room.players.find(p => p.id === playerId); if (!player) return res.json({ ok: false, msg: '玩家不在房间' });
  room.events.push({ type: 'emoji', playerName: player.name, emoji: sanitize(emoji).slice(0, 10), time: Date.now() });
  if (room.events.length > 50) room.events = room.events.slice(-30);
  room.lastActive = Date.now();
  res.json({ ok: true });
});

app.post('/api/sendEvent', rateLimit('sendEvent', 30, 60000), (req, res) => {
  const { roomId, playerId, type, msg } = req.body;
  if (!roomId || !playerId) return res.json({ ok: false, msg: '参数错误' });
  const room = rooms[roomId];
  if (!room) return res.json({ ok: false, msg: '房间不存在' });
  const player = room.players.find(p => p.id === playerId);
  if (!player) return res.json({ ok: false, msg: '玩家不在房间' });
  room.events.push({ type: type || 'chat', playerName: player.name, msg: sanitize(msg || '').slice(0, 200), time: Date.now() });
  if (room.events.length > 50) room.events = room.events.slice(-30);
  room.lastActive = Date.now();
  res.json({ ok: true });
});

app.post('/api/leaveRoom', (req, res) => {
  const { roomId, playerId } = req.body;
  if (!roomId || !playerId) return res.json({ ok: true });
  const room = rooms[roomId];
  if (!room) return res.json({ ok: true });
  const playerIdx = room.players.findIndex(p => p.id === playerId);
  if (playerIdx !== -1) {
    const leftName = room.players[playerIdx].name;
    room.players.splice(playerIdx, 1);
    room.events.push({ type: 'leave', playerName: leftName, time: Date.now() });
    console.log(`${leftName} 离开房间 ${roomId}`);
    if (room.players.length === 0) { clearRoomTimers(roomId); delete rooms[roomId]; console.log(`房间 ${roomId} 删除`); }
    else {
      if (room.owner === playerId) { room.owner = room.players[0].id; }
      if (room.phase === 'playing') { checkRoundComplete(roomId); }
      if (room.phase === 'countdown' && room.players.length < 2) {
        clearRoomTimers(roomId);
        room.phase = 'waiting';
        room.players.forEach(p => p.ready = false);
      }
    }
  }
  res.json({ ok: true });
});

app.post('/api/restartGame', rateLimit('restartGame', 5, 60000), (req, res) => {
  const { roomId, playerId } = req.body;
  if (!roomId || !playerId) return res.json({ ok: false, msg: '参数错误' });
  const room = rooms[roomId];
  if (!room) return res.json({ ok: false, msg: '房间不存在' });
  if (room.owner !== playerId) return res.json({ ok: false, msg: '只有房主才能操作' });
  if (room.phase !== 'finished') return res.json({ ok: false, msg: '游戏未结束' });
  clearRoomTimers(roomId);
  room.phase = 'waiting'; room.currentRound = 0; room.currentQuestion = null;
  room.roundAnswers = []; room._rankedPlayers = null; room.players.forEach(p => { p.correct = 0; p.wrong = 0; p.totalTime = 0; p.ready = true; p.score = 0; });
  room.events = []; room.totalQuestions = 0; room.startTime = 0; room.roundStartTime = 0; room.lastActive = Date.now();
  res.json({ ok: true });
});

app.post('/api/dissolveRoom', rateLimit('dissolveRoom', 5, 60000), (req, res) => {
  const { roomId, playerId } = req.body;
  if (!roomId || !playerId) return res.json({ ok: true });
  const room = rooms[roomId];
  if (!room) return res.json({ ok: true });
  if (room.owner !== playerId) return res.json({ ok: false, msg: '只有房主才能解散' });
  clearRoomTimers(roomId);
  delete rooms[roomId];
  console.log(`房间 ${roomId} 被房主解散`);
  res.json({ ok: true });
});

setInterval(() => {
  const now = Date.now();
  for (const id in rooms) if (now - rooms[id].lastActive > 3600000) { clearRoomTimers(id); delete rooms[id]; console.log(`房间 ${id} 超时删除`); }
  for (const diff in matchQueue) {
    matchQueue[diff] = matchQueue[diff].filter(p => now - p.time < 60000);
  }
}, 60000);

const matchQueue = {};
app.post('/api/joinMatch', rateLimit('joinMatch', 10, 60000), (req, res) => {
  const { playerId, playerName, difficulty } = req.body;
  const name = sanitize(playerName || '玩家').slice(0, 10);
  const diff = VALID_DIFFICULTIES.includes(difficulty) ? difficulty : 'easy';
  const myId = playerId || ('p_' + Math.random().toString(36).slice(2, 10));
  if (!matchQueue[diff]) matchQueue[diff] = [];
  if (matchQueue[diff].some(p => p.playerId === myId)) {
    return res.json({ ok: false, msg: '已在匹配队列中' });
  }
  matchQueue[diff].push({ playerId: myId, playerName: name, time: Date.now() });
  if (matchQueue[diff].length >= 2) {
    const p1 = matchQueue[diff].shift();
    const p2 = matchQueue[diff].shift();
    let roomId; do { roomId = String(Math.floor(100000 + Math.random() * 900000)); } while (rooms[roomId]);
    rooms[roomId] = {
      id: roomId, owner: p1.playerId, phase: 'waiting', difficulty: diff, range: 50,
      totalRounds: 999, currentRound: 0, currentQuestion: null, roundAnswers: [], roundStartTime: 0,
      players: [
        { id: p1.playerId, name: p1.playerName, correct: 0, wrong: 0, totalTime: 0, ready: true, color: PLAYER_COLORS[0] },
        { id: p2.playerId, name: p2.playerName, correct: 0, wrong: 0, totalTime: 0, ready: true, color: PLAYER_COLORS[1] }
      ],
      password: '', lastActive: Date.now(), events: [],
      mode: 'time', modeValue: diff === 'hard' ? 300 : 180, totalQuestions: 0, startTime: 0,
      timeLimit: 20, totalTime: diff === 'hard' ? 300 : 180, gameMode: 'race'
    };
    console.log(`匹配成功！${p1.playerName} vs ${p2.playerName}，房间 ${roomId}`);
    res.json({ ok: true, matched: true, roomId, playerId: myId, opponentId: myId === p1.playerId ? p2.playerId : p1.playerId, opponentName: myId === p1.playerId ? p2.playerName : p1.playerName });
  } else {
    res.json({ ok: true, matched: false, playerId: myId });
  }
});

app.post('/api/cancelMatch', (req, res) => {
  const { playerId, difficulty } = req.body;
  const diff = difficulty || 'easy';
  if (matchQueue[diff]) {
    matchQueue[diff] = matchQueue[diff].filter(p => p.playerId !== playerId);
  }
  res.json({ ok: true });
});

app.post('/api/checkMatch', rateLimit('checkMatch', 30, 60000), (req, res) => {
  const { playerId, difficulty } = req.body;
  if (!playerId) return res.json({ ok: false, msg: '参数错误' });
  for (const id in rooms) {
    const room = rooms[id];
    if (room.gameMode === 'race' && room.phase !== 'finished' && room.players.some(p => p.id === playerId)) {
      const opponent = room.players.find(p => p.id !== playerId);
      res.json({ ok: true, matched: true, roomId: id, playerId, opponentId: opponent ? opponent.id : null, opponentName: opponent ? opponent.name : '对手' });
      return;
    }
  }
  res.json({ ok: true, matched: false });
});

app.post('/api/getRaceOpponent', rateLimit('getRaceOpponent', 30, 60000), (req, res) => {
  const { roomId, playerId } = req.body;
  if (!roomId || !playerId) return res.json({ ok: false, msg: '参数错误' });
  const room = rooms[roomId];
  if (!room) return res.json({ ok: false, msg: '房间不存在' });

  const opponent = room.players.find(p => p.id !== playerId);
  if (!opponent) return res.json({ ok: false, msg: '找不到对手' });

  res.json({
    ok: true,
    opponent: {
      score: opponent.score || 0,
      correct: opponent.correct || 0,
      wrong: opponent.wrong || 0
    }
  });
});

app.post('/api/updateRaceScore', rateLimit('updateRaceScore', 30, 60000), (req, res) => {
  const { roomId, playerId, score, correct, wrong } = req.body;
  if (!roomId || !playerId) return res.json({ ok: false, msg: '参数错误' });
  const room = rooms[roomId];
  if (!room) return res.json({ ok: false, msg: '房间不存在' });

  const player = room.players.find(p => p.id === playerId);
  if (!player) return res.json({ ok: false, msg: '玩家不存在' });

  player.score = Math.max(0, parseInt(score) || 0);
  player.correct = Math.max(0, parseInt(correct) || 0);
  player.wrong = Math.max(0, parseInt(wrong) || 0);
  room.lastActive = Date.now();

  res.json({ ok: true });
});

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║              数理试炼 - 趣味数学游戏服务器                       ║
╠═══════════════════════════════════════════════════════════════╣
║  本机访问:    http://localhost:${PORT}                          ║
║  局域网访问:  http://${getLocalIP()}:${PORT}                     ║
║                                                               ║
║  分享局域网链接给朋友，一起多人对战！                           ║
╚═══════════════════════════════════════════════════════════════╝
`);
});

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error(`端口 ${PORT} 已被占用，请设置 PORT=其他端口 后重试`);
  } else {
    console.error('服务器启动失败:', err);
  }
  process.exit(1);
});

function gracefulShutdown() {
  console.log('\n正在关闭服务器...');
  for (const id in rooms) {
    clearRoomTimers(id);
  }
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('强制关闭');
    process.exit(1);
  }, 5000);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
