// player.js - 轨迹回放模块

const Player = {
  map: null,
  isPlaying: false,
  currentIndex: 0,
  speed: 1,
  speedOptions: [1, 2, 4, 8],
  animationId: null,
  track: null,
  basePolyline: null,
  basePolylines: [],
  playedPolyline: null,
  playedPolylines: [],
  movingMarker: null,
  startMarker: null,
  endMarker: null,

  // 初始化回放地图
  initMap() {
    this.map = new AMap.Map('playback-map', {
      zoom: 15,
      center: [116.397428, 39.90923],
      resizeEnable: true,
      viewMode: '2D',
      zooms: [3, 18],
      mapStyle: 'amap://styles/normal',
      animateEnable: true
    });
  },

  // 开始回放
  start(track) {
    this.stop();
    this.track = track;
    this.currentIndex = 0;
    this.isPlaying = false;
    this.speed = 1;

    if (!track.points || track.points.length === 0) {
      App.showToast('该轨迹无点位数据');
      return;
    }

    const path = track.points.map(p => [p.lng, p.lat]);
    const pathSegments = this.groupPathSegments(track.points);

    // 清除旧覆盖物
    this.clearOverlays();

    // 半透明底色轨迹线
    this.basePolylines = pathSegments.map(pathSegment => new AMap.Polyline({
      path: pathSegment,
      strokeColor: '#4A90D9',
      strokeWeight: 4,
      strokeOpacity: 0.4,
      lineJoin: 'round',
      lineCap: 'round',
      zIndex: 50
    }));
    if (this.basePolylines.length > 0) {
      this.map.add(this.basePolylines);
      this.basePolyline = this.basePolylines[this.basePolylines.length - 1];
    }

    // 已走过的轨迹线
    this.updatePlayedPath();

    // 起点标记
    this.startMarker = new AMap.Marker({
      position: path[0],
      content: '<div class="start-marker">起点</div>',
      offset: new AMap.Pixel(-20, -28),
      zIndex: 100
    });
    this.map.add(this.startMarker);

    // 终点标记
    if (path.length > 1) {
      this.endMarker = new AMap.Marker({
        position: path[path.length - 1],
        content: '<div class="end-marker">终点</div>',
        offset: new AMap.Pixel(-20, -28),
        zIndex: 100
      });
      this.map.add(this.endMarker);
    }

    // 移动标记
    this.movingMarker = new AMap.Marker({
      position: path[0],
      content: '<div class="playback-marker"></div>',
      offset: new AMap.Pixel(-10, -10),
      zIndex: 120
    });
    this.map.add(this.movingMarker);

    // 调整视野
    if (this.basePolylines.length > 0) {
      this.map.setFitView(this.basePolylines, false, [60, 60, 60, 60]);
    } else {
      this.map.setCenter(path[0]);
    }

    // 更新UI
    this.updatePlaybackUI();
  },

  // 播放
  play() {
    if (!this.track) return;
    this.isPlaying = true;
    this.animate();
    App.updatePlaybackBtn(true);
  },

  // 暂停
  pause() {
    this.isPlaying = false;
    if (this.animationId) {
      clearTimeout(this.animationId);
      this.animationId = null;
    }
    App.updatePlaybackBtn(false);
  },

  // 停止
  stop() {
    this.isPlaying = false;
    if (this.animationId) {
      clearTimeout(this.animationId);
      this.animationId = null;
    }
    this.clearOverlays();
    App.updatePlaybackBtn(false);
  },

  // 动画帧
  animate() {
    if (!this.isPlaying || !this.track) return;

    const points = this.track.points;
    const pointsPerFrame = Math.max(1, Math.floor(this.speed));

    this.currentIndex += pointsPerFrame;

    if (this.currentIndex >= points.length) {
      this.currentIndex = points.length - 1;
      this.isPlaying = false;
      App.updatePlaybackBtn(false);
    }

    // 更新已走过的轨迹线
    this.updatePlayedPath();

    // 更新移动标记
    const currentPoint = points[this.currentIndex];
    this.movingMarker.setPosition([currentPoint.lng, currentPoint.lat]);

    // 更新UI
    this.updatePlaybackUI();

    if (this.isPlaying) {
      this.animationId = setTimeout(() => {
        this.animate();
      }, 33 / this.speed);
    }
  },

  // 跳转到指定进度
  seek(percent) {
    if (!this.track) return;
    const points = this.track.points;
    this.currentIndex = Math.min(
      Math.floor(percent * points.length / 100),
      points.length - 1
    );

    this.updatePlayedPath();

    const currentPoint = points[this.currentIndex];
    this.movingMarker.setPosition([currentPoint.lng, currentPoint.lat]);

    this.updatePlaybackUI();
  },

  // 设置播放速度
  setSpeed(speed) {
    this.speed = speed;
  },

  // 更新回放UI
  updatePlaybackUI() {
    if (!this.track) return;
    const points = this.track.points;
    const percent = points.length > 1
      ? Math.round((this.currentIndex / (points.length - 1)) * 100)
      : 100;

    const currentPoint = points[this.currentIndex] || points[0];

    // 更新进度条
    const progressInput = document.getElementById('playback-progress');
    if (progressInput) progressInput.value = percent;

    // 更新时间
    const currentTimeEl = document.getElementById('playback-current-time');
    const totalTimeEl = document.getElementById('playback-total-time');
    if (currentTimeEl) {
      const elapsed = currentPoint.timestamp - this.track.createdAt;
      currentTimeEl.textContent = Tracker.formatDuration(elapsed);
    }
    if (totalTimeEl) {
      totalTimeEl.textContent = Tracker.formatDuration(this.track.duration);
    }
  },

  updatePlayedPath() {
    if (!this.track || !this.map) return;

    const points = this.track.points.slice(0, this.currentIndex + 1);
    const paths = this.groupPathSegments(points);

    while (this.playedPolylines.length > paths.length) {
      const removed = this.playedPolylines.pop();
      this.map.remove(removed);
    }

    paths.forEach((path, index) => {
      if (!this.playedPolylines[index]) {
        const polyline = new AMap.Polyline({
          path: path,
          strokeColor: '#4A90D9',
          strokeWeight: 6,
          strokeOpacity: 1,
          lineJoin: 'round',
          lineCap: 'round',
          zIndex: 51
        });
        this.playedPolylines[index] = polyline;
        this.playedPolyline = polyline;
        this.map.add(polyline);
        return;
      }

      this.playedPolylines[index].setPath(path);
    });
  },

  groupPathSegments(points) {
    if (!Array.isArray(points) || points.length < 2) return [];

    const segments = [];
    let currentSegmentId = points[0].segmentId || 0;
    let currentPath = [];

    points.forEach((point) => {
      const segmentId = point.segmentId || 0;
      if (segmentId !== currentSegmentId) {
        if (currentPath.length >= 2) segments.push(currentPath);
        currentPath = [];
        currentSegmentId = segmentId;
      }
      currentPath.push([point.lng, point.lat]);
    });

    if (currentPath.length >= 2) segments.push(currentPath);
    return segments;
  },

  // 清除覆盖物
  clearOverlays() {
    const overlays = Array.from(new Set([
      ...this.basePolylines,
      ...this.playedPolylines,
      this.basePolyline,
      this.playedPolyline,
      this.movingMarker,
      this.startMarker,
      this.endMarker
    ].filter(Boolean)));
    if (this.map && overlays.length > 0) {
      this.map.remove(overlays);
    }
    this.basePolyline = null;
    this.basePolylines = [];
    this.playedPolyline = null;
    this.playedPolylines = [];
    this.movingMarker = null;
    this.startMarker = null;
    this.endMarker = null;
  }
};
