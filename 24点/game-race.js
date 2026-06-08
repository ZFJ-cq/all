window.G24 = window.G24 || {};

G24._race = {
  diff: 'easy', range: 20, totalTime: 180,
  roomId: null, playerId: null, opponentId: null, opponentName: null,
  score: 0, correct: 0, wrong: 0, streak: 0, maxStreak: 0,
  questions: [], currentIdx: 0, submitted: false,
  wrongList: [], startTime: 0, timer: null, questionStart: 0,
  opponentScore: 0, opponentCorrect: 0, opponentWrong: 0, opponentStreak: 0,
  myId: null,
  matchTime: 0, matchTimeTimer: null, matchCheckTimer: null,
  ended: false
};

G24._isRoomRace = false;
G24._aiTimer = null;
G24._raceTimer = null;
G24._race24AITimer = null;
G24._race24RealOpponentTimer = null;
G24._raceEnded = false;
G24._opponentPollTimer = null;

G24._race24 = {
  numbers: [], firstIdx: null, selectedOp: null,
  steps: [], history: [], original: [], solution: ''
};

G24._roomCurrentQuestion = null;

G24.getRaceTimeLimit = function () {
  return G24._race.diff === 'hard' ? 300 : 180;
};

G24.getRaceRoomId = function () {
  return G24._isRoomRace ? G24._roomSession.myRoomId : G24._race.roomId;
};

G24.startRaceMatching = async function () {
  var race = G24._race;
  race.diff = G24.getOpt('race-diff-row');

  document.getElementById('race-start-btn').style.display = 'none';
  document.getElementById('race-matching').style.display = 'block';
  document.getElementById('race-matching-text').textContent = '正在匹配对手...';
  document.getElementById('race-matching-time').textContent = '匹配中... 0s';

  race.matchTime = 0;
  race.matchTimeTimer = setInterval(function () {
    race.matchTime++;
    document.getElementById('race-matching-time').textContent = '匹配中... ' + race.matchTime + 's';
    if (race.matchTime >= 30 && !race.roomId) {
      G24._startRaceWithAI();
    }
  }, 1000);

  race.myId = 'p_' + Math.random().toString(36).slice(2, 10);

  try {
    var res = await G24.api('/api/joinMatch', { playerId: race.myId, playerName: '我', difficulty: race.diff }, true);
    if (res.ok && res.matched) {
      race.roomId = res.roomId;
      race.playerId = res.playerId;
      race.opponentId = res.opponentId;
      race.opponentName = res.opponentName;
      if (race.matchTimeTimer) { clearInterval(race.matchTimeTimer); race.matchTimeTimer = null; }
      G24._startRaceBattle();
      return;
    }
  } catch (e) {}

  race.matchCheckTimer = setInterval(G24._checkRealMatch, 2000);
};

G24._checkRealMatch = async function () {
  try {
    var res = await G24.api('/api/checkMatch', { playerId: G24._race.myId, difficulty: G24._race.diff });
    if (res.ok && res.matched) {
      var race = G24._race;
      if (race.matchCheckTimer) { clearInterval(race.matchCheckTimer); race.matchCheckTimer = null; }
      if (race.matchTimeTimer) { clearInterval(race.matchTimeTimer); race.matchTimeTimer = null; }
      race.roomId = res.roomId;
      race.playerId = res.playerId || race.myId;
      race.opponentId = res.opponentId;
      race.opponentName = res.opponentName;
      G24._startRaceBattle();
    }
  } catch (e) {}
};

G24.cancelMatching = function () {
  var race = G24._race;
  if (race.matchCheckTimer) { clearInterval(race.matchCheckTimer); race.matchCheckTimer = null; }
  if (race.matchTimeTimer) { clearInterval(race.matchTimeTimer); race.matchTimeTimer = null; }
  G24.api('/api/cancelMatch', { playerId: race.myId, difficulty: race.diff }).catch(function () {});
  document.getElementById('race-start-btn').style.display = 'block';
  document.getElementById('race-matching').style.display = 'none';
  race.roomId = null;
  race.playerId = null;
};

G24._startRaceWithAI = function () {
  G24._stopRacePolling();
  G24._stopOpponentPolling();
  if (G24._raceTimer) { clearInterval(G24._raceTimer); G24._raceTimer = null; }
  if (G24._aiTimer) { clearTimeout(G24._aiTimer); G24._aiTimer = null; }
  if (G24._race24AITimer) { clearTimeout(G24._race24AITimer); G24._race24AITimer = null; }
  if (G24._race24RealOpponentTimer) { clearInterval(G24._race24RealOpponentTimer); G24._race24RealOpponentTimer = null; }
  G24._raceEnded = false;

  var aiNames = G24.AI_NAMES;
  if (G24._race.myId) {
    G24.api('/api/cancelMatch', { playerId: G24._race.myId, difficulty: G24._race.diff }).catch(function () {});
  }
  document.getElementById('race-start-btn').style.display = 'block';
  document.getElementById('race-matching').style.display = 'none';

  G24._race.roomId = null;
  G24._race.playerId = null;
  G24._race.opponentId = 'ai_opponent';
  G24._race.opponentName = aiNames[Math.floor(Math.random() * aiNames.length)];

  if (G24._race.diff === 'hard') {
    G24._startRace24WithAI();
  } else {
    G24.showPage('race-battle-page');
    G24._race.score = 0;
    G24._race.correct = 0;
    G24._race.wrong = 0;
    G24._race.streak = 0;
    G24._race.maxStreak = 0;
    G24._race.wrongList = [];
    G24._race.currentIdx = 0;
    G24._race.submitted = false;
    G24._race.opponentScore = 0;
    G24._race.opponentCorrect = 0;
    G24._race.opponentWrong = 0;
    G24._race.opponentStreak = 0;

    document.getElementById('opponent-name').textContent = G24._race.opponentName;
    document.getElementById('my-score').textContent = '0分';
    document.getElementById('opponent-score').textContent = '0分';
    document.getElementById('race-timer').textContent = G24.formatTime(G24.getRaceTimeLimit());
    document.getElementById('my-correct').textContent = '0';
    document.getElementById('my-wrong').textContent = '0';
    document.getElementById('my-answered').textContent = '0';
    document.getElementById('my-streak').textContent = '';
    document.getElementById('opponent-correct').textContent = '0';
    document.getElementById('opponent-wrong').textContent = '0';
    document.getElementById('opponent-answered').textContent = '0';
    document.getElementById('opponent-streak').textContent = '';
    document.getElementById('opponent-current').textContent = '答题中...';
    document.getElementById('race-progress-fill').style.width = '0%';

    G24._race.startTime = Date.now();
    G24._raceTimer = setInterval(G24._updateRaceTimer, 1000);

    G24._generateRaceQuestions();
    setTimeout(function () {
      G24._showRaceQuestion();
      G24._startAIOpponent();
    }, 500);
  }
};

