/**
 * API 请求拦截器 - 统一处理API请求、缓存和错误
 */

class ApiInterceptor {
  constructor() {
    this._baseURL = null;
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000;
    this.requestQueue = new Map();
  }
  
  get baseURL() {
    if (this._baseURL) return this._baseURL;
    if (typeof window.getApiBaseUrl === 'function') {
      this._baseURL = window.getApiBaseUrl();
    } else {
      this._baseURL = 'http://localhost:8088/api';
    }
    return this._baseURL;
  }
  
  /**
   * 生成请求缓存键
   * @param {string} endpoint - API端点
   * @param {object} params - 请求参数
   * @returns {string} 缓存键
   */
  generateCacheKey(endpoint, params = {}) {
    const sortedParams = Object.keys(params).sort().map(key => `${key}=${params[key]}`).join('&');
    return `${endpoint}?${sortedParams}`;
  }
  
  /**
   * 检查缓存是否有效
   * @param {string} key - 缓存键
   * @returns {boolean} 缓存是否有效
   */
  isCacheValid(key) {
    const cachedItem = this.cache.get(key);
    if (!cachedItem) return false;
    
    const now = Date.now();
    return now - cachedItem.timestamp < this.cacheExpiry;
  }
  
  /**
   * 获取缓存数据
   * @param {string} key - 缓存键
   * @returns {any} 缓存数据或null
   */
  getCache(key) {
    if (this.isCacheValid(key)) {
      return this.cache.get(key).data;
    }
    this.cache.delete(key);
    return null;
  }
  
  /**
   * 设置缓存数据
   * @param {string} key - 缓存键
   * @param {any} data - 数据
   */
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  
  /**
   * 清除缓存
   * @param {string} key - 缓存键，不传则清除所有缓存
   */
  clearCache(key) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
  
  /**
   * 错误代码映射
   * @param {number} code - 错误代码
   * @returns {string} 友好的错误提示
   */
  mapErrorCode(code) {
    const errorMap = {
      401: '未授权，请重新登录',
      403: '权限不足',
      404: '资源不存在',
      400: '请求参数错误',
      500: '服务器内部错误',
      // 业务错误代码
      1001: '灵石不足',
      1002: '境界不够',
      1003: '背包已满',
      1004: '任务条件未满足',
      1005: '物品不存在',
      1006: '操作失败'
    };
    
    return errorMap[code] || `操作失败（错误码：${code}）`;
  }
  
  /**
   * 统一的API请求方法
   * @param {string} endpoint - API端点
   * @param {object} options - 请求选项
   * @returns {Promise<any>} API响应数据
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const method = options.method || 'GET';
    const params = options.params || {};
    
    // 生成缓存键（仅对 GET 请求使用缓存）
    const cacheKey = method === 'GET' ? this.generateCacheKey(endpoint, params) : null;
    
    // 检查是否有正在进行的相同请求
    const requestKey = `${method}:${endpoint}`;
    if (this.requestQueue.has(requestKey)) {
      return this.requestQueue.get(requestKey);
    }
    
    // 检查缓存（仅对 GET 请求，但排除 cultivation/next-realm）
    const skipCache = endpoint.includes('/cultivation/next-realm');
    if (method === 'GET' && cacheKey && !skipCache) {
      const cachedData = this.getCache(cacheKey);
      if (cachedData) {
        console.log('使用缓存数据:', cacheKey);
        return cachedData;
      }
    }
    
    // 构建请求配置
    const token = window.TokenUtils ? window.TokenUtils.get() : localStorage.getItem('token') || (window.store && window.store.getState().user.token) || (localStorage.getItem('adminSession') ? JSON.parse(localStorage.getItem('adminSession')).token : '');
    
    const requestConfig = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers
      },
      ...options
    };
    
    // 处理查询参数
    let finalUrl = url;
    if (method === 'GET' && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params);
      finalUrl = `${url}?${searchParams.toString()}`;
    }
    
    // 处理请求体
    if (options.body && typeof options.body === 'object') {
      requestConfig.body = JSON.stringify(options.body);
    }
    
    // 创建请求Promise
    const requestPromise = this.fetchWithRetry(finalUrl, requestConfig)
      .then(response => {
        // 从请求队列中移除
        this.requestQueue.delete(requestKey);
        return response;
      })
      .catch(error => {
        // 从请求队列中移除
        this.requestQueue.delete(requestKey);
        throw error;
      });
    
    // 添加到请求队列
    this.requestQueue.set(requestKey, requestPromise);
    
    return requestPromise;
  }
  
  /**
   * 带重试机制的fetch
   * @param {string} url - 请求URL
   * @param {object} options - 请求选项
   * @param {number} retryCount - 重试次数
   * @returns {Promise<any>} API响应数据
   */
  async fetchWithRetry(url, options, retryCount = 2) {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP 错误！状态码：${response.status}`);
      }
      
      const data = await response.json();
      
      // 处理API错误
      if (data.code && data.code !== 200) {
        const errorMessage = this.mapErrorCode(data.code);
        this.logError(data.code, errorMessage, url);
        throw new Error(errorMessage);
      }
      
      // 缓存GET请求的响应
      if (options.method === 'GET') {
        const cacheKey = this.generateCacheKey(url.replace(this.baseURL, ''), options.params || {});
        this.setCache(cacheKey, data.data || data);
      }
      
      return data.data || data;
    } catch (error) {
      if (retryCount > 0 && (error.message.includes('网络错误') || error.message.includes('500'))) {
        console.log(`请求失败，重试 ${retryCount} 次...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.fetchWithRetry(url, options, retryCount - 1);
      }
      
