window.G24 = window.G24 || {};

G24._g24 = {
  numbers: [], firstIdx: null, selectedOp: null,
  steps: [], history: [], original: [], solution: ''
};

G24.showPage = function (id) {
  document.querySelectorAll('.page').forEach(function (p) {
    p.classList.remove('active');
  });
  document.getElementById(id).classList.add('active');
  if (id === 'race-page') G24.loadRaceHistory();
  if (id === 'room-page') {
    document.getElementById('jn-roomid').value = '';
    document.getElementById('jn-name').value = '';
    document.getElementById('jn-password').value = '';
  }
};

G24.renderWaitRoom = function (room) {
  var s = G24._roomSession;
  if (s.lastPhase !== 'waiting') G24.showPage('wait-page');
  document.getElementById('wait-roomid').textContent = room.id;
  document.getElementById('wait-count').textContent = room.players.length;

  var diffMap = { easy: '🌱 加减', medium: '⚡ 四则', hard: '🏆 24点' };
  var isRaceRoom = room.gameMode === 'race';
  var modeValue = '';
  if (room.mode === 'rounds') modeValue = room.modeValue + '轮';
  else if (room.mode === 'questions') modeValue = room.modeValue + '题';
  else if (room.mode === 'time') { modeValue = Math.floor(room.modeValue / 60) + '分钟'; }

  document.getElementById('wait-settings').innerHTML =
    '<div class="settings-row"><span>难度</span><span class="settings-val">' + (diffMap[room.difficulty] || room.difficulty) + '</span></div>' +
    (room.difficulty !== 'hard' ? '<div class="settings-row"><span>范围</span><span class="settings-val">' + room.range + '以内</span></div>' : '') +
    '<div class="settings-row"><span>模式</span><span class="settings-val">' + (isRaceRoom ? '⚡ 竞速模式' : '普通对战') + '</span></div>' +
    (!isRaceRoom ? '<div class="settings-row"><span>目标</span><span class="settings-val">' + modeValue + '</span></div>' : '') +
    (room.password ? '<div class="settings-row"><span>密码</span><span class="settings-val">🔒 有密码</span></div>' : '');

  var pc = document.getElementById('wait-players');
  pc.innerHTML = room.players.map(function (p) {
    var isP = room.owner === p.id;
    var isMe = p.id === s.myPlayerId;
    var showReady = isP ? '<span style="color:var(--green)">✅ 已准备</span>'
      : (p.ready ? '<span style="color:var(--green)">✅ 已准备</span>' : '<span style="color:var(--sub)">⏳ 未准备</span>');
    return '<div class="player-item">' +
      '<div class="player-avatar" style="background:' + (p.color || 'var(--purple)') + '">' + G24.esc(p.name[0]) + '</div>' +
      '<div class="player-info">' +
      '<div class="player-name">' + G24.esc(p.name) + (isP ? '<span class="owner-tag">房主</span>' : '') + '</div>' +
      '<div class="player-name" style="font-size:11px">' + showReady + '</div>' +
      '</div>' +
      (s.isOwner && !isMe ? '<button class="kick-btn" data-pid="' + G24.esc(p.id) + '" onclick="G24.kickPlayer(this.dataset.pid)">踢出</button>' : '') +
      '</div>';
  }).join('');

  var me = room.players.find(function (p) { return p.id === s.myPlayerId; });
  G24._myReady = me ? me.ready : false;
  var rdyBtn = document.getElementById('wait-ready-btn');
  if (s.isOwner) {
    rdyBtn.style.display = 'none';
  } else {
    if (G24._myReady) {
      rdyBtn.textContent = '✅ 已准备（点击取消准备）';
      rdyBtn.className = 'btn btn-success';
      rdyBtn.style.marginTop = '12px';
      rdyBtn.style.display = 'block';
    } else {
      rdyBtn.textContent = '⏳ 未准备（点击准备）';
      rdyBtn.className = 'btn btn-warning';
      rdyBtn.style.marginTop = '12px';
      rdyBtn.style.display = 'block';
    }
  }

  var allReady = room.players.every(function (p) {
    return p.id === room.owner || p.ready;
  });
  var btn = document.getElementById('start-game-btn');
  if (s.isOwner) {
    btn.style.display = 'block';
    btn.disabled = room.players.length < 2 || !allReady;
    btn.textContent = !allReady ? '▶️ 等待全员准备'
      : room.players.length < 2 ? '▶️ 至少2人'
      : '▶️ 开始游戏';
  } else {
    btn.style.display = 'none';
  }
};