G24._startAIOpponent = function () {
  var config = G24.AI_CONFIG[G24._race.diff] || G24.AI_CONFIG.mix;
  var race = G24._race;

  function aiAnswer() {
    var elapsed = (Date.now() - race.startTime) / 1000;
    var limit = G24.getRaceTimeLimit();
    if (elapsed >= limit) {
      document.getElementById('opponent-current').textContent = '时间到！';
      return;
    }

    var correctRate = config.correct[0] + Math.random() * (config.correct[1] - config.correct[0]);
    var isCorrect = Math.random() < correctRate;

    if (isCorrect) {
      race.opponentCorrect++;
      var timeBonus = Math.floor(Math.random() * 50) + 50;
      race.opponentScore += 100 + timeBonus;
      race.opponentStreak++;
    } else {
      race.opponentWrong++;
      race.opponentStreak = 0;
    }

    document.getElementById('opponent-score').textContent = race.opponentScore + '分';
    document.getElementById('opponent-correct').textContent = race.opponentCorrect;
    document.getElementById('opponent-wrong').textContent = race.opponentWrong;
    document.getElementById('opponent-answered').textContent = race.opponentCorrect + race.opponentWrong;
    document.getElementById('opponent-streak').textContent = race.opponentStreak >= 2 ? '🔥 ' + race.opponentStreak + '连对' : '';

    var speed = config.speed[0] + Math.random() * (config.speed[1] - config.speed[0]);
    G24._aiTimer = setTimeout(aiAnswer, speed);
  }

  var firstDelay = Math.floor(Math.random() * 2000) + 1000;
  G24._aiTimer = setTimeout(aiAnswer, firstDelay);
};

G24._stopRacePolling = function () {
  var race = G24._race;
  if (race.matchTimeTimer) { clearInterval(race.matchTimeTimer); race.matchTimeTimer = null; }
  if (race.matchCheckTimer) { clearInterval(race.matchCheckTimer); race.matchCheckTimer = null; }
};

G24._stopOpponentPolling = function () {
  if (G24._opponentPollTimer) { clearInterval(G24._opponentPollTimer); G24._opponentPollTimer = null; }
};

G24._startRaceBattle = function () {
  G24._raceEnded = false;
  G24._stopRacePolling();
  G24._stopOpponentPolling();
  if (G24._raceTimer) { clearInterval(G24._raceTimer); G24._raceTimer = null; }
  if (G24._aiTimer) { clearTimeout(G24._aiTimer); G24._aiTimer = null; }
  if (G24._race24AITimer) { clearTimeout(G24._race24AITimer); G24._race24AITimer = null; }
  if (G24._race24RealOpponentTimer) { clearInterval(G24._race24RealOpponentTimer); G24._race24RealOpponentTimer = null; }

  if (G24._race.diff === 'hard') {
    G24.showPage('race24-page');
    G24._race.score = 0;
    G24._race.correct = 0;
    G24._race.wrong = 0;
    G24._race.streak = 0;
    G24._race.maxStreak = 0;
    G24._race.wrongList = [];
    G24._race.opponentScore = 0;
    G24._race.opponentCorrect = 0;
    G24._race.opponentWrong = 0;
    G24._race.opponentStreak = 0;

    document.getElementById('race24-opponent-name').textContent = G24._race.opponentName;
    document.getElementById('race24-my-score').textContent = '0分';
    document.getElementById('race24-opponent-score').textContent = '0分';
    document.getElementById('race24-timer').textContent = G24.formatTime(G24.getRaceTimeLimit());
    document.getElementById('race24-my-correct').textContent = '0';
    document.getElementById('race24-my-wrong').textContent = '0';
    document.getElementById('race24-my-answered').textContent = '0';
    document.getElementById('race24-opponent-correct').textContent = '0';
    document.getElementById('race24-opponent-wrong').textContent = '0';
    document.getElementById('race24-opponent-answered').textContent = '0';
    document.getElementById('race24-progress-fill').style.width = '0%';

    G24._race.startTime = Date.now();
    G24._raceTimer = setInterval(G24._updateRace24Timer, 1000);

    G24._nextRace24Q();
    G24._startRealRace24Opponent();
  } else {
    G24.showPage('race-battle-page');
    G24._race.score = 0;
    G24._race.correct = 0;
    G24._race.wrong = 0;
    G24._race.streak = 0;
    G24._race.maxStreak = 0;
    G24._race.wrongList = [];
    G24._race.currentIdx = 0;
    G24._race.submitted = false;
    G24._race.opponentScore = 0;
    G24._race.opponentCorrect = 0;
    G24._race.opponentWrong = 0;
    G24._race.opponentStreak = 0;

    document.getElementById('opponent-name').textContent = G24._race.opponentName;
    document.getElementById('my-score').textContent = '0分';
    document.getElementById('opponent-score').textContent = '0分';
    document.getElementById('race-timer').textContent = G24.formatTime(G24.getRaceTimeLimit());
    document.getElementById('my-correct').textContent = '0';
    document.getElementById('my-wrong').textContent = '0';
    document.getElementById('my-answered').textContent = '0';
    document.getElementById('my-streak').textContent = '';
    document.getElementById('opponent-correct').textContent = '0';
    document.getElementById('opponent-wrong').textContent = '0';
    document.getElementById('opponent-answered').textContent = '0';
    document.getElementById('opponent-streak').textContent = '';

    G24._race.startTime = Date.now();
    G24._raceTimer = setInterval(G24._updateRaceTimer, 1000);

    G24._generateRaceQuestions();
    G24._showRaceQuestion();
  }
};

