/**
 * 用户认证与信息服务
 * 
 * 功能：
 * 1. 统一的 Token 管理和验证
 * 2. 自动获取和刷新用户信息
 * 3. 登录状态检查和跳转
 * 4. API 请求的统一拦截处理
 * 5. 带认证的 GET/POST/PUT/DELETE 快捷方法
 */

window.AuthService = {
  API_BASE: (function() {
    if (typeof window.getApiBaseHost === 'function') {
      return window.getApiBaseHost();
    }
    const hostname = window.location.hostname;
    if (hostname.match(/^192\.168\./) || hostname.match(/^10\./) || hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) {
      return `http://${hostname}:8088`;
    }
    if (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) {
      return window.APP_CONFIG.API_BASE_URL.replace(/\/api$/, '');
    }
    return 'http://localhost:8088';
  })(),
  
  currentUser: null,
  
  options: {
    requireAuth: true,
    autoRefresh: true,
    redirectOnAuthFail: true
  },
  
  init(options = {}) {
    this.options = {
      requireAuth: true,
      autoRefresh: true,
      redirectOnAuthFail: true,
      ...options
    };
    
    if (this.options.requireAuth && !this.checkAuth()) {
      return;
    }
    
    if (this.options.autoRefresh) {
      this.loadUserInfo();
    }
  },
  
  getToken() {
    return localStorage.getItem('token') || '';
  },
  
  getCurrentRoleId() {
    return localStorage.getItem('currentRoleId') || 
           localStorage.getItem('roleId') || 
           localStorage.getItem('selectedCharacterId') || '';
  },
  
  checkAuth() {
    const token = this.getToken();
    
    if (!token) {
      console.warn('AuthService: 未检测到登录 Token');
      if (this.options.redirectOnAuthFail) {
        this.redirectToLogin();
      }
      return false;
    }
    
    return true;
  },
  
  /**
   * 构建带认证的 headers
   */
  authHeaders(extraHeaders = {}) {
    const token = this.getToken();
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
      ...extraHeaders
    };
  },
  
  /**
   * 带认证的 GET 请求
   */
  async get(url, extraHeaders = {}) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.authHeaders(extraHeaders)
      });
      
      if (response.status === 401) {
        this.handleAuthFail();
        return null;
      }
      
      return response;
    } catch (error) {
      console.error('AuthService GET 失败:', error);
      throw error;
    }
  },
  
  /**
   * 带认证的 POST 请求
   */
  async post(url, body = {}, extraHeaders = {}) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.authHeaders(extraHeaders),
        body: JSON.stringify(body)
      });
      
      if (response.status === 401) {
        this.handleAuthFail();
        return null;
      }
      
      return response;
    } catch (error) {
      console.error('AuthService POST 失败:', error);
      throw error;
    }
  },
  
  /**
   * 带认证的 PUT 请求
   */
  async put(url, body = {}, extraHeaders = {}) {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.authHeaders(extraHeaders),
        body: JSON.stringify(body)
      });
      
      if (response.status === 401) {
        this.handleAuthFail();
        return null;
      }
      
      return response;
    } catch (error) {
      console.error('AuthService PUT 失败:', error);
      throw error;
    }
  },
  
  /**
   * 带认证的 DELETE 请求
   */
  async delete(url, extraHeaders = {}) {
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.authHeaders(extraHeaders)
      });
      
      if (response.status === 401) {
        this.handleAuthFail();
        return null;
      }
      
      return response;
    } catch (error) {
      console.error('AuthService DELETE 失败:', error);
      throw error;
    }
  },
  
  /**
   * 通用带认证的 fetch（兼容旧代码）
   */
  async fetch(url, options = {}) {
    const mergedOptions = {
      ...options,
      headers: {
        ...this.authHeaders(),
        ...(options.headers || {})
      }
    };
    
    if (mergedOptions.body && typeof mergedOptions.body === 'object') {
      mergedOptions.body = JSON.stringify(mergedOptions.body);
    }
    
    try {
      const response = await fetch(url, mergedOptions);
      
      if (response.status === 401) {
        this.handleAuthFail();
        return null;
      }
      
      return response;
    } catch (error) {
      console.error('AuthService fetch 失败:', error);
      throw error;
    }
  },
  
  /**
   * 加载用户信息
   */
  async loadUserInfo() {
    try {
      const roleId = this.getCurrentRoleId();
      
      if (!roleId) {
        console.warn('AuthService: 未找到角色 ID');
        return null;
      }
      
      const response = await this.get(`${this.API_BASE}/api/role/${roleId}`);
      
      if (!response || !response.ok) {
        console.warn('AuthService: 获取角色信息失败');
        return null;
      }
      
      const data = await response.json();
      this.currentUser = data;
      
      this._dispatchUserInfoLoaded(data);
      
      return data;
    } catch (error) {
      console.error('AuthService: 加载用户信息失败', error);
      return null;
    }
  },
  
  handleAuthFail() {
    console.error('AuthService: 认证失败');
    
    if (window.TokenManager) {
      window.TokenManager.clearToken();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('roleId');
      localStorage.removeItem('currentRoleId');
    }
    
    if (this.options.redirectOnAuthFail) {
      this.redirectToLogin();
    }
  },
  
  redirectToLogin() {
    const currentPath = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/login.html?redirect=${currentPath}`;
  },
  
  getUserInfo() {
    return this.currentUser;
  },
  
  onUserInfoLoaded(callback) {
    if (this.currentUser) {
      callback(this.currentUser);
    } else {
      window.addEventListener('user-info-loaded', (e) => {
        callback(e.detail);
      }, { once: true });
    }
  },
  
  _dispatchUserInfoLoaded(userInfo) {
    const event = new CustomEvent('user-info-loaded', { detail: userInfo });
    window.dispatchEvent(event);
  }
};

console.log('✅ AuthService 已加载');
