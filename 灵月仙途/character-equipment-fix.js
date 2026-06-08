/**
 * 修复 character/character.html 的装备系统
 * 添加穿上/卸下装备功能
 */

// 在 character.html 的 JavaScript 部分添加以下函数：

/**
 * 穿上装备
 * @param {number} roleId - 角色 ID
 * @param {number} roleEquipmentId - 角色装备 ID（在背包中的装备）
 * @param {string} slotType - 装备部位
 */
async function wearEquipment(roleId, roleEquipmentId, slotType) {
  try {
    const response = await window.apiService.equipItem(roleId, roleEquipmentId);
    
    if (response && response.code === 0) {
      showToast(`✅ 装备已穿上`);
      // 刷新装备显示
      await loadEquipment(roleId);
      await loadItems(roleId);
    } else {
      showToast(response?.message || '穿上装备失败');
    }
  } catch (error) {
    console.error('穿上装备失败:', error);
    showToast('穿上装备失败：' + error.message);
  }
}

/**
 * 卸下装备
 * @param {number} roleId - 角色 ID
 * @param {string} slotType - 装备部位
 */
async function unequipEquipment(roleId, slotType) {
  try {
    const slotMap = {
      'weapon': 1,
      'head': 2,
      'body': 3,
      'legs': 4,
      'feet': 5,
      'accessory': 6
    };
    
    const slot = slotMap[slotType];
    if (slot === undefined) {
      showToast('无效的装备部位');
      return;
    }
    
    const response = await window.apiService.unequipItem(roleId, slot);
    
    if (response && response.code === 0) {
      showToast(`✅ 装备已卸下`);
      // 刷新装备显示
      await loadEquipment(roleId);
      await loadItems(roleId);
    } else {
      showToast(response?.message || '卸下装备失败');
    }
  } catch (error) {
    console.error('卸下装备失败:', error);
    showToast('卸下装备失败：' + error.message);
  }
}

/**
 * 显示装备操作菜单
 * @param {object} item - 物品对象
 * @param {number} roleId - 角色 ID
 */
