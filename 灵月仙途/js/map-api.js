/**
 * 地图管理 API 调用
 */

// 地图数据缓存
let mapDataCache = {};
const CACHE_EXPIRY = 5 * 60 * 1000;
const API_BASE_URL = typeof window.getApiBaseHost === 'function' ? window.getApiBaseHost() : 'http://localhost:8088';

// 处理API响应
function handleResponse(response) {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// 地图渲染引擎
class MapRenderEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.centerX = this.width / 2;
    this.centerY = this.height * 0.7; // 中心偏下，适应竖屏操作
    this.scale = 1.0;
    this.maxScale = 1.5;
    this.minScale = 1.0;
    this.tiles = {};
    this.loadedTiles = new Set();
    this.LODLevels = [
      { distance: 0, detail: 'high' },
      { distance: 200, detail: 'medium' },
      { distance: 400, detail: 'low' }
    ];
    this.init();
  }

  init() {
    this.resize();
    this.setupEventListeners();
    this.renderLoop();
  }

  resize() {
    this.width = this.canvas.width = this.canvas.offsetWidth;
    this.height = this.canvas.height = this.canvas.offsetHeight;
    this.centerX = this.width / 2;
    this.centerY = this.height * 0.7;
  }

  setupEventListeners() {
    // 双指缩放
    let startDistance = 0;
    let startScale = this.scale;

    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        startDistance = this.getDistance(e.touches[0], e.touches[1]);
        startScale = this.scale;
      }
    });

    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
        const scaleFactor = currentDistance / startDistance;
        this.scale = Math.max(this.minScale, Math.min(this.maxScale, startScale * scaleFactor));
      }
    });

    // 双击地面寻路
    let lastClickTime = 0;
    this.canvas.addEventListener('click', (e) => {
      const now = Date.now();
      if (now - lastClickTime < 300) {
        // 双击
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.handleDoubleClick(x, y);
      }
      lastClickTime = now;
    });

    // 初始化虚拟摇杆
    this.initJoystick();
  }

  initJoystick() {
    const joystick = document.querySelector('.joystick');
    const joystickControl = document.querySelector('.joystick-control');
    if (!joystick || !joystickControl) return;

    let isDragging = false;
    let startX, startY;
    const joystickRadius = joystick.offsetWidth / 2;

    // 触摸开始
    joystick.addEventListener('touchstart', (e) => {
      isDragging = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });

    // 触摸移动
    document.addEventListener('touchmove', (e) => {
      if (!isDragging) return;

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = currentX - startX;
      const deltaY = currentY - startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // 限制在摇杆范围内
      const maxDistance = joystickRadius - 20;
      const normalizedDistance = Math.min(distance, maxDistance);

      if (distance > 0) {
        const angle = Math.atan2(deltaY, deltaX);
        const x = Math.cos(angle) * normalizedDistance;
        const y = Math.sin(angle) * normalizedDistance;

        joystickControl.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;

        // 计算移动方向和速度
        const moveX = x / maxDistance;
        const moveY = y / maxDistance;
        this.handleJoystickMove(moveX, moveY);
      }
    });

    // 触摸结束
    document.addEventListener('touchend', () => {
      if (isDragging) {
        isDragging = false;
        joystickControl.style.transform = 'translate(-50%, -50%)';
        this.handleJoystickMove(0, 0);
      }
    });
  }

  handleJoystickMove(x, y) {
    // 处理摇杆移动，这里可以更新角色位置
    console.log('Joystick move:', { x, y });
  }

  getDistance(touch1, touch2) {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  handleDoubleClick(x, y) {
    // 转换为地图坐标
    const mapX = (x - this.centerX) / this.scale;
    const mapY = (y - this.centerY) / this.scale;
    console.log('双击寻路到:', { x: mapX, y: mapY });
    
    // 模拟寻路和角色移动
    this.startPathfinding(mapX, mapY);
  }

  startPathfinding(targetX, targetY) {
    // 模拟寻路过程
    console.log('开始寻路到:', { x: targetX, y: targetY });
    
    // 这里可以调用后端寻路API
    // 模拟寻路成功
    setTimeout(() => {
      this.moveCharacter(targetX, targetY);
    }, 500);
  }

  moveCharacter(targetX, targetY) {
    // 模拟角色移动
    console.log('角色开始移动到:', { x: targetX, y: targetY });
    
    // 这里可以实现平滑的角色移动动画
    // 暂时只打印日志
  }

  loadTile(x, y, level) {
    const tileKey = `${x},${y},${level}`;
    if (this.loadedTiles.has(tileKey)) return;

    // 模拟加载瓦片
    setTimeout(() => {
      this.tiles[tileKey] = { x, y, level, loaded: true };
      this.loadedTiles.add(tileKey);
    }, 100);
  }

  getLODLevel(distance) {
    for (let i = this.LODLevels.length - 1; i >= 0; i--) {
      if (distance >= this.LODLevels[i].distance) {
        return this.LODLevels[i].detail;
      }
    }
    return 'high';
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 绘制背景
    this.ctx.fillStyle = 'rgba(15, 20, 35, 0.7)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // 绘制网格
    this.ctx.save();
    this.ctx.translate(this.centerX, this.centerY);
    this.ctx.scale(this.scale, this.scale);

    // 绘制坐标系原点
    this.ctx.fillStyle = 'rgba(230, 199, 73, 0.5)';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 5, 0, Math.PI * 2);
    this.ctx.fill();

    // 绘制坐标轴
    this.ctx.strokeStyle = 'rgba(230, 199, 73, 0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(-this.width / 2, 0);
    this.ctx.lineTo(this.width / 2, 0);
    this.ctx.moveTo(0, -this.height / 2);
    this.ctx.lineTo(0, this.height / 2);
    this.ctx.stroke();

    // 绘制瓦片
    const tileSize = 50;
    const visibleTiles = 5;

    for (let i = -visibleTiles; i <= visibleTiles; i++) {
      for (let j = -visibleTiles; j <= visibleTiles; j++) {
        const tileX = i * tileSize;
        const tileY = j * tileSize;
        const distance = Math.sqrt(tileX * tileX + tileY * tileY);
        const lodLevel = this.getLODLevel(distance);

        this.loadTile(i, j, lodLevel);

        if (this.tiles[`${i},${j},${lodLevel}`]) {
          this.ctx.fillStyle = this.getTileColor(lodLevel);
          this.ctx.fillRect(tileX, tileY, tileSize, tileSize);
          this.ctx.strokeStyle = 'rgba(230, 199, 73, 0.2)';
          this.ctx.strokeRect(tileX, tileY, tileSize, tileSize);
        }
      }
    }

    this.ctx.restore();
  }

  getTileColor(level) {
    const colors = {
      high: 'rgba(230, 199, 73, 0.2)',
      medium: 'rgba(230, 199, 73, 0.1)',
      low: 'rgba(230, 199, 73, 0.05)'
    };
    return colors[level] || colors.low;
  }

  renderLoop() {
    this.render();
    requestAnimationFrame(() => this.renderLoop());
  }
}

