// storage.js - 数据持久化模块（IndexedDB + LocalStorage 混合方案）
// 轨迹数据使用 IndexedDB（无容量限制），设置使用 LocalStorage（轻量快速）

const Storage = {
  DB_NAME: 'TrackRecorderDB',
  DB_VERSION: 1,
  STORE_NAME: 'tracks',
  db: null,

  // LocalStorage 键名
  LS_KEYS: {
    SETTINGS: 'app_settings',
    CURRENT_TRACK: 'current_track'
  },

  // ===== IndexedDB 初始化 =====

  init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('IndexedDB 初始化成功');
        // 迁移旧 LocalStorage 数据
        this.migrateFromLocalStorage().then(() => resolve());
      };

      request.onerror = (event) => {
        console.error('IndexedDB 初始化失败:', event.target.error);
        // 降级到 LocalStorage
        this.db = null;
        resolve();
      };
    });
  },

  // 从旧版 LocalStorage 迁移数据
  async migrateFromLocalStorage() {
    try {
      const oldData = localStorage.getItem('track_records');
      if (!oldData) return;

      const tracks = JSON.parse(oldData);
      if (!Array.isArray(tracks) || tracks.length === 0) return;

      // 逐条写入 IndexedDB
      for (const track of tracks) {
        await this.addTrack(track);
      }

      // 迁移成功后删除旧数据
      localStorage.removeItem('track_records');
      console.log(`已迁移 ${tracks.length} 条轨迹到 IndexedDB`);
    } catch (e) {
      console.warn('数据迁移失败:', e);
    }
  },

  // ===== 轨迹 CRUD（IndexedDB 优先，LocalStorage 降级）=====

  // 获取所有轨迹
  getAllTracks() {
    return new Promise((resolve) => {
      if (this.db) {
        const tx = this.db.transaction(this.STORE_NAME, 'readonly');
        const store = tx.objectStore(this.STORE_NAME);
        const index = store.index('createdAt');
        const request = index.openCursor(null, 'prev'); // 按时间倒序
        const tracks = [];

        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            tracks.push(cursor.value);
            cursor.continue();
          } else {
            resolve(tracks);
          }
        };

        request.onerror = () => {
          console.error('读取轨迹失败');
          resolve([]);
        };
      } else {
        // 降级到 LocalStorage
        try {
          const data = localStorage.getItem('track_records');
          resolve(data ? JSON.parse(data) : []);
        } catch (e) {
          resolve([]);
        }
      }
    });
  },

  // 同步版本（用于兼容旧代码，内部调用异步版本）
  _syncCache: null,
  _syncCacheTime: 0,

  async _refreshCache() {
    this._syncCache = await this.getAllTracks();
    this._syncCacheTime = Date.now();
  },

  // 添加单条轨迹
  addTrack(track) {
    return new Promise((resolve) => {
      if (this.db) {
        const tx = this.db.transaction(this.STORE_NAME, 'readwrite');
        const store = tx.objectStore(this.STORE_NAME);
        const request = store.put(track);

        request.onsuccess = () => {
          this._syncCache = null; // 清除缓存
          resolve(true);
        };

        request.onerror = (event) => {
          console.error('保存轨迹失败:', event.target.error);
          resolve(false);
        };
      } else {
        // 降级到 LocalStorage
        try {
          const tracks = localStorage.getItem('track_records');
          const arr = tracks ? JSON.parse(tracks) : [];
          arr.unshift(track);
          localStorage.setItem('track_records', JSON.stringify(arr));
          resolve(true);
        } catch (e) {
          if (e.name === 'QuotaExceededError' || e.code === 22) {
            alert('存储空间不足，请删除部分历史轨迹后重试');
          }
          resolve(false);
        }
      }
    });
  },

  // 删除单条轨迹
  deleteTrack(trackId) {
    return new Promise((resolve) => {
      if (this.db) {
        const tx = this.db.transaction(this.STORE_NAME, 'readwrite');
        const store = tx.objectStore(this.STORE_NAME);
        const request = store.delete(trackId);

        request.onsuccess = () => {
          this._syncCache = null;
          resolve(true);
        };

        request.onerror = () => resolve(false);
      } else {
        try {
          const tracks = localStorage.getItem('track_records');
          const arr = tracks ? JSON.parse(tracks) : [];
          const filtered = arr.filter(t => t.id !== trackId);
          localStorage.setItem('track_records', JSON.stringify(filtered));
          resolve(true);
        } catch (e) {
          resolve(false);
        }
      }
    });
  },

  // 获取单条轨迹
  getTrack(trackId) {
    return new Promise((resolve) => {
      if (this.db) {
        const tx = this.db.transaction(this.STORE_NAME, 'readonly');
        const store = tx.objectStore(this.STORE_NAME);
        const request = store.get(trackId);

        request.onsuccess = (event) => {
          resolve(event.target.result || null);
        };

        request.onerror = () => resolve(null);
      } else {
        try {
          const tracks = localStorage.getItem('track_records');
          const arr = tracks ? JSON.parse(tracks) : [];
          resolve(arr.find(t => t.id === trackId) || null);
        } catch (e) {
          resolve(null);
        }
      }
    });
  },

  // 更新单条轨迹
  updateTrack(trackId, updates) {
    return new Promise((resolve) => {
      if (this.db) {
        const tx = this.db.transaction(this.STORE_NAME, 'readwrite');
        const store = tx.objectStore(this.STORE_NAME);
        const getReq = store.get(trackId);

        getReq.onsuccess = (event) => {
          const track = event.target.result;
          if (track) {
            const updated = { ...track, ...updates };
            const putReq = store.put(updated);
            putReq.onsuccess = () => {
              this._syncCache = null;
              resolve(true);
            };
            putReq.onerror = () => resolve(false);
          } else {
            resolve(false);
          }
        };

        getReq.onerror = () => resolve(false);
      } else {
        try {
          const tracks = localStorage.getItem('track_records');
          const arr = tracks ? JSON.parse(tracks) : [];
          const index = arr.findIndex(t => t.id === trackId);
          if (index !== -1) {
            arr[index] = { ...arr[index], ...updates };
            localStorage.setItem('track_records', JSON.stringify(arr));
            resolve(true);
          } else {
            resolve(false);
          }
        } catch (e) {
          resolve(false);
        }
      }
    });
  },

  // ===== 存储使用量 =====

  getStorageUsage() {
    return new Promise((resolve) => {
      if (this.db && navigator.storage && navigator.storage.estimate) {
        navigator.storage.estimate().then((estimate) => {
          const usedMB = (estimate.usage / 1024 / 1024).toFixed(2);
          const maxMB = (estimate.quota / 1024 / 1024).toFixed(0);
          resolve({
            usedBytes: estimate.usage || 0,
            usedMB: usedMB,
            maxMB: maxMB,
            usagePercent: estimate.quota > 0
              ? ((estimate.usage / estimate.quota) * 100).toFixed(1)
              : '0'
          });
        }).catch(() => {
          resolve(this._getFallbackUsage());
        });
      } else {
        resolve(this._getFallbackUsage());
      }
    });
  },

  _getFallbackUsage() {
    const tracks = localStorage.getItem('track_records') || '';
    const settings = localStorage.getItem(this.LS_KEYS.SETTINGS) || '';
    const current = localStorage.getItem(this.LS_KEYS.CURRENT_TRACK) || '';
    const totalBytes = (tracks.length + settings.length + current.length) * 2;
    return {
      usedBytes: totalBytes,
      usedMB: (totalBytes / 1024 / 1024).toFixed(2),
      maxMB: '500+',
      usagePercent: '0'
    };
  },

  // ===== 当前录制轨迹（LocalStorage，轻量快速）=====

  saveCurrentTrack(track) {
    try {
      localStorage.setItem(this.LS_KEYS.CURRENT_TRACK, JSON.stringify(track));
    } catch (e) {
      console.warn('保存当前轨迹失败:', e);
    }
  },

  getCurrentTrack() {
    try {
      const data = localStorage.getItem(this.LS_KEYS.CURRENT_TRACK);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  clearCurrentTrack() {
    localStorage.removeItem(this.LS_KEYS.CURRENT_TRACK);
  },

  // ===== 应用设置（LocalStorage，轻量快速）=====

  getSettings() {
    try {
      const data = localStorage.getItem(this.LS_KEYS.SETTINGS);
      const defaults = {
        collectInterval: 3000,
        minAccuracy: 100,
        autoSave: true,
        theme: 'light',
        backgroundTimeout: 3600000
      };
      if (data) {
        return { ...defaults, ...JSON.parse(data) };
      }
      return defaults;
    } catch (e) {
      return {
        collectInterval: 3000,
        minAccuracy: 100,
        autoSave: true,
        theme: 'light',
        backgroundTimeout: 3600000
      };
    }
  },

  saveSettings(settings) {
    try {
      localStorage.setItem(this.LS_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('保存设置失败:', e);
    }
  },

  // ===== 数据清除 =====

  clearAllData() {
    return new Promise((resolve) => {
      if (this.db) {
        const tx = this.db.transaction(this.STORE_NAME, 'readwrite');
        const store = tx.objectStore(this.STORE_NAME);
        const request = store.clear();
        request.onsuccess = () => {
          this._syncCache = null;
          localStorage.removeItem(this.LS_KEYS.CURRENT_TRACK);
          resolve();
        };
        request.onerror = () => {
          localStorage.removeItem('track_records');
          localStorage.removeItem(this.LS_KEYS.CURRENT_TRACK);
          resolve();
        };
      } else {
        localStorage.removeItem('track_records');
        localStorage.removeItem(this.LS_KEYS.CURRENT_TRACK);
        resolve();
      }
    });
  }
};