      // 记录错误
      this.logError(0, error.message, url);
      throw error;
    }
  }
  
  /**
   * 记录错误日志
   * @param {number} code - 错误代码
   * @param {string} message - 错误消息
   * @param {string} url - 请求URL
   */
  logError(code, message, url) {
    console.error(`API错误 [${code}]: ${message}`, url);
    
    // 这里可以添加错误日志上报逻辑
    // 例如：发送错误信息到监控平台
    // sendErrorToMonitoring(code, message, url);
  }
  
  // 便捷方法
  async get(endpoint, params = {}) {
    return this.request(endpoint, { method: 'GET', params });
  }
  
  async post(endpoint, data = {}) {
    return this.request(endpoint, { method: 'POST', body: data });
  }
  
  async put(endpoint, data = {}) {
    return this.request(endpoint, { method: 'PUT', body: data });
  }
  
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// 创建全局拦截器实例
window.apiInterceptor = new ApiInterceptor();

// 创建增强版apiService，合并api-service.js和api-interceptor.js的方法
window.apiService = {
  // 通用方法（使用拦截器）
  get: (endpoint, params) => window.apiInterceptor.get(endpoint, params),
  post: (endpoint, data) => window.apiInterceptor.post(endpoint, data),
  put: (endpoint, data) => window.apiInterceptor.put(endpoint, data),
  delete: (endpoint) => window.apiInterceptor.delete(endpoint),
  
  // 用户相关 API
  async getUserProfile(roleId) {
    return this.get(`/role/${roleId}`);
  },
  
  async getUserInfo(userId) {
    return this.get(`/auth/user/${userId}`);
  },
  
  // 角色相关 API
  async getRole(userId) {
    return this.get(`/role/user/${userId}`);
  },
  
  async getRoleById(roleId) {
    return this.get(`/role/${roleId}`);
  },
  
  // 修炼相关 API
  async getCultivationStatus(roleId) {
    return this.get(`/cultivation/status/${roleId}`);
  },
  
  async cultivate(roleId, partId, qteScore) {
    return this.post(`/body-cultivation/role/${roleId}/cultivate`, { partId, qteScore });
  },
  
  async breakthrough(roleId, useMedicine = false) {
    return this.post(`/body-cultivation/role/${roleId}/breakthrough`, { useMedicine });
  },
  
  // 锻体相关 API
  async getBodyCultivation(roleId) {
    return this.get(`/body-cultivation/role/${roleId}`);
  },
  
  async getBodyCultivationInfo(roleId) {
    return this.get(`/body-cultivation/role/${roleId}`);
  },
  
  async bodyTrain(roleId, bodyPart) {
    return this.post('/body-training/start', { roleId, bodyPart });
  },
  
  async bodyBreakthrough(roleId) {
    return this.post(`/body-training/${roleId}/breakthrough`);
  },
  
  // 角色信息相关 API
  async getRoleInfo(roleId) {
    return this.get(`/role/${roleId}`);
  },
  
  async getRoleResources(roleId) {
    return this.get(`/resource/role/${roleId}`);
  },
  
  // 任务相关 API
  async getTasks(roleId) {
    return this.get(`/enhanced-task/role/${roleId}`);
  },
  
  async acceptTask(roleId, taskId) {
    return this.post('/enhanced-task/accept', { roleId, taskId });
  },
  
  async claimTaskReward(roleId, taskId) {
    return this.post(`/enhanced-task/claim/${roleId}/${taskId}`);
  },
  
  // 背包相关 API
  async getInventory(roleId) {
    return this.get(`/inventory/${roleId}`);
  },
  
  async useItem(roleId, itemId, count = 1) {
    return this.post('/inventory/use', { roleId, itemId, count });
  },
  
  async getEquipmentStats(roleId) {
    return this.get(`/equipment/stats/${roleId}`);
  },
  
  async getEquippedItems(roleId) {
    return this.get(`/equipment/equipped/${roleId}`);
  },
  
  async equipItem(roleId, roleAssetId) {
    return this.post('/equipment/equip', { roleId, roleAssetId });
  },
  
  async equipByEquipmentId(roleId, roleEquipmentId) {
    return this.post(`/equipment/equip-by-equipment?roleId=${roleId}&roleEquipmentId=${roleEquipmentId}`, {});
  },
  
  async unequipItem(roleId, slot) {
    return this.post(`/equipment/unequip?roleId=${roleId}&slot=${slot}`, {});
  },
  
  // 技能相关 API
  async getAllSkills() {
    return this.get('/skill');
  },
  
  async getRoleSkills(roleId) {
    return this.get(`/role-skill/role/${roleId}`);
  },
  
  // 资产相关 API
  async getAssets(roleId) {
    return this.get(`/role-asset/${roleId}`);
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
  
  async getRoleBaseStats(roleId) {
    return this.get(`/role-stats/base/${roleId}`);
  },
  
  async updateRoleBaseStats(roleId, stats) {
    return this.post(`/role-stats/base/${roleId}`, stats);
  },
  
  // 宗门相关 API
  async getClans() {
    return this.get('/clan');
  },

  async getClanDetail(clanId) {
    return this.get(`/clan/${clanId}`);
  },

  async applyJoinClan(roleId, clanId, message) {
    return this.post('/clan/apply/join', { roleId, clanId, message });
  },

  async getClanApplyList(clanId, status) {
    return this.get(`/clan/apply/list/${clanId}`, { status });
  },

  async processApply(applyId, status, handlerId) {
    return this.post('/clan/apply/process', { applyId, status, handlerId });
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

  async getClanMembers(clanId) {
    return this.get(`/clan/${clanId}/members`);
  },

  async getClanChatMessages(clanId, page = 1, size = 50) {
    return this.get(`/clan/chat/${clanId}`, { page, size });
  },

  async sendClanChatMessage(clanId, roleId, roleName, message) {
    return this.post('/clan/chat/send', { clanId, roleId, roleName, message });
  },

  async getClanShopItems(clanId) {
    return this.get(`/clan/shop/${clanId}`);
  },

  async buyClanItem(clanId, roleId, itemId, count) {
    return this.post('/clan/shop/buy', { clanId, roleId, itemId, count });
  },

  async getClanTasks(clanId, roleId = null) {
    const params = {};
    if (roleId) params.roleId = roleId;
    return this.get(`/clan/tasks/${clanId}`, params);
  },

  async acceptClanTask(clanId, roleId, taskId) {
    return this.post('/clan/task/accept', { clanId, roleId, taskId });
  },

  async submitClanTask(clanId, roleId, taskId) {
    return this.post('/clan/task/submit', { clanId, roleId, taskId });
  },

  async getClanBuildings(clanId) {
    return this.get(`/clan/buildings/${clanId}`);
  },

  async upgradeClanBuilding(clanId, roleId, buildingId) {
    return this.post('/clan/building/upgrade', { clanId, roleId, buildingId });
  },
  
  // 地图探索相关 API
  async getMapRegions() {
    return this.get('/map/regions');
  },
  
  async getScenes(regionId) {
    return this.get(`/map/${regionId}/scenes`);
  },
  
  // 交易相关 API
  async getTradeItems(category = null) {
    const endpoint = category ? `/trade/items?category=${category}` : '/trade/items';
    return this.get(endpoint);
  },
  
  // 拍卖行相关 API
  async getAuctions(page = 1, size = 20) {
    return this.get(`/auction?pageSize=${size}&pageNum=${page}`);
  },
  
  // 限时商店相关 API
  async getLimitedShop() {
    return this.get('/limited-shop');
  },
  
  // 邮件相关 API
  async getMail(userId) {
    return this.get(`/mail/user/${userId}`);
  },
  
  // 其他 API
  async getNews() {
    return this.get('/activity/status/active');
  },
  
  async getStatistics() {
    return this.get('/stats');
  },
  
  // 配置相关 API
  async getConfig(configKey) {
    return this.get(`/stats/configs/${configKey}`);
  },
  
  async getAllConfigs() {
    return this.get(`/stats/configs`);
  },
  
  // 角色详细信息 API
  async getRoleDetail(roleId) {
    return this.get(`/role/detail/${roleId}`);
  },
  
  // 角色排名 API
  async getRoleRank(roleId) {
    return this.get(`/role/rank/${roleId}`);
  },
  
  // 角色装备 API
  async getRoleEquipment(roleId) {
    return this.get(`/equipment/role/${roleId}`);
  },
  
  // 装备操作 API
  async autoEquip(roleId) {
    return this.post('/equipment/auto-equip', { roleId });
  },
  
  async unequipAll(roleId) {
    return this.post('/equipment/unequip-all', { roleId });
  },
  
  // 背包操作 API
  async organizeBag(roleId) {
    return this.post('/inventory/organize', { roleId });
  },
  
  async expandBag(roleId, stones) {
    return this.post('/inventory/expand', { roleId, stones });
  }
};

// api-service.js后加载时，自动合并其方法到apiService
window._mergeApiServiceMethods = function(serviceObj) {
  if (!serviceObj || typeof serviceObj !== 'object') return;
  const currentMethods = Object.keys(window.apiService);
  Object.getOwnPropertyNames(serviceObj).forEach(name => {
    if (typeof serviceObj[name] === 'function' && !currentMethods.includes(name)) {
      window.apiService[name] = serviceObj[name].bind(serviceObj);
    }
  });
};