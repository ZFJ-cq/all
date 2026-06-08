window.G24 = window.G24 || {};

G24._pollTimer = null;
G24._gameTimer = null;
G24._timerStart = 0;
G24._submitted = false;
G24._myReady = false;
G24._showingRoundResult = false;

G24.onCRDiffChange = function (el) {
  G24.pickOpt(el, 'cr-diff-row');
  document.getElementById('cr-range-section').style.display = el.dataset.v === 'hard' ? 'none' : 'block';
};

G24.showMainPanel = function () {
  document.getElementById('multi-main').style.display = 'block';
  document.getElementById('create-panel').style.display = 'none';
  document.getElementById('join-panel').style.display = 'none';
};

G24.showCreatePanel = function () {
  document.getElementById('multi-main').style.display = 'none';
  document.getElementById('create-panel').style.display = 'block';
  document.getElementById('join-panel').style.display = 'none';
  G24.updateModeSection();
};

G24.showJoinPanel = function () {
  document.getElementById('multi-main').style.display = 'none';
  document.getElementById('create-panel').style.display = 'none';
  document.getElementById('join-panel').style.display = 'block';
};

G24.updateModeSection = function () {
  var diff = G24.getOpt('cr-diff-row');
  document.getElementById('cr-range-section').style.display = diff === 'hard' ? 'none' : 'block';
};

G24.updateRoomMode = function () {
  var mode = G24.getOpt('cr-game-mode');
  var roundsSec = document.getElementById('cr-rounds-section');
  var timeSec = document.getElementById('cr-time-row');
  var totalTimeSec = document.getElementById('cr-total-time-row');

  if (mode === 'race') {
    roundsSec.style.display = 'none';
  } else {
    roundsSec.style.display = 'block';
  }
  timeSec.style.display = 'flex';
  totalTimeSec.style.display = 'flex';
};

G24.createRoom = async function () {
  var name = document.getElementById('cr-name').value.trim();
  if (!name) { G24.showToast('请输入昵称'); return; }

  var gameMode = G24.getOpt('cr-game-mode');
  var diff = G24.getOpt('cr-diff-row');
  var range = G24.getOpt('cr-range-row');
  var rounds = G24.getOpt('cr-rounds-row');
  var timeLimit = G24.getOpt('cr-time-row');
  var totalTime = G24.getOpt('cr-total-time-row');
  var pw = document.getElementById('cr-password').value.trim();

  var isRace = gameMode === 'race';
  var res = await G24.api('/api/createRoom', {
    playerName: name, difficulty: diff, range: range,
    totalRounds: isRace ? 999 : rounds, password: pw,
    mode: isRace ? 'time' : 'rounds',
    modeValue: isRace ? parseInt(totalTime) : rounds,
    timeLimit: timeLimit, totalTime: totalTime, gameMode: gameMode
  }, true);

  if (!res.ok) { G24.showToast(res.msg); return; }

  var s = G24._roomSession;
  s.myRoomId = res.roomId;
  s.myPlayerId = res.playerId;
  s.myPlayerName = name;
  s.isOwner = true;
  s.isInRoom = true;
  s.lastEventIdx = 0;
  G24._myReady = false;
  G24.saveRoomSession();

  document.getElementById('wait-roomid').textContent = res.roomId;
  var cl = document.getElementById('wait-chat-log');
  if (cl) cl.innerHTML = '';
  G24.showPage('wait-page');
  G24.startPolling();
};

G24.joinRoom = async function () {
  var rid = document.getElementById('jn-roomid').value.trim();
  var name = document.getElementById('jn-name').value.trim();
  var pw = document.getElementById('jn-password').value.trim();
  if (!rid || rid.length !== 6) { G24.showToast('请输入6位房间号'); return; }
  if (!name) { G24.showToast('请输入昵称'); return; }

  var res = await G24.api('/api/joinRoom', { roomId: rid, playerName: name, password: pw }, true);
  if (!res.ok) { G24.showToast(res.msg); return; }

  var s = G24._roomSession;
  s.myRoomId = rid;
  s.myPlayerId = res.playerId;
  s.myPlayerName = name;
  s.isOwner = false;
  s.isInRoom = true;
  s.lastEventIdx = 0;
  G24._myReady = false;
  G24.saveRoomSession();

  document.getElementById('wait-roomid').textContent = rid;
  var cl2 = document.getElementById('wait-chat-log');
  if (cl2) cl2.innerHTML = '';
  G24.showPage('wait-page');
  G24.startPolling();
};

G24.confirmLeave = function () {
  G24.showConfirm('离开房间', '确定要离开吗？', G24.leaveRoom);
};

G24.confirmLeaveRoom = function () {
  G24.showConfirm('退出房间', '确定要退出房间吗？', G24.leaveRoom);
};