function showEquipmentActionMenu(item, roleId) {
  const isEquipment = item.assetType === '装备' || item.type === '装备';
  
  if (!isEquipment) {
    // 不是装备，只显示详情
    showDetail(item.assetName || item.name, item.description || '', item.effect || item.value || '');
    return;
  }
  
  // 创建操作菜单
  const modal = document.createElement('div');
  modal.id = 'equipmentActionModal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  const slotMap = {
    '武器': 'weapon',
    '头盔': 'head',
    '衣服': 'body',
    '裤子': 'legs',
    '鞋子': 'feet',
    '饰品': 'accessory'
  };
  
  const slotType = slotMap[item.subtype] || 'unknown';
  
  modal.innerHTML = `
    <div style="background: var(--bg-panel); border: 1px solid var(--gold-primary); border-radius: 10px; padding: 20px; width: 90%; max-width: 400px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="color: var(--gold-primary); font-size: 1.2rem;">${item.assetName || item.name}</h2>
        <button onclick="document.getElementById('equipmentActionModal').remove()" style="background: none; border: none; color: var(--text-dim); font-size: 24px; cursor: pointer;">&times;</button>
      </div>
      
      <div style="color: var(--text-dim); margin-bottom: 20px;">
        ${item.description || '无描述'}
      </div>
      
      <div style="color: var(--gold); margin-bottom: 20px; font-size: 0.9rem;">
        ${item.effect || item.value || ''}
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <button onclick="wearEquipment(${roleId}, ${item.id}, '${slotType}'); document.getElementById('equipmentActionModal').remove();" 
                style="padding: 12px; background: var(--gold-primary); border: none; border-radius: 6px; color: #000; font-weight: bold; cursor: pointer;">
          👔 穿上
        </button>
        <button onclick="showDetail('${item.assetName || item.name}', '${item.description || ''}', '${item.effect || item.value || ''}')" 
                style="padding: 12px; background: rgba(255,255,255,0.1); border: 1px solid var(--text-dim); border-radius: 6px; color: var(--text-light); cursor: pointer;">
          📖 详情
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

/**
 * 显示已装备物品操作菜单
 * @param {string} slotName - 部位名称
 * @param {string} slotType - 部位类型 (weapon, head, etc.)
 * @param {object} equippedItem - 已装备的物品
 * @param {number} roleId - 角色 ID
 */
function showEquippedItemActionMenu(slotName, slotType, equippedItem, roleId) {
  if (!equippedItem) {
    showToast('该部位未装备物品');
    return;
  }
  
  const modal = document.createElement('div');
  modal.id = 'equippedActionModal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  modal.innerHTML = `
    <div style="background: var(--bg-panel); border: 1px solid var(--gold-primary); border-radius: 10px; padding: 20px; width: 90%; max-width: 400px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="color: var(--gold-primary); font-size: 1.2rem;">${equippedItem.itemName || equippedItem.name}</h2>
        <button onclick="document.getElementById('equippedActionModal').remove()" style="background: none; border: none; color: var(--text-dim); font-size: 24px; cursor: pointer;">&times;</button>
      </div>
      
      <div style="color: var(--text-dim); margin-bottom: 20px;">
        ${equippedItem.description || '无描述'}
      </div>
      
      <div style="color: var(--gold); margin-bottom: 20px; font-size: 0.9rem;">
        ${equippedItem.effect || equippedItem.attrs || ''}
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <button onclick="unequipEquipment(${roleId}, '${slotType}'); document.getElementById('equippedActionModal').remove();" 
                style="padding: 12px; background: #e74c3c; border: none; border-radius: 6px; color: #fff; font-weight: bold; cursor: pointer;">
          👋 卸下
        </button>
        <button onclick="showDetail('${equippedItem.itemName || equippedItem.name}', '${equippedItem.description || ''}', '${equippedItem.effect || equippedItem.attrs || ''}')" 
                style="padding: 12px; background: rgba(255,255,255,0.1); border: 1px solid var(--text-dim); border-radius: 6px; color: var(--text-light); cursor: pointer;">
          📖 详情
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// 修改 updateCharacterAssets 函数，为物品点击添加装备菜单支持
function updateCharacterAssets(assets) {
  const itemGrid = document.getElementById('characterItemGrid');
  if (!itemGrid) return;
  
  itemGrid.innerHTML = '';
  
  const roleId = window.APP_CONFIG?.currentRoleId || localStorage.getItem('currentRoleId');
  
  if (Array.isArray(assets) && assets.length > 0) {
    assets.forEach(item => {
      const itemSlot = document.createElement('div');
      itemSlot.className = 'item-slot';
      
      const itemName = item.assetName || item.name || '物品';
      const itemDesc = item.description || '无描述';
      const itemValue = item.value || item.effect || '';
      
      // 点击时显示操作菜单（包括穿上装备）
      itemSlot.onclick = () => showEquipmentActionMenu(item, roleId);
      
      itemSlot.innerHTML = `
        ${getItemIcon(item.assetType || item.type)}
        <div class="item-count">${item.quantity || 1}</div>
      `;
      itemGrid.appendChild(itemSlot);
    });
  } else {
    itemGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 20px; color: var(--text-dim);">
        📦 背包为空
      </div>
    `;
  }
}

// 添加加载装备函数
async function loadEquipment(roleId) {
  try {
    const response = await window.apiService.getEquippedItems(roleId);
    if (response && response.code === 0) {
      updateEquipmentDisplay(response.data);
    }
  } catch (error) {
    console.error('加载装备失败:', error);
  }
}

// 更新装备显示
function updateEquipmentDisplay(equippedData) {
  const slotMap = {
    0: { name: '武器', icon: '⚔️', type: 'weapon' },
    1: { name: '头部', icon: '🪖', type: 'head' },
    2: { name: '身体', icon: '👕', type: 'body' },
    3: { name: '腿部', icon: '👖', type: 'legs' },
    4: { name: '鞋子', icon: '👢', type: 'feet' },
    5: { name: '饰品', icon: '💍', type: 'accessory' }
  };
  
  const roleId = window.APP_CONFIG?.currentRoleId || localStorage.getItem('currentRoleId');
  
  Object.keys(slotMap).forEach(slotIndex => {
    const slot = slotMap[slotIndex];
    const equippedItem = equippedData?.[slotIndex];
    
    const equipSlotEl = document.querySelector(`.equip-slot:nth-child(${parseInt(slotIndex)})`);
    if (equipSlotEl) {
      if (equippedItem) {
        equipSlotEl.innerHTML = `${slot.icon}<div class="equip-label">${equippedItem.itemName || slot.name}</div>`;
        equipSlotEl.style.background = 'rgba(230, 199, 73, 0.2)';
        equipSlotEl.style.borderColor = 'var(--gold)';
        // 点击已装备物品显示操作菜单
        equipSlotEl.onclick = () => showEquippedItemActionMenu(slot.name, slot.type, equippedItem, roleId);
      } else {
        equipSlotEl.innerHTML = `${slot.icon}<div class="equip-label">${slot.name}</div>`;
        equipSlotEl.style.background = '';
        equipSlotEl.style.borderColor = '';
        equipSlotEl.onclick = null;
      }
    }
  });
}
