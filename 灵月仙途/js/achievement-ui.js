/**
 * 灵月仙途 - 成就系统 UI 组件
 * 包含：成就弹窗、红点提示、解锁通知、属性展示
 */

// ==================== 成就解锁通知弹窗 ====================
window.AchievementUINotification = {
  /**
   * 显示成就解锁通知
   * @param {Object} data - 成就数据
   */
  showUnlockNotification(data) {
    const { name, description, title, rewardAttributes, icon } = data;

    const notification = document.createElement('div');
    notification.className = 'achievement-unlock-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(-100px);
      background: linear-gradient(135deg, rgba(30, 35, 50, 0.95), rgba(15, 18, 25, 0.95));
      border: 2px solid var(--gold-primary);
      border-radius: 16px;
      padding: 20px 30px;
      min-width: 350px;
      max-width: 90%;
      z-index: 10000;
      box-shadow: 0 10px 40px rgba(230, 199, 73, 0.4);
      animation: slideDown 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
      display: flex;
      align-items: center;
      gap: 20px;
    `;

    notification.innerHTML = `
      <div style="font-size: 3rem; animation: iconPulse 1s ease infinite;">${icon || '🏆'}</div>
      <div style="flex: 1;">
        <div style="font-size: 1.2rem; font-weight: bold; color: var(--gold-primary); margin-bottom: 5px;">
          🏆 成就解锁：${name}
        </div>
        <div style="font-size: 0.9rem; color: var(--text-dim); margin-bottom: 8px;">
          ${description}
        </div>
        <div style="font-size: 0.85rem; color: var(--gold-light);">
          🎁 获得称号：${title}
          ${this._formatAttributes(rewardAttributes)}
        </div>
      </div>
    `;

    // 添加动画样式
    this._addAnimationStyles();

    document.body.appendChild(notification);

    // 3 秒后自动消失
    setTimeout(() => {
      notification.style.animation = 'slideUp 0.5s ease forwards';
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  },

  /**
   * 格式化属性文本
   * @param {Object} attributes - 属性对象
   * @returns {string} 格式化后的文本
   */
  _formatAttributes(attributes) {
    if (!attributes) return '';
    
    const attrText = Object.entries(attributes)
      .map(([key, value]) => {
        const attrName = window.titleAttributeManager?.getAttributeName(key) || key;
        return `${attrName}+${value}`;
      })
      .join(', ');
    
    return attrText ? ` (${attrText})` : '';
  },

  /**
   * 添加动画样式
   */
  _addAnimationStyles() {
    if (document.getElementById('achievement-animations')) return;

    const style = document.createElement('style');
    style.id = 'achievement-animations';
    style.textContent = `
      @keyframes slideDown {
        from {
          transform: translateX(-50%) translateY(-100px);
          opacity: 0;
        }
        to {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
      }
      
      @keyframes slideUp {
        from {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
        to {
          transform: translateX(-50%) translateY(-100px);
          opacity: 0;
        }
      }
      
      @keyframes iconPulse {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.1);
        }
      }
    `;

    document.head.appendChild(style);
  }
};

// ==================== 红点提示组件 ====================
window.AchievementRedDot = {
  /**
   * 在指定元素上显示红点
   * @param {string} elementId - 目标元素 ID
   */
  showOnElement(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    // 检查是否已有红点
    if (element.querySelector('.achievement-red-dot')) return;

    const redDot = document.createElement('span');
    redDot.className = 'achievement-red-dot';
    redDot.style.cssText = `
      position: absolute;
      top: -5px;
      right: -5px;
      width: 10px;
      height: 10px;
      background: #ff4444;
      border-radius: 50%;
      animation: redDotPulse 1.5s ease-in-out infinite;
      box-shadow: 0 0 10px rgba(255, 68, 68, 0.6);
    `;

    // 确保父元素 position 为 relative
    if (getComputedStyle(element).position === 'static') {
      element.style.position = 'relative';
    }

    element.style.position = 'relative';
    element.appendChild(redDot);

    // 添加动画样式
    this._addAnimationStyles();
  },

  /**
   * 隐藏红点
   * @param {string} elementId - 目标元素 ID
   */
  hideOnElement(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const redDot = element.querySelector('.achievement-red-dot');
    if (redDot) {
      redDot.remove();
    }
  },

  /**
   * 更新所有红点状态
   * @param {boolean} hasUnclaimed - 是否有未领取成就
   */
  update(hasUnclaimed) {
    const elementId = 'achievement-menu-item'; // 成就菜单项 ID
    
    if (hasUnclaimed) {
      this.showOnElement(elementId);
    } else {
      this.hideOnElement(elementId);
    }
  },

  /**
   * 添加动画样式
   */
  _addAnimationStyles() {
    if (document.getElementById('red-dot-animations')) return;

    const style = document.createElement('style');
    style.id = 'red-dot-animations';
    style.textContent = `
      @keyframes redDotPulse {
        0%, 100% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.2);
          opacity: 0.8;
        }
      }
    `;

    document.head.appendChild(style);
  }
};

// ==================== 成就详情弹窗组件 ====================
window.AchievementDetailModal = {
  /**
   * 显示成就详情
   * @param {Object} achievement - 成就数据
   */
  show(achievement) {
    const modal = document.createElement('div');
    modal.className = 'achievement-detail-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      backdrop-filter: blur(5px);
      animation: modalFadeIn 0.3s ease;
    `;

    const progressPercent = achievement.progressPercent || 0;
    const isUnlocked = achievement.isUnlocked || false;
    const isClaimed = achievement.isClaimed || false;

    modal.innerHTML = `
      <div style="
        background: linear-gradient(135deg, rgba(30, 35, 50, 0.95), rgba(15, 18, 25, 0.95));
        border: 3px solid var(--gold-primary);
        border-radius: 24px;
        padding: 35px;
        max-width: 90%;
        width: 450px;
        position: relative;
        animation: modalSlideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      ">
        <!-- 关闭按钮 -->
        <button onclick="window.AchievementDetailModal.close()" style="
          position: absolute;
          top: 15px;
          right: 15px;
          background: transparent;
          border: none;
          color: var(--text-dim);
          font-size: 1.5rem;
          cursor: pointer;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">×</button>

        <!-- 头部 -->
        <div style="text-align: center; margin-bottom: 25px;">
          <div style="font-size: 4rem; margin-bottom: 15px; animation: iconPulse 1.5s ease infinite;">
            ${isUnlocked ? (achievement.icon || '🏆') : '🔒'}
          </div>
          <div style="font-size: 1.5rem; font-weight: bold; color: var(--gold-primary); margin-bottom: 8px;">
            ${isUnlocked ? achievement.name : '???'}
          </div>
          <div style="font-size: 0.9rem; color: var(--text-dim);">
            ${this._getRarityText(achievement.rarity)}
          </div>
        </div>

        <!-- 描述 -->
        <div style="margin-bottom: 20px;">
          <div style="font-size: 0.9rem; font-weight: bold; color: var(--gold-dark); margin-bottom: 10px;">
            📖 成就描述
          </div>
          <div style="font-size: 0.95rem; line-height: 1.6; color: var(--text-secondary);">
            ${isUnlocked ? achievement.description : '成就详情尚未解锁...'}
          </div>
        </div>

        <!-- 进度 -->
        <div style="margin-bottom: 20px;">
          <div style="font-size: 0.9rem; font-weight: bold; color: var(--gold-dark); margin-bottom: 10px;">
            📊 达成进度
          </div>
          <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 8px;">
            ${isUnlocked ? '已完成' : (achievement.condition || '完成条件')}
          </div>
          <div style="width: 100%; height: 12px; background: rgba(0, 0, 0, 0.5); border-radius: 6px; overflow: hidden;">
            <div style="
              width: ${progressPercent}%;
              height: 100%;
              background: linear-gradient(90deg, var(--gold-dark), var(--gold-primary));
              transition: width 0.5s ease;
            "></div>
          </div>
          <div style="font-size: 0.8rem; color: var(--text-dim); margin-top: 5px; text-align: right;">
            ${achievement.progress || 0} / ${achievement.threshold} (${progressPercent}%)
          </div>
        </div>

        <!-- 奖励 -->
        ${isUnlocked ? `
          <div style="margin-bottom: 25px;">
            <div style="font-size: 0.9rem; font-weight: bold; color: var(--gold-dark); margin-bottom: 10px;">
              🎁 成就奖励
            </div>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${achievement.title ? `
                <div style="
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  padding: 10px;
                  background: rgba(230, 199, 73, 0.1);
                  border: 1px solid rgba(230, 199, 73, 0.3);
                  border-radius: 10px;
                ">
                  <div style="font-size: 1.5rem;">🏷️</div>
                  <div style="flex: 1; font-size: 0.9rem; color: var(--gold-primary);">
                    称号：${achievement.title}
                  </div>
                </div>
              ` : ''}
              ${achievement.rewardAttributes ? `
                <div style="
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  padding: 10px;
                  background: rgba(230, 199, 73, 0.1);
                  border: 1px solid rgba(230, 199, 73, 0.3);
                  border-radius: 10px;
                ">
                  <div style="font-size: 1.5rem;">✨</div>
                  <div style="flex: 1; font-size: 0.9rem; color: var(--gold-primary);">
                    ${this._formatAttributes(achievement.rewardAttributes)}
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        ` : ''}

        <!-- 按钮 -->
        <div style="text-align: center;">
          ${isUnlocked && !isClaimed ? `
            <button onclick="window.AchievementDetailModal.claimReward(${achievement.id})" style="
              padding: 12px 40px;
              background: linear-gradient(135deg, var(--gold-primary), var(--gold-dark));
              border: none;
              border-radius: 12px;
              color: #000;
              font-weight: bold;
              font-size: 1rem;
              cursor: pointer;
              transition: all 0.3s;
              box-shadow: 0 4px 15px rgba(230, 199, 73, 0.4);
            ">
              🎁 领取奖励
            </button>
          ` : isClaimed ? `
            <div style="color: var(--success-color); font-weight: bold;">
              ✅ 奖励已领取
            </div>
          ` : ''}
          ${isUnlocked && isClaimed && window.achievementSystem ? `
            <div style="margin-top: 10px;">
              ${window.achievementSystem.playerData?.equippedTitleId === achievement.id ? `
                <button onclick="window.achievementSystem.unequipTitle()" style="
                  padding: 10px 30px;
                  background: rgba(231, 76, 60, 0.3);
                  border: 1px solid var(--epic-color);
                  border-radius: 10px;
                  color: var(--text-main);
                  cursor: pointer;
                ">
                  🔓 卸下称号
                </button>
              ` : `
                <button onclick="window.achievementSystem.equipTitle(${achievement.id})" style="
                  padding: 10px 30px;
                  background: linear-gradient(135deg, var(--gold-primary), var(--gold-dark));
                  border: none;
                  border-radius: 10px;
                  color: #000;
                  font-weight: bold;
                  cursor: pointer;
                ">
                  📿 佩戴称号
                </button>
              `}
            </div>
          ` : ''}
        </div>
      </div>
    `;

    // 点击遮罩关闭
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.close();
      }
    });

    document.body.appendChild(modal);
    this._addAnimationStyles();
  },

  /**
   * 关闭弹窗
   */
  close() {
    const modal = document.querySelector('.achievement-detail-modal');
    if (modal) {
      modal.style.animation = 'modalFadeOut 0.3s ease forwards';
      setTimeout(() => modal.remove(), 300);
    }
  },

  /**
   * 领取奖励
   * @param {number} achievementId - 成就 ID
   */
  claimReward(achievementId) {
    if (!window.achievementSystem) return;

    const result = window.achievementSystem.claimReward(achievementId);
    if (result) {
      window.AchievementUINotification.showUnlockNotification({
        name: '奖励领取',
        description: `成功领取成就奖励`,
        title: result.title,
        rewardAttributes: result.rewardAttributes,
        icon: '🎁'
      });
      this.close();
      // 重新打开弹窗刷新状态
      setTimeout(() => {
        const achievement = window.achievementSystem.getAchievementDetail(achievementId);
        if (achievement) {
          this.show(achievement);
        }
      }, 500);
    }
  },

  /**
   * 获取稀有度文本
   * @param {string} rarity - 稀有度
   * @returns {string} 中文稀有度
   */
  _getRarityText(rarity) {
    const map = {
      common: '普通',
      rare: '稀有',
      epic: '史诗',
      legendary: '传说'
    };
    return map[rarity] || rarity;
  },

  /**
   * 格式化属性
   * @param {Object} attributes - 属性对象
   * @returns {string} 格式化文本
   */
  _formatAttributes(attributes) {
    if (!attributes) return '';
    
    return Object.entries(attributes)
      .map(([key, value]) => {
        const attrName = window.titleAttributeManager?.getAttributeName(key) || key;
        return `${attrName} +${value}`;
      })
      .join(', ');
  },

  /**
   * 添加动画样式
   */
  _addAnimationStyles() {
    if (document.getElementById('modal-animations')) return;

    const style = document.createElement('style');
    style.id = 'modal-animations';
    style.textContent = `
      @keyframes modalFadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      
      @keyframes modalFadeOut {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }
      
      @keyframes modalSlideIn {
        from {
          transform: translateY(-50px) scale(0.8);
          opacity: 0;
        }
        to {
          transform: translateY(0) scale(1);
          opacity: 1;
        }
      }
      
      @keyframes iconPulse {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.1);
        }
      }
    `;

    document.head.appendChild(style);
  }
};

console.log('🎨 成就系统 UI 组件已加载');
