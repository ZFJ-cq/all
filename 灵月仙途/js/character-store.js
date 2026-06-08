/**
 * 全局角色状态管理器 - 单一事实来源 (Single Source of Truth)
 * 
 * 功能特性：
 * 1. 统一管理所有角色核心数据
 * 2. 多标签页同步 (BroadcastChannel + localStorage)
 * 3. 定时心跳/自动校准
 * 4. 状态变更通知机制
 * 5. 乐观更新与悲观回滚
 * 6. 数据持久化与恢复
 * 
 * @author 灵月仙途开发团队
 * @version 2.0
 */

class CharacterStore {
  constructor() {
    // 广播频道名称
    this.CHANNEL_NAME = 'lingyue_character_store';
    
    // 广播频道
    this.channel = null;
    
    // 状态数据（单一事实来源）
    this.state = {
      // 基础信息
      basic: {
        roleId: null,
        roleName: null,
        userId: null,
        username: null,
        gender: null,
        spiritRoot: null, // 灵根
        createdAt: null
      },
      
      // 修炼状态
      cultivation: {
        realm: null, // 境界
        realmLevel: 0, // 境界层级
        experience: 0, // 当前经验
        maxExperience: 0, // 升级所需经验
        cultivationRate: 0, // 修炼速度
        isMeditating: false, // 是否正在修炼
        meditationStartTime: null, // 修炼开始时间
        lastSyncTime: null // 最后同步时间
      },
      
      // 资产信息
      assets: {
        spiritStones: 0, // 灵石
        contribution: 0, // 宗门贡献
        travelPoints: 0, // 云游点数
        vip: 0 // VIP 等级
      },
      
      // 战斗属性
      attributes: {
        hp: 1000, // 气血
        maxHp: 1000,
        mp: 800, // 法力
        maxMp: 800,
        attack: 100, // 攻击力
        defense: 50, // 防御力
        speed: 10, // 速度
        crit: 0, // 暴击率
        dodge: 0, // 闪避率
        strength: 0, // 力量
        agility: 0, // 敏捷
        intelligence: 0 // 智力
      },
      
      // 背包物品
      inventory: {
        items: [],
        maxSize: 100
      },
      
      // 功法技能
      skills: {
        equipped: [], // 已装备
        owned: [] // 已拥有
      },
      
      // 状态标识
      status: {
        isTraveling: false, // 是否正在云游
        travelingStartTime: null, // 云游开始时间
        isSectDonating: false, // 是否正在捐赠
        lastActionTime: null // 最后操作时间
      },
      
      // 缓存管理
      cache: {
        timestamp: {},
        data: {}
      },
      
      // 同步状态
      sync: {
        lastFullSync: null, // 最后完整同步时间
        lastPartialSync: null, // 最后部分同步时间
        syncInterval: 30000, // 同步间隔（30 秒）
        isSyncing: false // 是否正在同步
      },
      
      // 错误状态
      error: null,
      
      // 加载状态
      loading: {
        global: false,
        modules: {}
      }
    };
    
    // 监听器列表
    this.listeners = [];
    
    // 定时器
    this.ticker = null;
    this.tickerInterval = 1000; // 1 秒心跳
    
    // 是否已初始化
    this.initialized = false;
    
    // 多标签页同步启用
    this.multiTabSyncEnabled = true;
  }
  
  /**
   * 初始化 Store
   */
  async init() {
    if (this.initialized) {
      console.log('CharacterStore 已初始化，跳过');
      return;
    }
    
    console.log('=== CharacterStore 初始化 ===');
    
    try {
      // 1. 从 localStorage 恢复状态
      await this._restoreFromLocalStorage();
      
      // 2. 初始化广播频道（多标签页同步）
      if (this.multiTabSyncEnabled) {
        this._initBroadcastChannel();
      }
      
      // 3. 启动心跳定时器
      this._startTicker();
      
      // 4. 从服务器同步数据
      await this.syncData();
      
      this.initialized = true;
      console.log('✅ CharacterStore 初始化完成');
      
      // 通知所有监听器
      this._notifyListeners('init');
      
    } catch (error) {
      console.error('❌ CharacterStore 初始化失败:', error);
      this.state.error = error.message;
    }
  }
  
