/**
 * 统一的头像和工具函数
 * 提供跨页面共享的工具方法
 */

window.GameUtils = {
  /**
   * 根据灵根获取头像图标
   * @param {string} spiritRoot - 灵根类型
   * @returns {string} - Emoji 图标
   */
  getAvatarBySpiritRoot(spiritRoot) {
    if (!spiritRoot) return '🧙‍️';
    
    const avatarMap = {
      '金灵根': '⚡',
      '木灵根': '🌿',
      '水灵根': '💧',
      '火灵根': '🔥',
      '土灵根': '⛰️',
      '雷灵根': '⚡',
      '冰灵根': '❄️',
      '风灵根': '🌪️',
      '光灵根': '✨',
      '暗灵根': '🌑',
      '五行灵根': '🌈',
      '五灵根': '🌈',
      '天灵根': '🌟',
      '混沌灵根': '🌀',
      '变异灵根': '💫'
    };
    
    return avatarMap[spiritRoot] || '🧙‍♂️';
  },

  /**
   * 设置头像图标
   * @param {HTMLElement} element - 头像元素
   * @param {string} spiritRoot - 灵根类型
   */
  setAvatar(element, spiritRoot) {
    if (element) {
      element.textContent = this.getAvatarBySpiritRoot(spiritRoot);
    }
  },

  /**
   * 格式化数字（添加千分位）
   * @param {number} num - 数字
   * @returns {string} - 格式化后的字符串
   */
  formatNumber(num) {
    if (num === null || num === undefined) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  /**
   * 格式化百分比
   * @param {number} value - 值
   * @param {number} decimals - 小数位数
   * @returns {string} - 格式化后的百分比字符串
   */
  formatPercent(value, decimals = 1) {
    if (value === null || value === undefined) return '0%';
    return `${Number(value).toFixed(decimals)}%`;
  },

  /**
   * 安全获取对象属性
   * @param {object} obj - 对象
   * @param {string} path - 属性路径，如 'user.profile.name'
   * @param {any} defaultValue - 默认值
   * @returns {any} - 属性值或默认值
   */
  safeGet(obj, path, defaultValue = null) {
    return path.split('.').reduce((prev, curr) => {
      return prev ? prev[curr] : null;
    }, obj) ?? defaultValue;
  }
};

console.log('✅ GameUtils 已加载');
