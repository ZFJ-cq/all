window.G24 = window.G24 || {};

G24.STORY_LEVELS = [
  {
    id: 1, name: '大娃', title: '力大无穷', emoji: '💪',
    color: '#e17055', desc: '大娃力大无穷，先去救爷爷！从简单加减法开始吧！',
    diff: 'easy', range: 20, count: 5, passCount: 3,
    storyBefore: '爷爷被蛇精抓走了！大娃拍着胸膛说："我去救爷爷！"',
    storyAfter: '大娃凭借蛮力冲破了第一道关卡！可是...他被蛇精的魔法困住了！',
    bossName: '蛇精守卫', bossEmoji: '🐍'
  },
  {
    id: 2, name: '二娃', title: '千里眼顺风耳', emoji: '👁️',
    color: '#fdcb6e', desc: '二娃千里眼洞察一切，更大的数字也难不倒他！',
    diff: 'easy', range: 50, count: 5, passCount: 3,
    storyBefore: '二娃用千里眼发现了大娃被困的位置，他决定去营救！',
    storyAfter: '二娃找到了大娃！但蝎子精挡住了去路，二娃也被困住了...',
    bossName: '蝎子精', bossEmoji: '🦂'
  },
  {
    id: 3, name: '三娃', title: '铜头铁臂', emoji: '🛡️',
    color: '#fdcb6e', desc: '三娃刀枪不入，四则运算也无所畏惧！',
    diff: 'medium', range: 20, count: 5, passCount: 3,
    storyBefore: '三娃铜头铁臂，什么都不怕！他冲向了蛇精的洞穴！',
    storyAfter: '三娃虽然刀枪不入，但被蛇精的如意法宝吸了进去...',
    bossName: '如意法宝', bossEmoji: '🔮'
  },
  {
    id: 4, name: '四娃', title: '火娃', emoji: '🔥',
    color: '#e17055', desc: '四娃喷火降妖，更大的四则运算也能驾驭！',
    diff: 'medium', range: 50, count: 5, passCount: 3,
    storyBefore: '四娃喷出熊熊烈火，要烧毁蛇精的妖洞！',
    storyAfter: '四娃的火被蛇精的冰冻法术熄灭了，他也被困住了...',
    bossName: '冰蛇妖', bossEmoji: '❄️'
  },
  {
    id: 5, name: '五娃', title: '水娃', emoji: '🌊',
    color: '#0984e3', desc: '五娃吐水淹妖，百位数的四则运算也不在话下！',
    diff: 'medium', range: 100, count: 5, passCount: 3,
    storyBefore: '五娃掀起滔天巨浪，要淹没蛇精的巢穴！',
    storyAfter: '五娃的水被蛇精的吸水法术化解了，他也落入了陷阱...',
    bossName: '吸水蛇妖', bossEmoji: '🌀'
  },
  {
    id: 6, name: '六娃', title: '隐身娃', emoji: '👻',
    color: '#6c5ce7', desc: '六娃来无影去无踪，混合题型随机应对！',
    diff: 'mix', range: 50, count: 5, passCount: 3,
    storyBefore: '六娃隐身潜入蛇精洞穴，准备偷偷救出哥哥们！',
    storyAfter: '六娃成功找到了哥哥们！但蛇精发现了他的踪迹...',
    bossName: '蛇精分身', bossEmoji: '🐲'
  },
  {
    id: 7, name: '七娃', title: '宝葫芦', emoji: '🔮',
    color: '#d63031', desc: '七娃的宝葫芦能收妖镇魔，24点终极挑战！',
    diff: 'hard', range: 0, count: 5, passCount: 3,
    storyBefore: '七娃拿着宝葫芦，要收了蛇精救出爷爷和哥哥们！最终决战！',
    storyAfter: '七娃用宝葫芦收了蛇精！爷爷和哥哥们终于得救了！🎉',
    bossName: '蛇精大王', bossEmoji: '👹'
  }
];

G24._story = {
  currentLevel: 0,
  questions: [],
  idx: 0,
  correct: 0,
  wrong: 0,
  streak: 0,
  maxStreak: 0,
  submitted: false,
  timerStart: 0,
  sessionStart: 0,
  timerInterval: null,
  wrongList: [],
  qTimes: [],
  totalScore: 0,
  sg24: { numbers: [], firstIdx: null, selectedOp: null, steps: [], history: [], original: [], solution: '' }
};

