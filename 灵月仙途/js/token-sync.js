/**
 * Token 同步管理器 - 解决多模块 token 不一致问题
 * 
 * 功能：
 * 1. 统一所有 token 管理模块的存储键名
 * 2. 在页面跳转前自动同步 token 到所有存储位置
 * 3. 监控 token 变化，自动修复不一致
 */
(function() {
  'use strict';
  
  // 统一的存储键名
  const STORAGE_KEYS = {
    TOKEN: 'token',
    USER_ID: 'userId',
    USERNAME: 'username',
    ROLE_ID: 'roleId',
    CURRENT_ROLE_ID: 'currentRoleId',
    BACKUP: '_token_backup_'
  };
  
  /**
   * 同步 token 到所有可能的存储位置
   */
  function syncToken() {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    const username = localStorage.getItem(STORAGE_KEYS.USERNAME);
    const roleId = localStorage.getItem(STORAGE_KEYS.ROLE_ID);
    const currentRoleId = localStorage.getItem(STORAGE_KEYS.CURRENT_ROLE_ID);
    
    // 如果没有 token，不需要同步
    if (!token) {
      console.warn('[TokenSync] 没有 token 可同步');
      return false;
    }
    
    // 确保所有相关键都存在
    if (userId) {
      // 同步到 login-manager 使用的键
      if (currentRoleId && currentRoleId !== roleId) {
        localStorage.setItem(STORAGE_KEYS.ROLE_ID, currentRoleId);
      }
    }
    
    // 创建备份
    createBackup(token, userId, roleId);
    
    console.log('[TokenSync] Token 已同步');
    return true;
  }
  
  /**
   * 创建 token 备份
   */
  function createBackup(token, userId, roleId) {
    try {
      const backupData = {
        token: token,
        userId: userId,
        roleId: roleId,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEYS.BACKUP, JSON.stringify(backupData));
    } catch (error) {
      console.error('[TokenSync] 创建备份失败:', error);
    }
  }
  
  /**
   * 从备份恢复 token
   */
  function restoreFromBackup() {
    try {
      const backupStr = localStorage.getItem(STORAGE_KEYS.BACKUP);
      if (!backupStr) return null;
      
      const backupData = JSON.parse(backupStr);
      
      // 检查备份是否过期（24 小时）
      const now = Date.now();
      const backupAge = now - backupData.timestamp;
      if (backupAge > 24 * 60 * 60 * 1000) {
        console.warn('[TokenSync] 备份数据已过期');
        localStorage.removeItem(STORAGE_KEYS.BACKUP);
        return null;
      }
      
      // 恢复 token
      if (backupData.token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, backupData.token);
        if (backupData.userId) {
          localStorage.setItem(STORAGE_KEYS.USER_ID, backupData.userId);
        }
        if (backupData.roleId) {
          localStorage.setItem(STORAGE_KEYS.ROLE_ID, backupData.roleId);
        }
        console.log('[TokenSync] 从备份恢复 token 成功');
        return backupData.token;
      }
      
      return null;
    } catch (error) {
      console.error('[TokenSync] 从备份恢复失败:', error);
      return null;
    }
  }
  
  /**
   * 检查并修复 token 不一致
   */
  function checkAndFix() {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    const roleId = localStorage.getItem(STORAGE_KEYS.ROLE_ID);
    const currentRoleId = localStorage.getItem(STORAGE_KEYS.CURRENT_ROLE_ID);
    
    // 情况 1: 有 userId/roleId 但没有 token
    if (!token && (userId || currentRoleId)) {
      console.warn('[TokenSync] 检测到数据不一致：有 userId/roleId 但没有 token');
      const restored = restoreFromBackup();
      return !!restored;
    }
    
    // 情况 2: roleId 和 currentRoleId 不一致
    if (roleId && currentRoleId && roleId !== currentRoleId) {
      console.warn('[TokenSync] roleId 和 currentRoleId 不一致');
      // 优先使用 currentRoleId
      localStorage.setItem(STORAGE_KEYS.ROLE_ID, currentRoleId);
    }
    
    // 情况 3: 有 token 但没有 userId
    if (token && !userId) {
      console.warn('[TokenSync] 有 token 但没有 userId，数据不完整');
      // 尝试从 token 解析 userId
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          if (payload.userId) {
            localStorage.setItem(STORAGE_KEYS.USER_ID, payload.userId.toString());
            console.log('[TokenSync] 从 token 解析出 userId');
          }
        }
      } catch (e) {
        console.error('[TokenSync] 解析 token 失败:', e);
      }
    }
    
    return true;
  }
  
  /**
   * 页面跳转前自动同步
   */
  function setupAutoSync() {
    // 监听页面卸载事件
    window.addEventListener('beforeunload', () => {
      syncToken();
    });
    
    // 监听 storage 事件（跨标签页同步）
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEYS.TOKEN) {
        if (e.newValue) {
          console.log('[TokenSync] 检测到 token 变化（跨标签页）');
          syncToken();
        } else {
          console.warn('[TokenSync] 检测到 token 被清除（跨标签页）');
          restoreFromBackup();
        }
      }
    });
  }
  
  /**
   * 获取当前 token（统一接口）
   */
  function getToken() {
    let token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    
    if (!token) {
      console.warn('[TokenSync] 主存储中 token 不存在，尝试从备份恢复...');
      token = restoreFromBackup();
    }
    
    return token;
  }
  
  /**
   * 设置 token（统一接口）
   */
  function setToken(token, userInfo = {}) {
    if (!token) {
      console.error('[TokenSync] 不能设置空 token');
      return false;
    }
    
    // 保存到统一存储位置
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    
    if (userInfo.userId) {
      localStorage.setItem(STORAGE_KEYS.USER_ID, userInfo.userId.toString());
    }
    if (userInfo.username) {
      localStorage.setItem(STORAGE_KEYS.USERNAME, userInfo.username);
    }
    if (userInfo.roleId) {
      localStorage.setItem(STORAGE_KEYS.ROLE_ID, userInfo.roleId.toString());
    }
    
    // 同步到 backup
    createBackup(token, userInfo.userId, userInfo.roleId);
    
    console.log('[TokenSync] Token 已设置并同步');
    return true;
  }
  
  /**
   * 清除 token
   */
  function clearToken() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_ID);
    localStorage.removeItem(STORAGE_KEYS.USERNAME);
    localStorage.removeItem(STORAGE_KEYS.ROLE_ID);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_ROLE_ID);
    localStorage.removeItem(STORAGE_KEYS.BACKUP);
    console.log('[TokenSync] Token 已清除');
  }
  
  // 初始化
  function init() {
    console.log('[TokenSync] 初始化...');
    checkAndFix();
    setupAutoSync();
    
    // 页面加载时检查
    window.addEventListener('load', () => {
      const token = getToken();
      console.log('[TokenSync] 页面加载完成，当前 token:', token ? '存在' : '不存在');
    });
  }
  
  // 导出到全局
  window.TokenSync = {
    sync: syncToken,
    get: getToken,
    set: setToken,
    clear: clearToken,
    checkAndFix: checkAndFix,
    init: init
  };
  
  // 自动初始化
  init();
  
  console.log('[TokenSync] 已加载并初始化');
})();
