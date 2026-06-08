/**
 * 灵月仙途 - 服务器选择模块
 * 提供服务器选择、状态检测、持久化等功能
 */

// 服务器配置
const SERVER_CONFIG = {
  apiBaseUrl: typeof window.getApiBaseHost === 'function' ? window.getApiBaseHost() : 'http://localhost:8088',
  pingInterval: 30000,
  cacheTimeout: 300000
};

// 服务器列表缓存
let serverListCache = null;
let serverListCacheTime = 0;

/**
 * 显示服务器选择界面
 */
function showServerSelection() {
  const overlay = document.getElementById('serverSelectionOverlay');
  const serverListEl = document.getElementById('serverList');
  
  if (!overlay || !serverListEl) {
    console.error('服务器选择界面元素不存在');
    return;
  }
  
  // 清空服务器列表并显示加载中
  serverListEl.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-dim);">加载中...</div>';
  
  // 获取已选择的服务器
  const selectedServerId = localStorage.getItem('selectedServerId');
  
  // 从后端API获取服务器列表
  fetch(`${SERVER_CONFIG.apiBaseUrl}/server/list`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // 更新缓存
      serverListCache = data;
      serverListCacheTime = new Date().getTime();
      
      // 更新状态栏
      updateServerStatusBar(data);
      
      // 渲染服务器列表
      renderServerList(data, selectedServerId);
      
      // 显示弹窗
      overlay.classList.add('active');
    })
    .catch(error => {
      console.error('加载服务器列表失败:', error);
      serverListEl.innerHTML = '<div style="text-align: center; padding: 40px; color: red;">加载失败，请稍后重试</div>';
    });
}

/**
 * 更新服务器状态栏
 */
function updateServerStatusBar(servers) {
  const onlineCount = servers.filter(s => s.status === 'online').length;
  const maintenanceCount = servers.filter(s => s.status === 'maintenance').length;
  
  const onlineCountEl = document.getElementById('onlineCount');
  const maintenanceCountEl = document.getElementById('maintenanceCount');
  
  if (onlineCountEl) onlineCountEl.textContent = onlineCount;
  if (maintenanceCountEl) maintenanceCountEl.textContent = maintenanceCount;
}

/**
 * 渲染服务器列表
 */
function renderServerList(servers, selectedServerId) {
  const serverListEl = document.getElementById('serverList');
  
  // 清空服务器列表
  serverListEl.innerHTML = '';
  
  servers.forEach(server => {
    const serverItem = document.createElement('div');
    serverItem.className = `server-item ${server.status !== 'online' ? 'disabled' : ''} ${selectedServerId == server.id ? 'selected' : ''}`;
    
    const ping = server.status === 'online' ? getServerPing(server.id) : null;
    
    serverItem.innerHTML = createServerItemHTML(server, ping);
    
    // 点击选择服务器
    if (server.status === 'online') {
      serverItem.addEventListener('click', () => selectServer(server));
    }
    
    serverListEl.appendChild(serverItem);
  });
}

/**
 * 创建服务器项 HTML
 */
function createServerItemHTML(server, ping) {
  return `
    <div class="server-header">
      <div class="server-name">
        ${server.name}
        ${server.recommended ? '<span class="server-recommended">推荐</span>' : ''}
      </div>
      <span class="server-status ${server.status}">
        ${server.status === 'online' ? '● 在线' : '● 维护中'}
      </span>
    </div>
    <div class="server-info">
      <div class="server-info-item">
        📍 ${server.region}
      </div>
      ${server.status === 'online' ? `
        <div class="server-info-item">
          👥 ${server.players} 人在线
        </div>
      ` : ''}
    </div>
    ${ping ? `<div class="server-ping">延迟：${ping}ms</div>` : ''}
  `;
}

/**
 * 选择服务器
 */
function selectServer(server) {
  // 移除其他服务器的选中状态
  document.querySelectorAll('#serverList .server-item').forEach(item => {
    item.classList.remove('selected');
  });
  
  // 存储选中的服务器信息
  localStorage.setItem('selectedServerId', server.id);
  localStorage.setItem('selectedServerName', server.name);
  localStorage.setItem('selectedServerRegion', server.region);
  localStorage.setItem('selectedServerTime', new Date().getTime());
  
  // 显示选择成功提示
  showToast(`已选择服务器：${server.name}`, 'success');
  
  // 关闭弹窗
  closeServerSelection();
}

/**
 * 关闭服务器选择界面
 */
function closeServerSelection() {
  const overlay = document.getElementById('serverSelectionOverlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
}

/**
 * 刷新服务器列表
 */
function refreshServerList() {
  showToast('正在刷新服务器状态...', 'info');
  
  // 从后端API刷新服务器列表
  fetch(`${SERVER_CONFIG.apiBaseUrl}/server/list`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // 更新缓存
      serverListCache = data;
      serverListCacheTime = new Date().getTime();
      
      // 获取已选择的服务器
      const selectedServerId = localStorage.getItem('selectedServerId');
      
      // 更新状态栏
      updateServerStatusBar(data);
      
      // 渲染服务器列表
      renderServerList(data, selectedServerId);
      
      showToast('服务器列表已刷新', 'success');
    })
    .catch(error => {
      console.error('刷新服务器列表失败:', error);
      showToast('刷新失败，请稍后重试', 'error');
    });
}

/**
 * 获取服务器延迟（模拟）
 */
function getServerPing(serverId) {
  // 实际应该调用后端 API 检测延迟
  return Math.floor(Math.random() * 50 + 10);
}

/**
 * 获取当前选择的服务器
 */
function getCurrentServer() {
  return {
    id: localStorage.getItem('selectedServerId'),
    name: localStorage.getItem('selectedServerName'),
    region: localStorage.getItem('selectedServerRegion'),
    time: localStorage.getItem('selectedServerTime')
  };
}

/**
 * 检查服务器选择是否过期
 */
function isServerSelectionExpired() {
  const selectedTime = localStorage.getItem('selectedServerTime');
  if (!selectedTime) return true;
  
  const now = new Date().getTime();
  return (now - parseInt(selectedTime)) > SERVER_CONFIG.cacheTimeout;
}

// 导出函数
window.showServerSelection = showServerSelection;
window.closeServerSelection = closeServerSelection;
window.refreshServerList = refreshServerList;
window.getCurrentServer = getCurrentServer;
window.isServerSelectionExpired = isServerSelectionExpired;