G24.renderCountdown = function (room) {
  var s = G24._roomSession;
  if (s.lastPhase !== 'countdown') G24.showPage('countdown-page');
  var elapsed = (Date.now() - room.countdownAt) / 1000;
  var remaining = 3 - Math.floor(elapsed);
  document.getElementById('countdown-num').textContent = Math.max(1, Math.min(3, remaining));
};

G24.renderPlaying = function (room) {
  if (room.gameMode === 'race') {
    G24.startRoomRacePlaying(room);
    return;
  }
  var s = G24._roomSession;
  if (s.lastPhase === 'countdown' || s.lastPhase === 'waiting' || s.lastPhase === 'roundEnd') {
    G24._showingRoundResult = false;
    G24._submitted = false;
    G24._myReady = false;
    G24._g24 = { numbers: [], firstIdx: null, selectedOp: null, steps: [], history: [], original: [], solution: '' };

    if (room.difficulty === 'hard') {
      G24.showPage('play24-page');
      var q = room.currentQuestion;
      G24._g24.numbers = q.numbers.slice();
      G24._g24.original = q.numbers.slice();
      G24._g24.solution = q.solution || '';
      G24._updateProgressDisplay(room, 'play24-round', 'play24-progress');
      document.getElementById('play24-hint').textContent = '① 选择一个数字卡片';
      G24._render24Cards();
    } else {
      G24.showPage('play-page');
      var q2 = room.currentQuestion;
      document.getElementById('play-title').textContent = room.difficulty === 'easy' ? '加减对战' : '四则对战';
      G24._updateProgressDisplay(room, 'play-round', 'play-progress');
      document.getElementById('play-question-expr').innerHTML =
        '<span class="q-num">' + q2.numbers[0] + '</span><span class="q-op">' +
        q2.operator + '</span><span class="q-num">' + q2.numbers[1] +
        '</span><span>=</span><span class="q-num">?</span>';
      document.getElementById('play-answer').value = '';
      setTimeout(function () { document.getElementById('play-answer').focus(); }, 100);
    }
    G24._startGameTimer();
    G24._timerStart = Date.now();
  }
  G24._renderPlayPlayers(room);
};

G24._updateProgressDisplay = function (room, roundElId, progressElId) {
  var roundEl = document.getElementById(roundElId);
  var progressEl = document.getElementById(progressElId);
  if (room.mode === 'rounds') {
    roundEl.textContent = room.currentRound + '/' + room.modeValue;
    progressEl.style.width = (room.currentRound / room.modeValue * 100) + '%';
  } else if (room.mode === 'questions') {
    roundEl.textContent = room.totalQuestions + '/' + room.modeValue;
    progressEl.style.width = (room.totalQuestions / room.modeValue * 100) + '%';
  } else if (room.mode === 'time') {
    var elapsed = Math.max(0, Math.floor((Date.now() - room.startTime) / 1000));
    var remaining = Math.max(0, room.modeValue - elapsed);
    roundEl.textContent = Math.floor(remaining / 60) + ':' + (remaining % 60 < 10 ? '0' : '') + (remaining % 60);
    progressEl.style.width = (elapsed / room.modeValue * 100) + '%';
  } else {
    roundEl.textContent = room.currentRound + '/' + room.totalRounds;
    progressEl.style.width = (room.currentRound / room.totalRounds * 100) + '%';
  }
};

G24._renderPlayPlayers = function (room) {
  var submitted = room.roundAnswers.map(function (a) { return a.playerId; });
  var html = room.players.map(function (p) {
    var done = submitted.includes(p.id);
    return '<div class="player-item">' +
      '<div class="player-avatar" style="background:' + (p.color || 'var(--purple)') + '">' + G24.esc(p.name[0]) + '</div>' +
      '<div class="player-info">' +
      '<div class="player-name">' + G24.esc(p.name) + (done ? ' ✅' : '') + '</div>' +
      '<div class="player-score">' + p.correct + '✓ ' + p.wrong + '✗</div>' +
      '</div></div>';
  }).join('');
  var el1 = document.getElementById('play-players'); if (el1) el1.innerHTML = html;
  var el2 = document.getElementById('play24-players'); if (el2) el2.innerHTML = html;
};

G24._render24Cards = function () {
  var g24 = G24._g24;
  var c = document.getElementById('play24-cards');
  c.innerHTML = g24.numbers.map(function (n, i) {
    return '<div class="num-card-24' + (g24.firstIdx === i ? ' selected' : '') +
      '" onclick="G24._pick24Card(' + i + ')">' + G24.fmtNum(n) + '</div>';
  }).join('');
  document.querySelectorAll('#play24-ops .op-btn').forEach(function (b) { b.classList.remove('selected'); });
};

