/**
 * 背包系统功能模块
 * 用于 character/character.html 的装备和背包功能
 */

window.InventorySystem = {
  playerItems: [],
  equipmentSlots: [],
  equippedItems: {},
  setBonuses: [],
  currentTab: 'all',
  
  // 装备槽位映射（从 API 加载，带默认值）
  slotMappings: {},
  
  // 初始化
  async init() {
    console.log('InventorySystem 初始化...');
    await this.loadEquipmentSlotsConfig();
    await this.loadPlayerItems();
    await this.loadEquipmentStatus();
    this.renderGrid();
    this.renderEquipmentSlots();
  },
  
  // 加载玩家物品
  async loadPlayerItems() {
    try {
      const roleId = window.APP_CONFIG?.currentRoleId || localStorage.getItem('currentRoleId');
      const response = await window.apiService.getAssets(roleId);
      
      if (response && Array.isArray(response)) {
        this.playerItems = response.map(item => ({
          id: item.id,
          name: item.assetName || item.name,
          type: item.assetType || item.type,
          subtype: item.subtype,
          quantity: item.quantity || item.count || 1,
          icon: this.getItemIcon(item.assetType || item.type),
          desc: item.description || '无描述',
          effect: item.effect || item.value || '',
          rarity: item.rarity || 'common',
          affixes: item.affixes || []
        }));
        console.log('物品加载成功:', this.playerItems.length);
      } else {
        // API返回但数据为空
        this.playerItems = [];
        console.warn('API返回空物品数据');
      }
    } catch (error) {
      console.error('加载物品失败:', error);
      // 不使用默认数据，保持为空数组
      this.playerItems = [];
    }
  },
  
  // 加载装备槽位配置（从 API）
  async loadEquipmentSlotsConfig() {
    try {
      if (!window.apiService || typeof window.apiService.getConfig !== 'function') {
        console.warn('⚠️ apiService.getConfig 不存在');
        this.equipmentSlots = [];
        this.slotMappings = {};
        return;
      }
      const response = await window.apiService.getConfig('equipment_slots');
      if (response) {
        const config = typeof response.content === 'string' ? JSON.parse(response.content) : response.content;
        this.equipmentSlots = config.slots || [];
        this.slotMappings = {};
        
        // 构建映射关系
        this.equipmentSlots.forEach(slot => {
          this.slotMappings[slot.name] = slot.slot_id;
        });
        
        console.log('✅ 装备槽位配置已加载');
      } else {
        // API返回但数据为空
        this.equipmentSlots = [];
        this.slotMappings = {};
        console.warn('API返回空装备槽位配置');
      }
    } catch (error) {
      console.error('❌ 加载装备槽位配置失败:', error);
      // 不使用默认数据，保持为空
      this.equipmentSlots = [];
      this.slotMappings = {};
    }
  },
  
  // 加载装备状态
  async loadEquipmentStatus() {
    try {
      const roleId = window.APP_CONFIG?.currentRoleId || localStorage.getItem('currentRoleId');
      const response = await window.apiService.getEquippedItems(roleId);
      
      if (response && Array.isArray(response)) {
        const slotMap = {
          1: 'weapon',
          2: 'head',
          3: 'body',
          4: 'legs',
          5: 'feet',
          6: 'accessory'
        };
        
        this.equippedItems = {};
        response.forEach((item) => {
          if (item) {
            const slotKey = slotMap[item.slot || item.slotId];
            if (slotKey) {
              this.equippedItems[slotKey] = {
                id: item.id || item.itemId,
                name: item.itemName || item.name || item.assetName,
                icon: this.getItemIcon(item.itemType || item.assetType || '装备')
              };
            }
          }
        });
        console.log('装备状态加载成功');
      } else if (response && response.equippedList && Array.isArray(response.equippedList)) {
        const slotMap = {
          1: 'weapon',
          2: 'head',
          3: 'body',
          4: 'legs',
          5: 'feet',
          6: 'accessory'
        };
        
        this.equippedItems = {};
        response.equippedList.forEach((item) => {
          if (item) {
            const slotKey = slotMap[item.slot || item.slotId];
            if (slotKey) {
              this.equippedItems[slotKey] = {
                id: item.id || item.itemId,
                name: item.name || item.assetName,
                icon: this.getItemIcon(item.assetType || '装备')
              };
            }
          }
        });
        console.log('装备状态加载成功');
      }
    } catch (error) {
      console.error('加载装备状态失败:', error);
    }
  },
  
  // 获取物品图标
  getItemIcon(type) {
    const icons = {
      '装备': '️',
      '武器': '🗡️',
      '丹药': '💊',
      '消耗品': '💊',
      '材料': '🌿',
      '任务': '📜',
      '饰品': '💍',
      '头盔': '👒',
      '衣服': '👕',
      '裤子': '👖',
      '鞋子': '👢',
      '头部': '👒',
      '身体': '👕',
      '腿部': '👖',
      '脚部': '👢'
    };
    return icons[type] || '📦';
  },
  
  // 渲染装备槽位
  renderEquipmentSlots() {
    const grid = document.getElementById('equip-grid');
    if (!grid) {
      console.error('未找到 equip-grid 元素');
      return;
    }
    
    grid.innerHTML = '';
    
    if (this.equipmentSlots.length === 0) {
      // 如果没有装备槽位配置，显示加载中状态
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <i class="fas fa-suitcase"></i>
          <div>装备槽位加载中...</div>
        </div>
      `;
      return;
    }
    
    this.equipmentSlots.forEach(slot => {
      const slotElement = document.createElement('div');
      const equippedItem = this.equippedItems[slot.slot_id];
      
      if (!equippedItem) {
        slotElement.className = 'equip-slot empty';
        slotElement.innerHTML = `
          <div style="font-size: 1.8rem;">${slot.icon || '📦'}</div>
          <div class="equip-label">${slot.name || '未知'}</div>
        `;
      } else {
        slotElement.className = 'equip-slot';
        slotElement.innerHTML = `
          <div class="item-icon" style="font-size: 1.8rem;">${equippedItem.icon || '📦'}</div>
          <div class="equip-label">${slot.name || '未知'}</div>
        `;
        // 点击已装备物品显示操作菜单
        slotElement.onclick = () => this.showEquippedItemActionMenu(slot.slot_id, equippedItem);
      }
      
      grid.appendChild(slotElement);
    });
  },
  
  // 渲染物品网格
  renderGrid() {
    const grid = document.getElementById('item-grid');
    if (!grid) {
      console.error('未找到 item-grid 元素');
      return;
    }
    
    grid.innerHTML = '';
    
    const filteredItems = this.currentTab === 'all' 
      ? this.playerItems 
      : this.playerItems.filter(item => {
          if (this.currentTab === 'equip' || this.currentTab === 'equipment') return item.type === '装备';
          if (this.currentTab === 'consumable') return item.type === '消耗品' || item.type === '丹药';
          if (this.currentTab === 'material') return item.type === '材料';
          if (this.currentTab === 'quest') return item.type === '任务';
          return true;
        });
    
    if (filteredItems.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-box-open"></i>
          <div>背包空空如也</div>
        </div>
      `;
      return;
    }
    
    filteredItems.forEach(item => {
      const itemSlot = document.createElement('div');
      itemSlot.className = 'item-slot';
      
      // 添加品质标识
      const qualityClass = `q-${item.rarity || 'common'}`;
      
      itemSlot.innerHTML = `
        <div class="quality-indicator ${qualityClass}"></div>
        <div class="item-icon" style="font-size: 1.4rem;">${item.icon || '📦'}</div>
        ${item.quantity > 1 ? `<div class="item-count">${item.quantity}</div>` : ''}
      `;
      
      // 点击显示操作菜单
      itemSlot.onclick = () => this.showItemActionMenu(item);
      
      grid.appendChild(itemSlot);
    });
  },
  
  // 显示物品操作菜单
  showItemActionMenu(item) {
    const roleId = window.APP_CONFIG?.currentRoleId || localStorage.getItem('currentRoleId');
    
    // 如果是装备，显示智能对比面板
    if (item.type === '装备' && item.subtype) {
      // 使用动态加载的槽位映射
      const slotId = this.slotMappings[item.subtype];
      if (slotId) {
        // 显示智能对比面板
        window.EquipmentComparator.showCompare(item, slotId);
        return;
      }
    }
    
    // 非装备物品显示普通详情
    this.showSimpleItemDetail(item);
  },
  
  // 显示简单物品详情（非装备）
  showSimpleItemDetail(item) {
    const modal = document.getElementById('item-modal');
    if (!modal) return;
    
    // 设置弹窗内容
    document.getElementById('m-icon').textContent = item.icon || '📦';
    document.getElementById('m-name').textContent = item.name || '未知物品';
    document.getElementById('m-type').textContent = `${item.type || ''} ${item.subtype || ''}`;
    document.getElementById('m-desc').textContent = item.desc || item.description || '无描述';
    
    // 显示属性词条
    const affixesContainer = document.getElementById('m-affixes');
    if (item.affixes && item.affixes.length > 0) {
      affixesContainer.innerHTML = item.affixes.map(affix => 
        `<div class="affix-item ${affix.isBonus ? 'bonus' : ''}">${affix.text || affix}</div>`
      ).join('');
    } else if (item.effect) {
      affixesContainer.innerHTML = `<div class="affix-item bonus">${item.effect}</div>`;
    } else {
      affixesContainer.innerHTML = '';
    }
    
    // 更新操作按钮
    const actionBtn = document.getElementById('m-action-btn');
    if (item.type === '丹药') {
      actionBtn.textContent = '使用';
      actionBtn.className = 'modal-btn btn-primary';
      actionBtn.onclick = () => {
        showToast('丹药使用功能开发中');
        closeModalDirect();
      };
    } else if (item.type === '消耗品') {
      actionBtn.textContent = '使用';
      actionBtn.className = 'modal-btn btn-primary';
      actionBtn.onclick = () => {
        showToast('消耗品使用功能开发中');
        closeModalDirect();
      };
    } else {
      actionBtn.textContent = '查看';
      actionBtn.className = 'modal-btn btn-secondary';
      actionBtn.onclick = () => {
        closeModalDirect();
      };
    }
    
    // 显示弹窗
    modal.classList.add('active');
  },
  
  // 显示已装备物品操作菜单
  showEquippedItemActionMenu(slotId, equippedItem) {
    const roleId = window.APP_CONFIG?.currentRoleId || localStorage.getItem('currentRoleId');
    
    const modal = document.getElementById('item-modal');
    if (!modal) return;
    
    // 设置弹窗内容
    document.getElementById('m-icon').textContent = equippedItem.icon || '📦';
    document.getElementById('m-name').textContent = equippedItem.name || '未知装备';
    document.getElementById('m-type').textContent = `装备中 · ${this.equipmentSlots.find(s => s.slot_id === slotId)?.name || ''}`;
    document.getElementById('m-desc').textContent = '点击卸下或查看详情';
    document.getElementById('m-affixes').innerHTML = '';
    
    // 更新操作按钮
    const actionBtn = document.getElementById('m-action-btn');
    actionBtn.textContent = '卸下';
    actionBtn.className = 'modal-btn btn-secondary';
    actionBtn.onclick = () => {
      this.unequipEquipment(roleId, slotId);
      closeModalDirect();
    };
    
    // 显示弹窗
    modal.classList.add('active');
  },
  
  // 穿上装备
  async wearEquipment(roleId, roleEquipmentId) {
    try {
      const response = await window.apiService.equipItem(roleId, roleEquipmentId);
      
      if (response) {
        showToast('✅ 装备已穿上');
        await this.loadPlayerItems();
        await this.loadEquipmentStatus();
        this.renderGrid();
        this.renderEquipmentSlots();
      } else {
        showToast('穿上装备失败');
      }
    } catch (error) {
      console.error('穿上装备失败:', error);
      showToast('穿上装备失败：' + error.message);
    }
  },
  
  // 卸下装备
  async unequipEquipment(roleId, slotId) {
    try {
      // 使用动态加载的槽位索引（从 API 配置获取）
      const slotIndex = this.getSlotIndex(slotId);
      
      if (slotIndex === undefined || slotIndex === null) {
        showToast('无效的装备部位');
        return;
      }
      
      const response = await window.apiService.unequipItem(roleId, slotIndex);
      
      if (response) {
        showToast('✅ 装备已卸下');
        await this.loadPlayerItems();
        await this.loadEquipmentStatus();
        this.renderGrid();
        this.renderEquipmentSlots();
      } else {
        showToast('卸下装备失败');
      }
    } catch (error) {
      console.error('卸下装备失败:', error);
      showToast('卸下装备失败：' + error.message);
    }
  },
  
  // 获取槽位索引（从配置或默认值）
  getSlotIndex(slotId) {
    // 尝试从配置中获取
    const slot = this.equipmentSlots.find(s => s.slot_id === slotId);
    if (slot && slot.index !== undefined) {
      return slot.index;
    }
    
    // 降级方案：使用默认映射
    const defaultIndices = {
      'weapon': 1,
      'head': 2,
      'body': 3,
      'legs': 4,
      'feet': 5,
      'accessory': 6
    };
    return defaultIndices[slotId];
  },
  
  // 切换分类
  switchTab(tab) {
    this.currentTab = tab;
    
    // 更新标签样式
    document.querySelectorAll('.tab-pill').forEach(pill => {
      pill.classList.remove('active');
      if (pill.textContent === this.getTabName(tab)) {
        pill.classList.add('active');
      }
    });
    
    this.renderGrid();
  },
  
  // 获取标签名称
  getTabName(tab) {
    const names = {
      'all': '全部',
      'attributes': '属性',
      'equip': '装备',
      'equipment': '装备',
      'consumable': '消耗品',
      'material': '材料',
      'quest': '任务'
    };
    return names[tab] || '全部';
  }
};

// 辅助函数
function showToast(message) {
  if (window.showToast) {
    window.showToast(message);
  } else {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.8);
      color: #fff;
      padding: 20px 40px;
      border-radius: 10px;
      z-index: 9999;
      text-align: center;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }
}

function closeModalDirect() {
  const modal = document.getElementById('item-modal');
  if (modal) {
    modal.classList.remove('active');
  }
}

function closeModal(event) {
  if (event.target.id === 'item-modal') {
    closeModalDirect();
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  // 延迟初始化，确保其他脚本已加载
  setTimeout(() => {
    if (window.InventorySystem) {
      console.log('准备初始化 InventorySystem...');
      // 注意：实际初始化由 character.html 的 initCharacterPage 调用
    }
  }, 500);
});
