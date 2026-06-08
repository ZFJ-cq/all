// map.js - 地图初始化与交互模块

const MapModule = {
  map: null,
  geolocation: null,
  trackPolyline: null,
  trackPolylines: [],
  startMarker: null,
  currentMarker: null,
  locationCircle: null,

  isReady() {
    return Boolean(this.map) && typeof AMap !== 'undefined';
  },

  // 初始化地图
  init() {
    if (this.map) return this.map;
    if (typeof AMap === 'undefined') {
      console.warn('高德地图脚本未加载，跳过地图初始化');
      return null;
    }

    this.map = new AMap.Map('map-container', {
      zoom: 15,
      center: [116.397428, 39.90923],
      resizeEnable: true,
      rotateEnable: false,
      pitchEnable: false,
      viewMode: '2D',
      zooms: [3, 18],
      mapStyle: 'amap://styles/normal',
      animateEnable: true
    });

    // 添加控件（插件已在 script 标签中预加载）
    try {
      this.map.addControl(new AMap.Scale());
      this.map.addControl(new AMap.ToolBar({
        position: { top: '110px', right: '16px' },
        liteStyle: true
      }));
    } catch (e) {
      console.warn('地图控件加载失败:', e);
    }

    this.initGeolocation();
    return this.map;
  },

  // 初始化定位
  initGeolocation() {
    try {
      this.geolocation = new AMap.Geolocation({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        convert: true,
        showButton: false,
        showMarker: false,
        showCircle: false,
        panToLocation: true,
        zoomToAccuracy: true
      });

      this.map.addControl(this.geolocation);
      this.doLocate().catch(() => {});
    } catch (e) {
      console.warn('定位插件加载失败:', e);
    }
  },

  // 执行定位
  doLocate() {
    return new Promise((resolve, reject) => {
      if (!this.geolocation) {
        reject(new Error('定位插件未加载'));
        return;
      }
      this.geolocation.getCurrentPosition((status, result) => {
        if (status === 'complete') {
          this.onLocationSuccess(result);
          resolve(result);
        } else {
          this.onLocationError(result);
          reject(result);
        }
      });
    });
  },

  // 定位成功
  onLocationSuccess(result) {
    if (!this.isReady()) return;
    const { position, accuracy } = result;
    const lnglat = [position.lng, position.lat];

    this.updateLocationMarker(lnglat, accuracy);
    this.map.setCenter(lnglat);

    console.log(`定位成功: [${position.lng}, ${position.lat}], 精度: ${accuracy}m`);
  },

  // 定位失败
  onLocationError(result) {
    console.warn('定位失败:', result.message);
    if (typeof App !== 'undefined') {
      App.showToast('定位失败，使用默认位置');
    }
  },

  // 更新当前位置标记
  updateLocationMarker(lnglat, accuracy) {
    if (!this.isReady()) return;

    this._safeRemove(this.currentMarker);
    this._safeRemove(this.locationCircle);

    this.currentMarker = new AMap.Marker({
      position: lnglat,
      content: '<div class="location-marker"></div>',
      offset: new AMap.Pixel(-8, -8),
      zIndex: 110
    });

    this.locationCircle = new AMap.Circle({
      center: lnglat,
      radius: accuracy || 50,
      strokeColor: '#4A90D9',
      strokeOpacity: 0.3,
      strokeWeight: 1,
      fillColor: '#4A90D9',
      fillOpacity: 0.15,
      zIndex: 100
    });

    try {
      this.map.add([this.currentMarker, this.locationCircle]);
    } catch (e) {
      console.warn('添加位置标记失败:', e.message || e);
    }
  },

  // 初始化轨迹线
  initTrackPolyline() {
    if (!this.isReady()) return;

    this._safeRemove(this.trackPolyline);
    this.trackPolyline = null;
    this._safeRemoveMany(this.trackPolylines);
    this.trackPolylines = [];
  },

  // 更新轨迹线
  updateTrackPath(points) {
    if (!this.isReady()) return;
    const paths = this.groupPathSegments(points);

    if (paths.length === 0) return;

    while (this.trackPolylines.length > paths.length) {
      this._safeRemove(this.trackPolylines.pop());
    }

    paths.forEach((path, index) => {
      if (!this.trackPolylines[index]) {
        const polyline = new AMap.Polyline({
          path: path,
          strokeColor: '#4A90D9',
          strokeWeight: 6,
          strokeOpacity: 1,
          lineJoin: 'round',
          lineCap: 'round',
          zIndex: 50
        });

        this.trackPolylines[index] = polyline;
        this.trackPolyline = polyline;

        try {
          this.map.add(polyline);
        } catch (e) {
          console.warn('添加轨迹线失败:', e.message || e);
        }
        return;
      }

      try {
        this.trackPolylines[index].setPath(path);
      } catch (e) {
        console.warn('更新轨迹线失败:', e.message || e);
      }
    });
  },

  // 设置起点标记
  setStartMarker(lnglat) {
    if (!this.isReady()) return;

    this._safeRemove(this.startMarker);

    this.startMarker = new AMap.Marker({
      position: lnglat,
      content: '<div class="start-marker">起点</div>',
      offset: new AMap.Pixel(-20, -28),
      zIndex: 100
    });

    try {
      this.map.add(this.startMarker);
    } catch (e) {
      console.warn('添加起点标记失败:', e.message || e);
    }
  },

  // 移动地图中心
  setCenter(lnglat) {
    if (!this.isReady()) return;
    this.map.setCenter(lnglat);
  },

  // 清除所有覆盖物（安全移除，不抛异常）
  clearOverlays() {
    this._safeRemove(this.trackPolyline);
    this.trackPolyline = null;
    this._safeRemoveMany(this.trackPolylines);
    this.trackPolylines = [];
    this._safeRemove(this.startMarker);
    this.startMarker = null;
    // 保留当前位置标记
  },

  // 安全移除单个覆盖物
  _safeRemove(overlay) {
    if (!overlay || !this.map) return;
    try {
      this.map.remove(overlay);
    } catch (e) {
      console.warn('移除覆盖物失败（忽略）:', e.message || e);
    }
  },

  _safeRemoveMany(overlays) {
    if (!Array.isArray(overlays)) return;
    overlays.forEach((overlay) => this._safeRemove(overlay));
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

  // 调整视野包含完整轨迹
  fitView(overlays) {
    if (!this.isReady()) return;
    this.map.setFitView(overlays, false, [60, 60, 60, 60]);
  },

  // 显示完整历史轨迹
  showHistoryTrack(track) {
    if (!this.isReady()) return;

    this.clearOverlays();

    const path = track.points.map(p => [p.lng, p.lat]);
    if (path.length === 0) return;

    try {
      const paths = this.groupPathSegments(track.points);
      const polylines = paths.map(pathSegment => new AMap.Polyline({
        path: pathSegment,
        strokeColor: '#4A90D9',
        strokeWeight: 6,
        strokeOpacity: 0.8,
        lineJoin: 'round',
        lineCap: 'round',
        zIndex: 50
      }));

      if (polylines.length > 0) {
        this.map.add(polylines);
        this.trackPolylines = polylines;
        this.trackPolyline = polylines[polylines.length - 1];
      }

      const startMarker = new AMap.Marker({
        position: path[0],
        content: '<div class="start-marker">起点</div>',
        offset: new AMap.Pixel(-20, -28),
        zIndex: 100
      });
      this.map.add(startMarker);
      this.startMarker = startMarker;

      if (path.length > 1) {
        const endMarker = new AMap.Marker({
          position: path[path.length - 1],
          content: '<div class="end-marker">终点</div>',
          offset: new AMap.Pixel(-20, -28),
          zIndex: 100
        });
        this.map.add(endMarker);
      }

      if (polylines.length > 0) {
        this.fitView(polylines);
      } else {
        this.map.setCenter(path[0]);
      }
    } catch (e) {
      console.warn('显示历史轨迹失败:', e.message || e);
    }
  }
};
