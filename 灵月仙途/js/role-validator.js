/**
 * 角色验证工具
 * 确保所有页面使用用户登录后选择的角色
 */
window.RoleValidator = {
  /**
   * 获取当前角色 ID
   * 优先使用 currentRoleId，其次使用 roleId
   * @returns {string|null} 角色 ID 或 null
   */
  getRoleId() {
    const roleId = localStorage.getItem('currentRoleId') || localStorage.getItem('roleId');
    return (roleId && roleId !== 'undefined' && roleId !== 'null') ? roleId : null;
  },

  /**
   * 获取当前用户 ID
   * @returns {string|null} 用户 ID 或 null
   */
  getUserId() {
    const userId = localStorage.getItem('userId');
    return (userId && userId !== 'undefined' && userId !== 'null') ? userId : null;
  },

  /**
   * 验证用户是否已登录
   * @returns {boolean} 是否已登录
   */
  isLoggedIn() {
    return !!this.getUserId();
  },

  /**
   * 验证是否有角色
   * @returns {boolean} 是否有角色
   */
  hasRole() {
    return !!this.getRoleId();
  },

  /**
   * 验证用户和角色
   * 如果没有登录或没有角色，会自动跳转到相应页面
   * @param {string} redirectType - 重定向类型：'login' | 'character' | 'auto'
   * @returns {string|null} 角色 ID，如果验证失败则返回 null
   */
  validate(redirectType = 'auto') {
    // 检查是否已登录
    if (!this.isLoggedIn()) {
      if (redirectType === 'login' || redirectType === 'auto') {
        this.redirectToLogin('请先登录！');
      }
      return null;
    }

    // 检查是否有角色
    const roleId = this.getRoleId();
    if (!roleId) {
      if (redirectType === 'character' || redirectType === 'auto') {
        this.redirectToCharacter('请先选择角色！');
      }
      return null;
    }

    return roleId;
  },

  /**
   * 跳转到登录页
   * @param {string} message - 提示信息
   */
  redirectToLogin(message) {
    if (message) {
      this.showToast(message);
    }
    setTimeout(() => {
      window.location.href = '../login.html';
    }, 1000);
  },

  /**
   * 跳转到角色选择页
   * @param {string} message - 提示信息
   */
  redirectToCharacter(message) {
    if (message) {
      this.showToast(message);
    }
    setTimeout(() => {
      window.location.href = '../character/character.html';
    }, 1500);
  },

  /**
   * 显示提示消息
   * @param {string} message - 消息内容
   * @param {string} type - 消息类型：'error' | 'info' | 'success'
   */
  showToast(message, type = 'error') {
    // 尝试使用 window.showToast
    if (typeof window.showToast === 'function') {
      window.showToast(message, type);
    }
    // 尝试使用 ErrorHandler
    else if (window.ErrorHandler && typeof window.ErrorHandler.showToast === 'function') {
      window.ErrorHandler.showToast(message, type);
    }
    // 使用 alert 作为后备
    else {
      alert(message);
    }
  },

  /**
   * 设置当前角色 ID
   * @param {string} roleId - 角色 ID
   */
  setRoleId(roleId) {
    localStorage.setItem('currentRoleId', roleId);
    localStorage.setItem('roleId', roleId);
    if (window.APP_CONFIG) {
      window.APP_CONFIG.currentRoleId = roleId;
    }
  }
};
