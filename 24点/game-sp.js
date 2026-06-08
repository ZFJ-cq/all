window.G24 = window.G24 || {};

G24._sp = {
  diff: 'easy', range: 20, count: 10,
  questions: [], idx: 0, correct: 0, wrong: 0,
  streak: 0, timerStart: 0, sessionStart: 0, timerInterval: null,
  submitted: false, wrongList: [],
  pendingDiff: null, pendingRange: 0
};

G24._sg24 = {
  numbers: [], firstIdx: null, selectedOp: null,
  steps: [], history: [], original: [], solution: ''
};

G24.showCountSelect = function (diff, range) {
  var sp = G24._sp;
  sp.pendingDiff = diff;
  sp.pendingRange = range;
  var title = '';
  if (diff === 'easy') title = range === 20 ? '20以内加减' : range === 50 ? '50以内加减' : '100以内加减';
  else if (diff === 'medium') title = range === 20 ? '20以内四则' : range === 50 ? '50以内四则' : '100以内四则';
  else title = '经典24点';
  document.getElementById('count-select-title').textContent = title;
  document.getElementById('count-select-modal').style.display = 'flex';
};

G24.hideCountSelect = function () {
  document.getElementById('count-select-modal').style.display = 'none';
  G24._sp.pendingDiff = null;
  G24._sp.pendingRange = 0;
};

G24.confirmStart = function () {
  var sp = G24._sp;
  var diff = sp.pendingDiff;
  var range = sp.pendingRange;
  var count = parseInt(G24.getOpt('count-select-row') || '10');
  G24.hideCountSelect();
  G24._startSP(diff, range, count);
};

G24._startSP = function (diff, range, count) {
  var sp = G24._sp;
  sp.diff = diff;
  sp.range = range;
  sp.count = count || 10;
  sp.idx = 0;
  sp.correct = 0;
  sp.wrong = 0;
  sp.streak = 0;
  sp.submitted = false;
  sp.wrongList = [];
  if (sp.diff === 'hard') {
    G24._startSP24();
  } else {
    G24._startSPMath();
  }
};

G24.restartSP = function () {
  if (G24._sp.diff === 'hard') {
    G24._startSP24();
  } else {
    G24._startSPMath();
  }
};

G24._startSPMath = function () {
  var sp = G24._sp;
  sp.questions = [];
  for (var i = 0; i < sp.count; i++) {
    sp.questions.push(G24.genMathQ(sp.diff, sp.range));
  }
  sp.idx = 0;
  sp.correct = 0;
  sp.wrong = 0;
  sp.streak = 0;
  sp.submitted = false;
  sp.wrongList = [];
  G24.showPage('sp-math-page');
  document.getElementById('sp-math-title').textContent = sp.diff === 'easy' ? '加减练习' : '四则练习';
  G24._startSPTimer();
  G24._showSPQuestion();
};

G24._startSPTimer = function () {
  G24._stopSPTimer();
  G24._sp.sessionStart = Date.now();
  G24._sp.timerStart = Date.now();
  G24._sp.timerInterval = setInterval(function () {
    var s = ((Date.now() - G24._sp.sessionStart) / 1000).toFixed(1);
    var el = document.getElementById('sp-timer-display');
    if (el) el.textContent = s + 's';
  }, 100);
};

G24._stopSPTimer = function () {
  if (G24._sp.timerInterval) {
    clearInterval(G24._sp.timerInterval);
    G24._sp.timerInterval = null;
  }
};

G24._showSPQuestion = function () {
  var sp = G24._sp;
  if (sp.idx >= sp.questions.length) {
    G24._endSP();
    return;
  }
  var q = sp.questions[sp.idx];
  document.getElementById('sp-question-expr').innerHTML =
    '<span class="q-num">' + q.n1 + '</span><span class="q-op">' +
    (G24.OP_DISPLAY[q.op] || q.op) + '</span><span class="q-num">' +
    q.n2 + '</span><span>=</span><span class="q-num">?</span>';
  document.getElementById('sp-answer').value = '';
  document.getElementById('sp-current').textContent = sp.idx + 1;
  document.getElementById('sp-total').textContent = sp.questions.length;
  document.getElementById('sp-correct').textContent = sp.correct;
  document.getElementById('sp-streak').textContent = sp.streak;
  document.getElementById('sp-progress').style.width = (sp.idx / sp.questions.length * 100) + '%';
  document.getElementById('sp-feedback').style.display = 'none';
  sp.submitted = false;
  sp.timerStart = Date.now();
  setTimeout(function () { document.getElementById('sp-answer').focus(); }, 100);
};

