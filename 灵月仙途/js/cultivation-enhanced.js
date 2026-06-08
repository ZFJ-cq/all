/**
 * 灵月仙途 - 修炼系统增强模块
 * 功能：智能挂机、突破特效、灵气汇聚动画
 */

// 修炼系统配置
const CultivationConfig = {
  AUTO_CULTIVATION_INTERVAL: 60, // 自动修炼间隔（秒）
  BREAKTHROUGH_ANIMATION_DURATION: 3000, // 突破动画持续时间（毫秒）
  SPIRIT_GATHERING_PARTICLES: 50, // 灵气粒子数量
};

// 修炼系统状态
const CultivationState = {
  isAutoCultivating: false,
  autoCultivationTimer: null,
  countdown: CultivationConfig.AUTO_CULTIVATION_INTERVAL,
  currentRealm: '炼体期',
  currentXiuwei: 0,
  breakthroughRate: 0,
  isBreakthroughModalOpen: false
};

/**
 * 初始化修炼系统
 */
function initCultivationSystem() {
  console.log('初始化修炼系统...');
  loadPlayerCultivationInfo();
  setupAutoCultivationButton();
  setupBreakthroughButton();
  startCountdown();
}

/**
 * 加载玩家修炼信息
 */
function loadPlayerCultivationInfo() {
  // 从后端加载玩家修炼信息
  const roleId = getCurrentRoleId(); // 需要从登录信息中获取
  
  fetch(`/api/cultivation/config?roleId=${roleId}`)
    .then(response => response.json())
    .then(data => {
      if (data.code === 200) {
        CultivationState.currentRealm = data.data.currentRealm || '炼体期';
        CultivationState.currentXiuwei = data.data.currentXiuwei || 0;
        CultivationState.breakthroughRate = data.data.breakthroughRate || 0;
        
        updateCultivationUI();
      }
    })
    .catch(error => {
      console.error('加载修炼信息失败:', error);
    });
}

/**
 * 更新修炼界面显示
 */
function updateCultivationUI() {
  // 更新境界显示
  const realmElement = document.getElementById('currentRealm');
  if (realmElement) {
    realmElement.textContent = CultivationState.currentRealm;
  }
  
  // 更新修为显示
  const xiuweiElement = document.getElementById('currentXiuwei');
  if (xiuweiElement) {
    xiuweiElement.textContent = CultivationState.currentXiuwei.toLocaleString();
  }
  
  // 更新突破成功率显示
  const rateElement = document.getElementById('breakthroughRate');
  if (rateElement) {
    rateElement.textContent = CultivationState.breakthroughRate.toFixed(2) + '%';
    
    // 根据成功率设置颜色
    if (CultivationState.breakthroughRate >= 70) {
      rateElement.style.color = '#2ecc71'; // 绿色 - 高成功率
    } else if (CultivationState.breakthroughRate >= 40) {
      rateElement.style.color = '#f39c12'; // 橙色 - 中等成功率
    } else {
      rateElement.style.color = '#e74c3c'; // 红色 - 低成功率
    }
  }
}

/**
 * 设置自动修炼按钮
 */
function setupAutoCultivationButton() {
  const autoButton = document.getElementById('autoCultivationBtn');
  if (!autoButton) return;
  
  autoButton.addEventListener('click', toggleAutoCultivation);
}

/**
 * 切换自动修炼状态
 */
function toggleAutoCultivation() {
  const autoButton = document.getElementById('autoCultivationBtn');
  
  if (CultivationState.isAutoCultivating) {
    // 停止自动修炼
    stopAutoCultivation();
    autoButton.textContent = '▶️ 自动修炼';
    autoButton.classList.remove('active');
  } else {
    // 启动自动修炼
    startAutoCultivation();
    autoButton.textContent = '⏸️ 停止修炼';
    autoButton.classList.add('active');
  }
}

/**
 * 启动自动修炼
 */
function startAutoCultivation() {
  CultivationState.isAutoCultivating = true;
  CultivationState.countdown = CultivationConfig.AUTO_CULTIVATION_INTERVAL;
  
  // 启动倒计时
  startCountdown();
  
  // 显示灵气汇聚特效
  showSpiritGatheringEffect();
  
  console.log('自动修炼已启动');
}

/**
 * 停止自动修炼
 */
