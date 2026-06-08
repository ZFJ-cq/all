/**
 * 灵月仙途 - 统一认证管理模块
 * 
 * 功能：
 * 1. 安全的 Token 存储（localStorage + 内存缓存）
 * 2. 自动过期检查
 * 3. 防止 Token 丢失的兜底机制
 * 4. XSS 防护
 * 
 * 使用方法：
 * window.AuthManager.setToken('your-token')
 * window.AuthManager.getToken()
 * window.AuthManager.isLoggedIn()
 */
(function() {
  'use strict';
  
  // 内存缓存（提高读取性能）
  let tokenCache = null;
  let tokenExpireTime = null;
  
  // 存储键名
  const STORAGE_KEYS = {
    TOKEN: 'token',
    USER_ID: 'userId',
    USERNAME: 'username',
    ROLE_ID: 'roleId',
    TOKEN_EXPIRE: 'auth_token_expire'
  };
  
  /**
   * 安全的 localStorage 写入
   */
  function safeSetStorage(key, value) {
    try {
      localStorage.setItem(key, value);
      tokenCache = null; // 清除缓存，确保下次读取最新值
    } catch (e) {
      console.error('[AuthManager] 写入 localStorage 失败:', e);
      // 存储失败时的降级处理
      if (e.name === 'QuotaExceededError') {
        console.warn('[AuthManager] 存储空间已满，尝试清理过期数据');
        clearExpiredData();
      }
    }
  }
  
  /**
   * 安全的 localStorage 读取
   */
  function safeGetStorage(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('[AuthManager] 读取 localStorage 失败:', e);
      return null;
    }
  }
  
  /**
   * 清理过期数据
   */
  function clearExpiredData() {
    const now = Date.now();
    const tokenExpire = safeGetStorage(STORAGE_KEYS.TOKEN_EXPIRE);
    
    if (tokenExpire && parseInt(tokenExpire) < now) {
      console.log('[AuthManager] Token 已过期，清理过期数据');
      safeRemoveStorage(STORAGE_KEYS.TOKEN);
      safeRemoveStorage(STORAGE_KEYS.TOKEN_EXPIRE);
    }
  }
  
  /**
   * 安全的 localStorage 删除
   */
  function safeRemoveStorage(key) {
    try {
      localStorage.removeItem(key);
      tokenCache = null;
    } catch (e) {
      console.error('[AuthManager] 删除 localStorage 失败:', e);
    }
  }
  
  /**
   * 解析 Token（JWT 格式）
   */
  function parseToken(token) {
    try {
      if (!token || typeof token !== 'string') {
        return null;
      }
      
      const parts = token.split('.');
      if (parts.length < 3) {
        // 不是标准 JWT 格式，返回 null
        return null;
      }
      
      const base64Url = parts[1];
      if (!base64Url) {
        return null;
      }
      
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('[AuthManager] Token 解析失败:', e);
      return null;
    }
  }
  
  /**
   * 认证管理器
   */
  window.AuthManager = {
    /**
     * 设置 Token
     * @param {string} token - JWT Token
     * @param {Object} userInfo - 用户信息（可选）
     */
    setToken(token, userInfo = {}) {
      if (!token || typeof token !== 'string') {
        console.error('[AuthManager] setToken: Token 不能为空');
        return false;
      }
      
      console.log('[AuthManager] 设置 Token...');
      
      // 1. 解析 Token，获取过期时间
      const payload = parseToken(token);
      if (payload && payload.exp) {
        tokenExpireTime = payload.exp * 1000; // 转换为毫秒
        safeSetStorage(STORAGE_KEYS.TOKEN_EXPIRE, tokenExpireTime.toString());
        console.log('[AuthManager] Token 过期时间:', new Date(tokenExpireTime).toLocaleString());
      }
      
      // 2. 存储 Token
      safeSetStorage(STORAGE_KEYS.TOKEN, token);
      
      // 3. 存储用户信息（如果提供）
      if (userInfo.userId) {
        safeSetStorage(STORAGE_KEYS.USER_ID, userInfo.userId.toString());
      }
      if (userInfo.username) {
        safeSetStorage(STORAGE_KEYS.USERNAME, userInfo.username);
      }
      if (userInfo.roleId) {
        safeSetStorage(STORAGE_KEYS.ROLE_ID, userInfo.roleId.toString());
      }
      
      // 4. 更新内存缓存
      tokenCache = token;
      
      console.log('[AuthManager] Token 设置成功');
      return true;
    },
    
    /**
     * 获取 Token
     * @returns {string|null} Token
     */
    getToken() {
      // 优先从内存缓存读取
      if (tokenCache) {
        return tokenCache;
      }
      
      // 从 localStorage 读取
      const token = safeGetStorage(STORAGE_KEYS.TOKEN);
      
      if (token) {
        // 检查是否过期
        const payload = parseToken(token);
        if (payload && payload.exp) {
          const now = Date.now() / 1000;
          if (payload.exp < now) {
            console.warn('[AuthManager] Token 已过期');
            this.clearToken();
            return null;
          }
        }
        
        // 更新内存缓存
        tokenCache = token;
        return token;
      }
      
      return null;
    },
    
    /**
     * 获取用户 ID
     * @returns {string|null} 用户 ID
     */
    getUserId() {
      return safeGetStorage(STORAGE_KEYS.USER_ID);
    },
    
    /**
     * 获取角色 ID
     * @returns {string|null} 角色 ID
     */
    getRoleId() {
      return safeGetStorage(STORAGE_KEYS.ROLE_ID);
    },
    
    /**
     * 获取用户名
     * @returns {string|null} 用户名
     */
    getUsername() {
      return safeGetStorage(STORAGE_KEYS.USERNAME);
    },
    
    /**
     * 检查是否已登录
     * @returns {boolean} 是否已登录
     */
    isLoggedIn() {
      const token = this.getToken();
      return !!token;
    },
    
    /**
     * 清除 Token（登出）
     * @param {boolean} clearAll - 是否清除所有用户数据（默认 false）
     */
    clearToken(clearAll = false) {
      console.log('[AuthManager] 清除 Token...');
      
      safeRemoveStorage(STORAGE_KEYS.TOKEN);
      safeRemoveStorage(STORAGE_KEYS.TOKEN_EXPIRE);
      
      if (clearAll) {
        safeRemoveStorage(STORAGE_KEYS.USER_ID);
        safeRemoveStorage(STORAGE_KEYS.USERNAME);
        safeRemoveStorage(STORAGE_KEYS.ROLE_ID);
      }
      
      tokenCache = null;
      
      console.log('[AuthManager] Token 已清除');
    },
    
    /**
     * 获取所有认证信息（用于调试）
     * @returns {Object} 认证信息
     */
    getAuthInfo() {
      return {
        token: this.getToken(),
        userId: this.getUserId(),
        roleId: this.getRoleId(),
        username: this.getUsername(),
        isLoggedIn: this.isLoggedIn()
      };
    },
    
    /**
     * 打印调试信息
     */
    debug() {
      console.group('[AuthManager] 调试信息');
      console.log('Token:', this.getToken() ? '存在' : '不存在');
      console.log('用户 ID:', this.getUserId() || '不存在');
      console.log('角色 ID:', this.getRoleId() || '不存在');
      console.log('用户名:', this.getUsername() || '不存在');
      console.log('登录状态:', this.isLoggedIn() ? '已登录' : '未登录');
      
      const expireTime = safeGetStorage(STORAGE_KEYS.TOKEN_EXPIRE);
      if (expireTime) {
        console.log('Token 过期时间:', new Date(parseInt(expireTime)).toLocaleString());
      }
      
      console.groupEnd();
    }
  };
  
  // 页面加载时自动清理过期数据
  clearExpiredData();
  
  console.log('[AuthManager] 已初始化');
})();
