// API 服务 - 调用真实后端
// 开发环境使用代理服务器解决 CORS 问题
// 注意：代理服务器会自动处理 context-path
function getApiBaseUrl() {
  if (typeof window.getApiBaseUrl === 'function' && window.getApiBaseUrl !== getApiBaseUrl) {
    return window.getApiBaseUrl();
  }
  if (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) {
    return window.APP_CONFIG.API_BASE_URL;
  }
  const hostname = window.location.hostname;
  if (hostname.match(/^192\.168\./) || hostname.match(/^10\./) || hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) {
    return `http://${hostname}:8088/api`;
  }
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:8088/api`;
  }
  return 'http://localhost:8088/api';
}

/**
 * 统一 Token 获取方法
 * 优先级：TokenUtils > TokenManager > localStorage
 */
function getAuthToken() {
  // 1. 尝试使用 TokenUtils（推荐）
  if (window.TokenUtils && typeof window.TokenUtils.get === 'function') {
    const token = window.TokenUtils.get();
    if (token) {
      return token;
    }
  }
  
  // 2. 尝试使用 TokenManager
  if (window.TokenManager && typeof window.TokenManager.getToken === 'function') {
    const token = window.TokenManager.getToken();
    if (token) {
      return token;
    }
  }
  
  // 3. 降级到 localStorage
  return localStorage.getItem('token') || '';
}

/**
 * 统一 Authorization Header 构建方法
 */
function buildAuthHeader() {
  const token = getAuthToken();
  console.log('[buildAuthHeader] getAuthToken() 返回:', token ? token.substring(0, 20) + '...' : 'null');
  
  if (token && token.trim()) {
    const header = `Bearer ${token}`;
    console.log('[buildAuthHeader] 返回 Authorization Header:', header.substring(0, 30) + '...');
    return header;
  }
  
  // 尝试 adminSession
  const adminSession = localStorage.getItem('adminSession');
  if (adminSession) {
    try {
      const session = JSON.parse(adminSession);
      if (session && session.token) {
        const header = `Bearer ${session.token}`;
        console.log('[buildAuthHeader] 从 adminSession 获取:', header.substring(0, 30) + '...');
        return header;
      }
    } catch (e) {
      console.error('[buildAuthHeader] Failed to parse adminSession:', e);
    }
  }
  
  console.warn('[buildAuthHeader] 返回空字符串 - 没有 Token');
  return '';
}

// XSS防护工具
const xssUtils = {
  // 转义HTML特殊字符
  escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },
  
  // 安全地设置元素内容
  setText(element, text) {
    if (element) {
      element.textContent = this.escapeHtml(text);
    }
  },
  
  // 安全地设置元素HTML（仅在必要时使用）
  setHtml(element, html) {
    if (element) {
      element.innerHTML = this.escapeHtml(html);
    }
  },
  
  // 清理用户输入
  sanitizeInput(input) {
    return this.escapeHtml(input);
  },
  
  // 清理对象中的所有字符串属性
  sanitizeObject(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    
    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (typeof value === 'string') {
          sanitized[key] = this.escapeHtml(value);
        } else if (typeof value === 'object') {
          sanitized[key] = this.sanitizeObject(value);
        } else {
          sanitized[key] = value;
        }
      }
    }
    return sanitized;
  }
};

const apiService = {
  // 请求超时配置（毫秒）
  REQUEST_TIMEOUT: 30000,
  
  // 缓存配置
  cache: {
    // 缓存数据
    data: {},
    // 默认缓存过期时间（毫秒）
    defaultExpireTime: 5 * 60 * 1000, // 5分钟
    // 不同类型请求的缓存时间配置
    expireTimes: {
      // 静态数据，缓存时间较长
      '/asset-type': 30 * 60 * 1000, // 30分钟
      '/skill': 30 * 60 * 1000, // 30分钟
      '/body-cultivation/realms': 30 * 60 * 1000, // 30分钟
      '/body-cultivation/parts': 30 * 60 * 1000, // 30分钟
      
      // 动态数据，缓存时间较短
      '/role/': 1 * 60 * 1000, // 1分钟
      '/checkin/': 1 * 60 * 1000, // 1分钟
      '/task/': 1 * 60 * 1000, // 1分钟
      '/mail/': 1 * 60 * 1000, // 1分钟
      '/leaderboard/': 2 * 60 * 1000, // 2分钟
      '/clan/': 2 * 60 * 1000, // 2分钟
      '/cultivation/': 1 * 60 * 1000, // 1分钟
      
      // 活动数据，缓存时间适中
      '/activity': 5 * 60 * 1000, // 5分钟
    },
    // 最大缓存大小（字节）
    maxCacheSize: 5 * 1024 * 1024, // 5MB
    
    // 获取缓存过期时间
    getExpireTime(endpoint) {
      for (const [key, time] of Object.entries(this.expireTimes)) {
        if (endpoint.includes(key)) {
          return time;
        }
      }
      return this.defaultExpireTime;
    },
    
    // 计算localStorage使用大小
    getUsedSize() {
      let size = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          size += localStorage[key].length;
        }
      }
      return size;
    },
    
    // 清理过期缓存
    cleanExpiredCache() {
      const now = Date.now();
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          try {
            const cacheItem = JSON.parse(localStorage[key]);
            const expireTime = cacheItem.expireTime || this.defaultExpireTime;
            if (now - cacheItem.timestamp > expireTime) {
              this.remove(key);
            }
          } catch (error) {
            this.remove(key);
          }
        }
      }
    },
    
    // 清理最旧的缓存
    cleanOldestCache() {
      const cacheItems = [];
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          try {
            const cacheItem = JSON.parse(localStorage[key]);
            cacheItems.push({ key, timestamp: cacheItem.timestamp });
          } catch (error) {
            this.remove(key);
          }
        }
      }
      
      // 按时间戳排序
      cacheItems.sort((a, b) => a.timestamp - b.timestamp);
      
      // 清理最旧的缓存，直到使用量低于最大限制的80%
      const targetSize = this.maxCacheSize * 0.8;
      while (this.getUsedSize() > targetSize && cacheItems.length > 0) {
        const oldest = cacheItems.shift();
        this.remove(oldest.key);
      }
    },
    
    // 确保有足够的存储空间
    ensureSpace() {
      // 先清理过期缓存
      this.cleanExpiredCache();
      
      // 如果仍然超出限制，清理最旧的缓存
      if (this.getUsedSize() > this.maxCacheSize) {
        this.cleanOldestCache();
      }
    },
    
    // 设置缓存
    set(key, value, endpoint) {
      // 确保有足够的存储空间
      this.ensureSpace();
      
      const expireTime = this.getExpireTime(endpoint);
      const cacheItem = {
        data: value,
        timestamp: Date.now(),
        expireTime: expireTime
      };
      
      try {
        localStorage.setItem(key, JSON.stringify(cacheItem));
      } catch (error) {
        console.error('设置缓存失败:', error);
        // 清理更多缓存
        this.cleanOldestCache();
        try {
          localStorage.setItem(key, JSON.stringify(cacheItem));
        } catch (e) {
          console.error('仍然无法设置缓存:', e);
        }
      }
    },
    
    // 获取缓存
    get(key) {
      const cacheItemStr = localStorage.getItem(key);
      if (!cacheItemStr) return null;
      
      try {
        const cacheItem = JSON.parse(cacheItemStr);
        // 检查是否过期
        const expireTime = cacheItem.expireTime || this.defaultExpireTime;
        if (Date.now() - cacheItem.timestamp > expireTime) {
          this.remove(key);
          return null;
        }
        return cacheItem.data;
      } catch (error) {
        console.error('解析缓存数据失败:', error);
        this.remove(key);
        return null;
      }
    },
    
    // 移除缓存
    remove(key) {
      localStorage.removeItem(key);
    },
    
    // 清除所有缓存
    clear() {
      localStorage.clear();
    },
    
    // 清理指定类型的缓存
    clearByType(type) {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes(type)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => this.remove(key));
    }
  },
  
  // 页面卸载时清理缓存
  initCacheCleanup() {
    window.addEventListener('beforeunload', () => {
      // 清理过期缓存
      this.cache.cleanExpiredCache();
      // 清理临时缓存
      this.cache.clearByType('temp');
    });
  },
  // 通用 GET 请求方法
  async get(endpoint, params = {}) {
      // 需要认证的接口不使用缓存（实时数据）
      const requiresAuth = endpoint.startsWith('/role/') || 
                          endpoint.startsWith('/clan/') ||
                          endpoint.startsWith('/inventory/') ||
                          endpoint.startsWith('/equipment/') ||
                          endpoint.startsWith('/task/') ||
                          endpoint.startsWith('/mail/') ||
                          endpoint.startsWith('/checkin/') ||
                          endpoint.startsWith('/cultivation/') ||
                          endpoint.startsWith('/body-cultivation/');
      
      // 公开数据可以缓存
      const isPublicData = endpoint.startsWith('/announcement') || 
                          endpoint.startsWith('/activity') ||
                          endpoint.startsWith('/sys/') ||
                          endpoint.startsWith('/config/') ||
                          endpoint.startsWith('/asset-type') ||
                          endpoint.startsWith('/skill');
      
      // 生成缓存键
      const cacheKey = `GET_${endpoint}_${JSON.stringify(params)}`;
      
      // 检查缓存（只缓存公开数据）
      if (isPublicData && !requiresAuth) {
        const cachedData = this.cache.get(cacheKey);
        if (cachedData) {
          console.log('Cache hit:', endpoint);
          return cachedData;
        }
      }
      
      const url = new URL(getApiBaseUrl() + endpoint);
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);
      
      // 使用统一的 Token 获取方法
      const authHeader = buildAuthHeader();
      
      console.log(`[${endpoint}] Token exists:`, authHeader ? 'Yes' : 'No');
      console.log(`[${endpoint}] Authorization Header:`, authHeader ? 'Set' : 'Not set');
      
      console.log(`[${endpoint}] 发送请求到:`, url);
      console.log(`[${endpoint}] 请求头部:`, {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'Origin': window.location.origin
      });
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
            'Origin': window.location.origin
          },
          signal: controller.signal,
          credentials: 'include', // 允许携带凭证（cookies）
          mode: 'cors' // 明确指定 CORS 模式
        });
        
        clearTimeout(timeoutId);
        
        console.log(`[${endpoint}] 响应状态:`, response.status);
        console.log(`[${endpoint}] 响应头部:`, response.headers);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error(`[${endpoint}] 请求失败:`, response.status, errorData);
          
          // 如果是 401 错误，只记录日志，不弹窗
          if (response.status === 401) {
            console.warn('Token 可能已过期或无效，继续执行...');
            // 不弹窗，不跳转，继续执行
            // 让调用者决定如何处理
          }
          
          throw new Error(errorData.message || `HTTP 错误！状态码：${response.status}`);
        }
        
        const result = await response.json();
        
        // 检查响应体中的code字段
        if (result.code && result.code !== 200) {
          console.error(`[${endpoint}] 业务错误:`, result.code, result.message);
          throw new Error(result.message || `业务错误！状态码：${result.code}`);
        }
        
        // 如果是 Result 对象格式，返回 data 字段
        // 特殊处理：如果 result 是数组，直接返回
        let data;
        if (Array.isArray(result)) {
          data = result;
        } else {
          data = result.data !== undefined ? result.data : result;
        }
        
        // 对返回数据进行 XSS 防护处理
        const sanitizedData = xssUtils.sanitizeObject(data);
        
        // 缓存响应数据（只缓存公开数据）
        if (isPublicData && !requiresAuth) {
          this.cache.set(cacheKey, sanitizedData, endpoint);
          console.log('Data cached:', endpoint);
        }
        
        return sanitizedData;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          console.error('API 请求超时:', endpoint);
          throw new Error('请求超时，请检查网络连接');
        } else if (error.message.includes('NetworkError') || error.message.includes('网络')) {
          console.error('网络错误:', endpoint);
          throw new Error('网络连接失败，请检查网络设置');
        }
        console.error('API GET 错误:', endpoint, error);
        throw error;
      }
  },

  // 通用 POST 请求方法
  async post(endpoint, data = {}) {
    try {
      // 对请求数据进行 XSS 防护处理
      const sanitizedData = xssUtils.sanitizeObject(data);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);
      
      // 使用统一的 Token 获取方法
      const authHeader = buildAuthHeader();
      
      console.log(`POST [${endpoint}] Token exists:`, authHeader ? 'Yes' : 'No');
      console.log(`POST [${endpoint}] Authorization Header:`, authHeader ? 'Set' : 'Not set');
      console.log(`POST [${endpoint}] Token value:`, authHeader);
      console.log(`POST [${endpoint}] TokenManager status:`, window.TokenManager ? 'Loaded' : 'Not loaded');
      if (window.TokenManager && window.TokenManager.getToken) {
        console.log(`POST [${endpoint}] Token from TokenManager:`, window.TokenManager.getToken());
      }
      
      const response = await fetch(getApiBaseUrl() + endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify(sanitizedData),
        signal: controller.signal,
        credentials: 'include',
        mode: 'cors'
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`POST [${endpoint}] 请求失败:`, response.status, errorData);
        throw new Error(errorData.message || `HTTP 错误！状态码：${response.status}`);
      }
      
      const result = await response.json();
      
      // 检查响应体中的code字段
      if (result.code && result.code !== 200) {
        console.error(`POST [${endpoint}] 业务错误:`, result.code, result.message);
        throw new Error(result.message || `业务错误！状态码：${result.code}`);
      }
      
      // 如果是 Result 对象格式，返回 data 字段
      const resultData = result.data !== undefined ? result.data : result;
      
      // 对返回数据进行 XSS 防护处理
      const sanitizedResultData = xssUtils.sanitizeObject(resultData);
      
      // 清除相关缓存
      this.clearRelatedCache(endpoint);
      
      return sanitizedResultData;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('API 请求超时:', endpoint);
        throw new Error('请求超时，请检查网络连接');
      } else if (error.message.includes('NetworkError') || error.message.includes('网络')) {
        console.error('网络错误:', endpoint);
        throw new Error('网络连接失败，请检查网络设置');
      }
      console.error('API POST 错误:', endpoint, error);
      throw error;
    }
  },

  // 通用 PUT 请求方法
  async put(endpoint, data = {}) {
    try {
      // 对请求数据进行 XSS 防护处理
      const sanitizedData = xssUtils.sanitizeObject(data);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);
      
      // 使用统一的 Token 获取方法
      const authHeader = buildAuthHeader();
      
      const response = await fetch(getApiBaseUrl() + endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify(sanitizedData),
        signal: controller.signal,
        credentials: 'include',
        mode: 'cors'
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP 错误！状态码：${response.status}`);
      }
      
      if (response.status === 204) {
        return { success: true };
      }
      
      const result = await response.json();
      // 如果是 Result 对象格式，返回 data 字段
      const resultData = result.data !== undefined ? result.data : result;
      
      // 对返回数据进行XSS防护处理
      const sanitizedResultData = xssUtils.sanitizeObject(resultData);
      
      // 清除相关缓存
      this.clearRelatedCache(endpoint);
      
      return sanitizedResultData;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('API 请求超时:', endpoint);
        throw new Error('请求超时，请检查网络连接');
      } else if (error.message.includes('NetworkError') || error.message.includes('网络')) {
        console.error('网络错误:', endpoint);
        throw new Error('网络连接失败，请检查网络设置');
      }
      console.error('API PUT 错误:', error);
      throw error;
    }
  },

  // 通用 DELETE 请求方法
  async delete(endpoint) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);
      
      // 使用统一的 Token 获取方法
      const authHeader = buildAuthHeader();
      
      const response = await fetch(getApiBaseUrl() + endpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        signal: controller.signal,
        credentials: 'include',
        mode: 'cors'
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP 错误！状态码：${response.status}`);
      }
      
      if (response.status === 204) {
        return { success: true };
      }
      
      const result = await response.json();
      // 如果是 Result 对象格式，返回 data 字段
      const resultData = result.data !== undefined ? result.data : result;
      
      // 对返回数据进行XSS防护处理
      const sanitizedResultData = xssUtils.sanitizeObject(resultData);
      
      // 清除相关缓存
      this.clearRelatedCache(endpoint);
      
      return sanitizedResultData;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('API 请求超时:', endpoint);
        throw new Error('请求超时，请检查网络连接');
      } else if (error.message.includes('NetworkError') || error.message.includes('网络')) {
        console.error('网络错误:', endpoint);
        throw new Error('网络连接失败，请检查网络设置');
      }
      console.error('API DELETE 错误:', error);
      throw error;
    }
  },

  // 清除相关缓存
  clearRelatedCache(endpoint) {
    // 遍历所有缓存键，清除与当前 endpoint 相关的缓存
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('GET_')) {
        // 提取 endpoint 部分
        const parts = key.split('_');
        if (parts.length >= 2) {
          const cacheEndpoint = parts.slice(1).join('_').split('{')[0];
          // 检查是否与当前 endpoint 相关
          if (cacheEndpoint && (endpoint.includes(cacheEndpoint) || cacheEndpoint.includes(endpoint.split('/')[1]))) {
            keysToRemove.push(key);
          }
        }
      }
    }
    // 批量删除缓存
    keysToRemove.forEach(key => {
      this.cache.remove(key);
      console.log('清除缓存:', key);
    });
  },

  // 获取用户资料（使用游戏用户接口）
  async getUserProfile(roleId) {
    return this.get(`/role/${roleId}`);
  },

  // 获取用户角色列表
  async getRole(userId) {
    const response = await this.get(`/role/user/${userId}`);
    // 直接返回响应，因为后端返回的是 Result 对象，get 方法已经处理了 data 字段
    return Array.isArray(response) ? response : [];
  },

  // 获取角色详细信息
  async getRoleById(roleId) {
    return this.get(`/role/${roleId}`);
  },

  // 获取角色排名
  async getRoleRank(roleId) {
    return this.get(`/role/rank/${roleId}`);
  },

  // 获取角色装备
  async getRoleEquipment(roleId) {
    return this.get(`/equipment/equipped/${roleId}`);
  },

  // 装备相关 API
  async equipItem(roleId, roleAssetId) {
    return this.post(`/equipment/equip`, { roleId, roleAssetId });
  },

  async equipByEquipmentId(roleId, roleEquipmentId) {
    return this.post(`/equipment/equip-by-equipment?roleId=${roleId}&roleEquipmentId=${roleEquipmentId}`, {});
  },

  async unequipItem(roleId, slot) {
    return this.post(`/equipment/unequip?roleId=${roleId}&slot=${slot}`, {});
  },

  async getEquippedItems(roleId) {
    return this.get(`/equipment/equipped/${roleId}`);
  },

  async getEquipmentStats(roleId) {
    return this.get(`/equipment/stats/${roleId}`);
  },
  
  async previewEquip(roleId, slotId, itemId) {
    return this.post(`/equipment/preview-equip?roleId=${roleId}&slot_id=${slotId}&item_id=${itemId}`, {});
  },
  
  // 属性相关 API
  async getAttributes(roleId, forceRecalculate = false) {
    const url = forceRecalculate 
      ? `/attributes/${roleId}?forceRecalculate=true` 
      : `/attributes/${roleId}`;
    return this.get(url);
  },
  
  async recalculateAttributes(roleId) {
    return this.post(`/attributes/${roleId}/recalculate`, {});
  },
  
  async getPlayerBaseStats(playerId) {
    return this.get(`/stats/player/${playerId}`);
  },
  
  async getPlayerDerivedStats(playerId) {
    return this.get(`/stats/player/${playerId}/derived`);
  },
  
  async updatePlayerBaseStats(playerId, statType, value, opType, contextInfo) {
    return this.post(`/stats/player/${playerId}/update`, {
      statType,
      value,
      opType,
      contextInfo
    });
  },
  
  async updatePlayerRealm(playerId, realmLevel, realmStage, contextInfo) {
    return this.post(`/stats/player/${playerId}/realm`, {
      realmLevel,
      realmStage,
      contextInfo
    });
  },
  
  async addPlayerExperience(playerId, expAmount, contextInfo) {
    return this.post(`/stats/player/${playerId}/exp`, {
      expAmount,
      contextInfo
    });
  },
  
  async getStatLogs(playerId) {
    return this.get(`/stats/logs/${playerId}`);
  },
  
  /**
   * 获取配置信息
   * @param {string} configKey - 配置类型 (realm_breakthrough, equipment_quality, pill_effect, skill_upgrade, realm_mult, formula_coef, stat_caps)
   */
  async getConfig(configKey) {
    // 映射配置 key 到正确的后端路径
    const configPaths = {
      'realm_breakthrough': '/config/realm-breakthrough',
      'equipment_quality': '/config/equipment-quality',
      'pill_effect': '/config/pill-effect',
      'skill_upgrade': '/config/skill-upgrade',
      'realm_mult': '/config/realm-mult',
      'formula_coef': '/config/formula-coef',
      'stat_caps': '/config/stat-caps'
    };
    
    const path = configPaths[configKey] || `/config/${configKey.replace('_', '-')}`;
    return this.get(path);
  },
  
  /**
   * 获取所有配置
   */
  async getAllConfigs() {
    return {
      realmBreakthrough: await this.getConfig('realm_breakthrough'),
      equipmentQuality: await this.getConfig('equipment_quality'),
      pillEffect: await this.getConfig('pill_effect'),
      skillUpgrade: await this.getConfig('skill_upgrade')
    };
  },

  // 购买物品（充值）
  async buyItem(amount, method) {
    return this.post('/payment/buy', { amount, method });
  },

  // 获取签到信息
  async getCheckinInfo(roleId) {
    return this.get(`/checkin/monthly/${roleId}`);
  },

  // 执行签到
  async doCheckin(roleId) {
    const today = new Date().toISOString().split('T')[0];
    return this.post('/checkin/do', { roleId, checkinDate: today });
  },

  // 执行补签
  async supplementCheckin(roleId, day) {
    return this.post('/checkin/supplement', { roleId, day });
  },

  // 获取签到奖励配置
  async getCheckinRewards() {
    return this.get('/checkin/rewards');
  },

  // 获取任务列表
  async getTaskList(roleId) {
    return this.get(`/task/list/${roleId}`);
  },
  
  // 获取角色基础属性
  async getRoleBaseStats(roleId) {
    return this.get(`/role-stats/base/${roleId}`);
  },
  
  // 更新角色基础属性
  async updateRoleBaseStats(roleId, stats) {
    return this.post(`/role-stats/base/${roleId}`, stats);
  },

  // 接取任务
  async acceptTask(taskId) {
    const roleId = localStorage.getItem('currentRoleId');
    if (!roleId) {
      throw new Error('未选择角色，请先选择角色');
    }
    return this.post(`/role/tasks/${roleId}/${taskId}/accept`);
  },

  // 继续任务
  async continueTask(taskId) {
    const roleId = localStorage.getItem('currentRoleId');
    if (!roleId) {
      throw new Error('未选择角色，请先选择角色');
    }
    return this.put(`/role/tasks/${roleId}/${taskId}/progress`, { progress: 50 });
  },

  // 完成任务
  async completeTask(taskId) {
    const roleId = localStorage.getItem('currentRoleId');
    if (!roleId) {
      throw new Error('未选择角色，请先选择角色');
    }
    return this.put(`/role/tasks/${roleId}/${taskId}/complete`);
  },

  // 获取公告列表
  async getAnnouncements() {
    return this.get('/announcement');
  },

  // 获取公告详情
  async getAnnouncement(id) {
    return this.get(`/announcement/${id}`);
  },

  // 获取活动列表
  async getActivities() {
    return this.get('/activity');
  },

  // 获取未读邮件数量
  async getMailUnreadCount() {
    const userId = localStorage.getItem('currentUserId');
    if (!userId) {
      return 0;
    }
    return this.get(`/mail/unread/count/${userId}`);
  },

  // 获取礼物数量
  async getGiftCount() {
    const userId = localStorage.getItem('currentUserId');
    if (!userId) {
      return 0;
    }
    const result = await this.get(`/gift/unclaimed/count/${userId}`);
    return result.count || 0;
  },

  // 获取用户资产
  async getAssets(roleId) {
    return this.get(`/role-asset/${roleId}`);
  },

  // 获取资产类型列表
  async getAssetTypes() {
    return this.get('/asset-type');
  },

  // 获取新闻列表
  async getNews() {
    return this.get('/activity');
  },

  // 获取统计数据
  async getStatistics() {
    return this.get('/statistics');
  },

  // 获取成就列表
  async getAchievements(roleId) {
    return this.get(`/achievement/role/${roleId}`);
  },

  // 领取成就奖励
  async claimAchievementReward(achievementId, roleId) {
    return this.post(`/achievement/claim/${achievementId}`, { roleId });
  },

  // 更新成就进度
  async updateAchievementProgress(roleId, achievementId, progress, target) {
    return this.post('/achievement/progress', { roleId, achievementId, progress, target });
  },

  // 初始化角色成就数据
  async initRoleAchievements(roleId) {
    return this.post(`/achievement/role/${roleId}/init`);
  },

  // 获取邮件列表
  async getMails(roleId) {
    return this.get(`/mail/user/${roleId}`);
  },

  // 读取邮件
  async readMail(mailId, roleId) {
    return this.put(`/mail/${mailId}/read`);
  },

  // 获取排行榜数据
  async getLeaderboard(type) {
    return this.get(`/leaderboard/${type}`);
  },

  // 获取道友列表
  async getFriends(roleId) {
    return this.get(`/friend/list/${roleId}`);
  },

  // 获取商城商品列表
  async getMallProducts() {
    return this.get('/mall/products');
  },

  // 购买商品
  async buyProduct(roleId, productId, quantity = 1) {
    return this.post('/mall/buy', { roleId, productId, quantity });
  },

  // 获取所有技能列表
  async getAllSkills() {
    return this.get('/skill');
  },

  // 获取技能类型列表
  async getSkillTypes() {
    return this.get('/skill-type/active');
  },

  // 获取角色技能
  async getRoleSkills(roleId) {
    return this.get(`/role-skill/role/${roleId}`);
  },
  
  // 遗忘技能
  async forgetSkill(roleId, skillId) {
    return this.post('/role-skill/forget', { roleId, skillId });
  },
  
  // 获取境界技能容量配置
  async getRealmCapacity() {
    return this.get('/role-skill/capacity');
  },

  async participateActivity(roleId, activityId) {
    return this.post(`/activity/${activityId}/participate`, { roleId });
  },

  // 锻体相关 API
  async getBodyCultivationInfo(roleId) {
    return this.get(`/body-cultivation/role/${roleId}`);
  },

  async cultivate(roleId, partId, qteScore) {
    return this.post(`/body-cultivation/role/${roleId}/cultivate?partId=${partId}&qteScore=${qteScore}`, {});
  },

  async breakthrough(roleId, useMedicine = false) {
    return this.post(`/body-cultivation/role/${roleId}/breakthrough?useMedicine=${useMedicine}`, {});
  },

  async getAllBodyCultivationRealms() {
    return this.get('/body-cultivation/realms');
  },

  async getAllBodyCultivationParts() {
    return this.get('/body-cultivation/parts');
  },

  async getBodyCultivationLogs(roleId, days = 7) {
    return this.get(`/body-cultivation/role/${roleId}/logs`, { days });
  },

  // 修炼相关 API
  async executeAutoCultivation(roleId) {
    return this.post('/cultivation/auto', { roleId });
  },

  async getCultivationStatus(roleId) {
    return this.get(`/cultivation/status/${roleId}`);
  },

  async getNextRealm(currentRealm) {
    return this.get('/cultivation/next-realm', { currentRealm });
  },

  async calculateBreakthroughRate(roleId, currentRealm) {
    return this.get('/cultivation/breakthrough/rate', { roleId, currentRealm });
  },

  async executeBreakthrough(roleId) {
    return this.post('/cultivation/breakthrough', { roleId });
  },

  // 宗门相关 API
  async getClanList() {
    return this.get('/clan/all');
  },

  async getClanDetail(clanId) {
    return this.get(`/clan/${clanId}`);
  },

  async getClanMemberByRoleId(roleId) {
    return this.get(`/clan/member/role/${roleId}`);
  },

  async getClanApplicationStatus(roleId) {
    return this.get(`/clan/apply/status/${roleId}`);
  },

  async joinClan(roleId, clanId) {
    return this.post(`/clan/role/${roleId}/join/${clanId}`);
  },

  async applyJoinClan(roleId, clanId, message) {
    return this.post('/clan/apply/join', { roleId, clanId, message });
  },

  async processApply(applyId, status, handlerId) {
    return this.post('/clan/apply/process', { applyId, status, handlerId });
  },

  async getClanApplyList(clanId, status) {
    return this.get(`/clan/apply/list/${clanId}`, { status });
  },

  async leaveClan(memberId) {
    return this.post(`/clan/member/${memberId}/leave`);
  },

  async getClanResources(clanId) {
    return this.get(`/clan/${clanId}/resources`);
  },

  async getClanAnnouncement(clanId) {
    return this.get(`/clan/${clanId}/announcement`);
  },

  // 获取宗门成员列表
  async getClanMembers(clanId) {
    return this.get(`/clan/${clanId}/members`);
  },

  // 获取宗门聊天消息
  async getClanChatMessages(clanId, page = 1, size = 50) {
    return this.get(`/clan/chat/${clanId}`, { page, size });
  },

  // 发送宗门聊天消息
  async sendClanChatMessage(clanId, roleId, roleName, message) {
    return this.post('/clan/chat/send', { clanId, roleId, roleName, message });
  },

  // 获取宗门商店商品
  async getClanShopItems(clanId) {
    return this.get(`/clan/shop/${clanId}`);
  },

  // 购买宗门商品
  async buyClanItem(clanId, roleId, itemId, count) {
    return this.post('/clan/shop/buy', { clanId, roleId, itemId, count });
  },

  // 获取宗门任务
  async getClanTasks(clanId, roleId = null) {
    const params = {};
    if (roleId) params.roleId = roleId;
    return this.get(`/clan/tasks/${clanId}`, params);
  },

  // 接受宗门任务
  async acceptClanTask(clanId, roleId, taskId) {
    return this.post('/clan/task/accept', { clanId, roleId, taskId });
  },

  // 提交宗门任务
  async submitClanTask(clanId, roleId, taskId) {
    return this.post('/clan/task/submit', { clanId, roleId, taskId });
  },

  // 获取宗门建筑
  async getClanBuildings(clanId) {
    return this.get(`/clan/buildings/${clanId}`);
  },

  // 升级宗门建筑
  async upgradeClanBuilding(clanId, roleId, buildingId) {
    return this.post('/clan/building/upgrade', { clanId, roleId, buildingId });
  },

  async donateToClan(clanId, roleId, amount) {
    return this.post('/clan/donate', { clanId, roleId, amount });
  },

  async updateMemberPosition(memberId, position, operatorRoleId) {
    return this.post(`/clan/member/${memberId}/position?position=${position}&operatorRoleId=${operatorRoleId}`, {});
  },

  // 获取背包数据
  async getInventory(roleId) {
    return this.get(`/inventory/${roleId}`);
  },

  // 使用物品
  async useItem(roleId, itemId) {
    return this.post('/inventory/use', { roleId, itemId });
  },

  // 出售物品
  async sellItem(roleId, itemId, count = 1) {
    return this.post('/inventory/sell', { roleId, itemId, count });
  },

  // 分割物品
  async splitItem(roleId, itemId, count) {
    return this.post('/inventory/split', { roleId, itemId, count });
  },

  // 整理背包
  async organizeBag(roleId) {
    return this.post('/inventory/organize', { roleId });
  },

  // 扩容背包
  async expandBag(roleId, page) {
    return this.post('/inventory/expand', { roleId, page });
  },

  // 一键穿戴
  async autoEquip(roleId) {
    return this.post('/equipment/auto-equip', { roleId });
  },

  // 卸下全部
  async unequipAll(roleId) {
    return this.post('/equipment/unequip-all', { roleId });
  },

  async getAssetTypeList(name, category, status, page = 1, size = 10) {
    return this.get('/asset-type/list', { name, category, status, page, size });
  },

  async createAssetType(assetType) {
    return this.post('/asset-type', assetType);
  },

  async updateAssetType(id, assetType) {
    return this.put(`/asset-type/${id}`, assetType);
  },

  async deleteAssetType(id) {
    return this.delete(`/asset-type/${id}`);
  },

  // 资产信息相关API
  async getAssetInformationList(assetTypeCode, name, page = 1, size = 10) {
    return this.get('/asset-information/list', { assetTypeCode, name, page, size });
  },

  async getAssetInformationById(id) {
    return this.get(`/asset-information/${id}`);
  },

  async getAssetInformationByType(assetTypeCode) {
    return this.get(`/asset-information/type/${assetTypeCode}`);
  },

  async createAssetInformation(assetInformation) {
    return this.post('/asset-information', assetInformation);
  },

  async updateAssetInformation(id, assetInformation) {
    return this.put(`/asset-information/${id}`, assetInformation);
  },

  async deleteAssetInformation(id) {
    return this.delete(`/asset-information/${id}`);
  },

  async searchAssetInformation(name) {
    return this.get('/asset-information/search', { name });
  }
};

// 创建全局实例
if (typeof window !== 'undefined') {
  // 如果api-interceptor.js已加载，合并方法而非覆盖
  if (window.apiService && window._mergeApiServiceMethods) {
    window._mergeApiServiceMethods(apiService);
  } else {
    window.apiService = apiService;
  }
  
  // 版本标识 - 用于确认文件是否正确加载
  window.apiServiceVersion = '20250103-FIXED';
  console.log('========================================');
  console.log('✅ api-service.js 已加载！');
  console.log('版本:', window.apiServiceVersion);
  console.log('getSkillTypes 方法存在:', typeof apiService.getSkillTypes);
  console.log('cultivate 方法存在:', typeof apiService.cultivate);
  console.log('========================================');
}