// 全局渲染引擎实例
let mapRenderEngine = null;

// 加载所有地图
function loadAllMaps() {
  const container = document.getElementById('mapListContainer');
  if (!container) return;
  
  container.innerHTML = '<div style="text-align:center; padding:40px; color:var(--text-dim);">加载中...</div>';
  
  // 检查缓存
  const cached = mapDataCache['all'];
  if (cached && (Date.now() - cached.timestamp) < CACHE_EXPIRY) {
    renderMapList(cached.data);
    return;
  }
  
  fetch(`${API_BASE_URL}/map/enabled`)
    .then(response => handleResponse(response))
    .then(data => {
      // 更新缓存
      mapDataCache['all'] = {
        data: data,
        timestamp: Date.now()
      };
      renderMapList(data);
    })
    .catch(error => {
      console.error('加载地图失败:', error);
      container.innerHTML = '<div style="text-align:center; padding:40px; color:red;">加载失败，请稍后重试</div>';
    });
}

// 渲染地图列表
function renderMapList(maps) {
  const container = document.getElementById('mapListContainer');
  if (!container) return;
  
  if (!maps || maps.length === 0) {
    container.innerHTML = '<div style="text-align:center; padding:40px; color:var(--text-dim);">暂无地图数据</div>';
    return;
  }
  
  let html = '<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:20px; padding:20px;">';
  
  maps.forEach(map => {
    const statusColors = {
      0: '#999',
      1: '#4CAF50',
      2: '#FF9800'
    };
    const statusTexts = {
      0: '关闭',
      1: '开启',
      2: '维护'
    };
    const typeIcons = {
      1: '🏯',
      2: '🌲',
      3: '⚔️',
      4: '✨',
      5: '🏛️'
    };
    
    html += `
      <div class="map-card" onclick="showMapDetail(${map.id})" style="
        background: linear-gradient(135deg, rgba(20,25,45,0.9), rgba(30,35,55,0.9));
        border: 1px solid rgba(230,199,73,0.2);
        border-radius: 12px;
        padding: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      " onmouseover="this.style.transform='translateY(-5px)'; this.style.borderColor='rgba(230,199,73,0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='rgba(230,199,73,0.2)'">
        
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
          <div style="font-size:24px;">${typeIcons[map.mapType] || '🗺️'}</div>
          <div style="
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            background: ${statusColors[map.status]};
            color: #fff;
          ">${statusTexts[map.status]}</div>
        </div>
        
        <h3 style="color:var(--gold-primary); margin-bottom:10px; font-size:18px;">${map.mapName}</h3>
        
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;">
          <div style="color:var(--text-dim); font-size:13px;">
            <span style="color:var(--gold-primary);">推荐等级:</span> Lv.${map.recommendLevel}
          </div>
          <div style="color:var(--text-dim); font-size:13px;">
            <span style="color:var(--gold-primary);">推荐战力:</span> ${formatCombat(map.recommendCombat)}
          </div>
          <div style="color:var(--text-dim); font-size:13px;">
            <span style="color:var(--gold-primary);">怪物密度:</span> ${map.monsterDensity || '未知'}
          </div>
          <div style="color:var(--text-dim); font-size:13px;">
            <span style="color:var(--gold-primary);">掉落权重:</span> ${map.dropWeight || '未知'}
          </div>
        </div>
        
        <div style="
          background: rgba(0,0,0,0.3);
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 15px;
        ">
          <div style="color:var(--text-dim); font-size:12px; margin-bottom:5px;">主要产出</div>
          <div style="color:var(--text-main); font-size:14px;">${map.mainProducts || '未知'}</div>
        </div>
        
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; color:var(--text-dim);">
          <div>👥 在线：${map.onlineCount || 0}人</div>
          <div style="color:var(--gold-primary);">点击查看详情 ></div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

// 显示地图详情弹窗
function showMapDetail(mapId) {
  // 检查缓存
  const cached = mapDataCache[`map_${mapId}`];
  if (cached && (Date.now() - cached.timestamp) < CACHE_EXPIRY) {
    renderMapDetailPopup(cached.data);
    return;
  }
  
  const popup = document.getElementById('mapDetailPopup');
  const content = document.getElementById('mapDetailContent');
  content.innerHTML = '<div style="text-align:center; padding:40px; color:var(--text-dim);">加载中...</div>';
  popup.style.display = 'flex';
  
  fetch(`${API_BASE_URL}/map/${mapId}`)
    .then(response => handleResponse(response))
    .then(data => {
      // 更新缓存
      mapDataCache[`map_${mapId}`] = {
        data: data,
        timestamp: Date.now()
      };
      renderMapDetailPopup(data);
    })
    .catch(error => {
      console.error('加载地图详情失败:', error);
      content.innerHTML = '<div style="text-align:center; padding:40px; color:red;">加载失败</div>';
    });
}

// 渲染地图详情弹窗内容
function renderMapDetailPopup(map) {
  const content = document.getElementById('mapDetailContent');
  
  const statusColors = {
    0: '#999',
    1: '#4CAF50',
    2: '#FF9800'
  };
  const statusTexts = {
    0: '关闭',
    1: '开启',
    2: '维护'
  };
  const typeNames = {
    1: '主城',
    2: '野外',
    3: '副本',
    4: '秘境',
    5: '宗门'
  };
  const densityColors = {
    '低': '#4CAF50',
    '中': '#2196F3',
    '高': '#FF9800',
    '极高': '#f44336'
  };
  const dropColors = {
    '普通': '#999',
    '优秀': '#4CAF50',
    '稀有': '#2196F3',
    '史诗': '#FF9800',
    '传说': '#f44336'
  };
  
  // 检查用户等级是否达标
  const userLevel = parseInt(localStorage.getItem('userLevel') || '1');
  const isLevelSufficient = userLevel >= map.recommendLevel;
  
  let html = `
    <div style="
      background: linear-gradient(135deg, rgba(20,25,45,0.98), rgba(30,35,55,0.98));
      border: 1px solid rgba(230,199,73,0.3);
      border-radius: 16px;
      padding: 30px;
      max-width: 800px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    ">
      <!-- 头部 -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h2 style="color:var(--gold-primary); font-size:24px; margin:0;">${map.mapName}</h2>
        <span onclick="closeMapDetailPopup()" style="
          font-size: 28px;
          color: var(--text-dim);
          cursor: pointer;
          transition: color 0.3s;
        " onmouseover="this.style.color='var(--gold-primary)'" onmouseout="this.style.color='var(--text-dim)'">&times;</span>
      </div>
      
      <!-- 基本信息 -->
      <div style="
        background: rgba(0,0,0,0.3);
        padding: 20px;
        border-radius: 12px;
        margin-bottom: 20px;
      ">
        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:15px;">
          <div>
            <div style="color:var(--text-dim); font-size:13px; margin-bottom:5px;">地图类型</div>
            <div style="color:var(--text-main); font-size:16px;">${typeNames[map.mapType] || '未知'}</div>
          </div>
          <div>
            <div style="color:var(--text-dim); font-size:13px; margin-bottom:5px;">层级等级</div>
            <div style="color:var(--gold-primary); font-size:16px;">第${map.layerLevel}层</div>
          </div>
          <div>
            <div style="color:var(--text-dim); font-size:13px; margin-bottom:5px;">推荐等级</div>
            <div style="color:var(--text-main); font-size:16px;">Lv.${map.recommendLevel}</div>
          </div>
          <div>
            <div style="color:var(--text-dim); font-size:13px; margin-bottom:5px;">推荐战力</div>
            <div style="color:var(--gold-primary); font-size:16px;">${formatCombat(map.recommendCombat)}</div>
          </div>
          <div>
            <div style="color:var(--text-dim); font-size:13px; margin-bottom:5px;">怪物密度</div>
            <div style="color:${densityColors[map.monsterDensity] || '#fff'}; font-size:16px;">${map.monsterDensity || '未知'}</div>
          </div>
          <div>
            <div style="color:var(--text-dim); font-size:13px; margin-bottom:5px;">掉落权重</div>
            <div style="color:${dropColors[map.dropWeight] || '#fff'}; font-size:16px;">${map.dropWeight || '未知'}</div>
          </div>
        </div>
      </div>
      
      <!-- 环境描述 -->
      <div style="margin-bottom:20px;">
        <h3 style="color:var(--gold-primary); font-size:18px; margin-bottom:10px;">环境描述</h3>
        <div style="
          background: rgba(0,0,0,0.3);
          padding: 15px;
          border-radius: 8px;
          color: var(--text-main);
          line-height: 1.6;
        ">${map.environmentDesc || '暂无描述'}</div>
      </div>
      
      <!-- 主要产出 -->
      <div style="margin-bottom:20px;">
        <h3 style="color:var(--gold-primary); font-size:18px; margin-bottom:10px;">主要产出</h3>
        <div style="
          background: rgba(0,0,0,0.3);
          padding: 15px;
          border-radius: 8px;
          color: var(--text-main);
          line-height: 1.6;
        ">${map.mainProducts || '暂无数据'}</div>
      </div>
      
      <!-- 实时信息 -->
      <div style="
        background: rgba(230,199,73,0.1);
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
        display: flex;
        justify-content: space-around;
      ">
        <div style="text-align:center;">
          <div style="color:var(--text-dim); font-size:13px; margin-bottom:5px;">当前在线</div>
          <div style="color:var(--gold-primary); font-size:20px; font-weight:bold;">${map.onlineCount || 0}人</div>
        </div>
        <div style="text-align:center;">
          <div style="color:var(--text-dim); font-size:13px; margin-bottom:5px;">地图状态</div>
          <div style="color:${statusColors[map.status]}; font-size:16px; font-weight:bold;">${statusTexts[map.status]}</div>
        </div>
        ${map.weatherType ? `
        <div style="text-align:center;">
          <div style="color:var(--text-dim); font-size:13px; margin-bottom:5px;">天气</div>
          <div style="color:var(--text-main); font-size:16px;">${map.weatherType}</div>
        </div>
        ` : ''}
        ${map.specialEvent ? `
        <div style="text-align:center;">
          <div style="color:var(--text-dim); font-size:13px; margin-bottom:5px;">特殊事件</div>
          <div style="color:#FF5722; font-size:16px;">${map.specialEvent}</div>
        </div>
        ` : ''}
      </div>
      
      <!-- 用户等级提示 -->
      ${!isLevelSufficient ? `
      <div style="
        background: rgba(255,87,34,0.2);
        border: 1px solid #FF5722;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 20px;
      ">
        <div style="color:#FF5722; font-size:14px; margin-bottom:10px;">
          ⚠️ 等级不足提示
        </div>
        <div style="color:var(--text-dim); font-size:13px; line-height:1.6;">
          您的当前等级为 <strong style="color:var(--text-main);">Lv.${userLevel}</strong>，
          该地图推荐等级为 <strong style="color:var(--gold-primary);">Lv.${map.recommendLevel}</strong>。<br>
          建议您先提升等级后再来挑战，以免遭遇危险。
        </div>
      </div>
      ` : ''}
      
      <!-- 操作按钮 -->
      <div style="display:flex; gap:15px; justify-content:center;">
        ${isLevelSufficient && map.status === 1 ? `
        <button onclick="enterMap(${map.id})" style="
          flex: 1;
          padding: 15px 30px;
          background: linear-gradient(to bottom, var(--gold-primary), var(--gold-dim));
          border: none;
          border-radius: 8px;
          color: #1a2530;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
        " onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
          进入地图
        </button>
        ` : `
        <button disabled style="
          flex: 1;
          padding: 15px 30px;
          background: #555;
          border: none;
          border-radius: 8px;
          color: #999;
          font-size: 16px;
          cursor: not-allowed;
        ">
          ${!isLevelSufficient ? '等级不足' : map.status !== 1 ? '地图未开启' : '无法进入'}
        </button>
        `}
        <button onclick="closeMapDetailPopup()" style="
          flex: 1;
          padding: 15px 30px;
          background: transparent;
          border: 1px solid rgba(230,199,73,0.3);
          border-radius: 8px;
          color: var(--text-main);
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s;
        " onmouseover="this.style.borderColor='var(--gold-primary)'" onmouseout="this.style.borderColor='rgba(230,199,73,0.3)'">
          关闭
        </button>
      </div>
    </div>
  `;
  
  content.innerHTML = html;
}

// 关闭地图详情弹窗
function closeMapDetailPopup() {
  document.getElementById('mapDetailPopup').style.display = 'none';
}

// 进入地图
function enterMap(mapId) {
  const map = mapDataCache[`map_${mapId}`]?.data;
  if (!map) {
    showToast('地图信息加载失败', 'error');
    return;
  }
  
  // 这里可以跳转到对应的地图页面
  showToast(`正在进入${map.mapName}...`, 'success');
  setTimeout(() => {
    window.location.href = `map/map.html?mapId=${mapId}&mapCode=${map.mapCode}`;
  }, 1000);
}

// 格式化战力显示
function formatCombat(combat) {
  if (!combat) return '0';
  if (combat >= 10000) {
    return (combat / 10000).toFixed(1) + 'w';
  }
  return combat.toString();
}

// 显示提示消息
function showToast(message, type = 'info') {
  const colors = {
    info: '#2196F3',
    success: '#4CAF50',
    error: '#f44336',
    warning: '#FF9800'
  };
  
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${colors[type]};
    color: #fff;
    padding: 12px 30px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    animation: slideDown 0.3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideUp 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// 清除地图缓存
function clearMapCache() {
  mapDataCache = {};
}