  /**
   * 从 localStorage 恢复状态
   */
  async _restoreFromLocalStorage() {
    try {
      const savedState = localStorage.getItem('character_store_state');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        console.log('从 localStorage 恢复状态:', parsed);
        
        // 合并状态（只恢复非敏感数据）
        this.state.basic = { ...this.state.basic, ...parsed.basic };
        this.state.cultivation = { ...this.state.cultivation, ...parsed.cultivation };
        this.state.assets = { ...this.state.assets, ...parsed.assets };
        this.state.attributes = { ...this.state.attributes, ...parsed.attributes };
        
        // 检查数据是否需要刷新（超过 5 分钟）
        const lastSyncTime = parsed.sync?.lastFullSync;
        if (lastSyncTime) {
          const now = Date.now();
          const diff = now - lastSyncTime;
          if (diff > 5 * 60 * 1000) {
            console.log('⚠️ 缓存数据已过期，需要刷新');
          }
        }
      }
    } catch (error) {
      console.error('从 localStorage 恢复失败:', error);
    }
  }
  
  /**
   * 保存状态到 localStorage
   */
  _saveToLocalStorage() {
    try {
      // 只保存需要的数据
      const toSave = {
        basic: this.state.basic,
        cultivation: this.state.cultivation,
        assets: this.state.assets,
        attributes: this.state.attributes,
        sync: this.state.sync
      };
      
      localStorage.setItem('character_store_state', JSON.stringify(toSave));
      console.log('💾 状态已保存到 localStorage');
    } catch (error) {
      console.error('保存到 localStorage 失败:', error);
    }
  }
  
  /**
   * 初始化广播频道（多标签页同步）
   */
  _initBroadcastChannel() {
    if (!window.BroadcastChannel) {
      console.warn('⚠️ 浏览器不支持 BroadcastChannel，使用 localStorage 降级方案');
      this._initLocalStorageSync();
      return;
    }
    
    try {
      this.channel = new BroadcastChannel(this.CHANNEL_NAME);
      
      // 监听消息
      this.channel.onmessage = (event) => {
        const { type, payload, timestamp } = event.data;
        console.log('📡 收到广播消息:', type, payload);
        
        // 忽略自己发送的消息
        if (timestamp === this._lastBroadcastTime) {
          return;
        }
        
        // 处理消息
        this._handleBroadcastMessage(type, payload);
      };
      
      console.log('✅ BroadcastChannel 初始化成功');
    } catch (error) {
      console.error('BroadcastChannel 初始化失败:', error);
      this._initLocalStorageSync();
    }
  }
  
  /**
   * localStorage 降级方案（多标签页同步）
   */
  _initLocalStorageSync() {
    window.addEventListener('storage', (event) => {
      if (event.key === 'character_store_broadcast') {
        try {
          const { type, payload, timestamp } = JSON.parse(event.newValue);
          
          // 忽略自己发送的消息
          if (timestamp === this._lastBroadcastTime) {
            return;
          }
          
          console.log('📡 收到 localStorage 同步消息:', type, payload);
          this._handleBroadcastMessage(type, payload);
        } catch (error) {
          console.error('处理 localStorage 同步消息失败:', error);
        }
      }
    });
    
    console.log('✅ localStorage 同步初始化成功');
  }
  
  /**
   * 发送广播消息
   */
  _broadcast(type, payload) {
    const message = {
      type,
      payload,
      timestamp: Date.now(),
      source: 'character_store_' + Math.random().toString(36).substr(2, 9)
    };
    
    this._lastBroadcastTime = message.timestamp;
    
    try {
      if (this.channel) {
        this.channel.postMessage(message);
      } else {
        localStorage.setItem('character_store_broadcast', JSON.stringify(message));
        // 立即清除，避免堆积
        setTimeout(() => {
          localStorage.removeItem('character_store_broadcast');
        }, 100);
      }
      console.log('📡 已发送广播:', type);
    } catch (error) {
      console.error('发送广播失败:', error);
    }
  }
  
  /**
   * 处理广播消息
   */
  _handleBroadcastMessage(type, payload) {
    switch (type) {
      case 'STATE_UPDATE':
        // 其他标签页更新了状态，需要同步
        console.log('🔄 接收到状态更新，同步数据...');
        this.syncData();
        break;
        
      case 'PARTIAL_UPDATE':
        // 部分数据更新
        console.log('🔄 接收到部分更新:', payload.keys);
        this._patchState(payload.updates);
        break;
        
      case 'LOGOUT':
        // 其他标签页登出
        console.log('🚪 其他标签页已登出，清除本地数据');
        this.logout();
        break;
        
      default:
        console.warn('⚠️ 未知消息类型:', type);
    }
  }
  
  /**
   * 启动心跳定时器
   */
  _startTicker() {
    if (this.ticker) {
      clearInterval(this.ticker);
    }
    
    this.ticker = setInterval(() => {
      this._onTickerTick();
    }, this.tickerInterval);
    
    console.log('✅ 心跳定时器已启动（间隔：' + this.tickerInterval + 'ms）');
  }
  
  /**
   * 心跳事件
   */
  _onTickerTick() {
    const now = Date.now();
    
    // 检查是否需要自动同步
    if (this.state.sync.lastFullSync) {
      const diff = now - this.state.sync.lastFullSync;
      if (diff >= this.state.sync.syncInterval) {
        console.log('⏰ 定时同步时间到，自动同步数据...');
        this.syncData();
      }
    }
    
    // 更新本地时间相关数据（如修炼进度）
    this._updateTimeBasedData(now);
  }
  
  /**
   * 更新时间相关数据
   */
  _updateTimeBasedData(now) {
    // 更新修炼进度
    if (this.state.cultivation.isMeditating && this.state.cultivation.meditationStartTime) {
      const elapsed = (now - this.state.cultivation.meditationStartTime) / 1000; // 秒
      const rate = this.state.cultivation.cultivationRate || 1;
      const gainedExp = Math.floor(elapsed * rate);
      
      // 通知监听器：修炼进度更新
      this._notifyListeners('cultivation_progress', {
        elapsed,
        gainedExp,
        rate
      });
    }
    
    // 更新云游收益
    if (this.state.status.isTraveling && this.state.status.travelingStartTime) {
      const elapsed = (now - this.state.status.travelingStartTime) / 1000; // 秒
      // TODO: 计算云游收益
      
      this._notifyListeners('travel_progress', {
        elapsed
      });
    }
  }
  
  /**
   * 同步数据（从服务器获取最新数据）
   */
  async syncData(force = false) {
    if (this.state.sync.isSyncing && !force) {
      console.log('⚠️ 已在同步中，跳过');
      return;
    }
    
    const roleId = this.state.basic.roleId;
    if (!roleId) {
      console.warn('⚠️ 没有角色 ID，无法同步');
      return;
    }
    
    console.log('🔄 开始同步角色数据...');
    this.state.sync.isSyncing = true;
    this.state.loading.global = true;
    
    try {
      // 调用统一的用户信息接口
      const result = await window.apiService.getUserProfile(roleId);
      
      if (result) {
        // 更新状态
        this._updateStateFromServer(result);
        
        // 记录同步时间
        this.state.sync.lastFullSync = Date.now();
        this.state.sync.lastPartialSync = Date.now();
        
        // 保存到 localStorage
        this._saveToLocalStorage();
        
        // 通知其他标签页
        if (this.multiTabSyncEnabled) {
          this._broadcast('STATE_UPDATE', {
            roleId,
            timestamp: this.state.sync.lastFullSync
          });
        }
        
        // 通知监听器
        this._notifyListeners('sync_complete', {
          timestamp: this.state.sync.lastFullSync
        });
        
        console.log('✅ 数据同步完成');
      }
    } catch (error) {
      console.error('❌ 同步数据失败:', error);
      this.state.error = error.message;
      this._notifyListeners('sync_error', error);
    } finally {
      this.state.sync.isSyncing = false;
      this.state.loading.global = false;
    }
  }
  
  /**
   * 从服务器数据更新本地状态
   */
  _updateStateFromServer(serverData) {
    console.log('📥 更新状态:', serverData);
    
    // 更新基础信息
    if (serverData.roleName) {
      this.state.basic.roleName = serverData.roleName;
    }
    if (serverData.realm) {
      this.state.cultivation.realm = serverData.realm;
    }
    if (serverData.realmLevel !== undefined) {
      this.state.cultivation.realmLevel = serverData.realmLevel;
    }
    
    // 更新资产
    if (serverData.assets) {
      this.state.assets = { ...this.state.assets, ...serverData.assets };
    }
    
    // 更新属性
    if (serverData.attributes) {
      this.state.attributes = { ...this.state.attributes, ...serverData.attributes };
    }
    
    // 更新修炼状态
    if (serverData.isMeditating !== undefined) {
      this.state.cultivation.isMeditating = serverData.isMeditating;
    }
    if (serverData.meditationStartTime) {
      this.state.cultivation.meditationStartTime = serverData.meditationStartTime;
    }
    if (serverData.cultivationRate !== undefined) {
      this.state.cultivation.cultivationRate = serverData.cultivationRate;
    }
    
    // 更新云游状态
    if (serverData.isTraveling !== undefined) {
      this.state.status.isTraveling = serverData.isTraveling;
    }
    if (serverData.travelingStartTime) {
      this.state.status.travelingStartTime = serverData.travelingStartTime;
    }
    
    // 更新最后同步时间
    this.state.cultivation.lastSyncTime = Date.now();
    
    // 通知监听器
    this._notifyListeners('state_updated', serverData);
  }
  
  /**
   * 部分更新状态（乐观更新）
   */
  _patchState(updates) {
    console.log(' 部分更新:', updates);
    
    // 深度合并更新
    for (const key in updates) {
      if (this.state[key] && typeof this.state[key] === 'object') {
        this.state[key] = { ...this.state[key], ...updates[key] };
      } else {
        this.state[key] = updates[key];
      }
    }
    
    // 通知监听器
    this._notifyListeners('state_patched', updates);
    
    // 广播到其他标签页
    if (this.multiTabSyncEnabled) {
      this._broadcast('PARTIAL_UPDATE', {
        keys: Object.keys(updates),
        updates
      });
    }
  }
  
  /**
   * 更新属性（通用方法）
   */
  updateProperty(module, key, value, optimistic = true) {
    if (optimistic) {
      // 乐观更新
      this._patchState({
        [module]: {
          [key]: value
        }
      });
    }
    
    return true;
  }
  
  /**
   * 开始修炼
   */
  startMeditation(cultivationRate) {
    const now = Date.now();
    
    this._patchState({
      cultivation: {
        isMeditating: true,
        meditationStartTime: now,
        cultivationRate: cultivationRate || this.state.cultivation.cultivationRate
      },
      status: {
        isTraveling: false // 修炼时不能云游
      }
    });
    
    console.log('✅ 开始修炼，修炼速度:', cultivationRate);
  }
  
  /**
   * 停止修炼
   */
  stopMeditation() {
    this._patchState({
      cultivation: {
        isMeditating: false,
        meditationStartTime: null
      }
    });
    
    console.log('⏸️ 停止修炼');
  }
  
  /**
   * 开始云游
   */
  startTravel() {
    const now = Date.now();
    
    this._patchState({
      status: {
        isTraveling: true,
        travelingStartTime: now
      },
      cultivation: {
        isMeditating: false // 云游时不能修炼
      }
    });
    
    console.log('✅ 开始云游');
  }
  
  /**
   * 停止云游
   */
  stopTravel() {
    this._patchState({
      status: {
        isTraveling: false,
        travelingStartTime: null
      }
    });
    
    console.log('⏸️ 停止云游');
  }
  
  /**
   * 更新资产
   */
  updateAssets(assetsDelta) {
    const newAssets = {};
    for (const key in assetsDelta) {
      newAssets[key] = (this.state.assets[key] || 0) + assetsDelta[key];
    }
    
    this._patchState({
      assets: newAssets
    });
    
    console.log('💰 资产更新:', assetsDelta);
  }
  
  /**
   * 获取状态
   */
  getState() {
    return this.state;
  }
  
  /**
   * 获取模块状态
   */
  getModuleState(moduleName) {
    return this.state[moduleName] || {};
  }
  
  /**
   * 注册监听器
   */
  subscribe(listener) {
    this.listeners.push(listener);
    console.log('📡 注册监听器，当前监听器数量:', this.listeners.length);
    
    // 返回取消订阅函数
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
      console.log('📡 取消订阅，当前监听器数量:', this.listeners.length);
    };
  }
  
  /**
   * 通知所有监听器
   */
  _notifyListeners(type, payload) {
    if (this.listeners.length === 0) return;
    
    console.log('📢 通知监听器:', type, payload);
    
    this.listeners.forEach(listener => {
      try {
        listener(type, payload, this.state);
      } catch (error) {
        console.error('监听器执行失败:', error);
      }
    });
  }
  
  /**
   * 设置加载状态
   */
  setLoading(module, isLoading) {
    this.state.loading.modules[module] = isLoading;
    this._notifyListeners('loading_change', {
      module,
      isLoading
    });
  }
  
  /**
   * 设置错误
   */
  setError(error) {
    this.state.error = error;
    this._notifyListeners('error', error);
  }
  
  /**
   * 清除错误
   */
  clearError() {
    this.state.error = null;
    this._notifyListeners('error_cleared');
  }
  
  /**
   * 登出
   */
  logout() {
    console.log('🚪 登出，清除所有数据');
    
    // 清除 localStorage
    localStorage.removeItem('character_store_state');
    
    // 重置状态
    this.state = {
      basic: {},
      cultivation: {},
      assets: {},
      attributes: {},
      inventory: { items: [], maxSize: 100 },
      skills: { equipped: [], owned: [] },
      status: {},
      cache: { timestamp: {}, data: {} },
      sync: {
        lastFullSync: null,
        lastPartialSync: null,
        syncInterval: 30000,
        isSyncing: false
      },
      error: null,
      loading: { global: false, modules: {} }
    };
    
    // 通知监听器
    this._notifyListeners('logout');
    
    // 广播到其他标签页
    if (this.multiTabSyncEnabled) {
      this._broadcast('LOGOUT', {});
    }
    
    // 停止定时器
    if (this.ticker) {
      clearInterval(this.ticker);
      this.ticker = null;
    }
    
    // 关闭广播频道
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    
    this.initialized = false;
  }
  
  /**
   * 销毁 Store
   */
  destroy() {
    console.log('💥 销毁 CharacterStore');
    
    // 清除定时器
    if (this.ticker) {
      clearInterval(this.ticker);
    }
    
    // 关闭广播频道
    if (this.channel) {
      this.channel.close();
    }
    
    // 清除监听器
    this.listeners = [];
    
    this.initialized = false;
  }
}

// 创建全局实例
window.characterStore = new CharacterStore();

console.log('✅ CharacterStore 已加载');