function stopAutoCultivation() {
  CultivationState.isAutoCultivating = false;
  
  if (CultivationState.autoCultivationTimer) {
    clearInterval(CultivationState.autoCultivationTimer);
    CultivationState.autoCultivationTimer = null;
  }
  
  // 停止灵气汇聚特效
  hideSpiritGatheringEffect();
  
  console.log('自动修炼已停止');
}

/**
 * 启动倒计时
 */
function startCountdown() {
  const countdownElement = document.getElementById('cultivationCountdown');
  
  if (CultivationState.autoCultivationTimer) {
    clearInterval(CultivationState.autoCultivationTimer);
  }
  
  CultivationState.autoCultivationTimer = setInterval(() => {
    CultivationState.countdown--;
    
    if (countdownElement) {
      const minutes = Math.floor(CultivationState.countdown / 60);
      const seconds = CultivationState.countdown % 60;
      countdownElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // 倒计时结束
    if (CultivationState.countdown <= 0) {
      executeAutoCultivation();
      CultivationState.countdown = CultivationConfig.AUTO_CULTIVATION_INTERVAL;
    }
  }, 1000);
}

/**
 * 执行自动修炼
 */
function executeAutoCultivation() {
  const roleId = getCurrentRoleId();
  
  fetch('/api/cultivation/auto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roleId: roleId })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // 显示获得修为的提示
      showXiuweiGainNotification(data.totalXiuwei);
      
      // 更新修为显示
      CultivationState.currentXiuwei += data.totalXiuwei;
      updateCultivationUI();
      
      // 检查是否可以突破
      checkBreakthroughAvailability();
    } else {
      showMessage(data.message || '修炼失败', 'error');
    }
  })
  .catch(error => {
    console.error('自动修炼失败:', error);
    showMessage('修炼失败，请重试', 'error');
  });
}

/**
 * 显示获得修为提示
 */
function showXiuweiGainNotification(amount) {
  const notification = document.createElement('div');
  notification.className = 'xiuwei-gain-notification';
  notification.innerHTML = `
    <div class="gain-icon">✨</div>
    <div class="gain-text">获得 ${amount.toLocaleString()} 点修为</div>
  `;
  
  notification.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, rgba(241, 196, 15, 0.9), rgba(230, 126, 34, 0.9));
    padding: 30px 50px;
    border-radius: 12px;
    text-align: center;
    z-index: 9999;
    animation: floatUp 1.5s ease-out;
    box-shadow: 0 8px 32px rgba(241, 196, 15, 0.5);
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 1500);
}

/**
 * 设置突破按钮
 */
function setupBreakthroughButton() {
  const breakthroughButton = document.getElementById('breakthroughBtn');
  if (!breakthroughButton) return;
  
  breakthroughButton.addEventListener('click', openBreakthroughModal);
}

/**
 * 打开突破弹窗
 */
function openBreakthroughModal() {
  // 检查是否处于走火入魔状态
  checkWalkFireStatus().then(isInWalkFire => {
    if (isInWalkFire) {
      showMessage('正处于走火入魔状态，无法突破！', 'error');
      return;
    }
    
    // 计算突破成功率
    calculateBreakthroughRate().then(rate => {
      CultivationState.breakthroughRate = rate;
      showBreakthroughModal(rate);
    });
  });
}

/**
 * 检查走火入魔状态
 */
function checkWalkFireStatus() {
  const roleId = getCurrentRoleId();
  return fetch(`/api/cultivation/walkfire-status?roleId=${roleId}`)
    .then(response => response.json())
    .then(data => {
      if (data.code === 200) {
        return data.data.isInWalkFire;
      }
      return false;
    })
    .catch(() => false);
}

/**
 * 计算突破成功率
 */
function calculateBreakthroughRate() {
  const roleId = getCurrentRoleId();
  return fetch(`/api/cultivation/breakthrough/rate?roleId=${roleId}&currentRealm=${encodeURIComponent(CultivationState.currentRealm)}`)
    .then(response => response.json())
    .then(data => {
      if (data.code === 200) {
        return data.data.successRate;
      }
      return 0;
    })
    .catch(() => 0);
}

/**
 * 显示突破弹窗
 */