G24._generateRaceQuestions = function () {
  G24._race.questions = [];
  for (var i = 0; i < 5; i++) {
    G24._race.questions.push(G24.genRaceQ(G24._race.diff));
  }
};

G24._showRaceQuestion = function () {
  var race = G24._race;
  if (race.currentIdx >= race.questions.length) {
    for (var i = 0; i < 5; i++) race.questions.push(G24.genRaceQ(race.diff));
  }
  var q = race.questions[race.currentIdx];
  if (q.is24) {
    document.getElementById('race-question').innerHTML =
      '<div style="font-size:20px;margin-bottom:8px">用这4个数算出24</div>' +
      '<div style="font-size:28px;font-weight:800;letter-spacing:8px">' + q.nums.join('  ') + '</div>';
  } else {
    var opDisplay = G24.OP_DISPLAY[q.op] || q.op;
    document.getElementById('race-question').textContent = q.n1 + ' ' + opDisplay + ' ' + q.n2 + ' = ?';
  }
  document.getElementById('race-answer').value = '';
  document.getElementById('race-answer').disabled = false;
  document.getElementById('race-answer').focus();
  document.getElementById('race-wrong-hint').style.display = 'none';
  document.getElementById('race-submit-btn').style.display = 'block';
  document.getElementById('race-skip-btn').style.display = 'block';
  document.getElementById('race-next-btn').style.display = 'none';
  race.submitted = false;
  race.questionStart = Date.now();
};

G24._updateRaceTimer = function () {
  var race = G24._race;
  var limit = G24._isRoomRace ? race.totalTime : G24.getRaceTimeLimit();
  var elapsed = Math.floor((Date.now() - race.startTime) / 1000);
  var remaining = Math.max(0, limit - elapsed);
  document.getElementById('race-timer').textContent = G24.formatTime(remaining);
  document.getElementById('race-progress-fill').style.width = limit > 0 ? ((limit - remaining) / limit * 100) + '%' : '0%';
  if (remaining <= 0) G24._endRaceBattle();
};

G24.checkRaceAnswer = function (e) {
  if (e.key === 'Enter') G24.submitRaceAnswer();
};

G24.submitRaceAnswer = function () {
  var race = G24._race;
  if (race.submitted) return;
  if (G24._isRoomRace) { G24._submitRoomRaceAnswer(); return; }

  var q = race.questions[race.currentIdx];
  if (q.is24) {
    G24.showToast('请通过卡片操作完成24点');
    return;
  }

  var ans = document.getElementById('race-answer').value.trim();
  if (!ans) return;
  race.submitted = true;
  var isCorrect = Math.abs(parseFloat(ans) - q.answer) < G24.EPS;
  var timeSpent2 = Math.floor((Date.now() - race.questionStart) / 1000);
  var timeBonus2 = Math.max(0, 100 - timeSpent2 * 2);
  var streakBonus2 = 0;

  if (isCorrect) {
    race.correct++;
    race.streak++;
    race.maxStreak = Math.max(race.maxStreak, race.streak);
    if (race.streak >= 10) streakBonus2 = 50;
    else if (race.streak >= 5) streakBonus2 = 30;
    else if (race.streak >= 3) streakBonus2 = 15;
    race.score += 100 + timeBonus2 + streakBonus2;
    document.getElementById('my-score').textContent = race.score + '分';
    document.getElementById('my-correct').textContent = race.correct;
    document.getElementById('my-answered').textContent = race.correct + race.wrong;
    if (race.streak >= 2) document.getElementById('my-streak').textContent = '🔥 ' + race.streak + '连对';
    if (G24.getRaceRoomId()) {
      G24.api('/api/updateRaceScore', {
        roomId: G24.getRaceRoomId(), playerId: race.playerId,
        score: race.score, correct: race.correct, wrong: race.wrong
      }).catch(function () {});
    }
    setTimeout(function () { race.currentIdx++; G24._showRaceQuestion(); }, 500);
  } else {
    race.wrong++;
    race.streak = 0;
    var opDisp = G24.OP_DISPLAY[q.op] || q.op;
    race.wrongList.push({
      question: q.n1 + ' ' + opDisp + ' ' + q.n2,
      yourAnswer: ans, correctAnswer: q.answer
    });
    document.getElementById('my-wrong').textContent = race.wrong;
    document.getElementById('my-answered').textContent = race.correct + race.wrong;
    document.getElementById('my-streak').textContent = '';
    if (G24.getRaceRoomId()) {
      G24.api('/api/updateRaceScore', {
        roomId: G24.getRaceRoomId(), playerId: race.playerId,
        score: race.score, correct: race.correct, wrong: race.wrong
      }).catch(function () {});
    }
    document.getElementById('race-wrong-hint').textContent = '❌ 错误！正确答案：' + q.answer;
    document.getElementById('race-wrong-hint').style.display = 'block';
    document.getElementById('race-submit-btn').style.display = 'none';
    document.getElementById('race-skip-btn').style.display = 'none';
    document.getElementById('race-next-btn').style.display = 'block';
    document.getElementById('race-answer').disabled = true;
  }
};

