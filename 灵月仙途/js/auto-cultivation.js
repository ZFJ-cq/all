/**
 * 灵月仙途 - 自动修炼模块
 * 提供自动修炼、倒计时、功法加成等功能
 */

const CULTIVATION_CONFIG = {
  autoCultivateInterval: 60000,
  apiBaseUrl: typeof window.getApiBaseHost === 'function' ? window.getApiBaseHost() : 'http://localhost:8088'
};

let autoCultivateTimer = null;
let countdownTimer = null;

/**
 * 初始化自动修炼
 */
function initAutoCultivation(roleId) {
  // 加载当前修为
  loadCultivationStatus(roleId);
  
  // 获取功法加成
  loadSkillBonus(roleId);
  
  // 启动自动修炼
  startAutoCultivation(roleId);
}

/**
 * 加载修炼状态
 */
function loadCultivationStatus(roleId) {
  fetch(`${CULTIVATION_CONFIG.apiBaseUrl}/api/cultivation/status/${roleId}`)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        updateCultivationUI(data);
      }
    })
    .catch(error => {
      console.error('加载修炼状态失败:', error);
    });
}

/**
 * 更新修炼界面
 */
function updateCultivationUI(data) {
  const realmEl = document.getElementById('currentRealm');
  const xiuweiEl = document.getElementById('currentXiuwei');
  const efficiencyEl = document.getElementById('cultivationEfficiency');
  
  if (realmEl) realmEl.textContent = data.realm || '无修为';
  if (xiuweiEl) xiuweiEl.textContent = formatNumber(data.xiuwei || 0);
  if (efficiencyEl) efficiencyEl.textContent = `x${data.efficiency || 1}`;
}

/**
 * 加载功法加成
 */
function loadSkillBonus(roleId) {
  fetch(`${CULTIVATION_CONFIG.apiBaseUrl}/api/cultivation/skill-bonus/${roleId}`)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        updateSkillBonusUI(data);
      }
    })
    .catch(error => {
      console.error('加载功法加成失败:', error);
    });
}

/**
 * 更新功法加成界面
 */
function updateSkillBonusUI(data) {
  const bonusEl = document.getElementById('skillBonus');
  const skillCountEl = document.getElementById('skillCount');
  
  if (bonusEl) {
    bonusEl.textContent = `+${data.totalBonus || 0}`;
  }
  if (skillCountEl) {
    skillCountEl.textContent = `${data.skillCount || 0}个功法`;
  }
}

/**
 * 启动自动修炼
 */
function startAutoCultivation(roleId) {
  // 立即执行一次
  executeAutoCultivate(roleId);
  
  // 设置定时器
  if (autoCultivateTimer) {
    clearInterval(autoCultivateTimer);
  }
  
  autoCultivateTimer = setInterval(() => {
    executeAutoCultivate(roleId);
  }, CULTIVATION_CONFIG.autoCultivateInterval);
}

/**
 * 执行自动修炼
 */
function executeAutoCultivate(roleId) {
  fetch(`${CULTIVATION_CONFIG.apiBaseUrl}/api/cultivation/auto?roleId=${roleId}`, {
    method: 'POST'
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // 更新 UI
      updateAutoCultivateUI(data);
      
      // 重新加载状态
      loadCultivationStatus(roleId);
      
      // 显示提示
      showToast(`修炼成功！获得 ${data.totalXiuwei} 修为`, 'success');
    } else {
      showToast(data.message || '修炼失败', 'error');
    }
  })
  .catch(error => {
    console.error('自动修炼失败:', error);
    showToast('自动修炼失败', 'error');
  });
}

/**
 * 更新自动修炼 UI
 */
function updateAutoCultivateUI(data) {
  const lastXiuweiEl = document.getElementById('lastXiuwei');
  const baseXiuweiEl = document.getElementById('baseXiuwei');
  const efficiencyEl = document.getElementById('lastEfficiency');
  const bonusEl = document.getElementById('lastBonus');
  
  if (lastXiuweiEl) {
    lastXiuweiEl.textContent = `+${data.totalXiuwei}`;
  }
  if (baseXiuweiEl) {
    baseXiuweiEl.textContent = `${data.baseXiuwei}`;
  }
  if (efficiencyEl) {
    efficiencyEl.textContent = `x${data.efficiencyMultiplier}`;
  }
  if (bonusEl) {
    bonusEl.textContent = `+${data.skillBonus}`;
  }
}

/**
 * 启动倒计时
 */
function startCountdown(seconds, callback) {
  let remaining = seconds;
  
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
  
  updateCountdownDisplay(remaining);
  
  countdownTimer = setInterval(() => {
    remaining--;
    updateCountdownDisplay(remaining);
    
    if (remaining <= 0) {
      clearInterval(countdownTimer);
      if (callback) callback();
    }
  }, 1000);
}

/**
 * 更新倒计时显示
 */
function updateCountdownDisplay(seconds) {
  const countdownEl = document.getElementById('countdownTimer');
  if (!countdownEl) return;
  
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  countdownEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 停止自动修炼
 */
function stopAutoCultivation() {
  if (autoCultivateTimer) {
    clearInterval(autoCultivateTimer);
    autoCultivateTimer = null;
  }
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
}

/**
 * 格式化数字
 */
function formatNumber(num) {
  if (num >= 100000000) {
    return (num / 100000000).toFixed(2) + '亿';
  } else if (num >= 10000) {
    return (num / 10000).toFixed(2) + '万';
  } else {
    return num.toString();
  }
}

// 页面卸载时清理定时器
window.addEventListener('beforeunload', () => {
  stopAutoCultivation();
});

// 导出函数
window.initAutoCultivation = initAutoCultivation;
window.startAutoCultivation = startAutoCultivation;
window.stopAutoCultivation = stopAutoCultivation;
window.startCountdown = startCountdown;
