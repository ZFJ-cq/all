/**
 * 统一数据服务层 - 基于 CharacterStore
 * 
 * 功能：
 * 1. 统一数据获取接口
 * 2. 乐观更新与悲观回滚
 * 3. 请求去重与缓存
 * 4. 错误处理与重试
 * 
 * @author 灵月仙途开发团队
 * @version 2.0
 */

window.CharacterService = {
  // 请求缓存
  requestCache: new Map(),
  
  // 请求队列（去重）
  requestQueue: new Map(),
  
  /**
   * 获取角色完整数据（统一入口）
   */
  async getCharacterData(forceRefresh = false) {
    const roleId = window.characterStore?.state?.basic?.roleId || 
                   localStorage.getItem('currentRoleId') ||
                   localStorage.getItem('roleId');
    
    if (!roleId) {
      throw new Error('没有角色 ID，无法获取数据');
    }
    
    // 检查缓存（非强制刷新）
    if (!forceRefresh) {
      const cached = this._getCachedData('character_' + roleId);
      if (cached) {
        console.log('从缓存获取角色数据');
        return cached;
      }
    }
    
    // 检查是否有进行中的请求
    const queueKey = 'character_' + roleId;
    if (this.requestQueue.has(queueKey)) {
      console.log('请求正在进行中，等待完成...');
      return this.requestQueue.get(queueKey);
    }
    
    // 创建新请求
    const requestPromise = (async () => {
      try {
        console.log('从服务器获取角色数据...');
        const result = await window.apiService.getUserProfile(roleId);
        
        if (!result) {
          throw new Error('获取角色数据失败');
        }
        
        // 缓存数据
        this._cacheData('character_' + roleId, result);
        
        // 更新 CharacterStore
        if (window.characterStore) {
          window.characterStore._updateStateFromServer(result);
        }
        
        console.log('✅ 角色数据获取成功');
        return result;
      } catch (error) {
        console.error('❌ 获取角色数据失败:', error);
        throw error;
      } finally {
        // 清除队列
        this.requestQueue.delete(queueKey);
      }
    })();
    
    // 加入队列
    this.requestQueue.set(queueKey, requestPromise);
    
    return requestPromise;
  },
  
  /**
   * 开始修炼
   */
  async startMeditation(cultivationRate) {
    const roleId = window.characterStore?.state?.basic?.roleId || 
                   localStorage.getItem('currentRoleId');
    
    if (!roleId) {
      throw new Error('没有角色 ID');
    }
    
    try {
      console.log('开始修炼，修炼速度:', cultivationRate);
      
      // 乐观更新（先更新本地状态）
      if (window.characterStore) {
        window.characterStore.startMeditation(cultivationRate);
      }
      
      // 调用后端 API
      const result = await window.apiService.post('/cultivation/start', {
        roleId,
        cultivationRate
      });
      
      // 更新缓存
      this._cacheData('cultivation_state', {
        isMeditating: true,
        cultivationRate,
        startTime: Date.now()
      });
      
      console.log('✅ 修炼开始成功');
      return result;
    } catch (error) {
      console.error('❌ 开始修炼失败:', error);
      
      // 悲观回滚
      if (window.characterStore) {
        await window.characterStore.syncData(true);
      }
      
      throw error;
    }
  },
  
  /**
   * 停止修炼
   */
  async stopMeditation() {
    const roleId = window.characterStore?.state?.basic?.roleId || 
                   localStorage.getItem('currentRoleId');
    
    if (!roleId) {
      throw new Error('没有角色 ID');
    }
    
    try {
      console.log('停止修炼...');
      
      // 乐观更新
      if (window.characterStore) {
        window.characterStore.stopMeditation();
      }
      
      // 调用后端 API
      const result = await window.apiService.post('/cultivation/stop', {
        roleId
      });
      
      // 同步最新数据
      await this.getCharacterData(true);
      
      console.log('✅ 修炼停止成功');
      return result;
    } catch (error) {
      console.error('❌ 停止修炼失败:', error);
      throw error;
    }
  },
  
  /**
   * 开始云游
   */
  async startTravel() {
    const roleId = window.characterStore?.state?.basic?.roleId || 
                   localStorage.getItem('currentRoleId');
    
    if (!roleId) {
      throw new Error('没有角色 ID');
    }
    
    try {
      console.log('开始云游...');
      
      // 乐观更新
      if (window.characterStore) {
        window.characterStore.startTravel();
      }
      
      // 调用后端 API
      const result = await window.apiService.post('/travel/start', {
        roleId
      });
      
      // 更新缓存
      this._cacheData('travel_state', {
        isTraveling: true,
        startTime: Date.now()
      });
      
      console.log('✅ 云游开始成功');
      return result;
    } catch (error) {
      console.error('❌ 开始云游失败:', error);
      
      // 悲观回滚
      if (window.characterStore) {
        await window.characterStore.syncData(true);
      }
      
      throw error;
    }
  },
  
  /**
   * 停止云游
   */
  async stopTravel() {
    const roleId = window.characterStore?.state?.basic?.roleId || 
                   localStorage.getItem('currentRoleId');
    
    if (!roleId) {
      throw new Error('没有角色 ID');
    }
    
    try {
      console.log('停止云游...');
      
      // 乐观更新
      if (window.characterStore) {
        window.characterStore.stopTravel();
      }
      
      // 调用后端 API
      const result = await window.apiService.post('/travel/stop', {
        roleId
      });
      
      // 同步最新数据
      await this.getCharacterData(true);
      
      console.log('✅ 云游停止成功');
      return result;
    } catch (error) {
      console.error('❌ 停止云游失败:', error);
      throw error;
    }
  },
  
  /**
   * 获取云游收益
   */
  async collectTravelRewards() {
    const roleId = window.characterStore?.state?.basic?.roleId || 
                   localStorage.getItem('currentRoleId');
    
    if (!roleId) {
      throw new Error('没有角色 ID');
    }
    
    try {
      console.log('领取云游收益...');
      
      // 调用后端 API
      const result = await window.apiService.post('/travel/collect', {
        roleId
      });
      
      if (result && result.rewards) {
        // 乐观更新资产
        if (window.characterStore && result.rewards) {
          window.characterStore.updateAssets(result.rewards);
        }
      }
      
      console.log('✅ 云游收益领取成功');
      return result;
    } catch (error) {
      console.error('❌ 领取云游收益失败:', error);
      throw error;
    }
  },
  
  /**
   * 宗门捐赠
   */
  async sectDonate(amount) {
    const roleId = window.characterStore?.state?.basic?.roleId || 
                   localStorage.getItem('currentRoleId');
    
    if (!roleId) {
      throw new Error('没有角色 ID');
    }
    
    try {
      console.log('宗门捐赠:', amount);
      
      // 调用后端 API
      const result = await window.apiService.post('/sect/donate', {
        roleId,
        amount
      });
      
      if (result && result.contribation) {
        // 乐观更新资产
        if (window.characterStore) {
          window.characterStore.updateAssets({
            contribution: result.contribation
          });
        }
      }
      
      console.log('✅ 宗门捐赠成功');
      return result;
    } catch (error) {
      console.error('❌ 宗门捐赠失败:', error);
      throw error;
    }
  },
  
  /**
   * 领取云游收益（定时）
   */
  async autoCollectTravelRewards() {
    const travelState = window.characterStore?.state?.status;
    
    if (!travelState?.isTraveling) {
      return; // 不在云游中
    }
    
    try {
      await this.collectTravelRewards();
    } catch (error) {
      console.error('自动领取云游收益失败:', error);
    }
  },
  
  /**
   * 缓存数据
   */
  _cacheData(key, data) {
    this.requestCache.set(key, {
      data,
      timestamp: Date.now()
    });
    console.log('💾 数据已缓存:', key);
  },
  
  /**
   * 获取缓存数据
   */
  _getCachedData(key, maxAge = 5 * 60 * 1000) {
    const cached = this.requestCache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    const diff = now - cached.timestamp;
    
    if (diff > maxAge) {
      // 缓存过期
      this.requestCache.delete(key);
      return null;
    }
    
    console.log('从缓存获取:', key);
    return cached.data;
  },
  
  /**
   * 清除缓存
   */
  clearCache(key) {
    if (key) {
      this.requestCache.delete(key);
    } else {
      this.requestCache.clear();
    }
    console.log('🗑️ 缓存已清除');
  }
};

console.log('✅ CharacterService 已加载');