G24.skipRaceQuestion = function () {
  var race = G24._race;
  if (race.submitted) return;
  if (G24._isRoomRace) { G24._skipRoomRaceQuestion(); return; }
  race.submitted = true;
  var q = race.questions[race.currentIdx];
  var opDisp = G24.OP_DISPLAY[q.op] || q.op;
  race.wrong++;
  race.streak = 0;
  race.wrongList.push({
    question: q.n1 + ' ' + opDisp + ' ' + q.n2,
    yourAnswer: '跳过', correctAnswer: q.answer
  });
  document.getElementById('my-wrong').textContent = race.wrong;
  document.getElementById('my-answered').textContent = race.correct + race.wrong;
  document.getElementById('my-streak').textContent = '';
  setTimeout(function () { race.currentIdx++; G24._showRaceQuestion(); }, 500);
};

G24.nextRaceQuestion = function () {
  G24._race.currentIdx++;
  G24._showRaceQuestion();
};

G24._submitRoomRaceAnswer = async function () {
  var race = G24._race;
  var answer = document.getElementById('race-answer').value.trim();
  if (!answer) return;
  race.submitted = true;
  var time = Math.floor((Date.now() - (race.questionStart || race.startTime)) / 1000);
  var res = await G24.api('/api/submitAnswer', {
    roomId: G24._roomSession.myRoomId, playerId: G24._roomSession.myPlayerId,
    answer: parseFloat(answer), time: time
  });
  if (!res.ok) { G24.showToast(res.msg); race.submitted = false; return; }
  var q = G24._roomCurrentQuestion;
  if (res.isCorrect) {
    race.correct++;
    race.streak++;
    race.maxStreak = Math.max(race.maxStreak, race.streak);
    race.score += res.score || 100;
    document.getElementById('my-correct').textContent = race.correct;
    document.getElementById('my-streak').textContent = race.streak >= 2 ? '🔥 ' + race.streak + '连对' : '';
  } else {
    race.wrong++;
    race.streak = 0;
    document.getElementById('my-wrong').textContent = race.wrong;
    document.getElementById('my-streak').textContent = '';
    if (q) race.wrongList.push({
      question: q.expr || (q.numbers[0] + ' ' + q.operator + ' ' + q.numbers[1]),
      yourAnswer: answer, correctAnswer: res.correctAnswer
    });
  }
  document.getElementById('my-score').textContent = race.score + '分';
  document.getElementById('my-answered').textContent = race.correct + race.wrong;
  G24.api('/api/updateRaceScore', {
    roomId: G24._roomSession.myRoomId, playerId: G24._roomSession.myPlayerId,
    score: race.score, correct: race.correct, wrong: race.wrong
  }).catch(function () {});

  setTimeout(async function () {
    var roomRes = await G24.api('/api/getRoom', { roomId: G24._roomSession.myRoomId });
    if (roomRes.ok && roomRes.room.phase === 'playing' && roomRes.room.currentQuestion) {
      var nq = roomRes.room.currentQuestion;
      G24._roomCurrentQuestion = nq;
      document.getElementById('race-question').textContent = nq.expr || (nq.numbers[0] + ' ' + nq.operator + ' ' + nq.numbers[1] + ' = ?');
      document.getElementById('race-answer').value = '';
      document.getElementById('race-answer').disabled = false;
      document.getElementById('race-wrong-hint').style.display = 'none';
      race.questionStart = Date.now();
      race.submitted = false;
    } else {
      race.submitted = false;
    }
  }, 500);
};

G24._skipRoomRaceQuestion = async function () {
  var race = G24._race;
  if (race.submitted) return;
  race.submitted = true;
  var time = Math.floor((Date.now() - (race.questionStart || race.startTime)) / 1000);
  var q = G24._roomCurrentQuestion;
  race.wrong++;
  race.streak = 0;
  if (q) race.wrongList.push({
    question: q.expr || (q.numbers[0] + ' ' + q.operator + ' ' + q.numbers[1]),
    yourAnswer: '跳过', correctAnswer: q.answer
  });
  document.getElementById('my-wrong').textContent = race.wrong;
  document.getElementById('my-answered').textContent = race.correct + race.wrong;
  document.getElementById('my-streak').textContent = '';
  await G24.api('/api/submitAnswer', {
    roomId: G24._roomSession.myRoomId, playerId: G24._roomSession.myPlayerId,
    answer: 99999, time: time
  });
  setTimeout(async function () {
    var roomRes = await G24.api('/api/getRoom', { roomId: G24._roomSession.myRoomId });
    if (roomRes.ok && roomRes.room.phase === 'playing' && roomRes.room.currentQuestion) {
      var nq = roomRes.room.currentQuestion;
      G24._roomCurrentQuestion = nq;
      document.getElementById('race-question').textContent = nq.expr || (nq.numbers[0] + ' ' + nq.operator + ' ' + nq.numbers[1] + ' = ?');
      document.getElementById('race-answer').value = '';
      document.getElementById('race-answer').disabled = false;
      document.getElementById('race-wrong-hint').style.display = 'none';
      race.questionStart = Date.now();
      race.submitted = false;
    } else {
      race.submitted = false;
    }
  }, 500);
};

