// tracker.js - 轨迹录制模块

const Tracker = {
  CONFIG: {
    collectInterval: 3000,
    minAccuracy: 100,
    minDistance: 2,
    warmupAccuracy: 60,
    warmupTimeout: 8000,
    maxSegmentGap: 120000,
    maxPlausibleSpeedKmh: 180,
    locateWaitTimeout: 12000,
    autoSaveInterval: 30000,
    uiTickInterval: 1000,
    backgroundTimeout: 3600000,   // 后台超时：1小时
    maxPoints: 5000,
    lowBatteryThreshold: 20,      // 低电量阈值：20%
    offlineTimeout: 600000,       // 离线超时：10分钟
    backgroundMoveThreshold: 500  // 后台异常移动阈值：500米
  },

  watchId: null,
  isTracking: false,
  isPaused: false,
  currentTrack: null,
  autoSaveTimer: null,
  uiTickTimer: null,
  locationWaitTimer: null,
  backgroundTimer: null,
  lastPosition: null,
  pendingNewSegment: false,
  warmupStartedAt: null,
  lastDiscardToastAt: 0,
  visibilityHandlerRegistered: false,

  // 后台保护相关状态
  backgroundWatchId: null,
  backgroundEnterPosition: null,
  backgroundEnterTime: null,
  batteryLevel: 100,
  batteryObj: null,
  batteryHandler: null,
  networkHandler: null,
  offlineStart: null,
  pauseReason: '',

  // 创建新轨迹对象
  createNewTrack() {
    return {
      id: 'track_' + Date.now(),
      name: '运动轨迹',
      createdAt: Date.now(),
      endedAt: null,
      lastStartedAt: Date.now(),
      lastStartedDuration: 0,
      duration: 0,
      distance: 0,
      avgSpeed: 0,
      maxSpeed: 0,
      startPoint: null,
      endPoint: null,
      nextSegmentId: 0,
      points: []
    };
  },

  // 开始录制
  start() {
    if (this.isTracking) return;

    if (!navigator.geolocation) {
      App.showToast('您的浏览器不支持定位功能');
      return;
    }

    // 从设置中读取后台超时时间
    const settings = Storage.getSettings();
    if (settings.backgroundTimeout) {
      this.CONFIG.backgroundTimeout = settings.backgroundTimeout;
    }

    this.currentTrack = this.createNewTrack();
    this.isTracking = true;
    this.isPaused = false;
    this.pauseReason = '';
    this.pendingNewSegment = false;
    this.warmupStartedAt = Date.now();

    // 初始化地图轨迹线
    MapModule.initTrackPolyline();

    // 使用 watchPosition 持续监听
    this.watchId = navigator.geolocation.watchPosition(
      (pos) => this.onPositionUpdate(pos),
      (err) => this.onPositionError(err),
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000
      }
    );

    this.ensureSessionHooks();

    App.updateUI('tracking');
    App.showToast('正在定位，稳定后开始记录');
    this.startLocationWaitTimer();
  },

  // 位置更新
  onPositionUpdate(position) {
    if (!this.isTracking || this.isPaused) return;

    const { longitude, latitude, accuracy } = position.coords;
    const timestamp = position.timestamp || Date.now();

    // 精度过滤
    if (accuracy > this.CONFIG.minAccuracy) {
      console.log(`精度不足: ${accuracy}m，丢弃`);
      return;
    }

    const newPoint = this.createTrackPoint(longitude, latitude, accuracy, timestamp);

    if (this.shouldWarmupSkip(newPoint)) {
      MapModule.updateLocationMarker([newPoint.lng, newPoint.lat], accuracy);
      MapModule.setCenter([newPoint.lng, newPoint.lat]);
      return;
    }

    // 距离过滤
    if (this.currentTrack.points.length > 0) {
      const lastPoint = this.currentTrack.points[this.currentTrack.points.length - 1];
      if (!this.shouldAcceptPoint(lastPoint, newPoint)) {
        return;
      }

      const distance = this.calculateDistance(this.getDistancePoint(lastPoint), this.getDistancePoint(newPoint));
      if (distance < this.CONFIG.minDistance) {
        return;
      }
    }

    // 点位上限检查
    if (this.currentTrack.points.length >= this.CONFIG.maxPoints) {
      App.showToast('点位已达上限，降低采集频率');
    }

    // 第一个点：设置起点
    if (this.currentTrack.points.length === 0) {
      this.stopLocationWaitTimer();
      this.warmupStartedAt = null;
      this.currentTrack.startPoint = { lng: newPoint.lng, lat: newPoint.lat };
      MapModule.setStartMarker([newPoint.lng, newPoint.lat]);
    }

    this.applySegment(newPoint);

    // 添加点位
    this.currentTrack.points.push(newPoint);
    this.currentTrack.endPoint = { lng: newPoint.lng, lat: newPoint.lat };

    // 更新地图
    MapModule.updateTrackPath(this.currentTrack.points);
    MapModule.updateLocationMarker([newPoint.lng, newPoint.lat], accuracy);
    MapModule.setCenter([newPoint.lng, newPoint.lat]);

    // 更新统计信息
    this.updateStats();

    // 更新UI
    App.updateTrackingInfo(this.currentTrack);
  },

  // 位置错误
  onPositionError(error) {
    console.warn('定位错误:', error.message);
    if (error.code === 1) {
      App.showToast('定位权限被拒绝');
    }
  },

  // ===== 智能后台保护 =====

  // 页面可见性变化
  onVisibilityChange() {
    if (document.hidden) {
      // 记录进入后台时的位置和时间
      if (Tracker.currentTrack && Tracker.currentTrack.points.length > 0) {
        const lastPoint = Tracker.currentTrack.points[Tracker.currentTrack.points.length - 1];
        Tracker.backgroundEnterPosition = Tracker.getDistancePoint(lastPoint);
      }
      Tracker.backgroundEnterTime = Date.now();

      // 启动后台超时定时器
      Tracker.backgroundTimer = setTimeout(() => {
        Tracker.smartPause('后台超时');
      }, Tracker.CONFIG.backgroundTimeout);

      // 启动后台位置监测
      Tracker.startBackgroundPositionMonitor();

      // 启动电池监测
      Tracker.startBatteryMonitor();

      // 启动网络状态监测
      Tracker.startNetworkMonitor();

    } else {
      // 返回前台：清除所有后台监测
      if (Tracker.backgroundTimer) {
        clearTimeout(Tracker.backgroundTimer);
        Tracker.backgroundTimer = null;
      }

      Tracker.stopBackgroundPositionMonitor();
      Tracker.stopBatteryMonitor();
      Tracker.stopNetworkMonitor();

      // 如果是自动暂停的，返回前台时提醒用户
      if (Tracker.isPaused && Tracker.isTracking && Tracker.pauseReason) {
        const reason = Tracker.pauseReason;
        Tracker.pauseReason = '';
        App.showModal({
          title: '已自动暂停',
          message: `原因：${reason}。是否继续记录？`,
          confirmText: '继续记录',
          cancelText: '停止记录',
          onConfirm: () => Tracker.resume(),
          onCancel: () => {
            Tracker.stop();
            MapModule.clearOverlays();
          }
        });
      }
    }
  },

  // 智能暂停（支持多种触发原因）
  smartPause(reason) {
    if (!this.isTracking || this.isPaused) return;

    this.pause();
    this.pauseReason = reason;
    App.showToast(`${reason}，已自动暂停`);

    // 记录暂停原因到轨迹
    if (this.currentTrack) {
      this.currentTrack.pauseReason = reason;
      this.currentTrack.pausedAt = Date.now();
    }

    // 清除后台超时定时器（已暂停，无需再计时）
    if (this.backgroundTimer) {
      clearTimeout(this.backgroundTimer);
      this.backgroundTimer = null;
    }
  },

  // 后台位置监测：检测异常移动
  startBackgroundPositionMonitor() {
    if (this.backgroundWatchId) return;
    if (!this.backgroundEnterPosition) return;

    this.backgroundWatchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (!Tracker.backgroundEnterPosition) return;

        const distance = Tracker.calculateDistance(
          Tracker.backgroundEnterPosition,
          { lng: pos.coords.longitude, lat: pos.coords.latitude }
        );

        // 后台期间移动超过阈值，可能忘记停止记录
        if (distance > Tracker.CONFIG.backgroundMoveThreshold) {
          Tracker.smartPause('检测到异常移动');
          Tracker.stopBackgroundPositionMonitor();
        }
      },
      () => {},
      { enableHighAccuracy: false, maximumAge: 60000, timeout: 10000 }
    );
  },

  stopBackgroundPositionMonitor() {
    if (this.backgroundWatchId) {
      navigator.geolocation.clearWatch(this.backgroundWatchId);
      this.backgroundWatchId = null;
    }
  },

  // 电池监测：低电量自动暂停
  startBatteryMonitor() {
    if (!('getBattery' in navigator)) return;

    navigator.getBattery().then((battery) => {
      Tracker.batteryObj = battery;
      Tracker.batteryLevel = Math.round(battery.level * 100);

      // 立即检查电量
      if (Tracker.batteryLevel < Tracker.CONFIG.lowBatteryThreshold && !battery.charging) {
        Tracker.smartPause('电量不足');
        return;
      }

      // 监听电量变化
      Tracker.batteryHandler = () => {
        Tracker.batteryLevel = Math.round(battery.level * 100);
        if (Tracker.batteryLevel < Tracker.CONFIG.lowBatteryThreshold && !battery.charging) {
          Tracker.smartPause('电量不足');
        }
      };

      battery.addEventListener('levelchange', Tracker.batteryHandler);
    }).catch(() => {
      // getBattery 不可用，忽略
    });
  },

  stopBatteryMonitor() {
    if (Tracker.batteryObj && Tracker.batteryHandler) {
      Tracker.batteryObj.removeEventListener('levelchange', Tracker.batteryHandler);
      Tracker.batteryHandler = null;
    }
    Tracker.batteryObj = null;
  },

  // 网络状态监测：离线超时自动暂停
  startNetworkMonitor() {
    this.offlineStart = null;

    const checkOffline = () => {
      if (!navigator.onLine) {
        if (!Tracker.offlineStart) {
          Tracker.offlineStart = Date.now();
        } else if (Date.now() - Tracker.offlineStart > Tracker.CONFIG.offlineTimeout) {
          Tracker.smartPause('离线超时');
          Tracker.stopNetworkMonitor();
        }
      } else {
        Tracker.offlineStart = null;
      }
    };

    checkOffline();
    window.addEventListener('online', checkOffline);
    window.addEventListener('offline', checkOffline);
    this.networkHandler = checkOffline;
  },

  stopNetworkMonitor() {
    if (this.networkHandler) {
      window.removeEventListener('online', this.networkHandler);
      window.removeEventListener('offline', this.networkHandler);
      this.networkHandler = null;
    }
    this.offlineStart = null;
  },

  // ===== 基础录制控制 =====

  // 暂停录制
  pause() {
    this.updateStats();
    if (this.currentTrack) {
      this.currentTrack.lastStartedAt = null;
      this.currentTrack.lastStartedDuration = this.currentTrack.duration;
    }
    this.isPaused = true;
    if (this.currentTrack && this.currentTrack.points.length > 0) {
      this.pendingNewSegment = true;
    }
    this.warmupStartedAt = null;
    this.stopLocationWaitTimer();
    this.stopUiTicker();
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    App.updateUI('paused');
  },

  // 继续录制
  resume() {
    if (!navigator.geolocation) {
      App.showToast('您的浏览器不支持定位功能');
      return;
    }

    this.isPaused = false;
    this.pauseReason = '';
    this.warmupStartedAt = Date.now();
    if (this.currentTrack) {
      this.currentTrack.lastStartedAt = Date.now();
      this.currentTrack.lastStartedDuration = this.currentTrack.duration;
    }
    this.ensureSessionHooks();
    this.startLocationWaitTimer();
    this.watchId = navigator.geolocation.watchPosition(
      (pos) => this.onPositionUpdate(pos),
      (err) => this.onPositionError(err),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
    App.updateUI('tracking');
  },

  // 停止录制
  stop() {
    this.updateStats();
    this.isTracking = false;
    this.isPaused = false;
    this.pauseReason = '';
    this.pendingNewSegment = false;
    this.warmupStartedAt = null;

    // 停止定位监听
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    // 停止定时器
    this.stopUiTicker();
    this.stopLocationWaitTimer();

    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }

    if (this.backgroundTimer) {
      clearTimeout(this.backgroundTimer);
      this.backgroundTimer = null;
    }

    // 清理所有后台监测
    this.stopBackgroundPositionMonitor();
    this.stopBatteryMonitor();
    this.stopNetworkMonitor();

    if (this.visibilityHandlerRegistered) {
      document.removeEventListener('visibilitychange', this.onVisibilityChange);
      this.visibilityHandlerRegistered = false;
    }

    // 计算最终统计（可能因点位数据问题报错，需保护）
    try {
      this.finalizeTrack();
    } catch (e) {
      console.warn('统计计算异常（继续保存）:', e.message || e);
    }

    // 保存轨迹（核心操作，必须执行）
    const trackToSave = this.currentTrack;
    this.currentTrack = null;
    App.updateUI('idle');

    if (trackToSave && trackToSave.points && trackToSave.points.length > 0) {
      Storage.addTrack(trackToSave).then((saved) => {
        if (saved) {
          Storage.clearCurrentTrack();
          App.showToast('轨迹已保存');
        } else {
          Storage.saveCurrentTrack(trackToSave);
          App.showToast('保存失败，已保留未完成轨迹');
        }
      }).catch((err) => {
        console.error('保存失败:', err);
        Storage.saveCurrentTrack(trackToSave);
        App.showToast('保存失败，请重试');
      });
    } else {
      Storage.clearCurrentTrack();
      App.showToast('轨迹点位不足，未保存');
    }
  },

  // ===== 统计与工具 =====

  // 更新统计信息
  updateStats() {
    if (!this.currentTrack) return;

    const points = this.currentTrack.points;
    let totalDist = 0;
    let maxSpd = 0;

    for (let i = 1; i < points.length; i++) {
      if (points[i].segmentId !== points[i - 1].segmentId) {
        continue;
      }
      const dist = this.calculateDistance(this.getDistancePoint(points[i - 1]), this.getDistancePoint(points[i]));
      totalDist += dist;

      const timeDiff = (points[i].timestamp - points[i - 1].timestamp) / 1000;
      if (timeDiff > 0) {
        const speed = (dist / timeDiff) * 3.6; // m/s → km/h
        if (speed > maxSpd) maxSpd = speed;
      }
    }

    this.currentTrack.distance = Math.round(totalDist);
    this.currentTrack.maxSpeed = Math.round(maxSpd * 10) / 10;

    const duration = this.getElapsedDuration(this.currentTrack);
    this.currentTrack.duration = duration;
    this.currentTrack.avgSpeed = duration > 0
      ? Math.round((totalDist / (duration / 1000)) * 3.6 * 10) / 10
      : 0;
  },

  // 完成轨迹统计
  finalizeTrack() {
    if (!this.currentTrack) return;
    this.currentTrack.endedAt = Date.now();
    this.updateStats();
  },

  // 自动保存
  autoSave() {
    if (this.currentTrack) {
      this.updateStats();
      Storage.saveCurrentTrack(this.currentTrack);
    }
  },

  ensureSessionHooks() {
    if (!this.autoSaveTimer) {
      this.autoSaveTimer = setInterval(() => {
        this.autoSave();
      }, this.CONFIG.autoSaveInterval);
    }

    this.startUiTicker();

    if (!this.visibilityHandlerRegistered) {
      document.addEventListener('visibilitychange', this.onVisibilityChange);
      this.visibilityHandlerRegistered = true;
    }
  },

  startUiTicker() {
    if (this.uiTickTimer) return;

    this.uiTickTimer = setInterval(() => {
      if (!this.isTracking || this.isPaused || !this.currentTrack) return;
      this.updateStats();
      App.updateTrackingInfo(this.currentTrack);
    }, this.CONFIG.uiTickInterval);
  },

  stopUiTicker() {
    if (this.uiTickTimer) {
      clearInterval(this.uiTickTimer);
      this.uiTickTimer = null;
    }
  },

  startLocationWaitTimer() {
    this.stopLocationWaitTimer();
    this.locationWaitTimer = setTimeout(() => {
      if (!this.isTracking || this.isPaused || !this.currentTrack || this.currentTrack.points.length > 0) return;
      App.showToast('正在等待高精度定位，请到开阔处稍等');
    }, this.CONFIG.locateWaitTimeout);
  },

  stopLocationWaitTimer() {
    if (this.locationWaitTimer) {
      clearTimeout(this.locationWaitTimer);
      this.locationWaitTimer = null;
    }
  },

  shouldWarmupSkip(point) {
    if (!this.currentTrack || this.currentTrack.points.length > 0) return false;
    if (!this.warmupStartedAt) return false;
    if ((Number(point.accuracy) || 0) <= this.CONFIG.warmupAccuracy) return false;

    const waited = Date.now() - this.warmupStartedAt;
    if (waited >= this.CONFIG.warmupTimeout) {
      return false;
    }

    return true;
  },

  shouldAcceptPoint(lastPoint, newPoint) {
    const timeDiff = (newPoint.timestamp - lastPoint.timestamp) / 1000;
    if (timeDiff <= 0) return true;

    const dist = this.calculateDistance(this.getDistancePoint(lastPoint), this.getDistancePoint(newPoint));
    const speedKmh = (dist / timeDiff) * 3.6;
    if (speedKmh <= this.CONFIG.maxPlausibleSpeedKmh) return true;

    const lastAccuracy = Number(lastPoint.accuracy) || this.CONFIG.minAccuracy;
    const newAccuracy = Number(newPoint.accuracy) || this.CONFIG.minAccuracy;
    const likelyDrift = newAccuracy >= lastAccuracy || newAccuracy > this.CONFIG.warmupAccuracy;
    if (!likelyDrift) return true;

    this.showDiscardToast('已忽略一次疑似漂移点');
    return false;
  },

  applySegment(point) {
    if (!this.currentTrack) return;
    const points = this.currentTrack.points;
    const lastPoint = points[points.length - 1];

    if (!Number.isFinite(this.currentTrack.nextSegmentId)) {
      this.currentTrack.nextSegmentId = this.getLastSegmentId(points);
    }

    if (!lastPoint) {
      point.segmentId = this.currentTrack.nextSegmentId;
      return;
    }

    const timeGap = point.timestamp - lastPoint.timestamp;
    if (this.pendingNewSegment || timeGap > this.CONFIG.maxSegmentGap) {
      this.currentTrack.nextSegmentId += 1;
      this.pendingNewSegment = false;
    }

    point.segmentId = this.currentTrack.nextSegmentId;
  },

  getLastSegmentId(points) {
    if (!Array.isArray(points) || points.length === 0) return 0;
    return points.reduce((max, point) => Math.max(max, Number(point.segmentId) || 0), 0);
  },

  showDiscardToast(message) {
    const now = Date.now();
    if (now - this.lastDiscardToastAt < 8000) return;
    this.lastDiscardToastAt = now;
    App.showToast(message);
  },

  getElapsedDuration(track) {
    if (!track) return 0;
    const savedDuration = Number(track.duration) || 0;
    const lastStartedAt = Number(track.lastStartedAt) || 0;
    const lastStartedDuration = Number(track.lastStartedDuration) || 0;

    if (this.isTracking && !this.isPaused && lastStartedAt > 0) {
      return Math.max(0, lastStartedDuration + Date.now() - lastStartedAt);
    }

    return Math.max(0, savedDuration);
  },

  createTrackPoint(longitude, latitude, accuracy, timestamp) {
    const converted = this.wgs84ToGcj02(longitude, latitude);

    return {
      lng: converted.lng,
      lat: converted.lat,
      rawLng: longitude,
      rawLat: latitude,
      coordType: converted.converted ? 'gcj02' : 'wgs84',
      accuracy: accuracy,
      segmentId: 0,
      timestamp: timestamp
    };
  },

  getDistancePoint(point) {
    if (!point) return point;
    if (Number.isFinite(point.rawLng) && Number.isFinite(point.rawLat)) {
      return { lng: point.rawLng, lat: point.rawLat };
    }
    return point;
  },

  wgs84ToGcj02(lng, lat) {
    lng = Number(lng);
    lat = Number(lat);

    if (!Number.isFinite(lng) || !Number.isFinite(lat) || this.isOutsideChina(lng, lat)) {
      return { lng, lat, converted: false };
    }

    const a = 6378245.0;
    const ee = 0.00669342162296594323;
    let dLat = this.transformLat(lng - 105.0, lat - 35.0);
    let dLng = this.transformLng(lng - 105.0, lat - 35.0);
    const radLat = lat / 180.0 * Math.PI;
    let magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    const sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * Math.PI);
    dLng = (dLng * 180.0) / (a / sqrtMagic * Math.cos(radLat) * Math.PI);

    return { lng: lng + dLng, lat: lat + dLat, converted: true };
  },

  isOutsideChina(lng, lat) {
    return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
  },

  transformLat(x, y) {
    let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y +
      0.2 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin(y / 3.0 * Math.PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(y / 12.0 * Math.PI) + 320 * Math.sin(y * Math.PI / 30.0)) * 2.0 / 3.0;
    return ret;
  },

  transformLng(x, y) {
    let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y +
      0.1 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin(x / 3.0 * Math.PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(x / 12.0 * Math.PI) + 300.0 * Math.sin(x / 30.0 * Math.PI)) * 2.0 / 3.0;
    return ret;
  },

  // 恢复未完成的轨迹
  resumeFromStorage() {
    const saved = Storage.getCurrentTrack();
    if (saved && saved.points && saved.points.length > 0) {
      this.currentTrack = saved;
      MapModule.initTrackPolyline();
      MapModule.updateTrackPath(saved.points);
      if (saved.startPoint) {
        MapModule.setStartMarker([saved.startPoint.lng, saved.startPoint.lat]);
      }
      return saved;
    }
    return null;
  },

  // 计算两点间距离（Haversine公式）
  calculateDistance(p1, p2) {
    const R = 6371000;
    const dLat = (p2.lat - p1.lat) * Math.PI / 180;
    const dLng = (p2.lng - p1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  // 格式化距离
  formatDistance(meters) {
    meters = Number(meters) || 0;
    if (meters >= 1000) {
      return (meters / 1000).toFixed(2) + ' km';
    }
    return Math.round(meters) + ' m';
  },

  // 格式化时长
  formatDuration(ms) {
    ms = Number(ms) || 0;
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) {
      return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${m}:${String(s).padStart(2, '0')}`;
  },

  // 格式化速度
  formatSpeed(kmh) {
    kmh = Number(kmh) || 0;
    return kmh.toFixed(1) + ' km/h';
  }
};
