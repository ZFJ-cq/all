// app.js - 应用主逻辑

const App = {
  toastTimer: null,
  modalConfig: null,
  initialized: false,
  lastStopTapAt: 0,
  lastModalConfirmAt: 0,

  // 应用初始化
  init() {
    if (this.initialized) return;
    this.initialized = true;

    // 检查是否有未完成的轨迹
    const savedTrack = Tracker.resumeFromStorage();
    if (savedTrack) {
      this.showModal({
        title: '发现未完成的轨迹',
        message: `有一条 ${Tracker.formatDistance(savedTrack.distance)} 的轨迹未完成，是否继续录制？`,
        confirmText: '继续录制',
        cancelText: '丢弃',
        onConfirm: () => {
          Tracker.currentTrack = savedTrack;
          Tracker.isTracking = true;
          Tracker.isPaused = true;
          this.updateUI('paused');
          this.updateTrackingInfo(savedTrack);
        },
        onCancel: () => {
          Storage.clearCurrentTrack();
          Tracker.currentTrack = null;
        }
      });
    }

    // 检查网络状态
    this.checkOnlineStatus();
    window.addEventListener('online', () => this.checkOnlineStatus());
    window.addEventListener('offline', () => this.checkOnlineStatus());

    // 阻止底部操作区的触摸事件冒泡到地图
    document.querySelector('.bottom-actions').addEventListener('touchstart', (e) => {
      e.stopPropagation();
    }, { passive: true });
    document.querySelector('.bottom-actions').addEventListener('touchmove', (e) => {
      e.stopPropagation();
    }, { passive: true });

    // 绑定按钮事件
    this.bindEvents();

    // PWA 安装提示
    this.setupInstallPrompt();
  },

  // 绑定事件
  bindEvents() {
    // 开始记录按钮
    document.getElementById('btn-record').addEventListener('click', () => {
      this.startRecording();
    });

    // 暂停按钮
    document.getElementById('btn-pause').addEventListener('click', () => {
      if (Tracker.isPaused) {
        Tracker.resume();
      } else {
        Tracker.pause();
      }
    });

    // 停止按钮（同时绑定 click 和 touchend 确保移动端可用）
    const stopHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const now = Date.now();
      if (now - this.lastStopTapAt < 500) return;
      this.lastStopTapAt = now;

      if (Tracker.currentTrack) {
        Tracker.updateStats();
      }

      const summary = Tracker.currentTrack
        ? `当前已记录 ${Tracker.formatDistance(Tracker.currentTrack.distance)}，用时 ${Tracker.formatDuration(Tracker.currentTrack.duration)}。确定停止并保存轨迹？`
        : '确定停止记录并保存轨迹？';

      this.showModal({
        title: '停止记录',
        message: summary,
        confirmText: '确定',
        onConfirm: () => {
          Tracker.stop();
          try {
            MapModule.clearOverlays();
          } catch (e) {
            console.warn('清除地图覆盖物失败:', e);
          }
        }
      });
    };
    document.getElementById('btn-stop').addEventListener('click', stopHandler);
    document.getElementById('btn-stop').addEventListener('touchend', stopHandler);

    // 历史按钮
    document.getElementById('btn-history').addEventListener('click', () => {
      if (Tracker.isTracking) {
        this.showToast('录制中，请先停止记录');
        return;
      }
      this.openPage('history-page');
      History.renderList();
    });

    // 设置按钮
    document.getElementById('btn-settings').addEventListener('click', () => {
      if (Tracker.isTracking) {
        this.showToast('录制中，请先停止记录');
        return;
      }
      this.openPage('settings-page');
      this.renderSettings();
    });

    // 历史页返回
    document.getElementById('history-back').addEventListener('click', () => {
      this.closePage('history-page');
    });

    // 设置页返回
    document.getElementById('settings-back').addEventListener('click', () => {
      this.closePage('settings-page');
    });

    // 回放页返回
    document.getElementById('playback-back').addEventListener('click', () => {
      Player.stop();
      this.closePage('playback-page');
    });

    // 回放播放/暂停按钮
    document.getElementById('btn-play').addEventListener('click', () => {
      if (Player.isPlaying) {
        Player.pause();
      } else {
        Player.play();
      }
    });

    // 回放进度条
    document.getElementById('playback-progress').addEventListener('input', (e) => {
      Player.seek(parseInt(e.target.value));
    });

    // 速度选择按钮
    document.querySelectorAll('.speed-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const speed = parseInt(btn.dataset.speed);
        Player.setSpeed(speed);
        document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // 清除数据按钮
    document.getElementById('btn-clear-data').addEventListener('click', () => {
      this.showModal({
        title: '清除所有数据',
        message: '确定清除所有轨迹数据？此操作不可恢复。',
        confirmText: '清除',
        confirmClass: 'modal-btn-danger',
        onConfirm: async () => {
          await Storage.clearAllData();
          this.renderSettings();
          this.showToast('数据已清除');
        }
      });
    });

    // 后台超时时间选择
    const timeoutSelect = document.getElementById('background-timeout-select');
    if (timeoutSelect) {
      timeoutSelect.addEventListener('change', (e) => {
        this.saveBackgroundTimeout(parseInt(e.target.value));
      });
    }

    // 模态框取消按钮
    document.getElementById('modal-cancel').addEventListener('click', () => {
      this.hideModal();
      if (this.modalConfig && this.modalConfig.onCancel) {
        this.modalConfig.onCancel();
      }
    });

    // 模态框确认按钮（同时绑定 click 和 touchend）
    const modalConfirmHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const now = Date.now();
      if (now - this.lastModalConfirmAt < 500) return;
      this.lastModalConfirmAt = now;

      const config = this.modalConfig;
      this.hideModal();
      if (config && config.onConfirm) {
        config.onConfirm();
      }
    };
    document.getElementById('modal-confirm').addEventListener('click', modalConfirmHandler);
    document.getElementById('modal-confirm').addEventListener('touchend', modalConfirmHandler);
  },

  // 开始录制
  startRecording() {
    Tracker.start();
  },

  // 更新UI状态
  updateUI(state) {
    const btnRecord = document.getElementById('btn-record');
    const btnGroup = document.getElementById('btn-group');
    const trackingInfo = document.getElementById('tracking-info');
    const btnPause = document.getElementById('btn-pause');

    switch (state) {
      case 'tracking':
        btnRecord.style.display = 'none';
        btnGroup.classList.add('active');
        trackingInfo.classList.add('active');
        btnPause.classList.remove('is-resume');
        const pausedBadge = trackingInfo.querySelector('.tracking-paused-badge');
        if (pausedBadge) pausedBadge.remove();
        this.updateTrackingStatus(Tracker.currentTrack);
        break;

      case 'paused':
        btnPause.classList.add('is-resume');
        let badge = trackingInfo.querySelector('.tracking-paused-badge');
        if (!badge) {
          badge = document.createElement('div');
          badge.className = 'tracking-paused-badge';
          badge.textContent = '已暂停';
          trackingInfo.insertBefore(badge, trackingInfo.firstChild);
        }
        break;

      case 'idle':
        btnRecord.style.display = 'flex';
        btnGroup.classList.remove('active');
        trackingInfo.classList.remove('active');
        const existingBadge = trackingInfo.querySelector('.tracking-paused-badge');
        if (existingBadge) existingBadge.remove();
        break;
    }
  },

  // 更新录制信息
  updateTrackingInfo(track) {
    const distEl = document.getElementById('tracking-distance');
    const timeEl = document.getElementById('tracking-time');
    const speedEl = document.getElementById('tracking-speed');

    if (distEl) distEl.textContent = Tracker.formatDistance(track.distance);
    if (timeEl) timeEl.textContent = Tracker.formatDuration(track.duration);
    if (speedEl) speedEl.textContent = Tracker.formatSpeed(track.avgSpeed);
    this.updateTrackingStatus(track);
  },

  updateTrackingStatus(track) {
    const statusEl = document.getElementById('tracking-status');
    const textEl = document.getElementById('tracking-status-text');
    const pointsEl = document.getElementById('tracking-points');
    if (!statusEl || !textEl || !pointsEl) return;

    const points = track && Array.isArray(track.points) ? track.points : [];
    const lastPoint = points[points.length - 1];
    statusEl.classList.remove('is-good', 'is-weak', 'is-waiting');

    if (!lastPoint) {
      statusEl.classList.add('is-waiting');
      textEl.textContent = '等待定位';
      pointsEl.textContent = '0 个点';
      return;
    }

    const accuracy = Number(lastPoint.accuracy) || 0;
    const accuracyText = accuracy > 0 ? `精度约 ${Math.round(accuracy)} m` : '定位已记录';
    if (accuracy > 0 && accuracy <= 60) {
      statusEl.classList.add('is-good');
      textEl.textContent = `定位稳定，${accuracyText}`;
    } else {
      statusEl.classList.add('is-weak');
      textEl.textContent = `定位较弱，${accuracyText}`;
    }
    pointsEl.textContent = `${points.length} 个点`;
  },

  // 更新回放按钮状态
  updatePlaybackBtn(isPlaying) {
    const btnPlay = document.getElementById('btn-play');
    if (isPlaying) {
      btnPlay.classList.add('is-playing');
    } else {
      btnPlay.classList.remove('is-playing');
    }
  },

  // 打开页面
  openPage(pageId) {
    document.getElementById(pageId).classList.add('active');
  },

  // 关闭页面
  closePage(pageId) {
    document.getElementById(pageId).classList.remove('active');
  },

  // 显示 Toast
  showToast(message, duration = 2500) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('active');

    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.remove('active');
    }, duration);
  },

  // 显示模态框
  showModal(config) {
    this.modalConfig = config;
    document.getElementById('modal-title').textContent = config.title;
    document.getElementById('modal-message').textContent = config.message;
    document.getElementById('modal-confirm').textContent = config.confirmText || '确定';
    document.getElementById('modal-cancel').textContent = config.cancelText || '取消';

    const confirmBtn = document.getElementById('modal-confirm');
    confirmBtn.className = 'modal-btn ' + (config.confirmClass || 'modal-btn-confirm');

    document.getElementById('modal-overlay').classList.add('active');
  },

  // 隐藏模态框
  hideModal() {
    document.getElementById('modal-overlay').classList.remove('active');
    this.modalConfig = null;
  },

  // 检查网络状态
  checkOnlineStatus() {
    const tip = document.getElementById('offline-tip');
    if (!navigator.onLine) {
      tip.classList.add('active');
    } else {
      tip.classList.remove('active');
    }
  },

  // 渲染设置页
  async renderSettings() {
    const [usage, tracks] = await Promise.all([
      Storage.getStorageUsage(),
      Storage.getAllTracks()
    ]);
    const usageEl = document.getElementById('storage-usage');
    const barEl = document.getElementById('storage-bar-fill');
    const trackCount = tracks.length;

    if (usageEl) usageEl.textContent = `${usage.usedMB} MB / ${usage.maxMB} MB（${trackCount} 条轨迹）`;
    if (barEl) barEl.style.width = Math.min(parseFloat(usage.usagePercent), 100) + '%';

    // 设置后台超时选择器的当前值
    const settings = Storage.getSettings();
    const timeoutSelect = document.getElementById('background-timeout-select');
    if (timeoutSelect) {
      timeoutSelect.value = settings.backgroundTimeout;
    }

    // 显示电量信息（如果支持）
    const batteryEl = document.getElementById('battery-info');
    if (batteryEl && 'getBattery' in navigator) {
      navigator.getBattery().then((battery) => {
        const level = Math.round(battery.level * 100);
        const charging = battery.charging ? '（充电中）' : '';
        batteryEl.textContent = `${level}%${charging}`;
        batteryEl.parentElement.style.display = 'flex';
      }).catch(() => {
        batteryEl.parentElement.style.display = 'none';
      });
    } else if (batteryEl) {
      batteryEl.parentElement.style.display = 'none';
    }
  },

  // 保存后台超时设置
  saveBackgroundTimeout(value) {
    const settings = Storage.getSettings();
    settings.backgroundTimeout = value;
    Storage.saveSettings(settings);
    Tracker.CONFIG.backgroundTimeout = value;
    this.showToast('设置已保存');
  },

  // PWA 安装提示
  setupInstallPrompt() {
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      document.getElementById('install-banner').style.display = 'flex';
    });

    window.installApp = function () {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(() => {
          deferredPrompt = null;
        });
      }
    };

    window.addEventListener('appinstalled', () => {
      document.getElementById('install-banner').style.display = 'none';
    });
  }
};

let appBootPromise = null;
let mapBooted = false;

function initMapWhenReady() {
  if (mapBooted || typeof AMap === 'undefined') return;

  try {
    MapModule.init();
    mapBooted = true;
  } catch (e) {
    console.warn('地图初始化失败，应用将以无地图模式运行:', e);
  }
}

async function bootApp(options = {}) {
  if (!appBootPromise) {
    appBootPromise = Storage.init()
      .then(() => {
        App.init();
      })
      .catch((e) => {
        console.error('应用初始化失败:', e);
        App.showToast('应用初始化失败，请刷新重试');
      });
  }

  await appBootPromise;

  if (options.initMap) {
    initMapWhenReady();
  }
}

// 不等待地图脚本，先初始化应用与按钮事件。
window.addEventListener('DOMContentLoaded', () => {
  bootApp();
});

// 高德地图加载完成后再补充初始化地图。
async function onAMapLoaded() {
  await bootApp({ initMap: true });
}

window.onAMapLoaded = onAMapLoaded;
