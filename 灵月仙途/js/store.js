/**
 * 灵月仙途 - 全局状态管理（唯一数据源）
 * 所有页面必须通过此 store 读取和写入角色数据
 */

const EQUIPMENT_SLOTS = {
  1: { id: 1, key: 'weapon', name: '武器', icon: '⚔️' },
  2: { id: 2, key: 'head', name: '头盔', icon: '⛑️' },
  3: { id: 3, key: 'armor', name: '铠甲', icon: '🛡️' },
  4: { id: 4, key: 'belt', name: '腰带', icon: '📿' },
  5: { id: 5, key: 'boots', name: '鞋子', icon: '👢' },
  6: { id: 6, key: 'ring', name: '戒指', icon: '💍' },
  7: { id: 7, key: 'necklace', name: '项链', icon: '📿' },
  8: { id: 8, key: 'accessory', name: '法宝', icon: '🔮' }
};

const SLOT_KEY_TO_ID = {};
Object.values(EQUIPMENT_SLOTS).forEach(s => { SLOT_KEY_TO_ID[s.key] = s.id; });

const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
const RARITY_NAMES = { common: '凡品', uncommon: '良品', rare: '上品', epic: '极品', legendary: '仙品' };
const RARITY_COLORS = { common: '#9d9d9d', uncommon: '#4CAF50', rare: '#2196F3', epic: '#9C27B0', legendary: '#FF9800' };

const ITEM_TYPE_NAMES = {
  dan_yao: '丹药', cai_liao: '材料', zhuang_bei: '装备',
  fa_bao: '法宝', qi_ta: '其他'
};

const REALM_ORDER = [
  '凡人', '炼气初期', '炼气中期', '炼气后期', '炼气圆满',
  '筑基初期', '筑基中期', '筑基后期', '筑基圆满',
  '金丹初期', '金丹中期', '金丹后期', '金丹圆满',
  '元婴初期', '元婴中期', '元婴后期', '元婴圆满',
  '化神初期', '化神中期', '化神后期', '化神圆满',
  '渡劫初期', '渡劫中期', '渡劫后期', '渡劫圆满',
  '大乘初期', '大乘中期', '大乘后期', '大乘圆满'
];

class Store {
  constructor() {
    this.state = {
      role: {
        id: null,
        name: null,
        realm: null,
        realmLevel: 1,
        level: 0,
        experience: 0,
        gender: null,
        spiritRoot: null,
        origin: null,
        avatar: null,
        bodyLevel: null,
        bodyStrength: 0,
        cultivationBase: 1.0,
        hp: 0,
        mp: 0,
        assets: {},
        attributes: {
          strength: 0,
          agility: 0,
          intelligence: 0,
          constitution: 0,
          spirit: 0
        },
        derivedStats: {
          maxHp: 0,
          attack: 0,
          defense: 0,
          speed: 0,
          critRate: 0,
          critDamage: 150,
          dodgeRate: 0,
          hitRate: 100,
          resilience: 0,
          powerLevel: 0
        },
        equippedItems: {},
        lastCultivationTime: null,
        walkFireUntil: null,
        consecutiveBreakthroughFailures: 0
      },
      user: {
        id: null,
        username: null,
        token: null
      },
      cache: {
        timestamp: {},
        data: {}
      },
      loading: {
        global: false,
        individual: {}
      },
      error: null
    };
    this.listeners = [];
    this._initialized = false;
  }

  getState() { return this.state; }

