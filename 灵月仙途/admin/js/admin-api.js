/**
 * 灵月仙途 - 后台管理 API 统一拦截器
 * 功能：
 * 1. 统一 JWT/Session 认证
 * 2. 自动注入管理员 ID 与权限标识
 * 3. 统一错误处理与业务异常映射
 * 4. 自动记录操作日志上下文
 */

window.AdminAPI = (function() {
  // 管理员会话信息
  let adminSession = {
    adminId: null,
    username: null,
    token: null,
    permissions: [],
    loginTime: null
  };

  // API 基础路径
  const API_BASE_URL = 'http://localhost:8088/api/admin';
  
  // 不需要认证的路径
  const PUBLIC_PATHS = ['/login'];

  /**
   * 初始化 - 从本地存储加载会话
   */
  function init() {
    const storedSession = localStorage.getItem('adminSession');
    if (storedSession) {
      try {
        adminSession = JSON.parse(storedSession);
        console.log('AdminAPI: 会话已恢复', adminSession.username);
      } catch (e) {
        console.error('AdminAPI: 会话解析失败', e);
        clearSession();
      }
    }
  }

  /**
   * 保存会话到本地存储
   */
  function saveSession() {
    localStorage.setItem('adminSession', JSON.stringify(adminSession));
    if (adminSession.token) {
      localStorage.setItem('adminToken', adminSession.token);
    }
    if (adminSession.adminId) {
      localStorage.setItem('adminUser', JSON.stringify({
        id: adminSession.adminId,
        username: adminSession.username
      }));
    }
  }

  /**
   * 清除会话
   */
  function clearSession() {
    adminSession = {
      adminId: null,
      username: null,
      token: null,
      permissions: [],
      loginTime: null
    };
    localStorage.removeItem('adminSession');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  }

  /**
   * 检查是否已认证
   */
  function isAuthenticated() {
    return !!adminSession.token && !!adminSession.adminId;
  }

  /**
   * 检查是否有权限
   */
  function hasPermission(permissionCode) {
    if (!adminSession.permissions) return false;
    // 超级管理员拥有所有权限
    if (adminSession.permissions.includes('ADMIN')) return true;
    return adminSession.permissions.includes(permissionCode);
  }

  /**
   * 构建请求头 - 自动注入认证信息
   */
  function buildHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...customHeaders
    };

    // 注入 JWT Token（如果存在）
    if (adminSession.token) {
      headers['Authorization'] = `Bearer ${adminSession.token}`;
    }

    // 注入管理员 ID（用于审计日志，如果存在）
    if (adminSession.adminId) {
      headers['X-Admin-ID'] = adminSession.adminId;
    }

    // 注入请求时间戳（用于追踪）
    headers['X-Request-Timestamp'] = Date.now().toString();

    return headers;
  }

  /**
   * 统一错误处理
   */
  function handleError(error, context = {}) {
    console.error('AdminAPI Error:', {
      error,
      context,
      session: adminSession
    });

    // 错误码映射
    const errorMap = {
      401: '认证失败，请重新登录',
      403: '权限不足，无法执行此操作',
      404: '请求的资源不存在',
      409: '数据冲突，可能已存在重复记录',
      422: '数据格式错误，请检查输入',
      500: '服务器内部错误，请联系技术支持',
      503: '服务暂时不可用，请稍后重试'
    };

    const status = error.status || error.code || 500;
    const message = errorMap[status] || error.message || '操作失败';

    // 401 错误自动登出
    if (status === 401) {
      clearSession();
      setTimeout(() => {
        window.location.href = '/admin/login.html';
      }, 1000);
    }

    // 显示错误提示
    if (window.showToast) {
      window.showToast(message, 'error');
    } else {
      console.error('业务错误:', message);
    }

    // 记录错误日志（用于审计）
    logOperation('ERROR', {
      error: message,
      status,
      context
    });

    return {
      success: false,
      code: status,
      message,
      originalError: error
    };
  }

  /**
   * 记录操作日志
   */
  function logOperation(operationType, data = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      adminId: adminSession.adminId,
      username: adminSession.username,
      operationType,
      data,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // 保存到本地日志队列
    let operationLogs = JSON.parse(localStorage.getItem('adminOperationLogs') || '[]');
    operationLogs.push(logEntry);
    
    // 只保留最近 100 条
    if (operationLogs.length > 100) {
      operationLogs = operationLogs.slice(-100);
    }
    
    localStorage.setItem('adminOperationLogs', JSON.stringify(operationLogs));

    // 异步发送到后端（不阻塞主流程）
    sendLogToBackend(logEntry).catch(err => {
      console.error('发送操作日志失败:', err);
    });
  }

  /**
   * 异步发送日志到后端
   */
  async function sendLogToBackend(logEntry) {
    try {
      await fetch(`${API_BASE_URL}/logs/operation`, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify(logEntry)
      });
    } catch (error) {
      console.error('发送操作日志失败:', error);
      throw error;
    }
  }

  /**
   * 统一的 GET 请求
   */
  async function get(url, options = {}) {
    return request('GET', url, null, options);
  }

  /**
   * 统一的 POST 请求
   */
  async function post(url, data, options = {}) {
    return request('POST', url, data, options);
  }

  /**
   * 统一的 PUT 请求
   */
  async function put(url, data, options = {}) {
    return request('PUT', url, data, options);
  }

  /**
   * 统一的 DELETE 请求
   */
  async function del(url, options = {}) {
    return request('DELETE', url, null, options);
  }

  /**
   * 核心请求方法
   */
  async function request(method, url, data, options = {}) {
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    
    // 检查认证（公共路径除外）
    const isPublicPath = PUBLIC_PATHS.some(path => url.includes(path));
    if (!isPublicPath && !isAuthenticated()) {
      throw new Error('未认证，请先登录');
    }

    const config = {
      method,
      headers: buildHeaders(options.headers),
      ...options
    };

    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(fullUrl, config);
      
      // 处理响应
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          status: response.status,
          message: errorData.message || response.statusText,
          code: errorData.code,
          data: errorData.data
        };
      }

      const result = await response.json();
      
      // 记录成功操作
      if (method !== 'GET') {
        logOperation('SUCCESS', {
          method,
          url: fullUrl,
          data,
          result
        });
      }

      return result;
    } catch (error) {
      return handleError(error, { method, url, data });
    }
  }

  /**
   * 登录 - 特殊处理，不需要认证
   */
  async function login(username, password) {
    try {
      const response = await fetch('http://localhost:8088/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          status: response.status,
          message: errorData.message || response.statusText
        };
      }

      const result = await response.json();
      
      if (result.code === 200 && result.data && result.data.userId) {
        // 保存会话信息
        adminSession = {
          adminId: result.data.userId,
          username: result.data.username,
          token: result.data.token, // 使用真实的JWT token
          permissions: [], // 后端暂时没有返回权限
          loginTime: new Date().toISOString()
        };
        
        saveSession();
        
        // 记录登录日志
        logOperation('LOGIN', {
          loginTime: adminSession.loginTime,
          ip: 'N/A' // 实际应该从后端获取
        });

        return { success: true, data: result.data };
      } else {
        return { success: false, message: result.message || '登录失败，返回数据格式错误' };
      }
    } catch (error) {
      return handleError(error, { method: 'LOGIN', username });
    }
  }

  /**
   * 登出
   */
  async function logout() {
    try {
      // 通知后端登出
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: buildHeaders()
      });
    } catch (error) {
      console.error('登出失败:', error);
    } finally {
      // 记录登出日志
      logOperation('LOGOUT', {
        logoutTime: new Date().toISOString()
      });
      
      clearSession();
      window.location.href = '/admin/login.html';
    }
  }

  /**
   * 获取当前会话信息
   */
  function getSession() {
    return { ...adminSession };
  }

  /**
   * 刷新权限树
   */
  async function refreshPermissions() {
    try {
      const result = await get('/auth/permissions');
      if (result && result.data) {
        adminSession.permissions = result.data.permissions || [];
        saveSession();
        return adminSession.permissions;
      }
    } catch (error) {
      console.error('刷新权限失败:', error);
    }
    return [];
  }

  // 初始化
  init();

  // 导出公共 API
  return {
    // 认证相关
    login,
    logout,
    isAuthenticated,
    hasPermission,
    getSession,
    refreshPermissions,
    
    // HTTP 方法
    get,
    post,
    put,
    delete: del,
    
    // 工具方法
    logOperation,
    buildHeaders,
    
    // 直接访问会话（只读）
    get adminId() { return adminSession.adminId; },
    get username() { return adminSession.username; },
    get permissions() { return [...adminSession.permissions]; }
  };
})();

console.log('AdminAPI 已初始化');
