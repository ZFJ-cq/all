window.G24 = window.G24 || {};

G24._roomSession = {
  myRoomId: null, myPlayerId: null, myPlayerName: null,
  isOwner: false, isInRoom: false,
  lastPhase: '', lastRound: 0, lastEventIdx: 0
};

G24._lsGet = function (key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
};

G24._lsSet = function (key, value) {
  try { localStorage.setItem(key, value); } catch (e) {}
};

G24._lsRemove = function (key) {
  try { localStorage.removeItem(key); } catch (e) {}
};

G24.saveRoomSession = function () {
  var s = G24._roomSession;
  var session = {
    myRoomId: s.myRoomId, myPlayerId: s.myPlayerId,
    myPlayerName: s.myPlayerName, isOwner: s.isOwner,
    isInRoom: s.isInRoom, lastPhase: s.lastPhase,
    lastRound: s.lastRound, lastEventIdx: s.lastEventIdx
  };
  G24._lsSet('roomSession', JSON.stringify(session));
};

G24.clearRoomSession = function () {
  G24._lsRemove('roomSession');
  G24._roomSession = {
    myRoomId: null, myPlayerId: null, myPlayerName: null,
    isOwner: false, isInRoom: false,
    lastPhase: '', lastRound: 0, lastEventIdx: 0
  };
};

G24.tryResumeRoomSession = async function () {
  var renderRoundEnd = G24.renderRoundEnd;
  var renderFinished = G24.renderFinished;
  var renderWaitRoom = G24.renderWaitRoom;
  var renderPlaying = G24.renderPlaying;
  var startRoomRacePlaying = G24.startRoomRacePlaying;
  var renderCountdown = G24.renderCountdown;
  var startPolling = G24.startPolling;
  var showToast = G24.showToast;
  var showPage = G24.showPage;

  try {
    var saved = G24._lsGet('roomSession');
    if (!saved) return;

    var session = JSON.parse(saved);
    var s = G24._roomSession;
    s.myRoomId = session.myRoomId;
    s.myPlayerId = session.myPlayerId;
    s.myPlayerName = session.myPlayerName;
    s.isOwner = session.isOwner;
    s.isInRoom = session.isInRoom;
    s.lastPhase = session.lastPhase;
    s.lastRound = session.lastRound;
    s.lastEventIdx = session.lastEventIdx;

    if (!s.myRoomId || !s.myPlayerId || !s.isInRoom) return;

    var res = await G24.api('/api/getRoom', { roomId: s.myRoomId });
    if (!res.ok || !res.room) {
      G24.clearRoomSession();
      return;
    }

    var room = res.room;

    if (room.phase === 'finished') {
      G24._stopOpponentPolling();
      G24._isRoomRace = false;
      G24._raceEnded = false;
      if (G24._raceTimer) { clearInterval(G24._raceTimer); G24._raceTimer = null; }
      if (G24._aiTimer) { clearTimeout(G24._aiTimer); G24._aiTimer = null; }
      if (G24._race24AITimer) { clearTimeout(G24._race24AITimer); G24._race24AITimer = null; }
      if (G24._race24RealOpponentTimer) { clearInterval(G24._race24RealOpponentTimer); G24._race24RealOpponentTimer = null; }
      G24.clearRoomSession();
      showPage('result-page');
      renderFinished(room);
      return;
    }

    if (room.players.find(function (p) { return p.id === s.myPlayerId; })) {
      s.isOwner = room.owner === s.myPlayerId;
      s.lastPhase = '';
      if (room.gameMode === 'race' && room.phase === 'playing') {
        startRoomRacePlaying(room);
      } else if (room.phase === 'countdown') {
        showPage('wait-page');
        renderWaitRoom(room);
        showToast('游戏即将开始...');
      } else if (room.phase === 'playing') {
        if (room.difficulty === 'hard') {
          showPage('play24-page');
          renderPlaying(room);
        } else {
          showPage('play-page');
          renderPlaying(room);
        }
      } else if (room.phase === 'roundEnd') {
        showPage('round-result-page');
        renderRoundEnd(room);
      } else {
        showPage('wait-page');
        renderWaitRoom(room);
      }
      startPolling();
      showToast('已恢复房间连接');
    } else {
      G24.clearRoomSession();
    }
  } catch (e) {
    G24.clearRoomSession();
  }
};

G24.loadRaceHistory = function () {
  var history = [];
  try { history = JSON.parse(G24._lsGet('raceHistory') || '[]'); } catch (e) { history = []; }
  var list = document.getElementById('race-history-list');
  if (!list) return;
  if (history.length === 0) {
    list.innerHTML = '<div style="text-align:center;color:var(--sub);padding:20px">暂无对战记录</div>';
    return;
  }
  list.innerHTML = history.slice(-15).reverse().map(function (h) {
    return '<div class="history-item" style="flex-direction:column;gap:4px;padding:10px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center">' +
      '<span class="history-date">' + G24.esc(h.date) + '</span>' +
      '<span class="history-result ' + h.result + '">' + (h.result === 'win' ? '🎉 胜利' : '💪 失败') + '</span>' +
      '</div>' +
      '<div style="display:flex;gap:12px;font-size:12px;color:var(--sub)">' +
      '<span>' + (G24.DIFF_NAMES[h.difficulty] || G24.esc(h.difficulty)) + '</span>' +
      '<span>得分 ' + (h.score || 0) + '</span>' +
      '<span>' + (h.correct || 0) + '✓ ' + (h.wrong || 0) + '✗</span>' +
      '<span>🔥' + (h.maxStreak || 0) + '</span>' +
      '</div>' +
      '</div>';
  }).join('');
};

G24.saveRaceResult = function (result, diff, score, correct, wrong, maxStreak, oppName, oppScore) {
  var history = [];
  try { history = JSON.parse(G24._lsGet('raceHistory') || '[]'); } catch (e) { history = []; }
  history.push({
    date: new Date().toLocaleString('zh-CN'),
    result: result,
    difficulty: diff,
    score: score,
    correct: correct,
    wrong: wrong,
    maxStreak: maxStreak,
    opponentName: oppName || 'AI对手',
    opponentScore: oppScore
  });
  G24._lsSet('raceHistory', JSON.stringify(history));
};

G24.clearRaceHistory = function () {
  G24.showConfirm('清空记录', '确定要清空所有对战记录吗？', function () {
    G24._lsRemove('raceHistory');
    G24.loadRaceHistory();
    G24.showToast('已清空');
  });
};
