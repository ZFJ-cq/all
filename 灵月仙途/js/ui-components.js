(function() {
  let _styleInjected = false;
  function injectStyles() {
    if (_styleInjected) return;
    _styleInjected = true;
    const s = document.createElement('style');
    s.textContent = `
      .ly-toast{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,.85);color:#fff;padding:12px 24px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,.3);z-index:99999;animation:lyFadeIn .3s ease-out;max-width:80%;text-align:center;font-size:14px;pointer-events:none}
      .ly-toast-success{background:rgba(76,175,80,.92)}
      .ly-toast-error{background:rgba(244,67,54,.92)}
      .ly-toast-warning{background:rgba(255,152,0,.92)}
      .ly-toast-info{background:rgba(33,150,243,.92)}
      @keyframes lyFadeIn{from{opacity:0;transform:translate(-50%,-60%)}to{opacity:1;transform:translate(-50%,-50%)}}
      .ly-loading-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.5);display:flex;justify-content:center;align-items:center;z-index:99998}
      .ly-loading-box{background:rgba(255,255,255,.92);padding:20px 28px;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,.1);text-align:center}
      .ly-spinner{width:36px;height:36px;border:3px solid #f3f3f3;border-top:3px solid #3498db;border-radius:50%;animation:lySpin .8s linear infinite;margin:0 auto 10px}
      @keyframes lySpin{to{transform:rotate(360deg)}}
      .ly-loading-box p{margin:0;color:#333;font-size:14px}
      .ly-notify{position:fixed;top:20px;right:20px;padding:14px 20px;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,.2);z-index:99999;animation:lySlideIn .3s ease-out;max-width:320px;font-size:14px;color:#fff}
      .ly-notify-error{background:#f44336}
      .ly-notify-success{background:#4caf50}
      .ly-notify-warning{background:#ff9800}
      .ly-notify-info{background:#2196f3}
      @keyframes lySlideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
      .ly-dialog-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.55);display:flex;justify-content:center;align-items:center;z-index:99999}
      .ly-dialog-box{background:#fff;padding:24px;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.2);width:90%;max-width:400px}
      .ly-dialog-box h3{margin:0 0 12px;color:#333;font-size:1.1rem}
      .ly-dialog-box .ly-dialog-body{margin:0 0 20px;color:#555;font-size:.95rem;line-height:1.5}
      .ly-dialog-btns{display:flex;justify-content:flex-end;gap:10px}
      .ly-dialog-btns button{padding:8px 20px;border:none;border-radius:6px;cursor:pointer;font-size:14px;transition:opacity .2s}
      .ly-dialog-btns button:hover{opacity:.85}
      .ly-btn-cancel{background:#f1f1f1;color:#333}
      .ly-btn-confirm{background:#3498db;color:#fff}
      .ly-btn-danger{background:#e74c3c;color:#fff}
    `;
    document.head.appendChild(s);
  }

  const uiComponents = {
    showToast(message, duration, type) {
      if (typeof duration === 'string') { type = duration; duration = 2000; }
      duration = duration || 2000;
      type = type || 'default';
      injectStyles();
      this.hideToast();
      const el = document.createElement('div');
      el.className = 'ly-toast' + (type !== 'default' ? ' ly-toast-' + type : '');
      el.textContent = message;
      document.body.appendChild(el);
      if (duration > 0) { setTimeout(() => el.remove(), duration); }
      return el;
    },

    hideToast() {
      document.querySelectorAll('.ly-toast').forEach(el => el.remove());
    },

    showLoading(message) {
      injectStyles();
      this.hideLoading();
      const el = document.createElement('div');
      el.className = 'ly-loading-overlay';
      el.innerHTML = '<div class="ly-loading-box"><div class="ly-spinner"></div><p>' + (message || '加载中...') + '</p></div>';
      document.body.appendChild(el);
      return el;
    },

    hideLoading() {
      document.querySelectorAll('.ly-loading-overlay').forEach(el => el.remove());
    },

    showNotify(message, type, duration) {
      type = type || 'info';
      duration = duration || 3000;
      injectStyles();
      const el = document.createElement('div');
      el.className = 'ly-notify ly-notify-' + type;
      el.textContent = message;
      document.body.appendChild(el);
      if (duration > 0) { setTimeout(() => el.remove(), duration); }
      return el;
    },

    showError(message, duration) { return this.showNotify(message, 'error', duration || 3000); },
    showSuccess(message, duration) { return this.showNotify(message, 'success', duration || 3000); },
    showWarning(message, duration) { return this.showNotify(message, 'warning', duration || 3000); },
    showInfo(message, duration) { return this.showNotify(message, 'info', duration || 3000); },

    showConfirmDialog(title, message, onConfirm, onCancel, options) {
      injectStyles();
      this.hideConfirmDialog();
      options = options || {};
      const el = document.createElement('div');
      el.className = 'ly-dialog-overlay';
      const confirmClass = options.danger ? 'ly-btn-danger' : 'ly-btn-confirm';
      const confirmText = options.confirmText || '确认';
      const cancelText = options.cancelText || '取消';
      el.innerHTML = '<div class="ly-dialog-box"><h3></h3><div class="ly-dialog-body"></div><div class="ly-dialog-btns"><button class="ly-btn-cancel"></button><button class="' + confirmClass + '"></button></div></div>';
      el.querySelector('h3').textContent = title || '确认';
      el.querySelector('.ly-dialog-body').textContent = message || '';
      el.querySelector('.ly-btn-cancel').textContent = cancelText;
      el.querySelector('.' + confirmClass).textContent = confirmText;
      el.querySelector('.ly-btn-cancel').addEventListener('click', () => { el.remove(); if (onCancel) onCancel(); });
      el.querySelector('.' + confirmClass).addEventListener('click', () => { el.remove(); if (onConfirm) onConfirm(); });
      el.addEventListener('click', (e) => { if (e.target === el) { el.remove(); if (onCancel) onCancel(); } });
      document.body.appendChild(el);
      return el;
    },

    hideConfirmDialog() {
      document.querySelectorAll('.ly-dialog-overlay').forEach(el => el.remove());
    },

    showOfflineReward(rewards) {
      if (!rewards) return;
      injectStyles();
      const el = document.createElement('div');
      el.className = 'ly-dialog-overlay';
      let rewardHtml = '';
      if (rewards.xiuwei) rewardHtml += '<div style="margin:6px 0">修为 +' + rewards.xiuwei + '</div>';
      if (rewards.lingshi) rewardHtml += '<div style="margin:6px 0">灵石 +' + rewards.lingshi + '</div>';
      if (rewards.items && rewards.items.length) {
        rewards.items.forEach(i => { rewardHtml += '<div style="margin:6px 0">' + i.name + ' x' + (i.count || 1) + '</div>'; });
      }
      el.innerHTML = '<div class="ly-dialog-box"><h3>🌙 离线收益</h3><div class="ly-dialog-body"><div style="margin-bottom:8px;color:#888;font-size:.85rem">离线期间获得：</div>' + rewardHtml + '</div><div class="ly-dialog-btns"><button class="ly-btn-confirm" style="width:100%">领取</button></div></div>';
      el.querySelector('.ly-btn-confirm').addEventListener('click', () => el.remove());
      document.body.appendChild(el);
      return el;
    }
  };

  window.uiComponents = uiComponents;

  window.showToast = function(message, duration, type) {
    uiComponents.showToast(message, duration, type);
  };

  window.showNotify = function(message, type, duration) {
    uiComponents.showNotify(message, type, duration);
  };

  window.showLoading = function(message) {
    uiComponents.showLoading(message);
  };

  window.hideLoading = function() {
    uiComponents.hideLoading();
  };

  window.showConfirmDialog = function(title, message, onConfirm, onCancel, options) {
    uiComponents.showConfirmDialog(title, message, onConfirm, onCancel, options);
  };

  console.log('[UI] 统一UI组件已加载，版本: 2026-04-15');
})();