function showBreakthroughModal(rate) {
  const modal = document.getElementById('breakthroughModal');
  if (!modal) return;
  
  // 更新成功率显示
  const rateDisplay = document.getElementById('breakthroughRateDisplay');
  if (rateDisplay) {
    rateDisplay.textContent = rate.toFixed(2) + '%';
    
    // 根据成功率设置颜色
    if (rate >= 70) {
      rateDisplay.style.color = '#2ecc71';
    } else if (rate >= 40) {
      rateDisplay.style.color = '#f39c12';
    } else {
      rateDisplay.style.color = '#e74c3c';
    }
  }
  
  // 显示弹窗
  modal.style.display = 'flex';
  CultivationState.isBreakthroughModalOpen = true;
  
  // 添加轻微震动效果
  modal.classList.add('shake');
  setTimeout(() => modal.classList.remove('shake'), 500);
}

/**
 * 关闭突破弹窗
 */
function closeBreakthroughModal() {
  const modal = document.getElementById('breakthroughModal');
  if (modal) {
    modal.style.display = 'none';
  }
  CultivationState.isBreakthroughModalOpen = false;
}

/**
 * 执行突破
 */
function executeBreakthrough() {
  const roleId = getCurrentRoleId();
  const breakthroughButton = document.getElementById('confirmBreakthroughBtn');
  
  // 禁用按钮防止重复点击
  breakthroughButton.disabled = true;
  
  // 播放突破动画
  playBreakthroughAnimation();
  
  fetch('/api/cultivation/breakthrough', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roleId: roleId })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // 突破成功
      showBreakthroughSuccess(data);
    } else {
      // 突破失败
      showBreakthroughFailure(data);
    }
    
    // 关闭弹窗
    closeBreakthroughModal();
    
    // 重新启用按钮
    setTimeout(() => {
      breakthroughButton.disabled = false;
    }, 1000);
  })
  .catch(error => {
    console.error('突破失败:', error);
    showMessage('突破过程中发生错误', 'error');
    breakthroughButton.disabled = false;
  });
}

/**
 * 播放突破动画
 */
function playBreakthroughAnimation() {
  // 创建灵气汇聚效果
  createBreakthroughParticles();
  
  // 屏幕震动
  document.body.classList.add('screen-shake');
  setTimeout(() => {
    document.body.classList.remove('screen-shake');
  }, 1000);
}

/**
 * 显示突破成功
 */
function showBreakthroughSuccess(data) {
  // 播放成功特效
  const effect = document.createElement('div');
  effect.className = 'breakthrough-success-effect';
  effect.innerHTML = `
    <div class="success-title">🎉 突破成功！</div>
    <div class="success-realm">
      ${data.oldRealm || CultivationState.currentRealm} 
      → 
      <span class="new-realm">${data.newRealm}</span>
    </div>
  `;
  
  effect.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(241, 196, 15, 0.8) 0%, transparent 70%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    animation: fadeInOut 2s ease-out;
  `;
  
  document.body.appendChild(effect);
  
  setTimeout(() => {
    effect.remove();
  }, 2000);
  
  // 更新境界
  if (data.newRealm) {
    CultivationState.currentRealm = data.newRealm;
    updateCultivationUI();
  }
  
  showMessage('突破成功！恭喜踏入新境界！', 'success');
}

/**
 * 显示突破失败
 */
function showBreakthroughFailure(data) {
  // 播放失败特效
  const effect = document.createElement('div');
  effect.className = 'breakthrough-failure-effect';
  effect.innerHTML = `
    <div class="failure-title">❌ 突破失败</div>
    <div class="failure-message">${data.message || '修为受损，请调养后再试'}</div>
  `;
  
  effect.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(231, 76, 60, 0.6) 0%, transparent 70%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    animation: fadeInOut 1.5s ease-out;
    color: #e74c3c;
    font-size: 24px;
  `;
  
  document.body.appendChild(effect);
  
  setTimeout(() => {
    effect.remove();
  }, 1500);
  
  showMessage(data.message || '突破失败', 'error');
}

/**
 * 显示灵气汇聚特效
 */
function showSpiritGatheringEffect() {
  const container = document.getElementById('cultivationContainer');
  if (!container) return;
  
  // 创建灵气粒子
  for (let i = 0; i < CultivationConfig.SPIRIT_GATHERING_PARTICLES; i++) {
    createSpiritParticle(container);
  }
}

/**
 * 隐藏灵气汇聚特效
 */
function hideSpiritGatheringEffect() {
  const particles = document.querySelectorAll('.spirit-particle');
  particles.forEach(particle => particle.remove());
}

/**
 * 创建灵气粒子
 */