G24.leaveRoom = async function () {
  var s = G24._roomSession;
  if (s.myRoomId && s.myPlayerId) {
    await G24.api('/api/leaveRoom', { roomId: s.myRoomId, playerId: s.myPlayerId });
  }
  G24._stopPolling();
  G24._stopGameTimer();
  G24.clearRoomSession();
  G24._myReady = false;
  G24._showingRoundResult = false;
  G24._submitted = false;
  document.getElementById('jn-roomid').value = '';
  document.getElementById('jn-name').value = '';
  document.getElementById('jn-password').value = '';
  G24.showPage('room-page');
};

G24.startGame = async function () {
  var s = G24._roomSession;
  var res = await G24.api('/api/startGame', { roomId: s.myRoomId, playerId: s.myPlayerId });
  if (!res.ok) G24.showToast(res.msg);
};

G24.startPolling = function () {
  G24._stopPolling();
  G24._pollTimer = setInterval(G24._poll, 1000);
  G24._poll();
};

G24._stopPolling = function () {
  if (G24._pollTimer) { clearInterval(G24._pollTimer); G24._pollTimer = null; }
};

G24._startGameTimer = function () {
  G24._stopGameTimer();
  G24._timerStart = Date.now();
  G24._gameTimer = setInterval(G24._updateGameTimer, 100);
};

G24._stopGameTimer = function () {
  if (G24._gameTimer) { clearInterval(G24._gameTimer); G24._gameTimer = null; }
};

G24._updateGameTimer = function () {
  var s = ((Date.now() - G24._timerStart) / 1000).toFixed(1);
  var te = document.getElementById('play-timer');
  if (te) te.textContent = s + 's';
  var te2 = document.getElementById('play24-timer');
  if (te2) te2.textContent = s + 's';
};

G24._poll = async function () {
  var s = G24._roomSession;
  if (!s.myRoomId) return;
  var res = await G24.api('/api/getRoom', { roomId: s.myRoomId });
  if (!res.ok) { G24.showToast('房间已关闭'); G24._stopPolling(); G24.showPage('room-page'); return; }

  var room = res.room;
  G24._processEvents(room);

  if (room.phase === 'waiting') G24.renderWaitRoom(room);
  else if (room.phase === 'countdown') G24.renderCountdown(room);
  else if (room.phase === 'playing') G24.renderPlaying(room);
  else if (room.phase === 'roundEnd') G24.renderRoundEnd(room);
  else if (room.phase === 'finished') {
    if (room.gameMode === 'race') {
      G24._stopOpponentPolling();
      G24._isRoomRace = false;
      if (G24._raceTimer) { clearInterval(G24._raceTimer); G24._raceTimer = null; }
      if (G24._aiTimer) { clearTimeout(G24._aiTimer); G24._aiTimer = null; }
      if (G24._race24AITimer) { clearTimeout(G24._race24AITimer); G24._race24AITimer = null; }
      if (G24._race24RealOpponentTimer) { clearInterval(G24._race24RealOpponentTimer); G24._race24RealOpponentTimer = null; }
      G24.renderFinished(room);
    } else {
      G24.renderFinished(room);
    }
  }
  s.lastPhase = room.phase;
  s.lastRound = room.currentRound;
  G24.saveRoomSession();
};

G24._processEvents = function (room) {
  if (!room.events) return;
  var s = G24._roomSession;
  if (s.lastEventIdx > room.events.length) {
    s.lastEventIdx = 0;
  }
  var chatLog = document.getElementById('wait-chat-log');
  room.events.slice(s.lastEventIdx).forEach(function (ev) {
    if (ev.type === 'join') {
      G24.showEventToast(ev.playerName + ' 加入了房间');
      if (chatLog) chatLog.innerHTML += '<div style="color:var(--green)">' + G24.esc(ev.playerName) + ' 加入了房间</div>';
    } else if (ev.type === 'leave') {
      G24.showEventToast(ev.playerName + ' 离开了房间');
      if (chatLog) chatLog.innerHTML += '<div style="color:var(--sub)">' + G24.esc(ev.playerName) + ' 离开了房间</div>';
    } else if (ev.type === 'kick') {
      G24.showEventToast(ev.playerName + ' 被踢出');
      if (chatLog) chatLog.innerHTML += '<div style="color:var(--danger)">' + G24.esc(ev.playerName) + ' 被踢出</div>';
    } else if (ev.type === 'emoji') G24.showEmojiFloat(ev.emoji);
    else if (ev.type === 'chat') {
      G24.showEventToast(ev.playerName + ': ' + ev.msg);
      if (chatLog) {
        chatLog.innerHTML += '<div><b>' + G24.esc(ev.playerName) + '</b>: ' + G24.esc(ev.msg) + '</div>';
        chatLog.scrollTop = chatLog.scrollHeight;
      }
    }
  });
  s.lastEventIdx = room.events.length;
};

G24.showExitConfirm = function () {
  G24.showConfirm('退出房间', '确定要退出吗？', G24._exitRoom);
};