G24._pick24Card = function (i) {
  var g24 = G24._g24;
  if (G24._submitted) return;

  if (g24.firstIdx === null) {
    g24.firstIdx = i;
    G24._render24Cards();
    document.getElementById('play24-hint').textContent = '已选 ' + g24.numbers[i] + '，② 选运算符';
  } else if (g24.selectedOp) {
    if (i === g24.firstIdx) {
      g24.firstIdx = null;
      g24.selectedOp = null;
      G24._render24Cards();
      document.getElementById('play24-hint').textContent = '① 选择数字卡片';
      return;
    }
    G24._execute24Op(i);
  } else {
    g24.firstIdx = i;
    G24._render24Cards();
    document.getElementById('play24-hint').textContent = '已选 ' + g24.numbers[i] + '，② 选运算符';
  }
};

G24._execute24Op = function (i) {
  var g24 = G24._g24;
  var a = g24.numbers[g24.firstIdx];
  var b = g24.numbers[i];
  var op = g24.selectedOp;
  var r;

  if (op === '+') r = a + b;
  else if (op === '-') r = a - b;
  else if (op === '*') r = a * b;
  else {
    if (Math.abs(b) < G24.EPS) {
      G24.showToast('不能除以0');
      g24.firstIdx = null;
      g24.selectedOp = null;
      G24._render24Cards();
      return;
    }
    r = a / b;
  }

  g24.history.push({ numbers: g24.numbers.slice(), steps: g24.steps.slice() });
  g24.steps.push(G24.fmtNum(a) + G24.OP_DISPLAY[op] + G24.fmtNum(b) + '=' + G24.fmtNum(Math.round(r * 1000) / 1000));
  var newNums = g24.numbers.filter(function (_, idx) { return idx !== g24.firstIdx && idx !== i; });
  newNums.push(Math.round(r * 1000) / 1000);
  g24.numbers = newNums;
  g24.firstIdx = null;
  g24.selectedOp = null;
  G24._render24Cards();

  if (g24.numbers.length === 1) {
    var time = (Date.now() - G24._timerStart) / 1000;
    var isOk = Math.abs(g24.numbers[0] - 24) < G24.EPS;
    G24._submit24Answer(time, isOk);
  } else {
    document.getElementById('play24-hint').textContent = '① 选择数字卡片';
  }
};

G24._pick24Op = function (op) {
  var g24 = G24._g24;
  if (G24._submitted || g24.firstIdx === null) return;
  g24.selectedOp = op;
  document.querySelectorAll('#play24-ops .op-btn').forEach(function (b) {
    b.classList.toggle('selected', b.textContent.trim() === G24.OP_DISPLAY[op]);
  });
  document.getElementById('play24-hint').textContent =
    g24.numbers[g24.firstIdx] + ' ' + G24.OP_DISPLAY[op] + ' ③ 选第二个数字';
};

G24._undo24 = function () {
  var g24 = G24._g24;
  if (g24.history.length === 0) { G24.showToast('没有可撤销'); return; }
  var prev = g24.history.pop();
  g24.numbers = prev.numbers;
  g24.steps = prev.steps;
  g24.firstIdx = null;
  g24.selectedOp = null;
  G24._render24Cards();
  document.getElementById('play24-hint').textContent = '① 选择数字卡片';
};

G24._reset24 = function () {
  if (G24._submitted) return;
  var g24 = G24._g24;
  g24.numbers = g24.original.slice();
  g24.firstIdx = null;
  g24.selectedOp = null;
  g24.steps = [];
  g24.history = [];
  G24._render24Cards();
  document.getElementById('play24-hint').textContent = '① 选择数字卡片';
};