G24.submitSPAnswer = function () {
  var sp = G24._sp;
  if (sp.submitted) return;
  var ans = parseFloat(document.getElementById('sp-answer').value);
  if (isNaN(ans)) { G24.showToast('请输入答案'); return; }
  sp.submitted = true;
  var q = sp.questions[sp.idx];
  var fb = document.getElementById('sp-feedback');
  if (Math.abs(ans - q.answer) < G24.EPS) {
    fb.textContent = '✅ 正确！';
    fb.className = 'feedback correct';
    sp.correct++;
    sp.streak++;
    G24.showStreak(sp.streak);
  } else {
    fb.textContent = '❌ 错误！正确答案：' + q.answer;
    fb.className = 'feedback wrong';
    sp.wrong++;
    sp.streak = 0;
    sp.wrongList.push({
      q: q.n1 + ' ' + (G24.OP_DISPLAY[q.op] || q.op) + ' ' + q.n2,
      my: ans,
      right: q.answer
    });
  }
  fb.style.display = 'block';
  document.getElementById('sp-correct').textContent = sp.correct;
  document.getElementById('sp-streak').textContent = sp.streak;
  setTimeout(function () { sp.idx++; G24._showSPQuestion(); }, 800);
};

G24.skipSPQuestion = function () {
  var sp = G24._sp;
  if (sp.submitted) return;
  sp.submitted = true;
  var q = sp.questions[sp.idx];
  sp.wrong++;
  sp.streak = 0;
  sp.wrongList.push({
    q: q.n1 + ' ' + (G24.OP_DISPLAY[q.op] || q.op) + ' ' + q.n2,
    my: '跳过',
    right: q.answer
  });
  document.getElementById('sp-correct').textContent = sp.correct;
  document.getElementById('sp-streak').textContent = sp.streak;
  sp.idx++;
  G24._showSPQuestion();
};

G24.confirmExitSP = function () {
  G24.showConfirm('退出练习', '确定要退出吗？当前进度将丢失', function () {
    G24._stopSPTimer();
    G24.showPage('home-page');
  });
};

G24._endSP = function () {
  var sp = G24._sp;
  G24._stopSPTimer();
  var total = sp.questions.length;
  var rate = Math.round(sp.correct / total * 100);
  document.getElementById('sp-result-icon').textContent = rate >= 80 ? '🎉' : rate >= 50 ? '💪' : '😅';
  document.getElementById('sp-result-score').textContent = rate + '%';
  document.getElementById('sp-result-sub').textContent =
    (sp.diff === 'easy' ? '加减' : sp.diff === 'medium' ? '四则' : '24点') +
    ' · ' + (sp.range ? sp.range + '以内' : '经典') + ' · ' + total + '题';
  var avgTime = total > 0 ? ((Date.now() - sp.sessionStart) / 1000 / total).toFixed(1) : 0;
  document.getElementById('sp-result-stats').innerHTML =
    '<div class="card" style="padding:12px">' +
    '<div class="settings-row"><span>正确</span><span class="settings-val" style="color:var(--green)">' + sp.correct + '</span></div>' +
    '<div class="settings-row"><span>错误</span><span class="settings-val" style="color:var(--danger)">' + sp.wrong + '</span></div>' +
    '<div class="settings-row"><span>平均用时</span><span class="settings-val">' + avgTime + 's/题</span></div></div>';
  var key = 'mathGame_best_' + sp.diff + '_' + sp.range;
  var prev = G24._lsGet(key);
  if (!prev || sp.correct > parseInt(prev)) {
    G24._lsSet(key, sp.correct);
    document.getElementById('sp-new-record').style.display = 'block';
  } else {
    document.getElementById('sp-new-record').style.display = 'none';
  }
  if (sp.wrongList.length > 0) {
    document.getElementById('sp-review-section').style.display = 'block';
    document.getElementById('sp-review-list').innerHTML = sp.wrongList.map(function (w) {
      return '<div class="review-item"><span class="review-q">' + w.q + '</span>' +
        '<span class="review-a err">你答：' + w.my + '</span>' +
        '<span class="review-a right">正确：' + w.right + '</span></div>';
    }).join('');
  } else {
    document.getElementById('sp-review-section').style.display = 'none';
  }
  G24.showPage('sp-result-page');
};