G24.startRoomRacePlaying = function (room) {
  G24._raceEnded = false;
  if (G24._raceTimer) { clearInterval(G24._raceTimer); G24._raceTimer = null; }
  if (G24._aiTimer) { clearTimeout(G24._aiTimer); G24._aiTimer = null; }
  if (G24._race24AITimer) { clearTimeout(G24._race24AITimer); G24._race24AITimer = null; }
  if (G24._race24RealOpponentTimer) { clearInterval(G24._race24RealOpponentTimer); G24._race24RealOpponentTimer = null; }
  G24._isRoomRace = true;

  var race = G24._race;
  race.diff = room.difficulty;
  race.totalTime = room.modeValue;

  var opponent = room.players.find(function (p) { return p.id !== G24._roomSession.myPlayerId; });
  race.opponentId = opponent ? opponent.id : 'ai_opponent';
  race.opponentName = opponent ? opponent.name : '对手';

  var q = room.currentQuestion;
  G24._roomCurrentQuestion = q;

  if (room.difficulty === 'hard') {
    G24.showPage('race24-page');
    document.getElementById('race24-opponent-name').textContent = race.opponentName;
    document.getElementById('race24-timer').textContent = G24.formatTime(room.modeValue);

    if (!G24._raceTimer || G24._roomSession.lastPhase === 'countdown' || G24._roomSession.lastPhase === 'waiting') {
      race.score = 0;
      race.correct = 0;
      race.wrong = 0;
      race.streak = 0;
      race.maxStreak = 0;
      race.opponentScore = 0;
      race.opponentCorrect = 0;
      race.opponentWrong = 0;
      race.opponentStreak = 0;

      document.getElementById('race24-my-score').textContent = '0分';
      document.getElementById('race24-opponent-score').textContent = '0分';
      document.getElementById('race24-my-correct').textContent = '0';
      document.getElementById('race24-my-wrong').textContent = '0';
      document.getElementById('race24-my-answered').textContent = '0';
      document.getElementById('race24-opponent-correct').textContent = '0';
      document.getElementById('race24-opponent-wrong').textContent = '0';
      document.getElementById('race24-opponent-answered').textContent = '0';
      document.getElementById('race24-progress-fill').style.width = '0%';

      race.startTime = Date.now();
      G24._raceTimer = setInterval(G24._updateRace24Timer, 1000);

      G24._race24 = {
        numbers: q.numbers.slice(),
        firstIdx: null, selectedOp: null,
        steps: [], history: [],
        original: q.numbers.slice(),
        solution: q.solution || ''
      };
      document.getElementById('race24-hint').textContent = '① 选择一个数字卡片';
      document.querySelectorAll('#race24-ops .op-btn').forEach(function (b) { b.classList.remove('selected'); });
      G24._renderRace24Cards();
      G24._startRaceOpponentPolling();
    }
  } else {
    G24.showPage('race-battle-page');
    document.getElementById('opponent-name').textContent = race.opponentName;

    if (!G24._raceTimer || G24._roomSession.lastPhase === 'countdown' || G24._roomSession.lastPhase === 'waiting') {
      race.score = 0;
      race.correct = 0;
      race.wrong = 0;
      race.streak = 0;
      race.maxStreak = 0;
      race.questions = [];
      race.currentIdx = 0;
      race.submitted = false;
      race.wrongList = [];
      race.opponentScore = 0;
      race.opponentCorrect = 0;
      race.opponentWrong = 0;
      race.opponentStreak = 0;

      document.getElementById('my-score').textContent = '0分';
      document.getElementById('opponent-score').textContent = '0分';
      document.getElementById('my-correct').textContent = '0';
      document.getElementById('my-wrong').textContent = '0';
      document.getElementById('my-answered').textContent = '0';
      document.getElementById('my-streak').textContent = '';
      document.getElementById('opponent-correct').textContent = '0';
      document.getElementById('opponent-wrong').textContent = '0';
      document.getElementById('opponent-answered').textContent = '0';
      document.getElementById('opponent-streak').textContent = '';
      document.getElementById('opponent-current').textContent = '答题中...';
      document.getElementById('race-progress-fill').style.width = '0%';
      document.getElementById('race-timer').textContent = G24.formatTime(room.modeValue);

      document.getElementById('race-question').textContent = q.expr || (q.numbers[0] + ' ' + q.operator + ' ' + q.numbers[1] + ' = ?');
      document.getElementById('race-answer').value = '';
      document.getElementById('race-answer').disabled = false;
      document.getElementById('race-answer').focus();
      document.getElementById('race-wrong-hint').style.display = 'none';
      document.getElementById('race-submit-btn').style.display = 'block';
      document.getElementById('race-skip-btn').style.display = 'block';
      document.getElementById('race-next-btn').style.display = 'none';

      race.startTime = Date.now();
      race.questionStart = Date.now();
      G24._raceTimer = setInterval(G24._updateRaceTimer, 1000);
      G24._startRaceOpponentPolling();
    }
  }
};

G24._startRaceOpponentPolling = function () {
  G24._stopOpponentPolling();
  G24._opponentPollTimer = setInterval(async function () {
    var rid = G24.getRaceRoomId();
    if (!rid) return;
    try {
      var res = await G24.api('/api/getRoom', { roomId: rid });
      if (!res.ok) return;
      var room = res.room;
      var myId = G24._isRoomRace ? G24._roomSession.myPlayerId : (G24._race.playerId || G24._race.myId);
      var opponent = room.players.find(function (p) { return p.id !== myId; });
      if (opponent) {
        G24._race.opponentScore = opponent.score || 0;
        G24._race.opponentCorrect = opponent.correct || 0;
        G24._race.opponentWrong = opponent.wrong || 0;

        if (G24._race.diff === 'hard') {
          document.getElementById('race24-opponent-score').textContent = G24._race.opponentScore + '分';
          document.getElementById('race24-opponent-correct').textContent = G24._race.opponentCorrect;
          document.getElementById('race24-opponent-wrong').textContent = G24._race.opponentWrong;
          document.getElementById('race24-opponent-answered').textContent = G24._race.opponentCorrect + G24._race.opponentWrong;
        } else {
          document.getElementById('opponent-score').textContent = G24._race.opponentScore + '分';
          document.getElementById('opponent-correct').textContent = G24._race.opponentCorrect;
          document.getElementById('opponent-wrong').textContent = G24._race.opponentWrong;
          document.getElementById('opponent-answered').textContent = G24._race.opponentCorrect + G24._race.opponentWrong;
          var oppCurrent = document.getElementById('opponent-current');
          if (oppCurrent) oppCurrent.textContent = G24._race.opponentCorrect + G24._race.opponentWrong > 0 ? '答题中...' : '等待对手...';
        }
      }
    } catch (e) {}
  }, 1000);
};