  setState(updater) {
    const newState = typeof updater === 'function' ? updater(this.state) : updater;
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  updateRole(roleData) {
    this.setState(prev => ({ role: { ...prev.role, ...roleData } }));
  }

  updateUser(userData) {
    this.setState(prev => ({ user: { ...prev.user, ...userData } }));
  }

  updateAttributes(attrs) {
    this.setState(prev => ({
      role: { ...prev.role, attributes: { ...prev.role.attributes, ...attrs } }
    }));
  }

  updateDerivedStats(stats) {
    this.setState(prev => ({
      role: { ...prev.role, derivedStats: { ...prev.role.derivedStats, ...stats } }
    }));
  }

  updateEquippedItem(slotId, item) {
    this.setState(prev => ({
      role: { ...prev.role, equippedItems: { ...prev.role.equippedItems, [slotId]: item } }
    }));
  }

  removeEquippedItem(slotId) {
    this.setState(prev => {
      const items = { ...prev.role.equippedItems };
      delete items[slotId];
      return { role: { ...prev.role, equippedItems: items } };
    });
  }

  setCache(key, data) {
    this.setState(prev => ({
      cache: {
        ...prev.cache,
        timestamp: { ...prev.cache.timestamp, [key]: Date.now() },
        data: { ...prev.cache.data, [key]: data }
      }
    }));
  }

  getCache(key, maxAge = 5 * 60 * 1000) {
    const ts = this.state.cache.timestamp[key];
    const data = this.state.cache.data[key];
    if (!ts || !data) return null;
    if (Date.now() - ts > maxAge) { this.clearCache(key); return null; }
    return data;
  }

  clearCache(key) {
    if (key) {
      this.setState(prev => ({
        cache: {
          ...prev.cache,
          timestamp: { ...prev.cache.timestamp, [key]: undefined },
          data: { ...prev.cache.data, [key]: undefined }
        }
      }));
    } else {
      this.setState(prev => ({ cache: { ...prev.cache, timestamp: {}, data: {} } }));
    }
  }

  setLoading(key, isLoading) {
    if (key === 'global') {
      this.setState(prev => ({ loading: { ...prev.loading, global: isLoading } }));
    } else {
      this.setState(prev => ({
        loading: { ...prev.loading, individual: { ...prev.loading.individual, [key]: isLoading } }
      }));
    }
  }

  isLoading(key) {
    if (key === 'global') return this.state.loading.global;
    return this.state.loading.individual[key] || false;
  }

  setError(error) { this.setState({ error }); }
  clearError() { this.setState({ error: null }); }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  notifyListeners() {
    this.listeners.forEach(listener => { try { listener(this.state); } catch (e) { console.error('[Store] listener error:', e); } });
  }

  init(initialState) {
    this.state = { ...this.state, ...initialState };
    this.notifyListeners();
  }

  reset() {
    this.state = {
      role: {
        id: null, name: null, realm: null, realmLevel: 1, level: 0,
        experience: 0, gender: null, spiritRoot: null, origin: null,
        avatar: null, bodyLevel: null, bodyStrength: 0, cultivationBase: 1.0,
        hp: 0, mp: 0, assets: {},
        attributes: { strength: 0, agility: 0, intelligence: 0, constitution: 0, spirit: 0 },
        derivedStats: { maxHp: 0, attack: 0, defense: 0, speed: 0, critRate: 0, critDamage: 150, dodgeRate: 0, hitRate: 100, resilience: 0, powerLevel: 0 },
        equippedItems: {}, lastCultivationTime: null, walkFireUntil: null, consecutiveBreakthroughFailures: 0
      },
      user: { id: null, username: null, token: null },
      cache: { timestamp: {}, data: {} },
      loading: { global: false, individual: {} },
      error: null
    };
    this._initialized = false;
    this.notifyListeners();
  }
}

window.store = new Store();

window.getRoleId = function() {
  const storeRole = window.store.getState().role;
  if (storeRole && storeRole.id) return storeRole.id;
  if (window.APP_CONFIG && window.APP_CONFIG.currentRoleId) return window.APP_CONFIG.currentRoleId;
  const lsId = localStorage.getItem('currentRoleId') || localStorage.getItem('roleId');
  if (lsId && lsId !== 'undefined' && lsId !== 'null') return parseInt(lsId, 10);
  return null;
};

window.getUserId = function() {
  const storeUser = window.store.getState().user;
  if (storeUser && storeUser.id) return storeUser.id;
  if (window.APP_CONFIG && window.APP_CONFIG.currentUserId) return window.APP_CONFIG.currentUserId;
  const lsId = localStorage.getItem('userId') || localStorage.getItem('currentUserId');
  if (lsId && lsId !== 'undefined' && lsId !== 'null') return parseInt(lsId, 10);
  return null;
};

window.EQUIPMENT_SLOTS = EQUIPMENT_SLOTS;
window.SLOT_KEY_TO_ID = SLOT_KEY_TO_ID;
window.RARITY_ORDER = RARITY_ORDER;
window.RARITY_NAMES = RARITY_NAMES;
window.RARITY_COLORS = RARITY_COLORS;
window.ITEM_TYPE_NAMES = ITEM_TYPE_NAMES;
window.REALM_ORDER = REALM_ORDER;

window.roleStore = {
  getRoleId() { return window.getRoleId(); },

  getRole() { return window.store.getState().role; },

  getUser() { return window.store.getState().user; },

  getEquippedItems() { return window.store.getState().role.equippedItems || {}; },

  getDerivedStats() { return window.store.getState().role.derivedStats || {}; },

  getAssets() { return window.store.getState().role.assets || {}; },

  async initialize(userData, roleData) {
    window.store.updateUser(userData);
    window.store.updateRole(roleData);
    if (roleData.id) {
      localStorage.setItem('currentRoleId', String(roleData.id));
      localStorage.setItem('roleId', String(roleData.id));
    }
    if (userData.id) {
      localStorage.setItem('userId', String(userData.id));
      localStorage.setItem('currentUserId', String(userData.id));
    }
    window.store.setCache('role_core', {
      id: roleData.id, name: roleData.name, realm: roleData.realm, assets: roleData.assets
    });
    window.store._initialized = true;
  },

  async fetchFullRoleData() {
    const roleId = window.getRoleId();
    if (!roleId) return null;
    try {
      const roleData = await window.apiService.getRoleById(roleId);
      if (roleData) {
        const mapped = {
          id: roleData.id,
          name: roleData.roleName || roleData.name,
          realm: roleData.realm,
          realmLevel: roleData.realmLevel || 1,
          level: roleData.level || 0,
          gender: roleData.gender,
          spiritRoot: roleData.spiritRoot,
          origin: roleData.origin,
          avatar: roleData.avatar,
          bodyLevel: roleData.bodyLevel,
          bodyStrength: roleData.bodyStrength || 0,
          cultivationBase: roleData.cultivationBase || 1.0,
          hp: roleData.hp || 0,
          mp: roleData.mp || 0,
          lastCultivationTime: roleData.lastCultivationTime,
          walkFireUntil: roleData.walkFireUntil,
          consecutiveBreakthroughFailures: roleData.consecutiveBreakthroughFailures || 0
        };
        window.store.updateRole(mapped);
        return mapped;
      }
    } catch (e) {
      console.error('[roleStore] fetchFullRoleData failed:', e);
    }
    return null;
  },

  async fetchAssets() {
    const roleId = window.getRoleId();
    if (!roleId) return {};
    try {
      const assets = await window.apiService.getAssets(roleId);
      if (assets) {
        window.store.updateRole({ assets });
        return assets;
      }
    } catch (e) {
      console.error('[roleStore] fetchAssets failed:', e);
    }
    return window.store.getState().role.assets || {};
  },

  async fetchDerivedStats() {
    const roleId = window.getRoleId();
    if (!roleId) return {};
    try {
      const stats = await window.apiService.getAttributes(roleId);
      if (stats) {
        window.store.updateDerivedStats({
          maxHp: stats.hpMax || stats.hp || 0,
          attack: stats.atk || 0,
          defense: stats.def || 0,
          speed: stats.speed || 0,
          critRate: stats.critRate || 0,
          critDamage: stats.critDmg || 150,
          dodgeRate: stats.dodgeRate || 0,
          hitRate: stats.hitRate || 100,
          resilience: stats.tenacity || 0,
          powerLevel: 0
        });
        return stats;
      }
    } catch (e) {
      console.error('[roleStore] fetchDerivedStats failed:', e);
    }
    return window.store.getState().role.derivedStats || {};
  },

  async fetchEquippedItems() {
    const roleId = window.getRoleId();
    if (!roleId) return {};
    try {
      const result = await window.apiService.getEquippedItems(roleId);
      if (result) {
        const items = {};
        if (Array.isArray(result)) {
          result.forEach(item => {
            const slotId = item.slot || item.slotId;
            if (slotId) items[slotId] = item;
          });
        } else if (typeof result === 'object') {
          Object.entries(result).forEach(([key, item]) => {
            const slotId = item.slot || item.slotId || SLOT_KEY_TO_ID[key] || parseInt(key, 10);
            if (slotId) items[slotId] = item;
          });
        }
        window.store.updateRole({ equippedItems: items });
        return items;
      }
    } catch (e) {
      console.error('[roleStore] fetchEquippedItems failed:', e);
    }
    return window.store.getState().role.equippedItems || {};
  },

  async refreshAll() {
    await Promise.all([
      this.fetchFullRoleData(),
      this.fetchAssets(),
      this.fetchDerivedStats(),
      this.fetchEquippedItems()
    ]);
  },

  logout() {
    window.store.reset();
    localStorage.removeItem('currentRoleId');
    localStorage.removeItem('roleId');
    localStorage.removeItem('userId');
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('token');
  }
};

console.log('[Store] 全局状态管理已初始化，版本: 2026-04-15');