G24._startSP24 = function () {
  var sp = G24._sp;
  sp.idx = 0;
  sp.correct = 0;
  sp.wrong = 0;
  sp.streak = 0;
  sp.submitted = false;
  sp.wrongList = [];
  G24.showPage('sp24-page');
  G24._startSPTimer();
  G24._nextSP24Q();
};

G24._nextSP24Q = function () {
  var sp = G24._sp;
  if (sp.idx >= sp.count) {
    G24._endSP();
    return;
  }
  var res = G24.gen24Q();
  G24._sg24 = {
    numbers: res.nums.slice(),
    firstIdx: null,
    selectedOp: null,
    steps: [],
    history: [],
    original: res.nums.slice(),
    solution: res.solution
  };
  sp.submitted = false;
  sp.timerStart = Date.now();
  document.getElementById('sp24-current').textContent = sp.idx + 1;
  document.getElementById('sp24-total').textContent = sp.count;
  document.getElementById('sp24-correct').textContent = sp.correct;
  document.getElementById('sp24-streak').textContent = sp.streak;
  document.getElementById('sp24-progress').style.width = (sp.idx / sp.count * 100) + '%';
  document.getElementById('sp24-hint-box').style.display = 'none';
  document.getElementById('sp24-hint').textContent = '① 选择一个数字卡片';
  G24._renderSP24Cards();
};

G24._renderSP24Cards = function () {
  var sg = G24._sg24;
  var c = document.getElementById('sp24-cards');
  c.innerHTML = sg.numbers.map(function (n, i) {
    return '<div class="num-card-24' + (sg.firstIdx === i ? ' selected' : '') +
      '" onclick="G24.pickSP24Card(' + i + ')">' + G24.fmtNum(n) + '</div>';
  }).join('');
  document.querySelectorAll('#sp24-ops .op-btn').forEach(function (b) { b.classList.remove('selected'); });
};

G24.pickSP24Card = function (i) {
  var sg = G24._sg24;
  var sp = G24._sp;
  if (sp.submitted) return;

  if (sg.firstIdx === null) {
    sg.firstIdx = i;
    G24._renderSP24Cards();
    document.getElementById('sp24-hint').textContent = '已选 ' + sg.numbers[i] + '，② 选择运算符';
  } else if (sg.selectedOp) {
    if (i === sg.firstIdx) {
      sg.firstIdx = null;
      sg.selectedOp = null;
      G24._renderSP24Cards();
      document.getElementById('sp24-hint').textContent = '① 选择一个数字卡片';
      return;
    }
    G24._executeSP24Op(i);
  } else {
    sg.firstIdx = i;
    G24._renderSP24Cards();
    document.getElementById('sp24-hint').textContent = '已选 ' + sg.numbers[i] + '，② 选择运算符';
  }
};

