/**
 * 登录状态管理工具
 * 处理 Token 过期、重新登录等场景
 */

window.LoginManager = {
  // 是否正在处理登录状态
  isProcessing: false,
  
  // 已显示的提示次数（防止重复提示）
  warningCount: 0,
  
  /**
   * 处理 401 错误
   * @param {Error} error - 错误对象
   * @param {Function} onConfirm - 确认回调（重新登录）
   * @param {Function} onCancel - 取消回调（清除数据）
   */
  handle401Error(error, onConfirm, onCancel) {
    if (this.isProcessing) {
      return;
    }
    
    this.isProcessing = true;
    this.warningCount++;
    
    console.warn('登录状态失效:', error.message);
    
    // 检查当前页面是否在登录页
    if (window.location.pathname.includes('login.html')) {
      this.isProcessing = false;
      return;
    }
    
    // 不显示弹窗，只记录日志
    console.log('401 错误：登录已过期，但不显示弹窗');
    
    // 直接执行确认回调（如果有）
    if (onConfirm) {
      this.isProcessing = false;
      onConfirm();
    } else {
      this.isProcessing = false;
    }
  },
  
  /**
   * 显示重新登录对话框
   */
  showReloginDialog(onConfirm, onCancel) {
    // 检查是否有 uiUtils
    if (window.uiUtils && typeof window.uiUtils.showConfirm === 'function') {
      uiUtils.showConfirm(
        '登录已过期',
        '您的登录状态已过期，需要重新登录。',
        '立即登录',
        '稍后再说',
        () => {
          this.isProcessing = false;
          if (onConfirm) onConfirm();
          else this.redirectToLogin();
        },
        () => {
          this.isProcessing = false;
          // 取消按钮不执行任何操作，只是关闭对话框
          // 不清除数据，让用户可以继续使用当前页面
          console.log('用户选择稍后再说，保留当前数据');
          if (onCancel) onCancel();
        }
      );
    } else {
      // 如果没有 uiUtils，使用浏览器原生 confirm
      const result = confirm(
        '登录已过期，需要重新登录。\n\n点击"确定"立即登录，点击"取消"保留当前数据。'
      );
      
      this.isProcessing = false;
      
      if (result) {
        if (onConfirm) onConfirm();
        else this.redirectToLogin();
      } else {
        // 取消按钮不执行任何操作
        console.log('用户选择保留数据');
        if (onCancel) onCancel();
      }
    }
  },
  
  /**
   * 跳转到登录页面
   */
  redirectToLogin() {
    console.log('跳转到登录页面');
    // 保存当前页面路径，登录后可以返回
    localStorage.setItem('redirectAfterLogin', window.location.pathname);
    window.location.href = '/login.html';
  },
  
  /**
   * 清除数据并跳转
   */
  clearAndRedirect() {
    console.log('清除登录数据');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('currentRoleId');
    localStorage.removeItem('currentUserId');
    
    // 跳转到清除工具页面或登录页面
    window.location.href = '/clear-token.html';
  },
  
  /**
   * 检查登录状态
   * @returns {boolean} - 是否已登录
   */
  isLoggedIn() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    return !!(token && userId);
  },
  
  /**
   * 验证 Token 是否有效
   * @returns {Promise<boolean>} - Token 是否有效
   */
  async validateToken() {
    const token = this.getToken();
    const userId = this.getCurrentUserId();
    
    if (!token || !userId) {
      console.warn('Token 或用户 ID 不存在');
      return false;
    }
    
    try {
      // 调用一个简单的需要认证的接口来验证 token
      const baseUrl = typeof window.getApiBaseHost === 'function' ? window.getApiBaseHost() : (window.APP_CONFIG?.API_BASE_URL || 'http://localhost:8088');
      const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
      const response = await fetch(`${apiUrl}/role/user/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        },
        credentials: 'include',
        mode: 'cors'
      });
      
      if (response.ok) {
        console.log('Token 验证成功');
        return true;
      } else if (response.status === 401) {
        console.warn('Token 已过期或无效');
        return false;
      } else {
        console.warn('Token 验证失败，状态码:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Token 验证请求失败:', error);
      return false;
    }
  },
  
  /**
   * 获取当前用户 ID
   * @returns {string|null} - 用户 ID
   */
  getCurrentUserId() {
    return localStorage.getItem('userId');
  },
  
  /**
   * 获取当前 Token
   * @returns {string|null} - Token
   */
  getToken() {
    return localStorage.getItem('token');
  },
  
  /**
   * 设置登录信息
   * @param {Object} data - 登录数据
   */
  setLoginInfo(data) {
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    if (data.userId) {
      localStorage.setItem('userId', data.userId);
    }
    if (data.username) {
      localStorage.setItem('username', data.username);
    }
    
    console.log('登录信息已保存');
  },
  
  /**
   * 清除登录信息
   */
  clearLoginInfo() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('currentRoleId');
    localStorage.removeItem('currentUserId');
    
    console.log('登录信息已清除');
  },
  
  /**
   * 重置处理状态（用于调试）
   */
  reset() {
    this.isProcessing = false;
    this.warningCount = 0;
  }
};

// 导出到全局
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.LoginManager;
}