G24._getStoryProgress = function () {
  try {
    var saved = G24._lsGet('storyProgress');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return { maxLevel: 0, stars: {}, bestScores: {} };
};

G24._saveStoryProgress = function (progress) {
  G24._lsSet('storyProgress', JSON.stringify(progress));
};

G24.renderStoryPage = function () {
  var progress = G24._getStoryProgress();
  var maxLevel = progress.maxLevel || 0;
  var stars = progress.stars || {};
  var totalStars = 0;
  var maxStars = G24.STORY_LEVELS.length * 3;
  for (var k in stars) { if (stars.hasOwnProperty(k)) totalStars += stars[k]; }
  var rescued = 0;
  for (var i = 0; i < G24.STORY_LEVELS.length; i++) {
    if (i < maxLevel) rescued++;
  }

  var html = '<div class="story-map">';

  html += '<div class="story-hero-section">';
  html += '<div class="story-grandpa">👴</div>';
  html += '<div class="story-rescue-label">' + (rescued >= 7 ? '🎉 爷爷已获救！' : '救出爷爷！') + '</div>';
  html += '<div class="story-progress-summary">';
  html += '<span>🛡️ 已救出 <b>' + rescued + '/' + G24.STORY_LEVELS.length + '</b> 个葫芦娃</span>';
  html += '<span>⭐ 总星数 <b>' + totalStars + '/' + maxStars + '</b></span>';
  html += '</div>';
  html += '</div>';

  html += '<div class="story-path">';
  for (var i = G24.STORY_LEVELS.length - 1; i >= 0; i--) {
    var lv = G24.STORY_LEVELS[i];
    var unlocked = i <= maxLevel;
    var completed = i < maxLevel;
    var starCount = stars[lv.id] || 0;

    html += '<div class="story-node ' + (unlocked ? 'unlocked' : 'locked') + ' ' + (completed ? 'completed' : '') + '" ';
    if (unlocked) html += 'onclick="G24.enterStoryLevel(' + i + ')"';
    html += '>';

    html += '<div class="story-node-line"></div>';
    html += '<div class="story-node-circle" style="background:' + (unlocked ? lv.color : '#ccc') + '">';
    if (completed) {
      html += '<span class="story-node-check">✓</span>';
    } else if (unlocked) {
      html += '<span class="story-node-emoji">' + lv.emoji + '</span>';
    } else {
      html += '<span class="story-node-lock">🔒</span>';
    }
    html += '</div>';

    html += '<div class="story-node-info">';
    html += '<div class="story-node-name">' + (unlocked ? lv.name + '娃' : '???') + '</div>';
    html += '<div class="story-node-title">' + (unlocked ? lv.title : '未解锁') + '</div>';
    if (starCount > 0) {
      html += '<div class="story-node-stars">';
      for (var s = 0; s < 3; s++) {
        html += s < starCount ? '⭐' : '☆';
      }
      html += '</div>';
    }
    html += '</div>';

    if (unlocked && !completed) {
      html += '<div class="story-boss-badge">' + lv.bossEmoji + ' ' + lv.bossName + '</div>';
    }

    html += '</div>';
  }
  html += '</div>';

  html += '<div class="story-hero-section">';
  html += '<div class="story-home-base">🏔️</div>';
  html += '<div class="story-rescue-label">葫芦山</div>';
  html += '</div>';

  html += '</div>';

  document.getElementById('story-map-container').innerHTML = html;
};

G24.enterStoryLevel = function (levelIdx) {
  var lv = G24.STORY_LEVELS[levelIdx];
  G24._story.currentLevel = levelIdx;

  document.getElementById('story-level-emoji').textContent = lv.emoji;
  document.getElementById('story-level-name').textContent = lv.name + '娃 · ' + lv.title;
  document.getElementById('story-level-desc').textContent = lv.desc;
  document.getElementById('story-level-story').textContent = lv.storyBefore;
  document.getElementById('story-level-boss').textContent = lv.bossEmoji + ' ' + lv.bossName;
  document.getElementById('story-level-diff').textContent = G24.DIFF_NAMES[lv.diff] + (lv.range ? ' · ' + lv.range + '以内' : '');
  document.getElementById('story-level-count').textContent = lv.count + '题对' + lv.passCount + '题过关';

  var progress = G24._getStoryProgress();
  var bestScore = (progress.bestScores || {})[lv.id];
  var bestEl = document.getElementById('story-level-best');
  if (bestScore) {
    bestEl.textContent = '🏆 最高分：' + bestScore;
    bestEl.style.display = 'block';
  } else {
    bestEl.style.display = 'none';
  }

  var diffLabel = '';
  if (lv.diff === 'easy') diffLabel = '🌱 加减法';
  else if (lv.diff === 'medium') diffLabel = '⚡ 四则运算';
  else if (lv.diff === 'mix') diffLabel = '🎯 混合挑战';
  else diffLabel = '🏆 24点';
  document.getElementById('story-level-diff-badge').textContent = diffLabel;

  G24.showPage('story-level-page');
};

G24.startStoryLevel = function () {
  var st = G24._story;
  var lv = G24.STORY_LEVELS[st.currentLevel];

  st.idx = 0;
  st.correct = 0;
  st.wrong = 0;
  st.streak = 0;
  st.maxStreak = 0;
  st.submitted = false;
  st.wrongList = [];
  st.qTimes = [];
  st.totalScore = 0;

  if (lv.diff === 'hard') {
    st.questions = [];
    for (var i = 0; i < lv.count; i++) {
      st.questions.push(G24.gen24Q());
    }
    G24._startStory24();
  } else if (lv.diff === 'mix') {
    st.questions = [];
    for (var i = 0; i < lv.count; i++) {
      var d = Math.random() > 0.5 ? 'easy' : 'medium';
      var r = Math.floor(Math.random() * 3) * 30 + 20;
      st.questions.push(G24.genMathQ(d, r));
    }
    G24._startStoryMath();
  } else {
    st.questions = [];
    for (var i = 0; i < lv.count; i++) {
      st.questions.push(G24.genMathQ(lv.diff, lv.range));
    }
    G24._startStoryMath();
  }
};

G24._startStoryMath = function () {
  var st = G24._story;
  var lv = G24.STORY_LEVELS[st.currentLevel];
  G24.showPage('story-math-page');
  document.getElementById('story-math-title').textContent = lv.name + '娃 · ' + lv.title;
  G24._startStoryTimer();
  G24._showStoryMathQ();
};

G24._startStory24 = function () {
  var st = G24._story;
  var lv = G24.STORY_LEVELS[st.currentLevel];
  G24.showPage('story24-page');
  document.getElementById('story24-title').textContent = lv.name + '娃 · ' + lv.title;
  G24._startStoryTimer();
  G24._nextStory24Q();
};

G24._startStoryTimer = function () {
  G24._stopStoryTimer();
  G24._story.sessionStart = Date.now();
  G24._story.timerStart = Date.now();
  G24._story.timerInterval = setInterval(function () {
    var s = ((Date.now() - G24._story.sessionStart) / 1000).toFixed(1);
    var el = document.getElementById('story-timer-display');
    if (el) el.textContent = s + 's';
    var el2 = document.getElementById('story24-timer-display');
    if (el2) el2.textContent = s + 's';
  }, 100);
};

G24._stopStoryTimer = function () {
  if (G24._story.timerInterval) {
    clearInterval(G24._story.timerInterval);
    G24._story.timerInterval = null;
  }
};

G24._calcStoryScore = function (timeMs, isCorrect, streak) {
  if (!isCorrect) return 0;
  var base = 100;
  var timeBonus = Math.max(0, Math.round(50 - timeMs / 1000 * 5));
  var streakBonus = Math.min(streak - 1, 5) * 10;
  return base + timeBonus + streakBonus;
};

G24._showStoryMathQ = function () {
  var st = G24._story;
  var lv = G24.STORY_LEVELS[st.currentLevel];
  if (st.idx >= st.questions.length) {
    G24._endStoryLevel();
    return;
  }
  var q = st.questions[st.idx];
  document.getElementById('story-question-expr').innerHTML =
    '<span class="q-num">' + q.n1 + '</span><span class="q-op">' +
    (G24.OP_DISPLAY[q.op] || q.op) + '</span><span class="q-num">' +
    q.n2 + '</span><span>=</span><span class="q-num">?</span>';
  document.getElementById('story-answer').value = '';
  document.getElementById('story-current').textContent = st.idx + 1;
  document.getElementById('story-total').textContent = st.questions.length;
  document.getElementById('story-correct').textContent = st.correct;
  document.getElementById('story-streak').textContent = st.streak;
  document.getElementById('story-progress').style.width = (st.idx / st.questions.length * 100) + '%';
  document.getElementById('story-feedback').style.display = 'none';
  document.getElementById('story-boss-hp').style.width =
    Math.max(0, (1 - st.idx / st.questions.length) * 100) + '%';
  st.submitted = false;
  st.timerStart = Date.now();
  setTimeout(function () { document.getElementById('story-answer').focus(); }, 100);
};

G24.submitStoryAnswer = function () {
  var st = G24._story;
  if (st.submitted) return;
  var ans = parseFloat(document.getElementById('story-answer').value);
  if (isNaN(ans)) { G24.showToast('请输入答案'); return; }
  st.submitted = true;
  var q = st.questions[st.idx];
  var qTime = Date.now() - st.timerStart;
  st.qTimes.push(qTime);
  var fb = document.getElementById('story-feedback');
  if (Math.abs(ans - q.answer) < G24.EPS) {
    var score = G24._calcStoryScore(qTime, true, st.streak + 1);
    st.totalScore += score;
    fb.textContent = '✅ 正确！+' + score + '分';
    fb.className = 'feedback correct';
    st.correct++;
    st.streak++;
    if (st.streak > st.maxStreak) st.maxStreak = st.streak;
    G24.showStreak(st.streak);
  } else {
    fb.textContent = '❌ 错误！正确答案：' + q.answer;
    fb.className = 'feedback wrong';
    st.wrong++;
    st.streak = 0;
    st.wrongList.push({
      q: q.n1 + ' ' + (G24.OP_DISPLAY[q.op] || q.op) + ' ' + q.n2,
      my: ans,
      right: q.answer
    });
  }
  fb.style.display = 'block';
  document.getElementById('story-correct').textContent = st.correct;
  document.getElementById('story-streak').textContent = st.streak;
  st.idx++;
  if (st.idx >= st.questions.length) {
    setTimeout(function () { G24._endStoryLevel(); }, 800);
  } else {
    setTimeout(function () { G24._showStoryMathQ(); }, 800);
  }
};

G24.skipStoryQuestion = function () {
  var st = G24._story;
  if (st.submitted) return;
  st.submitted = true;
  var q = st.questions[st.idx];
  var qTime = Date.now() - st.timerStart;
  st.qTimes.push(qTime);
  st.wrong++;
  st.streak = 0;
  st.wrongList.push({
    q: q.n1 + ' ' + (G24.OP_DISPLAY[q.op] || q.op) + ' ' + q.n2,
    my: '跳过',
    right: q.answer
  });
  document.getElementById('story-correct').textContent = st.correct;
  document.getElementById('story-streak').textContent = st.streak;
  st.idx++;
  if (st.idx >= st.questions.length) {
    G24._endStoryLevel();
  } else {
    G24._showStoryMathQ();
  }
};

G24._nextStory24Q = function () {
  var st = G24._story;
  var lv = G24.STORY_LEVELS[st.currentLevel];
  if (st.idx >= st.questions.length) {
    G24._endStoryLevel();
    return;
  }
  var res = st.questions[st.idx];
  st.sg24 = {
    numbers: res.nums.slice(),
    firstIdx: null,
    selectedOp: null,
    steps: [],
    history: [],
    original: res.nums.slice(),
    solution: res.solution
  };
  st.submitted = false;
  st.timerStart = Date.now();
  document.getElementById('story24-current').textContent = st.idx + 1;
  document.getElementById('story24-total').textContent = st.questions.length;
  document.getElementById('story24-correct').textContent = st.correct;
  document.getElementById('story24-streak').textContent = st.streak;
  document.getElementById('story24-progress').style.width = (st.idx / st.questions.length * 100) + '%';
  document.getElementById('story24-hint-box').style.display = 'none';
  document.getElementById('story24-hint').textContent = '① 选择一个数字卡片';
  document.getElementById('story24-boss-hp').style.width =
    Math.max(0, (1 - st.idx / st.questions.length) * 100) + '%';
  G24._renderStory24Cards();
};

G24._renderStory24Cards = function () {
  var sg = G24._story.sg24;
  var c = document.getElementById('story24-cards');
  c.innerHTML = sg.numbers.map(function (n, i) {
    return '<div class="num-card-24' + (sg.firstIdx === i ? ' selected' : '') +
      '" onclick="G24.pickStory24Card(' + i + ')">' + G24.fmtNum(n) + '</div>';
  }).join('');
  document.querySelectorAll('#story24-ops .op-btn').forEach(function (b) { b.classList.remove('selected'); });
};

G24.pickStory24Card = function (i) {
  var sg = G24._story.sg24;
  if (G24._story.submitted) return;
  if (sg.firstIdx === null) {
    sg.firstIdx = i;
    G24._renderStory24Cards();
    document.getElementById('story24-hint').textContent = '已选 ' + sg.numbers[i] + '，② 选择运算符';
  } else if (sg.selectedOp) {
    if (i === sg.firstIdx) {
      sg.firstIdx = null;
      sg.selectedOp = null;
      G24._renderStory24Cards();
      document.getElementById('story24-hint').textContent = '① 选择一个数字卡片';
      return;
    }
    G24._executeStory24Op(i);
  } else {
    sg.firstIdx = i;
    G24._renderStory24Cards();
    document.getElementById('story24-hint').textContent = '已选 ' + sg.numbers[i] + '，② 选择运算符';
  }
};

G24._executeStory24Op = function (i) {
  var sg = G24._story.sg24;
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
      G24._renderStory24Cards();
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
  G24._renderStory24Cards();

  if (sg.numbers.length === 1) {
    var isOk = Math.abs(sg.numbers[0] - 24) < G24.EPS;
    var st = G24._story;
    var qTime = Date.now() - st.timerStart;
    st.qTimes.push(qTime);
    if (isOk) {
      var score = G24._calcStoryScore(qTime, true, st.streak + 1);
      st.totalScore += score;
      st.correct++;
      st.streak++;
      if (st.streak > st.maxStreak) st.maxStreak = st.streak;
      G24.showStreak(st.streak);
      G24.showToast('✅ 算出24点！+' + score + '分');
    } else {
      st.wrong++;
      st.streak = 0;
      st.wrongList.push({
        q: sg.original.join(', '),
        my: sg.numbers[0].toFixed(2),
        right: '24 (' + sg.solution + ')',
        is24: true
      });
      G24.showToast('❌ 结果不是24');
    }
    st.submitted = true;
    document.getElementById('story24-correct').textContent = st.correct;
    document.getElementById('story24-streak').textContent = st.streak;
    st.idx++;
    setTimeout(function () {
      if (st.idx >= st.questions.length) {
        G24._endStoryLevel();
      } else {
        G24._nextStory24Q();
      }
    }, 1000);
  } else {
    document.getElementById('story24-hint').textContent = '① 选择一个数字卡片';
  }
};

G24.pickStory24Op = function (op) {
  var sg = G24._story.sg24;
  if (G24._story.submitted || sg.firstIdx === null) return;
  sg.selectedOp = op;
  document.querySelectorAll('#story24-ops .op-btn').forEach(function (b) {
    b.classList.toggle('selected', b.textContent.trim() === G24.OP_DISPLAY[op]);
  });
  document.getElementById('story24-hint').textContent =
    sg.numbers[sg.firstIdx] + ' ' + G24.OP_DISPLAY[op] + ' ③ 选择第二个数字';
};

G24.undoStory24 = function () {
  var sg = G24._story.sg24;
  if (sg.history.length === 0) { G24.showToast('没有可撤销'); return; }
  var prev = sg.history.pop();
  sg.numbers = prev.numbers;
  sg.steps = prev.steps;
  sg.firstIdx = null;
  sg.selectedOp = null;
  G24._renderStory24Cards();
  document.getElementById('story24-hint').textContent = '① 选择一个数字卡片';
};

G24.hintStory24 = function () {
  var sg = G24._story.sg24;
  var box = document.getElementById('story24-hint-box');
  if (sg.solution) {
    box.style.display = box.style.display === 'none' ? 'block' : 'none';
    box.textContent = '💡 ' + sg.solution;
  } else {
    G24.showToast('暂无提示');
  }
};

G24.resetStory24 = function () {
  if (G24._story.submitted) return;
  var sg = G24._story.sg24;
  sg.numbers = sg.original.slice();
  sg.firstIdx = null;
  sg.selectedOp = null;
  sg.steps = [];
  sg.history = [];
  document.getElementById('story24-hint-box').style.display = 'none';
  G24._renderStory24Cards();
  document.getElementById('story24-hint').textContent = '① 选择一个数字卡片';
};

G24.skipStory24 = function () {
  if (G24._story.submitted) return;
  var st = G24._story;
  var sg = st.sg24;
  st.submitted = true;
  var qTime = Date.now() - st.timerStart;
  st.qTimes.push(qTime);
  st.wrong++;
  st.streak = 0;
  st.wrongList.push({
    q: sg.original.join(', '),
    my: '跳过',
    right: '24 (' + sg.solution + ')',
    is24: true
  });
  document.getElementById('story24-correct').textContent = st.correct;
  document.getElementById('story24-streak').textContent = st.streak;
  st.idx++;
  setTimeout(function () {
    if (st.idx >= st.questions.length) {
      G24._endStoryLevel();
    } else {
      G24._nextStory24Q();
    }
  }, 500);
};

G24._endStoryLevel = function () {
  G24._stopStoryTimer();
  var st = G24._story;
  var lv = G24.STORY_LEVELS[st.currentLevel];
  var total = st.questions.length;
  var passed = st.correct >= lv.passCount;
  var progress = G24._getStoryProgress();
  var totalTime = ((Date.now() - st.sessionStart) / 1000).toFixed(1);
  var avgTime = st.qTimes.length > 0
    ? (st.qTimes.reduce(function (a, b) { return a + b; }, 0) / st.qTimes.length / 1000).toFixed(1)
    : '0.0';
  var rate = total > 0 ? Math.round(st.correct / total * 100) : 0;

  var stars = 0;
  if (passed) {
    if (st.correct === total) stars = 3;
    else if (st.correct >= total - 1) stars = 2;
    else stars = 1;

    var oldStars = progress.stars[lv.id] || 0;
    if (stars > oldStars) progress.stars[lv.id] = stars;

    if (st.currentLevel + 1 > progress.maxLevel) {
      progress.maxLevel = st.currentLevel + 1;
    }
    if (progress.maxLevel > G24.STORY_LEVELS.length) {
      progress.maxLevel = G24.STORY_LEVELS.length;
    }

    if (!progress.bestScores) progress.bestScores = {};
    if (!progress.bestScores[lv.id] || st.totalScore > progress.bestScores[lv.id]) {
      progress.bestScores[lv.id] = st.totalScore;
    }

    G24._saveStoryProgress(progress);
  }

  document.getElementById('story-result-emoji').textContent = lv.emoji;
  document.getElementById('story-result-name').textContent = lv.name + '娃';

  if (passed) {
    document.getElementById('story-result-icon').textContent = '🎉';
    document.getElementById('story-result-title').textContent = '过关成功！';
    document.getElementById('story-result-story').textContent = lv.storyAfter;
    document.getElementById('story-result-stars').innerHTML =
      '<span class="story-stars">' + '⭐'.repeat(stars) + '☆'.repeat(3 - stars) + '</span>';

    var isLast = st.currentLevel === G24.STORY_LEVELS.length - 1;
    var nextBtn = document.getElementById('story-next-level-btn');
    if (isLast) {
      nextBtn.textContent = '🎊 查看最终结局';
      nextBtn.onclick = function () { G24._showStoryFinale(); };
    } else {
      nextBtn.textContent = '➡️ 下一关';
      nextBtn.onclick = function () { G24.enterStoryLevel(st.currentLevel + 1); };
    }
    nextBtn.style.display = 'block';
    G24.launchConfetti();
  } else {
    document.getElementById('story-result-icon').textContent = '😢';
    document.getElementById('story-result-title').textContent = '挑战失败...';
    document.getElementById('story-result-story').textContent =
      '需要答对' + lv.passCount + '题才能救出' + lv.name + '娃，再试一次吧！';
    document.getElementById('story-result-stars').innerHTML = '<span class="story-stars">☆☆☆</span>';
    document.getElementById('story-next-level-btn').style.display = 'none';
  }

  document.getElementById('story-result-correct').textContent = st.correct;
  document.getElementById('story-result-wrong').textContent = st.wrong;
  document.getElementById('story-result-total').textContent = total;
  document.getElementById('story-result-rate').textContent = rate + '%';
  document.getElementById('story-result-time').textContent = totalTime + 's';
  document.getElementById('story-result-avg').textContent = avgTime + 's';
  document.getElementById('story-result-score').textContent = st.totalScore;
  document.getElementById('story-result-maxstreak').textContent = st.maxStreak;

  var reviewEl = document.getElementById('story-result-review');
  if (st.wrongList.length > 0) {
    reviewEl.style.display = 'block';
    reviewEl.innerHTML = '<div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:8px">📝 错题回顾</div>' +
      st.wrongList.map(function (w) {
        var qLabel = w.is24 ? '【24点】' + w.q : w.q;
        return '<div class="review-item"><span class="review-q">' + G24.esc(qLabel) + '</span>' +
          '<span class="review-a err">你答：' + G24.esc(String(w.my)) + '</span>' +
          '<span class="review-a right">正确：' + G24.esc(String(w.right)) + '</span></div>';
      }).join('');
  } else {
    reviewEl.style.display = 'none';
  }

  var newRecordEl = document.getElementById('story-result-newrecord');
  if (passed) {
    var oldBest = (progress.bestScores || {})[lv.id] || 0;
    if (st.totalScore >= oldBest) {
      newRecordEl.style.display = 'block';
      newRecordEl.textContent = '🏆 新纪录！';
    } else {
      newRecordEl.style.display = 'none';
    }
  } else {
    newRecordEl.style.display = 'none';
  }

  G24.showPage('story-result-page');
};

G24._showStoryFinale = function () {
  var progress = G24._getStoryProgress();
  var totalStars = 0;
  var maxStars = G24.STORY_LEVELS.length * 3;
  var totalScore = 0;
  for (var k in progress.stars) {
    if (progress.stars.hasOwnProperty(k)) totalStars += progress.stars[k];
  }
  for (var k in (progress.bestScores || {})) {
    if (progress.bestScores.hasOwnProperty(k)) totalScore += progress.bestScores[k];
  }

  document.getElementById('finale-stars').textContent = totalStars + '/' + maxStars;
  document.getElementById('finale-score').textContent = totalScore;

  var rescuedHtml = '';
  for (var i = 0; i < G24.STORY_LEVELS.length; i++) {
    var lv = G24.STORY_LEVELS[i];
    var starCount = (progress.stars || {})[lv.id] || 0;
    rescuedHtml += '<div class="finale-hero">';
    rescuedHtml += '<div class="finale-hero-emoji">' + lv.emoji + '</div>';
    rescuedHtml += '<div class="finale-hero-name">' + lv.name + '娃</div>';
    rescuedHtml += '<div class="finale-hero-stars">';
    for (var s = 0; s < 3; s++) rescuedHtml += s < starCount ? '⭐' : '☆';
    rescuedHtml += '</div></div>';
  }
  document.getElementById('finale-heroes').innerHTML = rescuedHtml;

  G24.showPage('story-finale-page');
  G24.launchConfetti();
  setTimeout(G24.launchConfetti, 1000);
};

G24.retryStoryLevel = function () {
  G24.startStoryLevel();
};

G24.confirmExitStory = function () {
  G24.showConfirm('退出关卡', '确定要退出吗？当前进度将丢失', function () {
    G24._stopStoryTimer();
    G24.showPage('story-page');
    G24.renderStoryPage();
  });
};

G24.resetStoryProgress = function () {
  G24.showConfirm('重置进度', '确定要重置所有剧情进度吗？', function () {
    G24._lsRemove('storyProgress');
    G24.renderStoryPage();
    G24.showToast('已重置');
  });
};