G24._executeSP24Op = function (i) {
  var sg = G24._sg24;
  var sp = G24._sp;
  var a = sg.numbers[sg.firstIdx];
  var b = sg.numbers[i];
  var op = sg.selectedOp;
  var r;

  if (op === '+') r = a + b;
  else if (op === '-') r = a - b;
  else if (op === '*') r = a * b;
  else {
    if (Math.abs(b) < G24.EPS) {
      G24.showToast('不能除以0');
      sg.firstIdx = null;
      sg.selectedOp = null;
      G24._renderSP24Cards();
      return;
    }
    r = a / b;
  }

  sg.history.push({ numbers: sg.numbers.slice(), steps: sg.steps.slice() });
  sg.steps.push(G24.fmtNum(a) + G24.OP_DISPLAY[op] + G24.fmtNum(b) + '=' + G24.fmtNum(Math.round(r * 1000) / 1000));
  var newNums = sg.numbers.filter(function (_, idx) { return idx !== sg.firstIdx && idx !== i; });
  newNums.push(Math.round(r * 1000) / 1000);
  sg.numbers = newNums;
  sg.firstIdx = null;
  sg.selectedOp = null;
  G24._renderSP24Cards();

  if (sg.numbers.length === 1) {
    var isOk = Math.abs(sg.numbers[0] - 24) < G24.EPS;
    if (isOk) {
      sp.correct++;
      sp.streak++;
      G24.showStreak(sp.streak);
      G24.showToast('✅ 算出24点！');
    } else {
      sp.wrong++;
      sp.streak = 0;
      G24.showToast('❌ 结果不是24');
    }
    sp.submitted = true;
    document.getElementById('sp24-correct').textContent = sp.correct;
    document.getElementById('sp24-streak').textContent = sp.streak;
    setTimeout(function () { sp.idx++; G24._nextSP24Q(); }, 1000);
  } else {
    document.getElementById('sp24-hint').textContent = '① 选择一个数字卡片';
  }
};

G24.pickSP24Op = function (op) {
  var sg = G24._sg24;
  if (G24._sp.submitted || sg.firstIdx === null) return;
  sg.selectedOp = op;
  document.querySelectorAll('#sp24-ops .op-btn').forEach(function (b) {
    b.classList.toggle('selected', b.textContent.trim() === G24.OP_DISPLAY[op]);
  });
  document.getElementById('sp24-hint').textContent =
    sg.numbers[sg.firstIdx] + ' ' + G24.OP_DISPLAY[op] + ' ③ 选择第二个数字';
};

G24.undoSP24 = function () {
  var sg = G24._sg24;
  if (sg.history.length === 0) { G24.showToast('没有可撤销'); return; }
  var prev = sg.history.pop();
  sg.numbers = prev.numbers;
  sg.steps = prev.steps;
  sg.firstIdx = null;
  sg.selectedOp = null;
  G24._renderSP24Cards();
  document.getElementById('sp24-hint').textContent = '① 选择一个数字卡片';
};

G24.hintSP24 = function () {
  var sg = G24._sg24;
  var box = document.getElementById('sp24-hint-box');
  if (sg.solution) {
    box.style.display = box.style.display === 'none' ? 'block' : 'none';
    box.textContent = '💡 ' + sg.solution;
  } else {
    G24.showToast('暂无提示');
  }
};

G24.resetSP24 = function () {
  if (G24._sp.submitted) return;
  var sg = G24._sg24;
  sg.numbers = sg.original.slice();
  sg.firstIdx = null;
  sg.selectedOp = null;
  sg.steps = [];
  sg.history = [];
  document.getElementById('sp24-hint-box').style.display = 'none';
  G24._renderSP24Cards();
  document.getElementById('sp24-hint').textContent = '① 选择一个数字卡片';
};

G24.skipSP24 = function () {
  if (G24._sp.submitted) return;
  var sp = G24._sp;
  sp.submitted = true;
  sp.wrong++;
  sp.streak = 0;
  document.getElementById('sp24-correct').textContent = sp.correct;
  document.getElementById('sp24-streak').textContent = sp.streak;
  setTimeout(function () { sp.idx++; G24._nextSP24Q(); }, 500);
};

G24.toggleRules = function () {
  var modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = '<div class="modal-box" style="max-height:80vh;overflow-y:auto"><h3>🧮 24点规则</h3>' +
    '<p style="text-align:left;line-height:1.8"><b>🎯 目标</b>：用4个数字通过加减乘除算出24<br><br>' +
    '<b>📋 操作</b>：<br>1. 点选一个数字卡片<br>2. 选择运算符<br>3. 点选第二个数字<br>' +
    '4. 两数合并为结果<br>5. 重复直到只剩一个数<br><br><b>💡 技巧</b>：<br>• 每个数字只能用一次<br>' +
    '• 除法必须整除<br>• 尝试多种组合<br><br><b>🌟 示例</b>：3、4、5、6 → 3×4+5+6=24</p>' +
    '<div class="modal-actions"><button class="btn btn-primary" onclick="this.closest(\'.modal\').remove()">知道了</button></div></div>';
  document.body.appendChild(modal);
};