G24._endRaceBattle = function () {
  G24._raceEnded = true;
  G24._stopRacePolling();
  G24._stopOpponentPolling();
  if (G24._raceTimer) { clearInterval(G24._raceTimer); G24._raceTimer = null; }
  if (G24._aiTimer) { clearTimeout(G24._aiTimer); G24._aiTimer = null; }
  if (G24._race24AITimer) { clearTimeout(G24._race24AITimer); G24._race24AITimer = null; }
  if (G24._race24RealOpponentTimer) { clearInterval(G24._race24RealOpponentTimer); G24._race24RealOpponentTimer = null; }

  if (G24._isRoomRace) {
    G24._isRoomRace = false;
    if (G24._roomSession.myRoomId) {
      G24.api('/api/getRoom', { roomId: G24._roomSession.myRoomId }).then(function (roomRes) {
        if (roomRes.ok && roomRes.room) {
          G24._stopPolling();
          G24._stopGameTimer();
          G24.showPage('result-page');
          G24.renderFinished(roomRes.room);
          G24.clearRoomSession();
        }
      }).catch(function () {});
    }
    return;
  }
  G24._isRoomRace = false;

  var race = G24._race;
  var myFinalScore = race.score;
  var opponentFinalScore = race.opponentScore;
  var isWin = myFinalScore > opponentFinalScore;

  G24.saveRaceResult(
    isWin ? 'win' : 'lose',
    race.diff, race.score, race.correct, race.wrong,
    race.maxStreak, race.opponentName, race.opponentScore
  );
  G24._showRaceResult(isWin, myFinalScore, opponentFinalScore);
};

G24.confirmLeaveRace = function () {
  G24.showConfirm('退出对战', '确定要退出吗？', function () {
    G24._stopRacePolling();
    G24._stopOpponentPolling();
    if (G24._raceTimer) { clearInterval(G24._raceTimer); G24._raceTimer = null; }
    if (G24._aiTimer) { clearTimeout(G24._aiTimer); G24._aiTimer = null; }
    if (G24._race24AITimer) { clearTimeout(G24._race24AITimer); G24._race24AITimer = null; }
    if (G24._race24RealOpponentTimer) { clearInterval(G24._race24RealOpponentTimer); G24._race24RealOpponentTimer = null; }

    var race = G24._race;
    if (race.matchCheckTimer) { clearInterval(race.matchCheckTimer); race.matchCheckTimer = null; }
    if (race.matchTimeTimer) { clearInterval(race.matchTimeTimer); race.matchTimeTimer = null; }

    G24._lsRemove('raceSession');

    if (G24._isRoomRace && G24._roomSession.myRoomId && G24._roomSession.myPlayerId) {
      G24.api('/api/leaveRoom', { roomId: G24._roomSession.myRoomId, playerId: G24._roomSession.myPlayerId }).catch(function () {});
      G24.clearRoomSession();
    }
    G24._isRoomRace = false;
    G24._raceEnded = false;

    race.roomId = null;
    race.playerId = null;
    race.opponentId = null;
    race.opponentName = null;
    race.myId = null;
    race.score = 0;
    race.correct = 0;
    race.wrong = 0;
    race.streak = 0;
    race.maxStreak = 0;
    race.questions = [];
    race.currentIdx = 0;
    race.submitted = false;
    race.opponentScore = 0;
    race.opponentCorrect = 0;
    race.opponentWrong = 0;
    race.opponentStreak = 0;

    G24.showPage('race-page');
    G24.loadRaceHistory();
  });
};

G24._showRaceResult = function (isWin, myScore, opponentScore) {
  G24.showPage('race-result-page');

  if (isWin) {
    document.getElementById('race-result-crown').textContent = '👑';
    document.getElementById('race-result-title').textContent = '🎉 胜利！';
    G24.launchConfetti();
  } else {
    document.getElementById('race-result-crown').textContent = '💪';
    document.getElementById('race-result-title').textContent = '再接再厉！';
  }

  var race = G24._race;
  var totalTime = Math.floor((Date.now() - race.startTime) / 1000);
  var accuracy = race.correct + race.wrong > 0 ? Math.round(race.correct / (race.correct + race.wrong) * 100) : 0;

  document.getElementById('result-score').textContent = myScore + '分';
  document.getElementById('result-time').textContent = G24.formatTime(totalTime);
  document.getElementById('result-accuracy').textContent = accuracy + '%';
  document.getElementById('result-streak').textContent = race.maxStreak;

  document.getElementById('my-final-score').textContent = myScore + '分';
  document.getElementById('opponent-final-name').textContent = G24.esc(race.opponentName || '对手');
  document.getElementById('opponent-final-score').textContent = opponentScore + '分';

  var wrongContent = document.getElementById('wrong-list-content');
  if (race.wrongList.length === 0) {
    wrongContent.innerHTML = '<div style="text-align:center;color:var(--sub);padding:16px">太棒了！没有错题</div>';
  } else {
    wrongContent.innerHTML = race.wrongList.map(function (w) {
      return '<div class="wrong-item">' +
        '<div class="wrong-expr">' + w.question + '</div>' +
        '<div class="wrong-answer">你的答案: <span style="color:var(--danger)">' + w.yourAnswer +
        '</span> · 正确答案: <span style="color:var(--green)">' + w.correctAnswer + '</span></div></div>';
    }).join('');
  }
};

G24.toggleWrongList = function () {
  var content = document.getElementById('wrong-list-content');
  var btn = document.querySelector('#race-wrong-list .btn-sm');
  if (content.style.display === 'none') {
    content.style.display = 'block';
    btn.textContent = '收起';
  } else {
    content.style.display = 'none';
    btn.textContent = '展开';
  }
};