G24._exitRoom = async function () {
  var s = G24._roomSession;
  if (s.myRoomId && s.myPlayerId) {
    await G24.api('/api/leaveRoom', { roomId: s.myRoomId, playerId: s.myPlayerId });
  }
  G24._stopPolling();
  G24._stopGameTimer();
  G24.clearRoomSession();
  document.getElementById('jn-roomid').value = '';
  document.getElementById('jn-name').value = '';
  document.getElementById('jn-password').value = '';
  G24.showPage('home-page');
  G24.showToast('已退出房间');
};

G24.submitMathAnswer = async function () {
  if (G24._submitted) return;
  var ans = parseFloat(document.getElementById('play-answer').value);
  if (isNaN(ans)) { G24.showToast('请输入答案'); return; }
  G24._submitted = true;
  var time = (Date.now() - G24._timerStart) / 1000;
  var res = await G24.api('/api/submitAnswer', {
    roomId: G24._roomSession.myRoomId, playerId: G24._roomSession.myPlayerId,
    answer: ans, time: time
  });
  if (res.ok) G24.showToast(res.isCorrect ? '✅ 正确！' : '❌ 错误！');
  else G24.showToast(res.msg);
};

G24._submit24Answer = async function (time, isCorrect) {
  G24._submitted = true;
  var res = await G24.api('/api/submitAnswer', {
    roomId: G24._roomSession.myRoomId, playerId: G24._roomSession.myPlayerId,
    time: time, is24Correct: isCorrect, steps: G24._g24.steps
  });
  if (res.ok) G24.showToast(isCorrect ? '✅ 算出24点！' : '❌ 结果不是24');
  else G24.showToast(res.msg);
};

G24.sendEmoji = async function (emoji) {
  await G24.api('/api/sendEmoji', {
    roomId: G24._roomSession.myRoomId, playerId: G24._roomSession.myPlayerId,
    emoji: emoji
  });
};

G24.kickPlayer = async function (targetId) {
  var res = await G24.api('/api/kickPlayer', {
    roomId: G24._roomSession.myRoomId, playerId: G24._roomSession.myPlayerId,
    targetPlayerId: targetId
  });
  if (res.ok) G24.showToast(res.kickedName + ' 已被踢出');
  else G24.showToast(res.msg);
};

G24.toggleReady = async function () {
  var newReady = !G24._myReady;
  var res = await G24.api('/api/setReady', {
    roomId: G24._roomSession.myRoomId, playerId: G24._roomSession.myPlayerId,
    ready: newReady
  });
  if (res.ok) {
    G24._myReady = newReady;
    var btn = document.getElementById('ready-btn');
    if (G24._myReady) { btn.textContent = '✅ 已准备'; btn.className = 'btn btn-success'; }
    else { btn.textContent = '✋ 举手准备'; btn.className = 'btn btn-warning'; }
  }
};

G24.toggleRoomReady = async function () {
  var newReady = !G24._myReady;
  var res = await G24.api('/api/setReady', {
    roomId: G24._roomSession.myRoomId, playerId: G24._roomSession.myPlayerId,
    ready: newReady
  });
  if (res.ok) {
    G24._myReady = newReady;
    G24.showToast(G24._myReady ? '✅ 已准备' : '⏳ 已取消准备');
  }
};

G24.sendQuickChat = async function (msg) {
  await G24.api('/api/sendEvent', {
    roomId: G24._roomSession.myRoomId, playerId: G24._roomSession.myPlayerId,
    type: 'chat', msg: msg
  });
  G24.showToast('已发送');
};

G24.nextRound = async function () {
  var res = await G24.api('/api/nextRound', {
    roomId: G24._roomSession.myRoomId, playerId: G24._roomSession.myPlayerId
  });
  if (!res.ok) G24.showToast(res.msg);
  else {
    G24._showingRoundResult = false;
    if (res.finished) { G24._stopPolling(); G24._stopGameTimer(); }
  }
};

G24.restartGame = async function () {
  var res = await G24.api('/api/restartGame', {
    roomId: G24._roomSession.myRoomId, playerId: G24._roomSession.myPlayerId
  });
  if (res.ok) {
    G24._showingRoundResult = false;
    G24._myReady = false;
    G24._submitted = false;
    G24._roomSession.lastPhase = '';
    G24._roomSession.lastRound = 0;
    G24._raceEnded = false;
    G24.startPolling();
  } else G24.showToast(res.msg);
};

G24.dissolveRoom = async function () {
  G24.showConfirm('解散房间', '确定要解散吗？所有玩家将被移出', async function () {
    var s = G24._roomSession;
    await G24.api('/api/dissolveRoom', { roomId: s.myRoomId, playerId: s.myPlayerId });
    G24._stopPolling();
    G24.clearRoomSession();
    document.getElementById('jn-roomid').value = '';
    document.getElementById('jn-name').value = '';
    document.getElementById('jn-password').value = '';
    G24.showPage('home-page');
  });
};