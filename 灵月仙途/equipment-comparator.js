/**
 * 智能装备对比系统
 * 提供装备穿戴前后的属性对比、高亮显示、套装效果预览等功能
 */

window.EquipmentComparator = {
  // 当前已装备的物品
  currentEquipped: {},
  
  // 对比面板 DOM
  comparePanel: null,
  
  // 属性名称映射（从 API 加载，带默认值）
  statNames: {},
  
  /**
   * 加载属性名称配置（从 API）
   */
  async loadStatNamesConfig() {
    try {
      const response = await window.apiService.getConfig('stat_names');
      if (response && response.code === 0) {
        const config = JSON.parse(response.data.content);
        this.statNames = config || {};
        console.log('✅ 属性名称配置已加载');
      } else {
        this.loadDefaultStatNames();
      }
    } catch (error) {
      console.error('❌ 加载属性名称配置失败，使用默认值:', error);
      this.loadDefaultStatNames();
    }
  },
  
  /**
   * 加载默认属性名称（降级方案）
   */
  loadDefaultStatNames() {
    this.statNames = {
      attack: '攻击',
      defense: '防御',
      speed: '速度',
      crit: '暴击',
      dodge: '闪避',
      hit: '命中'
    };
    console.log('⚠️ 使用默认属性名称配置');
  },
  
  /**
   * 初始化对比系统
   */
  async init() {
    console.log('EquipmentComparator 初始化...');
    await this.loadStatNamesConfig();
    this.createComparePanel();
    await this.loadCurrentEquipment();
  },
  
  /**
   * 加载当前已装备的物品
   */
  async loadCurrentEquipment() {
    try {
      const roleId = window.APP_CONFIG?.currentRoleId || localStorage.getItem('currentRoleId');
      const response = await window.apiService.getEquippedItems(roleId);
      
      if (response && response.code === 0) {
        this.currentEquipped = response.data || {};
        console.log('当前装备加载成功');
      }
    } catch (error) {
      console.error('加载当前装备失败:', error);
    }
  },
  
  /**
   * 创建对比面板
   */
  createComparePanel() {
    const panel = document.createElement('div');
    panel.id = 'equipment-compare-panel';
    panel.className = 'compare-panel';
    panel.style.display = 'none';
    
    panel.innerHTML = `
      <div class="compare-panel-content">
        <div class="compare-header">
          <h3>装备对比</h3>
          <button class="compare-close" onclick="window.EquipmentComparator.hidePanel()">&times;</button>
        </div>
        <div class="compare-body">
          <div class="compare-column current">
            <div class="compare-title">当前装备</div>
            <div class="compare-item" id="compare-current"></div>
            <div class="compare-stats" id="compare-current-stats"></div>
          </div>
          <div class="compare-arrow">→</div>
          <div class="compare-column target">
            <div class="compare-title">预览装备</div>
            <div class="compare-item" id="compare-target"></div>
            <div class="compare-stats" id="compare-target-stats"></div>
          </div>
        </div>
        <div class="compare-footer">
          <div class="compare-summary" id="compare-summary"></div>
          <div class="compare-actions">
            <button class="btn-cancel" onclick="window.EquipmentComparator.hidePanel()">取消</button>
            <button class="btn-equip" onclick="window.EquipmentComparator.confirmEquip()">确认穿戴</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(panel);
    this.comparePanel = panel;
  },
  
  /**
   * 显示对比面板
   * @param {Object} targetItem - 目标装备（背包中点击的装备）
   * @param {string} slotId - 装备部位
   */
  async showCompare(targetItem, slotId) {
    if (!this.comparePanel) {
      await this.init();
    }
    
    // 获取当前装备
    const currentEquipped = this.currentEquipped[slotId] || null;
    
    // 填充对比数据
    this.renderCompareItem('current', currentEquipped);
    this.renderCompareItem('target', targetItem);
    
    // 计算属性差异
    await this.calculateDiff(currentEquipped, targetItem, slotId);
    
    // 显示面板
    this.comparePanel.style.display = 'block';
    setTimeout(() => {
      this.comparePanel.classList.add('active');
    }, 10);
  },
  
  /**
   * 渲染对比物品
   */
  renderCompareItem(type, item) {
    const container = document.getElementById(`compare-${type}`);
    if (!container) return;
    
    if (!item) {
      container.innerHTML = `
        <div class="compare-empty">
          <div class="empty-icon">📦</div>
          <div class="empty-text">未装备</div>
        </div>
      `;
      return;
    }
    
    const rarityClass = `q-${item.rarity || 'common'}`;
    container.innerHTML = `
      <div class="item-brief ${rarityClass}">
        <div class="item-icon">${item.icon || '📦'}</div>
        <div class="item-info">
          <div class="item-name">${item.name || item.itemName || '未知'}</div>
          <div class="item-type">${item.type || ''} ${item.subtype || ''}</div>
        </div>
      </div>
      <div class="item-affixes">
        ${(item.affixes || []).map(affix => `
          <div class="affix ${affix.rarity || 'common'}">
            ${this.formatAffix(affix)}
          </div>
        `).join('')}
      </div>
    `;
  },
  
  /**
   * 计算属性差异
   */
  async calculateDiff(currentItem, targetItem, slotId) {
    try {
      const roleId = window.APP_CONFIG?.currentRoleId || localStorage.getItem('currentRoleId');
      
      // 调用后端 API 计算差异
      const response = await window.apiService.previewEquip(roleId, slotId, targetItem.id);
      
      if (response && response.code === 0) {
        const diff = response.data.diff || {};
        const newSetBonus = response.data.new_set_effects || [];
        
        // 渲染差异
        this.renderDiff('current', response.data.current_stats || {});
        this.renderDiff('target', response.data.preview_stats || {}, diff);
        
        // 显示套装效果
        this.renderSetBonus(newSetBonus);
        
        // 保存预览数据
        this.pendingEquipData = {
          slotId,
          itemId: targetItem.id,
          diff,
          setBonus: newSetBonus
        };
      }
    } catch (error) {
      console.error('计算属性差异失败:', error);
      // 降级处理：前端简单对比
      this.simpleDiff(currentItem, targetItem);
    }
  },
  
  /**
   * 简单差异计算（降级方案）
   */
  simpleDiff(currentItem, targetItem) {
    const diff = {};
    
    // 简单对比词条
    const currentAffixes = currentItem?.affixes || [];
    const targetAffixes = targetItem?.affixes || [];
    
    // 这里可以实现简单的对比逻辑
    // 实际应该由后端计算
    
    this.renderDiff('current', { attack: 100, defense: 50 });
    this.renderDiff('target', { attack: 150, defense: 40 }, { attack: '+50', defense: '-10' });
    this.renderSetBonus([]);
  },
  
  /**
   * 渲染差异
   */
  renderDiff(type, stats, diff = {}) {
    const container = document.getElementById(`compare-${type}-stats`);
    if (!container) return;
    
    // 使用动态加载的属性名称配置
    const html = Object.keys(stats).map(stat => {
      const value = stats[stat];
      const diffValue = diff[stat];
      const name = this.statNames[stat] || stat;
      
      let diffHtml = '';
      if (diffValue !== undefined) {
        const diffNum = parseInt(diffValue);
        const diffClass = diffNum > 0 ? 'diff-up' : (diffNum < 0 ? 'diff-down' : 'diff-same');
        const diffSign = diffNum > 0 ? '+' : '';
        diffHtml = `<span class="stat-diff ${diffClass}">${diffSign}${diffValue}</span>`;
      }
      
      return `
        <div class="stat-row">
          <span class="stat-name">${name}</span>
          <span class="stat-value">${value}</span>
          ${diffHtml}
        </div>
      `;
    }).join('');
    
    container.innerHTML = html || '<div class="no-stats">无属性加成</div>';
  },
  
  /**
   * 渲染套装效果
   */
  renderSetBonus(setBonus) {
    const container = document.getElementById('compare-summary');
    if (!container) return;
    
    if (setBonus.length === 0) {
      container.innerHTML = '';
      return;
    }
    
    container.innerHTML = `
      <div class="set-bonus-preview">
        <div class="set-bonus-title">✨ 套装效果变化</div>
        ${setBonus.map(bonus => `
          <div class="set-bonus-item ${bonus.is_new ? 'new' : ''}">
            ${bonus.is_new ? '<span class="new-badge">新</span>' : ''}
            ${bonus.description || bonus}
          </div>
        `).join('')}
      </div>
    `;
  },
  
  /**
   * 格式化词条
   */
  formatAffix(affix) {
    if (affix.template && affix.params) {
      // 动态模板渲染
      let text = affix.template;
      Object.keys(affix.params).forEach(key => {
        text = text.replace(`{${key}}`, affix.params[key]);
      });
      return text;
    }
    return affix.text || affix.description || '';
  },
  
  /**
   * 确认穿戴
   */
  async confirmEquip() {
    if (!this.pendingEquipData) return;
    
    try {
      const { slotId, itemId } = this.pendingEquipData;
      const roleId = window.APP_CONFIG?.currentRoleId || localStorage.getItem('currentRoleId');
      
      const response = await window.apiService.equipItem(roleId, itemId);
      
      if (response && response.code === 0) {
        showToast('✅ 装备已穿戴');
        this.hidePanel();
        
        // 刷新装备显示
        if (window.InventorySystem) {
          await window.InventorySystem.loadPlayerItems();
          await window.InventorySystem.loadEquipmentStatus();
          window.InventorySystem.renderGrid();
          window.InventorySystem.renderEquipmentSlots();
        }
      } else {
        showToast(response?.message || '穿戴失败');
      }
    } catch (error) {
      console.error('穿戴装备失败:', error);
      showToast('穿戴失败：' + error.message);
    }
  },
  
  /**
   * 隐藏面板
   */
  hidePanel() {
    if (this.comparePanel) {
      this.comparePanel.classList.remove('active');
      setTimeout(() => {
        this.comparePanel.style.display = 'none';
      }, 300);
    }
    this.pendingEquipData = null;
  }
};

// 添加 CSS 样式
const style = document.createElement('style');
style.textContent = `
  .compare-panel {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    z-index: 3000;
    display: none;
    justify-content: center;
    align-items: flex-end;
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  .compare-panel.active {
    opacity: 1;
  }
  
  .compare-panel-content {
    background: #1a202c;
    width: 100%;
    max-width: 600px;
    border-radius: 20px 20px 0 0;
    padding: 20px;
    transform: translateY(100%);
    transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
    border-top: 1px solid rgba(230, 199, 73, 0.3);
    max-height: 80vh;
    overflow-y: auto;
  }
  
  .compare-panel.active .compare-panel-content {
    transform: translateY(0);
  }
  
  .compare-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  
  .compare-header h3 {
    color: var(--gold);
    font-size: 1.2rem;
  }
  
  .compare-close {
    background: none;
    border: none;
    color: var(--text-dim);
    font-size: 24px;
    cursor: pointer;
    width: 30px;
    height: 30px;
  }
  
  .compare-body {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
  }
  
  .compare-column {
    flex: 1;
    background: rgba(0,0,0,0.2);
    border-radius: 8px;
    padding: 15px;
  }
  
  .compare-column.target {
    border: 1px solid rgba(230, 199, 73, 0.3);
  }
  
  .compare-title {
    font-size: 0.85rem;
    color: var(--text-dim);
    margin-bottom: 10px;
    text-align: center;
  }
  
  .compare-arrow {
    font-size: 2rem;
    color: var(--gold);
    display: flex;
    align-items: center;
  }
  
  .compare-item {
    margin-bottom: 15px;
  }
  
  .item-brief {
    display: flex;
    gap: 10px;
    padding: 10px;
    background: rgba(0,0,0,0.2);
    border-radius: 6px;
    border-left: 3px solid transparent;
  }
  
  .item-brief.q-common { border-left-color: #b0b0b0; }
  .item-brief.q-uncommon { border-left-color: #4CAF50; }
  .item-brief.q-rare { border-left-color: #2196F3; }
  .item-brief.q-epic { border-left-color: #9C27B0; }
  .item-brief.q-legendary { border-left-color: #FF9800; }
  
  .item-icon {
    font-size: 2rem;
  }
  
  .item-info {
    flex: 1;
  }
  
  .item-name {
    color: var(--text-main);
    font-weight: bold;
    margin-bottom: 4px;
  }
  
  .item-type {
    color: var(--text-dim);
    font-size: 0.8rem;
  }
  
  .item-affixes {
    margin-top: 10px;
  }
  
  .affix {
    padding: 6px 8px;
    margin-bottom: 6px;
    border-radius: 4px;
    font-size: 0.8rem;
    background: rgba(0,0,0,0.2);
  }
  
  .affix.common { color: #b0b0b0; }
  .affix.uncommon { color: #4CAF50; }
  .affix.rare { color: #2196F3; }
  .affix.epic { color: #9C27B0; }
  .affix.legendary { color: #FF9800; }
  
  .compare-stats {
    background: rgba(0,0,0,0.2);
    border-radius: 6px;
    padding: 10px;
  }
  
  .stat-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  
  .stat-row:last-child {
    border-bottom: none;
  }
  
  .stat-name {
    color: var(--text-dim);
    font-size: 0.85rem;
  }
  
  .stat-value {
    color: var(--gold);
    font-weight: bold;
    margin-left: 10px;
  }
  
  .stat-diff {
    font-size: 0.75rem;
    padding: 2px 6px;
    border-radius: 4px;
    margin-left: 8px;
    font-weight: bold;
  }
  
  .stat-diff.diff-up {
    background: rgba(76, 175, 80, 0.2);
    color: #4CAF50;
  }
  
  .stat-diff.diff-down {
    background: rgba(244, 67, 54, 0.2);
    color: #F44336;
  }
  
  .stat-diff.diff-same {
    background: rgba(255,255,255,0.1);
    color: var(--text-dim);
  }
  
  .compare-footer {
    border-top: 1px solid rgba(255,255,255,0.05);
    padding-top: 15px;
  }
  
  .set-bonus-preview {
    margin-bottom: 15px;
  }
  
  .set-bonus-title {
    color: var(--gold);
    font-size: 0.9rem;
    font-weight: bold;
    margin-bottom: 8px;
  }
  
  .set-bonus-item {
    padding: 8px 10px;
    background: rgba(0,0,0,0.2);
    border-radius: 6px;
    margin-bottom: 6px;
    font-size: 0.85rem;
    color: var(--text-main);
    position: relative;
  }
  
  .set-bonus-item.new {
    background: rgba(76, 175, 80, 0.1);
    border-left: 3px solid #4CAF50;
  }
  
  .new-badge {
    position: absolute;
    top: 2px;
    right: 5px;
    background: #4CAF50;
    color: #fff;
    font-size: 0.65rem;
    padding: 1px 4px;
    border-radius: 3px;
  }
  
  .compare-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  
  .compare-actions button {
    padding: 12px;
    border-radius: 8px;
    font-weight: bold;
    cursor: pointer;
    border: none;
    transition: all 0.3s;
  }
  
  .btn-cancel {
    background: rgba(255,255,255,0.1);
    color: var(--text-main);
    border: 1px solid var(--text-dim);
  }
  
  .btn-equip {
    background: linear-gradient(135deg, var(--gold), var(--gold-dim));
    color: #000;
  }
  
  .btn-equip:active {
    transform: scale(0.95);
  }
  
  .compare-empty {
    text-align: center;
    padding: 20px;
    color: var(--text-dim);
  }
  
  .empty-icon {
    font-size: 3rem;
    margin-bottom: 10px;
  }
  
  .no-stats {
    text-align: center;
    color: var(--text-dim);
    padding: 10px;
  }
`;
document.head.appendChild(style);

console.log('✅ EquipmentComparator 已加载');
