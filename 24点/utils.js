window.G24 = window.G24 || {};

G24.esc = function (str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

G24.randInt = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

G24.fmtNum = function (n) {
  if (Number.isInteger(n)) return String(n);
  var r = Math.round(n * 1000) / 1000;
  if (Number.isInteger(r)) return String(r);
  return r.toString();
};

G24.formatTime = function (seconds) {
  var mins = Math.floor(seconds / 60);
  var secs = seconds % 60;
  return mins + ':' + secs.toString().padStart(2, '0');
};

G24.showToast = function (msg) {
  var el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(function () { el.classList.remove('show'); }, 2500);
};

G24.pickOpt = function (el, groupId) {
  var group = document.getElementById(groupId);
  group.querySelectorAll('.config-opt').forEach(function (o) {
    o.classList.remove('active');
  });
  el.classList.add('active');
};

G24.getOpt = function (groupId) {
  var el = document.getElementById(groupId).querySelector('.config-opt.active');
  return el ? el.dataset.v : null;
};

G24.showConfirm = function (title, msg, onOk) {
  var modal = document.createElement('div');
  modal.className = 'modal';
  var box = document.createElement('div');
  box.className = 'modal-box';
  var h3 = document.createElement('h3');
  h3.textContent = title;
  var p = document.createElement('p');
  p.textContent = msg;
  var actions = document.createElement('div');
  actions.className = 'modal-actions';
  var cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn btn-secondary _mc';
  cancelBtn.textContent = '取消';
  var okBtn = document.createElement('button');
  okBtn.className = 'btn btn-danger _mo';
  okBtn.textContent = '确定';
  actions.appendChild(cancelBtn);
  actions.appendChild(okBtn);
  box.appendChild(h3);
  box.appendChild(p);
  box.appendChild(actions);
  modal.appendChild(box);
  document.body.appendChild(modal);
  cancelBtn.onclick = function () { modal.remove(); };
  okBtn.onclick = function () { modal.remove(); onOk(); };
};

G24.showStreak = function (count) {
  if (count < 2) return;
  var el = document.createElement('div');
  el.className = 'streak-badge';
  el.textContent = count + '连击🔥';
  document.body.appendChild(el);
  setTimeout(function () { el.remove(); }, 1000);
};

G24.showEmojiFloat = function (emoji) {
  var el = document.createElement('div');
  el.className = 'emoji-float';
  el.textContent = emoji;
  el.style.left = Math.random() * 60 + 20 + '%';
  el.style.top = Math.random() * 40 + 30 + '%';
  document.body.appendChild(el);
  setTimeout(function () { el.remove(); }, 1500);
};

G24.showEventToast = function (text) {
  var el = document.createElement('div');
  el.className = 'event-toast';
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(function () { el.remove(); }, 3000);
};

G24.launchConfetti = function () {
  var colors = G24.CONFETTI_COLORS;
  for (var i = 0; i < 30; i++) {
    (function () {
      var el = document.createElement('div');
      el.className = 'confetti';
      el.style.left = Math.random() * 100 + '%';
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.animationDelay = Math.random() * 0.5 + 's';
      el.style.animationDuration = 1.5 + Math.random() + 's';
      document.body.appendChild(el);
      setTimeout(function () { el.remove(); }, 3000);
    })();
  }
};

G24.fallbackCopy = function (text) {
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    G24.showToast('📋 已复制');
  } catch (e) {
    prompt('复制房间信息：', text);
  }
  document.body.removeChild(ta);
};

G24.copyRoomId = function () {
  var el = document.getElementById('wait-roomid');
  if (!el) return;
  var text = '来数理试炼PK吧！房间号：' + el.textContent + '，访问 ' + G24.API + ' 加入';
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () {
      G24.showToast('📋 已复制');
    }).catch(function () {
      G24.fallbackCopy(text);
    });
  } else {
    G24.fallbackCopy(text);
  }
};

G24._loadingCount = 0;

G24._setLoading = function (loading) {
  G24._loadingCount += loading ? 1 : -1;
  if (G24._loadingCount < 0) G24._loadingCount = 0;
  var el = document.getElementById('global-loading');
  if (!el) return;
  el.style.display = G24._loadingCount > 0 ? 'flex' : 'none';
};

G24.api = async function (path, body, showLoading) {
  if (showLoading) G24._setLoading(true);
  try {
    var opts = body ? {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    } : {};
    var res = await fetch(G24.API + path, opts);
    return await res.json();
  } catch (e) {
    return { ok: false, msg: '网络错误，请检查服务器' };
  } finally {
    if (showLoading) G24._setLoading(false);
  }
};