G24._startRace24WithAI = function () {
  if (G24._raceTimer) { clearInterval(G24._raceTimer); G24._raceTimer = null; }
  if (G24._aiTimer) { clearTimeout(G24._aiTimer); G24._aiTimer = null; }
  if (G24._race24AITimer) { clearTimeout(G24._race24AITimer); G24._race24AITimer = null; }
  if (G24._race24RealOpponentTimer) { clearInterval(G24._race24RealOpponentTimer); G24._race24RealOpponentTimer = null; }

  G24.showPage('race24-page');
  G24._race.score = 0;
  G24._race.correct = 0;
  G24._race.wrong = 0;
  G24._race.streak = 0;
  G24._race.maxStreak = 0;
  G24._race.wrongList = [];
  G24._race.opponentScore = 0;
  G24._race.opponentCorrect = 0;
  G24._race.opponentWrong = 0;
  G24._race.opponentStreak = 0;

  document.getElementById('race24-opponent-name').textContent = G24._race.opponentName;
  document.getElementById('race24-my-score').textContent = '0分';
  document.getElementById('race24-opponent-score').textContent = '0分';
  document.getElementById('race24-timer').textContent = G24.formatTime(G24.getRaceTimeLimit());
  document.getElementById('race24-my-correct').textContent = '0';
  document.getElementById('race24-my-wrong').textContent = '0';
  document.getElementById('race24-my-answered').textContent = '0';
  document.getElementById('race24-opponent-correct').textContent = '0';
  document.getElementById('race24-opponent-wrong').textContent = '0';
  document.getElementById('race24-opponent-answered').textContent = '0';
  document.getElementById('race24-progress-fill').style.width = '0%';

  G24._race.startTime = Date.now();
  G24._raceTimer = setInterval(G24._updateRace24Timer, 1000);

  G24._nextRace24Q();
  setTimeout(function () { G24._startRace24AIOpponent(); }, 1000);
};

G24._nextRace24Q = function () {
  var res = G24.gen24Q();
  G24._race24 = {
    numbers: res.nums.slice(),
    firstIdx: null, selectedOp: null,
    steps: [], history: [],
    original: res.nums.slice(),
    solution: res.solution
  };
  G24._race.submitted = false;
  document.getElementById('race24-hint').textContent = '① 选择一个数字卡片';
  document.querySelectorAll('#race24-ops .op-btn').forEach(function (b) { b.classList.remove('selected'); });
  G24._renderRace24Cards();
  G24._race.questionStart = Date.now();
};

G24._renderRace24Cards = function () {
  var rc = G24._race24;
  var c = document.getElementById('race24-cards');
  c.innerHTML = rc.numbers.map(function (n, i) {
    return '<div class="num-card-24' + (rc.firstIdx === i ? ' selected' : '') +
      '" onclick="G24.pickRace24Card(' + i + ')">' + G24.fmtNum(n) + '</div>';
  }).join('');
};

G24.pickRace24Card = function (idx) {
  var rc = G24._race24;
  var race = G24._race;
  if (rc.numbers.length <= 1) return;

  if (rc.firstIdx === null) {
    rc.firstIdx = idx;
    document.getElementById('race24-hint').textContent = '② 选择运算符';
    G24._renderRace24Cards();
  } else if (rc.firstIdx === idx) {
    rc.firstIdx = null;
    rc.selectedOp = null;
    document.querySelectorAll('#race24-ops .op-btn').forEach(function (b) { b.classList.remove('selected'); });
    document.getElementById('race24-hint').textContent = '① 选择一个数字卡片';
    G24._renderRace24Cards();
  } else if (rc.firstIdx !== idx) {
    if (!rc.selectedOp) return;
    var a = rc.numbers[rc.firstIdx];
    var b = rc.numbers[idx];
    var op = rc.selectedOp;
    var r;
    if (op === '+') r = a + b;
    else if (op === '-') r = a - b;
    else if (op === '*') r = a * b;
    else {
      if (Math.abs(b) < G24.EPS) { G24.showToast('不能除以0'); return; }
      r = a / b;
    }
    if (!isFinite(r)) { G24.showToast('结果无效'); return; }

    rc.history.push({ numbers: rc.numbers.slice(), steps: rc.steps.slice() });
    rc.steps.push(G24.fmtNum(a) + G24.OP_DISPLAY[op] + G24.fmtNum(b) + '=' + G24.fmtNum(Math.round(r * 1000) / 1000));

    var newNums = rc.numbers.filter(function (_, i) { return i !== rc.firstIdx && i !== idx; });
    newNums.push(Math.round(r * 1000) / 1000);
    rc.numbers = newNums;
    rc.firstIdx = null;
    rc.selectedOp = null;

    document.querySelectorAll('#race24-ops .op-btn').forEach(function (b) { b.classList.remove('selected'); });

    if (rc.numbers.length === 1) {
      var isCorrect = Math.abs(rc.numbers[0] - 24) < G24.EPS;
      if (isCorrect) {
        race.correct++;
        race.streak++;
        race.maxStreak = Math.max(race.maxStreak, race.streak);
        var timeSpent24 = Math.floor((Date.now() - race.questionStart) / 1000);
        var timeBonus24 = Math.max(0, 100 - timeSpent24 * 2);
        var streakBonus24 = 0;
        if (race.streak >= 10) streakBonus24 = 50;
        else if (race.streak >= 5) streakBonus24 = 30;
        else if (race.streak >= 3) streakBonus24 = 15;
        race.score += 150 + timeBonus24 + streakBonus24;
      } else {
        race.wrong++;
        race.streak = 0;
        race.wrongList.push({
          question: '24点: ' + rc.original.join(', '),
          yourAnswer: G24.fmtNum(rc.numbers[0]),
          correctAnswer: '24'
        });
      }

      document.getElementById('race24-my-score').textContent = race.score + '分';
      document.getElementById('race24-my-correct').textContent = race.correct;
      document.getElementById('race24-my-wrong').textContent = race.wrong;
      document.getElementById('race24-my-answered').textContent = race.correct + race.wrong;

      if (G24._isRoomRace && G24._roomSession.myRoomId && G24._roomSession.myPlayerId) {
        var time = Math.floor((Date.now() - race.startTime) / 1000);
        G24.api('/api/submitAnswer', {
          roomId: G24._roomSession.myRoomId, playerId: G24._roomSession.myPlayerId,
          is24Correct: isCorrect, time: time, steps: rc.steps
        }).catch(function () {});
        G24.api('/api/updateRaceScore', {
          roomId: G24._roomSession.myRoomId, playerId: G24._roomSession.myPlayerId,
          score: race.score, correct: race.correct, wrong: race.wrong
        }).catch(function () {});
      }

      G24.showToast(isCorrect ? '🎉 正确！' : '😅 结果不是24');
      setTimeout(function () { G24._nextRace24Q(); }, isCorrect ? 800 : 1000);
    } else {
      document.getElementById('race24-hint').textContent = '① 选择一个数字卡片';
      G24._renderRace24Cards();
    }
  }
};