G24.renderRoundEnd = function (room) {
  var s = G24._roomSession;
  if (!G24._showingRoundResult) {
    G24._showingRoundResult = true;
    G24._stopGameTimer();
    G24.showPage('round-result-page');
  }

  var q = room.currentQuestion;
  var answerStr = room.difficulty === 'hard'
    ? (q.solution || '无解')
    : q.numbers[0] + ' ' + q.operator + ' ' + q.numbers[1] + ' ＝ ' + q.answer;

  var roundLabel = '';
  if (room.mode === 'rounds') roundLabel = '第 ' + room.currentRound + '/' + room.modeValue + ' 轮';
  else if (room.mode === 'questions') roundLabel = '已答 ' + room.totalQuestions + '/' + room.modeValue + ' 题';
  else if (room.mode === 'time') roundLabel = '本轮结束';

  var html = '<div style="text-align:center;margin-bottom:12px"><div style="font-size:13px;color:var(--sub)">' +
    roundLabel + '</div><div style="font-size:15px;font-weight:700;color:var(--text);margin-top:4px">正确答案：' +
    answerStr + '</div></div>';

  var sorted = room.roundAnswers.slice().sort(function (a, b) {
    if (a.correct !== b.correct) return b.correct - a.correct;
    return a.time - b.time;
  });

  sorted.forEach(function (a, i) {
    var cls = a.correct ? 'result-correct' : (a.timeout ? 'result-timeout' : 'result-wrong');
    var icon = a.correct ? '✓' : (a.timeout ? '⏱' : '✗');
    html += '<div class="round-result-item"><span>' + (i + 1) + '. ' + G24.esc(a.playerName) +
      '</span><span class="' + cls + '">' + icon + ' ' + a.time.toFixed(1) + 's</span></div>';
  });
  document.getElementById('round-result-content').innerHTML = html;

  var nextBtn = document.getElementById('next-round-btn');
  var readyBtn = document.getElementById('ready-btn');
  var readyInfo = document.getElementById('round-ready-info');

  if (s.isOwner) {
    nextBtn.style.display = 'block';
    readyBtn.style.display = 'none';
    var readyCount = room.players.filter(function (p) {
      return p.id !== s.myPlayerId && p.ready;
    }).length;
    var otherCount = room.players.length - 1;
    nextBtn.textContent = '➡️ 下一轮';
    readyInfo.textContent = otherCount > 0
      ? '其他玩家：' + readyCount + '/' + otherCount + ' 已准备 ' + (readyCount === otherCount ? '✅' : '⏳')
      : '';
    nextBtn.disabled = otherCount > 0 && readyCount < otherCount;
    if (otherCount === 0 || readyCount === otherCount) {
      nextBtn.className = 'btn btn-success';
    } else {
      nextBtn.className = 'btn btn-primary';
    }
  } else {
    nextBtn.style.display = 'none';
    readyBtn.style.display = 'block';
    var myPlayer = room.players.find(function (p) { return p.id === s.myPlayerId; });
    G24._myReady = myPlayer ? myPlayer.ready : G24._myReady;
    if (!G24._myReady) {
      readyBtn.textContent = '✋ 举手准备';
      readyBtn.className = 'btn btn-warning';
    } else {
      readyBtn.textContent = '✅ 已准备';
      readyBtn.className = 'btn btn-success';
    }
    readyInfo.textContent = '等待房主操作...';
  }
};

G24.renderFinished = function (room) {
  G24._stopPolling();
  G24._stopGameTimer();
  G24.showPage('result-page');

  var s = G24._roomSession;
  var sorted = room.players.slice().sort(function (a, b) {
    if (b.correct !== a.correct) return b.correct - a.correct;
    return a.totalTime - b.totalTime;
  });
  var winner = sorted[0];
  var isMe = winner && winner.id === s.myPlayerId;

  document.getElementById('result-title').textContent = isMe
    ? '🎉 你赢了！' : (winner ? G24.esc(winner.name) + ' 获胜！' : '游戏结束');

  var desc = '';
  if (room.mode === 'rounds') desc = '共' + room.modeValue + '轮';
  else if (room.mode === 'questions') desc = '共' + room.modeValue + '题';
  else if (room.mode === 'time') desc = Math.floor(room.modeValue / 60) + '分钟';

  document.getElementById('result-sub').textContent = desc + ' · ' +
    (room.difficulty === 'easy' ? '加减' : room.difficulty === 'medium' ? '四则' : '24点');

  document.getElementById('result-ranking').innerHTML = sorted.map(function (p, i) {
    return '<div class="player-item" style="' + (i === 0 ? 'border:2px solid var(--yellow)' : '') + '">' +
      '<div class="player-avatar" style="background:' + (p.color || 'var(--purple)') + '">' +
      (i === 0 ? '👑' : G24.esc(p.name[0])) + '</div>' +
      '<div class="player-info"><div class="player-name">' + G24.esc(p.name) +
      (p.id === s.myPlayerId ? ' (我)' : '') + '</div>' +
      '<div class="player-score">' + p.correct + '✓ ' + p.wrong + '✗ · ' + p.totalTime.toFixed(1) + 's</div></div></div>';
  }).join('');

  if (isMe) G24.launchConfetti();
};

G24.initServerInfo = async function () {
  try {
    var res = await fetch(G24.API + '/api/serverInfo');
    var data = await res.json();
    if (data.ok) {
      document.getElementById('lan-info').innerHTML = '📡 局域网：<b>http://' + data.ip + ':' + data.port + '</b>';
    }
  } catch (e) {}
};