function createSpiritParticle(container) {
  const particle = document.createElement('div');
  particle.className = 'spirit-particle';
  
  // 随机位置和颜色
  const startX = Math.random() * container.offsetWidth;
  const startY = Math.random() * container.offsetHeight;
  const size = Math.random() * 6 + 4;
  const colors = ['#3498db', '#9b59b6', '#2ecc71', '#f39c12'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  particle.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    background: ${color};
    border-radius: 50%;
    left: ${startX}px;
    top: ${startY}px;
    opacity: 0.6;
    box-shadow: 0 0 ${size * 2}px ${color};
    animation: floatToCenter 2s ease-in-out infinite;
  `;
  
  container.appendChild(particle);
  
  // 2 秒后移除
  setTimeout(() => {
    if (particle.parentNode) {
      particle.remove();
    }
  }, 2000);
}

/**
 * 创建突破粒子特效
 */
function createBreakthroughParticles() {
  const container = document.body;
  const particleCount = 100;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'breakthrough-particle';
    
    const angle = (Math.PI * 2 * i) / particleCount;
    const radius = 100;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    particle.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      width: 8px;
      height: 8px;
      background: #f1c40f;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 10px #f1c40f;
      animation: explode 1s ease-out forwards;
      animation-delay: ${Math.random() * 0.5}s;
    `;
    
    container.appendChild(particle);
    
    setTimeout(() => particle.remove(), 1500);
  }
}

/**
 * 检查是否可以突破
 */
function checkBreakthroughAvailability() {
  const roleId = getCurrentRoleId();
  
  fetch(`/api/cultivation/check-breakthrough?roleId=${roleId}&currentRealm=${encodeURIComponent(CultivationState.currentRealm)}`)
    .then(response => response.json())
    .then(data => {
      if (data.code === 200 && data.data.canBreakthrough) {
        // 高亮突破按钮
        const breakthroughButton = document.getElementById('breakthroughBtn');
        if (breakthroughButton) {
          breakthroughButton.classList.add('glowing');
          breakthroughButton.innerHTML = '⚡ 立即突破';
        }
      }
    })
    .catch(error => {
      console.error('检查突破条件失败:', error);
    });
}

/**
 * 获取当前角色 ID
 */
function getCurrentRoleId() {
  // 从 localStorage 或 cookie 中获取
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    const user = JSON.parse(userInfo);
    return user.roleId || user.id;
  }
  return null;
}

/**
 * 显示消息提示
 */
function showMessage(message, type = 'info') {
  const msgDiv = document.createElement('div');
  msgDiv.className = `message-toast message-${type}`;
  msgDiv.textContent = message;
  
  msgDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db'};
    color: white;
    border-radius: 4px;
    z-index: 9999;
    animation: slideInRight 0.3s ease-out;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;
  
  document.body.appendChild(msgDiv);
  
  setTimeout(() => {
    msgDiv.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => msgDiv.remove(), 300);
  }, 3000);
}

// 添加 CSS 动画样式
const style = document.createElement('style');
style.textContent = `
  @keyframes floatUp {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) translateY(20px);
    }
    50% {
      opacity: 1;
      transform: translate(-50%, -50%) translateY(0);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) translateY(-30px);
    }
  }
  
  @keyframes floatToCenter {
    0%, 100% {
      transform: translate(0, 0);
      opacity: 0.6;
    }
    50% {
      transform: translate(20px, -20px);
      opacity: 1;
    }
  }
  
  @keyframes explode {
    0% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
    100% {
      transform: translate(calc(-50% + ${Math.random() * 200 - 100}px), calc(-50% + ${Math.random() * 200 - 100}px)) scale(0);
      opacity: 0;
    }
  }
  
  @keyframes fadeInOut {
    0% { opacity: 0; }
    20% { opacity: 1; }
    80% { opacity: 1; }
    100% { opacity: 0; }
  }
  
  @keyframes slideInRight {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }
  
  .screen-shake {
    animation: shake 0.5s ease-in-out;
  }
  
  .glowing {
    animation: glow 1.5s ease-in-out infinite;
  }
  
  @keyframes glow {
    0%, 100% {
      box-shadow: 0 0 10px rgba(241, 196, 15, 0.5);
    }
    50% {
      box-shadow: 0 0 30px rgba(241, 196, 15, 1);
    }
  }
`;
document.head.appendChild(style);

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCultivationSystem);
} else {
  initCultivationSystem();
}
