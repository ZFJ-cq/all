// history.js - 历史管理模块

const History = {
  // 渲染历史列表
  async renderList() {
    const container = document.getElementById('history-list');
    const tracks = await Storage.getAllTracks();

    if (tracks.length === 0) {
      container.innerHTML = `
        <div class="history-empty">
          <div class="history-empty-icon">📍</div>
          <div class="history-empty-text">暂无轨迹记录</div>
          <button class="history-empty-btn" id="history-empty-record">
            去记录第一条轨迹
          </button>
        </div>
      `;
      this.bindEmptyEvents();
      return;
    }

    container.innerHTML = tracks.map(track => this.renderCard(track)).join('');
    this.bindCardEvents();
    this.bindSwipeEvents();
  },

  // 渲染单条轨迹卡片
  renderCard(track) {
    const date = new Date(track.createdAt);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    const trackId = this.escapeAttribute(track.id);

    return `
      <div class="track-card" data-id="${trackId}">
        <div class="track-card-header">
          <div class="track-card-name">${this.escapeHtml(track.name)}</div>
          <div class="track-card-date">${dateStr} ${timeStr}</div>
        </div>
        <div class="track-card-stats">
          <div class="track-card-stat">
            <div class="track-card-stat-value">${Tracker.formatDistance(track.distance)}</div>
            <div class="track-card-stat-label">距离</div>
          </div>
          <div class="track-card-stat">
            <div class="track-card-stat-value">${Tracker.formatDuration(track.duration)}</div>
            <div class="track-card-stat-label">时长</div>
          </div>
          <div class="track-card-stat">
            <div class="track-card-stat-value">${Tracker.formatSpeed(track.avgSpeed)}</div>
            <div class="track-card-stat-label">均速</div>
          </div>
        </div>
        <button class="track-card-delete" type="button" title="删除轨迹" aria-label="删除轨迹">删除</button>
      </div>
    `;
  },

  bindEmptyEvents() {
    const btn = document.getElementById('history-empty-record');
    if (!btn) return;

    btn.addEventListener('click', () => {
      App.closePage('history-page');
      App.startRecording();
    });
  },

  bindCardEvents() {
    document.querySelectorAll('.track-card').forEach(card => {
      const trackId = card.dataset.id;

      card.addEventListener('click', () => {
        this.openTrack(trackId);
      });

      const deleteBtn = card.querySelector('.track-card-delete');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.confirmDelete(trackId);
        });
      }
    });
  },

  // 打开轨迹详情/回放
  async openTrack(trackId) {
    const track = await Storage.getTrack(trackId);
    if (!track) {
      App.showToast('轨迹数据不存在');
      return;
    }

    // 打开回放页面
    App.openPage('playback-page');

    // 初始化回放地图
    setTimeout(() => {
      if (!Player.map) {
        Player.initMap();
      }
      // 显示轨迹统计
      this.renderDetailInfo(track);
      // 开始回放
      Player.start(track);
    }, 350);
  },

  // 渲染轨迹详情信息
  renderDetailInfo(track) {
    const container = document.getElementById('track-detail-info');
    if (!container) return;

    container.innerHTML = `
      <div class="track-detail-stats">
        <div class="track-detail-stat">
          <div class="track-detail-stat-value">${Tracker.formatDistance(track.distance)}</div>
          <div class="track-detail-stat-label">总距离</div>
        </div>
        <div class="track-detail-stat">
          <div class="track-detail-stat-value">${Tracker.formatDuration(track.duration)}</div>
          <div class="track-detail-stat-label">总时长</div>
        </div>
        <div class="track-detail-stat">
          <div class="track-detail-stat-value">${Tracker.formatSpeed(track.avgSpeed)}</div>
          <div class="track-detail-stat-label">平均速度</div>
        </div>
        <div class="track-detail-stat">
          <div class="track-detail-stat-value">${Tracker.formatSpeed(track.maxSpeed)}</div>
          <div class="track-detail-stat-label">最高速度</div>
        </div>
      </div>
    `;
  },

  // 确认删除
  confirmDelete(trackId) {
    App.showModal({
      title: '删除轨迹',
      message: '确定删除此轨迹？删除后不可恢复。',
      confirmText: '删除',
      confirmClass: 'modal-btn-danger',
      onConfirm: async () => {
        const deleted = await Storage.deleteTrack(trackId);
        if (deleted) {
          this.renderList();
          App.showToast('已删除');
        } else {
          App.showToast('删除失败，请重试');
        }
      }
    });
  },

  // 绑定左滑删除事件
  bindSwipeEvents() {
    const cards = document.querySelectorAll('.track-card');
    let startX = 0;
    let currentCard = null;

    cards.forEach(card => {
      card.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        document.querySelectorAll('.track-card.swiped').forEach(c => c.classList.remove('swiped'));
        currentCard = card;
      }, { passive: true });

      card.addEventListener('touchmove', (e) => {
        if (!currentCard) return;
        const diff = startX - e.touches[0].clientX;
        if (diff > 60) {
          currentCard.classList.add('swiped');
        } else if (diff < -30) {
          currentCard.classList.remove('swiped');
        }
      }, { passive: true });

      card.addEventListener('touchend', () => {
        currentCard = null;
      }, { passive: true });
    });
  },

  // HTML 转义
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  escapeAttribute(str) {
    return String(str).replace(/["&<>]/g, (char) => ({
      '"': '&quot;',
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;'
    }[char]));
  }
};
