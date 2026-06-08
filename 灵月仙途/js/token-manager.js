/**
 * Token 持久化管理器
 * 
 * 功能：
 * 1. 确保 Token 在页面间无缝持久化
 * 2. 自动备份和恢复 Token
 * 3. 防止 Token 意外丢失
 * 4. 提供 Token 状态监控
 */

window.TokenManager = {
  // Token 备份键名
  BACKUP_KEY: '_token_backup_',
  
  // 初始化
  init() {
    console.log('=== TokenManager 初始化 ===');
    this._checkAndRestoreToken();
    this._setupStorageMonitor();
    this._setupPageUnloadHandler();
    this._setupAutoBackup(); // 🔥 方案二：添加定时备份
  },
  
  /**
   * 保存 Token（带备份）
   */
  saveToken(token, userId, roleId) {
    if (!token) {
      console.error('TokenManager: 不能保存空 Token');
      return false;
    }
    
    try {
      // 保存到主存储
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId || '');
      localStorage.setItem('roleId', roleId || '');
      
      // 创建备份
      this._backupToken(token, userId, roleId);
      
      console.log('✅ TokenManager: Token 已保存并备份');
      return true;
    } catch (error) {
      console.error('❌ TokenManager: 保存 Token 失败', error);
      return false;
    }
  },
  
  /**
   * 获取 Token（带自动恢复）
   */
  getToken() {
    let token = localStorage.getItem('token');
    
    // 如果主存储没有，尝试从备份恢复
    if (!token) {
      console.warn('⚠️ TokenManager: 主存储中 Token 不存在，尝试从备份恢复...');
      token = this._restoreFromBackup();
    }
    
    if (token) {
      console.log('✅ TokenManager: Token 存在');
    } else {
      console.warn('⚠️ TokenManager: Token 不存在');
    }
    
    return token;
  },
  
  /**
   * 验证 Token 完整性
   */
  validateTokenIntegrity() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const roleId = localStorage.getItem('roleId');
    const currentRoleId = localStorage.getItem('currentRoleId');
    
    const status = {
      hasToken: !!token,
      hasUserId: !!userId,
      hasRoleId: !!roleId,
      hasCurrentRoleId: !!currentRoleId,
      isComplete: !!(token && userId && roleId),
      isValidFormat: this._isValidTokenFormat(token)
    };
    
    // 只在控制台输出简洁的日志
    if (status.isComplete) {
      console.log('✅ TokenManager: Token 完整');
    } else if (!status.hasToken && (status.hasUserId || status.hasRoleId)) {
      // 这种情况会在 _checkAndRestoreToken 中处理
    }
    
    return status;
  },
  
  /**
   * 清除 Token（同时清除备份）
   */
  clearToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('roleId');
    localStorage.removeItem(this.BACKUP_KEY);
    console.log('✅ TokenManager: Token 及备份已清除');
  },
  
  /**
   * 备份 Token
   */
  _backupToken(token, userId, roleId) {
    try {
      const backupData = {
        token: token,
        userId: userId,
        roleId: roleId,
        timestamp: Date.now()
      };
      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backupData));
      console.log('📦 TokenManager: Token 已备份');
    } catch (error) {
      console.error('❌ TokenManager: 备份 Token 失败', error);
    }
  },
  
  /**
   * 从备份恢复 Token
   */
  _restoreFromBackup() {
    try {
      const backupStr = localStorage.getItem(this.BACKUP_KEY);
      if (!backupStr) {
        console.log('ℹ️ TokenManager: 没有备份数据');
        return null;
      }
      
      const backupData = JSON.parse(backupStr);
      
      // 检查备份是否在 24 小时内
      const now = Date.now();
      const backupAge = now - backupData.timestamp;
      const maxAge = 24 * 60 * 60 * 1000; // 24 小时
      
      if (backupAge > maxAge) {
        console.warn('⚠️ TokenManager: 备份数据已过期（超过 24 小时）');
        localStorage.removeItem(this.BACKUP_KEY);
        return null;
      }
      
      // 恢复 Token
      if (backupData.token) {
        localStorage.setItem('token', backupData.token);
        if (backupData.userId) {
          localStorage.setItem('userId', backupData.userId);
        }
        if (backupData.roleId) {
          localStorage.setItem('roleId', backupData.roleId);
        }
        
        // 🔥 关键增强：如果没有 roleId 但有 currentRoleId，使用 currentRoleId
        const currentRoleId = localStorage.getItem('currentRoleId');
        if (!backupData.roleId && currentRoleId) {
          localStorage.setItem('roleId', currentRoleId);
          console.log('🔄 TokenManager: 使用 currentRoleId 作为 roleId');
        }
        
        console.log('✅ TokenManager: 从备份恢复 Token 成功');
        return backupData.token;
      }
      
      return null;
    } catch (error) {
      console.error('❌ TokenManager: 从备份恢复失败', error);
      return null;
    }
  },
  
  /**
   * 检查并恢复 Token
   */
  _checkAndRestoreToken() {
    const status = this.validateTokenIntegrity();
    
    if (!status.hasToken && (status.hasUserId || status.hasRoleId)) {
      console.warn('⚠️ TokenManager: 检测到数据不一致，尝试从备份恢复...');
      const restored = this._restoreFromBackup();
      
      // 如果从备份恢复失败，尝试从 AuthManager 恢复
      if (!restored && window.AuthManager) {
        const authToken = window.AuthManager.getToken();
        if (authToken) {
          console.log('✅ TokenManager: 从 AuthManager 恢复 Token');
          this.saveToken(authToken, localStorage.getItem('userId'), localStorage.getItem('roleId'));
        }
      }
      
      // 如果仍然没有 token，清理不一致的数据
      if (!localStorage.getItem('token')) {
        console.warn('⚠️ TokenManager: 无法恢复 Token，清理不一致的数据');
        localStorage.removeItem('userId');
        localStorage.removeItem('roleId');
        localStorage.removeItem('currentRoleId');
        localStorage.removeItem('selectedCharacterId');
      }
    }
  },
  
  /**
   * 验证 Token 格式
   */
  _isValidTokenFormat(token) {
    if (!token) return false;
    
    // JWT Token 应该是三段式
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }
    
    try {
      // 尝试解析 payload
      const payload = JSON.parse(atob(parts[1]));
      return !!payload;
    } catch (e) {
      return false;
    }
  },
  
  /**
   * 设置存储监控
   */
  _setupStorageMonitor() {
    // 监听 storage 事件（跨标签页同步）
    window.addEventListener('storage', (e) => {
      if (e.key === 'token') {
        if (e.newValue) {
          console.log('🔄 TokenManager: 检测到 Token 变化（跨标签页）');
          this._backupToken(e.newValue, localStorage.getItem('userId'), localStorage.getItem('roleId'));
        } else {
          console.warn('⚠️ TokenManager: 检测到 Token 被清除（跨标签页）');
          this._restoreFromBackup();
        }
      }
    });
  },
  
  /**
   * 设置页面卸载处理器
   */
  _setupPageUnloadHandler() {
    window.addEventListener('beforeunload', () => {
      // 在页面前卸载时备份 Token
      const token = localStorage.getItem('token');
      if (token) {
        this._backupToken(token, localStorage.getItem('userId'), localStorage.getItem('roleId'));
        console.log('💾 TokenManager: 页面卸载前备份 Token');
      }
    });
  },
  
  /**
   * 🔥 方案二：设置自动备份机制
   */
  _setupAutoBackup() {
    // 每分钟检查并备份一次
    setInterval(() => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      // 🔥 关键：同时检查 roleId 和 currentRoleId
      const roleId = localStorage.getItem('roleId') || localStorage.getItem('currentRoleId');
      
      if (token && userId) {
        this._backupToken(token, userId, roleId);
        console.log('💾 TokenManager: 定时备份 Token (roleId:', roleId || 'null', ')');
      }
    }, 60000); // 60 秒
    
    console.log('✅ TokenManager: 定时备份已启用（每分钟）');
  },
};

// 自动初始化
window.TokenManager.init();

// 导出工具函数
window.TokenUtils = {
  /**
   * 安全保存 Token（推荐使用）
   */
  save(token, userId, roleId) {
    return window.TokenManager.saveToken(token, userId, roleId);
  },
  
  /**
   * 安全获取 Token（推荐使用）
   */
  get() {
    return window.TokenManager.getToken();
  },
  
  /**
   * 验证 Token 完整性
   */
  validate() {
    return window.TokenManager.validateTokenIntegrity();
  },
  
  /**
   * 清除 Token
   */
  clear() {
    window.TokenManager.clearToken();
  }
};

console.log('✅ TokenManager 已加载');