G24.pickRace24Op = function (op) {
  if (G24._race24.firstIdx === null) return;
  G24._race24.selectedOp = op;
  document.querySelectorAll('#race24-ops .op-btn').forEach(function (b) {
    b.classList.toggle('selected', b.textContent.trim() === G24.OP_DISPLAY[op]);
  });
  document.getElementById('race24-hint').textContent =
    G24.fmtNum(G24._race24.numbers[G24._race24.firstIdx]) + ' ' + G24.OP_DISPLAY[op] + ' ③ 选择第二个数字';
};

G24.undoRace24 = function () {
  var rc = G24._race24;
  if (rc.history.length === 0) return;
  var last = rc.history.pop();
  rc.numbers = last.numbers;
  rc.steps = last.steps;
  rc.firstIdx = null;
  rc.selectedOp = null;
  document.querySelectorAll('#race24-ops .op-btn').forEach(function (b) { b.classList.remove('selected'); });
  document.getElementById('race24-hint').textContent = '① 选择一个数字卡片';
  G24._renderRace24Cards();
};

G24.resetRace24 = function () {
  var rc = G24._race24;
  rc.numbers = rc.original.slice();
  rc.firstIdx = null;
  rc.selectedOp = null;
  rc.steps = [];
  rc.history = [];
  document.querySelectorAll('#race24-ops .op-btn').forEach(function (b) { b.classList.remove('selected'); });
  document.getElementById('race24-hint').textContent = '① 选择一个数字卡片';
  G24._renderRace24Cards();
};

G24.skipRace24 = function () {
  if (G24._race.submitted) return;
  G24._race.submitted = true;
  G24._race.wrong++;
  G24._race.streak = 0;
  G24._race.wrongList.push({
    question: '24点: ' + G24._race24.original.join(', '),
    yourAnswer: '跳过',
    correctAnswer: G24._race24.solution || '24'
  });
  document.getElementById('race24-my-wrong').textContent = G24._race.wrong;
  document.getElementById('race24-my-answered').textContent = G24._race.correct + G24._race.wrong;
  G24.showToast('⏭ 已跳过');
  setTimeout(function () { G24._nextRace24Q(); }, 500);
};

G24._updateRace24Timer = function () {
  var limit = G24._isRoomRace ? G24._race.totalTime : G24.getRaceTimeLimit();
  var elapsed = Math.floor((Date.now() - G24._race.startTime) / 1000);
  var remaining = Math.max(0, limit - elapsed);
  document.getElementById('race24-timer').textContent = G24.formatTime(remaining);
  document.getElementById('race24-progress-fill').style.width = limit > 0 ? ((limit - remaining) / limit * 100) + '%' : '0%';
  if (remaining <= 0) G24._endRaceBattle();
};

G24._startRace24AIOpponent = function () {
  var config = G24.AI_CONFIG.hard;
  var race = G24._race;

  function aiAnswer() {
    var elapsed = (Date.now() - race.startTime) / 1000;
    if (elapsed >= G24.getRaceTimeLimit()) return;

    var correctRate = config.correct[0] + Math.random() * (config.correct[1] - config.correct[0]);
    var isCorrect = Math.random() < correctRate;
    if (isCorrect) {
      race.opponentCorrect++;
      var timeBonus = Math.floor(Math.random() * 30) + 20;
      race.opponentScore += 150 + timeBonus;
      race.opponentStreak++;
    } else {
      race.opponentWrong++;
      race.opponentStreak = 0;
    }

    document.getElementById('race24-opponent-score').textContent = race.opponentScore + '分';
    document.getElementById('race24-opponent-correct').textContent = race.opponentCorrect;
    document.getElementById('race24-opponent-wrong').textContent = race.opponentWrong;
    document.getElementById('race24-opponent-answered').textContent = race.opponentCorrect + race.opponentWrong;

    var speed = config.speed[0] + Math.random() * (config.speed[1] - config.speed[0]);
    G24._race24AITimer = setTimeout(aiAnswer, speed);
  }

  var firstDelay = Math.floor(Math.random() * 3000) + 2000;
  G24._race24AITimer = setTimeout(aiAnswer, firstDelay);
};

G24._startRealRace24Opponent = function () {
  if (!G24.getRaceRoomId()) {
    G24._startRace24AIOpponent();
    return;
  }

  G24._race24RealOpponentTimer = setInterval(async function () {
    try {
      var res = await G24.api('/api/getRaceOpponent', {
        roomId: G24.getRaceRoomId(), playerId: G24._race.playerId
      });
      if (res.ok && res.opponent) {
        var opp = res.opponent;
        G24._race.opponentScore = opp.score;
        G24._race.opponentCorrect = opp.correct;
        G24._race.opponentWrong = opp.wrong;

        document.getElementById('race24-opponent-score').textContent = G24._race.opponentScore + '分';
        document.getElementById('race24-opponent-correct').textContent = G24._race.opponentCorrect;
        document.getElementById('race24-opponent-wrong').textContent = G24._race.opponentWrong;
        document.getElementById('race24-opponent-answered').textContent = G24._race.opponentCorrect + G24._race.opponentWrong;
      }
    } catch (e) {}
  }, 1000);
};