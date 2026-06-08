// js/game-data.js

// 生成唯一用户ID
function generateUserId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 境界体系
const realms = {
  人间界: ["炼体", "炼气", "筑基", "金丹", "元婴", "化神", "炼虚", "合体", "大乘"],
  灵界: ["渡劫", "人仙", "真仙", "地仙", "天仙"],
  仙界: ["金仙", "玄仙", "神仙", "神王", "至尊"]
};

// 境界阶段
const realmStages = ["初", "中", "后", "圆满"];

// 职业系统数据
const professions = {
  炼丹师: {
    coreRole: "爆发 / 恢复 / 渡劫辅助",
    uniqueFeatures: ["火候 QTE", "丹毒系统", "丹药组合"],
    ultimateSkill: "九转还魂丹（复活队友 + 满血满蓝）",
    skills: ["基础炼丹术", "丹药辨识", "火候控制"]
  },
  炼器师: {
    coreRole: "战力 / 法宝 / 器灵养成",
    uniqueFeatures: ["本命法宝成长", "器灵羁绊", "法宝淬炼"],
    ultimateSkill: "混沌开天器（全屏 AOE + 破防 50%）",
    skills: ["基础炼器术", "材料辨识", "器灵沟通"]
  },
  阵法师: {
    coreRole: "PVP / 防守 / 秘境通关",
    uniqueFeatures: ["可移动阵法", "阵眼破解", "多阵组合"],
    ultimateSkill: "诛仙灭神阵（困住敌方 + 持续掉血）",
    skills: ["基础阵法", "阵眼辨识", "阵法组合"]
  },
  符箓师: {
    coreRole: "应急 / 秒伤 / 保命",
    uniqueFeatures: ["符阵连招", "一次性爆发符", "替身符"],
    ultimateSkill: "鸿蒙护体符（免疫 3 次致命伤害）",
    skills: ["基础符箓术", "符纸辨识", "符阵组合"]
  }
};

// 职业进阶路径
const professionLevels = ["九品学徒", "八品", "七品", "六品", "五品", "四品", "三品", "二品", "一品", "宗师", "圣手", "道祖"];

// 社交羁绊系统数据
const sects = [
  { name: "青云宗", level: "九流", specialty: "剑道", description: "以剑入道的宗门，擅长御剑术" },
  { name: "天音寺", level: "八流", specialty: "佛法", description: "修佛的宗门，擅长治疗和防御" },
  { name: "万毒谷", level: "七流", specialty: "毒术", description: "擅长用毒的宗门，攻击力强" },
  { name: "天机门", level: "六流", specialty: "阵法", description: "擅长阵法的宗门，防御能力强" }
];

const pets = [
  { name: "青鸾", type: "飞禽", rarity: "稀有", skills: ["飞行", "避障"] },
  { name: "白虎", type: "走兽", rarity: "稀有", skills: ["猛击", "撕咬"] },
  { name: "九尾狐", type: "妖兽", rarity: "传说", skills: ["魅惑", "火焰术"] },
  { name: "玄武", type: "神兽", rarity: "传说", skills: ["防御", "龟甲"] }
];

// 功法系统数据
const skills = {
  cultivation: [
    { name: "基础吐纳术", level: 1, exp: 0, maxExp: 100, effect: "基础修炼速度+10%" },
    { name: "引气入体", level: 1, exp: 0, maxExp: 200, effect: "修炼速度+20%" },
    { name: "炼气化神", level: 1, exp: 0, maxExp: 300, effect: "修炼速度+30%" }
  ],
  movement: [
    { name: "御风步", level: 1, exp: 0, maxExp: 100, effect: "移动速度+10%" },
    { name: "缩地成寸", level: 1, exp: 0, maxExp: 200, effect: "移动速度+20%" }
  ],
  combat: [
    { name: "基础拳法", level: 1, exp: 0, maxExp: 100, effect: "攻击力+10%" },
    { name: "剑法基础", level: 1, exp: 0, maxExp: 100, effect: "攻击力+15%" }
  ]
};

// 功法熟练度等级
const skillLevels = ["入门", "小成", "大成", "圆满", "化境"];

// 从API加载玩家数据
async function loadPlayer() {
  // 获取当前角色ID
  const currentRoleId = localStorage.getItem('currentRoleId');
  if (currentRoleId) {
    try {
      // 显示加载状态
      uiComponents.showLoading(document.body, '加载角色数据...');
      
      // 从API获取角色数据
      const roleData = await apiService.getUserProfile(currentRoleId);
      
      // 从API获取背包数据
      const inventoryData = await apiService.getInventory(currentRoleId);
      
      // 从API获取技能数据
      const skillsData = await apiService.getRoleSkills(currentRoleId);
      
      // 从API获取任务数据
      const tasksData = await apiService.getTaskList(currentRoleId);
      
      // 构建玩家对象
      const player = {
        id: roleData.id,
        name: roleData.roleName,
        origin: "",
        spiritStones: roleData.spiritStones || 0,
        worldLevel: roleData.worldLevel || "人间界",
        realm: roleData.realm || "炼体",
        realmStage: roleData.realmStage || "初",
        cultivation: roleData.cultivation || 0,
        cultivationMax: roleData.cultivationMax || 100,
        health: roleData.hp || 100,
        healthMax: roleData.hp || 100,
        mana: roleData.mp || 80,
        manaMax: roleData.mp || 80,
        str: 10, agi: 15, con: 12, int: 18, wis: 16, luck: 8,
        spiritRoot: roleData.spiritRoot || "-",
        profession: roleData.profession,
        professionLevel: roleData.professionLevel || 0,
        professionExp: roleData.professionExp || 0,
        professionCertified: roleData.professionCertified || false,
        sect: roleData.sect,
        sectPosition: roleData.sectPosition || "外门弟子",
        partner: roleData.partner,
        pets: [], // 后续从API获取
        disciples: [], // 后续从API获取
        tasks: tasksData || [],
        skills: skillsData || [],
        inventory: inventoryData.items || [],
        createdAt: roleData.createTime || new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      
      // 隐藏加载状态
      uiComponents.hideLoading(document.body);
      
      return player;
    } catch (error) {
      console.error('加载玩家数据失败:', error);
      // 隐藏加载状态
      uiComponents.hideLoading(document.body);
      // 显示错误信息
      uiComponents.showError('加载角色数据失败，使用本地数据', document.body, 3000);
      // 降级方案：使用本地存储数据
      return loadPlayerFromLocalStorage();
    }
  }

  // 降级方案：使用本地存储数据
  return loadPlayerFromLocalStorage();
}

// 从本地存储加载玩家数据（降级方案）
function loadPlayerFromLocalStorage() {
  // 获取当前玩家ID
  const currentPlayerId = localStorage.getItem('currentPlayerId');
  if (currentPlayerId) {
    const saved = localStorage.getItem(`player_${currentPlayerId}`);
    if (saved) {
      const player = JSON.parse(saved);
      // 更新最后登录时间
      player.lastLogin = new Date().toISOString();
      savePlayer(player);
      return player;
    }
  }

  // 默认初始数据（仅作为降级方案）
  return {
    id: generateUserId(),
    name: "林清羽",
    origin: "",
    spiritStones: 0,
    worldLevel: "人间界",
    realm: "炼体",
    realmStage: "初",
    cultivation: 30,
    cultivationMax: 100,
    health: 100,
    healthMax: 100,
    mana: 80,
    manaMax: 80,
    str: 10, agi: 15, con: 12, int: 18, wis: 16, luck: 8,
    spiritRoot: "-",
    profession: null,
    professionLevel: 0,
    professionExp: 0,
    professionCertified: false,
    sect: null,
    sectPosition: "外门弟子",
    partner: null,
    pets: [],
    disciples: [],
    tasks: [
      { id: 1, title: "拜入山门", desc: "前往青云宗完成入门仪式。", progress: 100, completed: true },
      { id: 2, title: "采集灵草", desc: "在后山采集3株月华草。", progress: 40, completed: false }
    ],
    skills: [
      { name: "基础吐纳术", type: "cultivation", level: 1, exp: 30, maxExp: 100, effect: "基础修炼速度+10%" },
      { name: "御风步", type: "movement", level: 0, exp: 0, maxExp: 100, unlocked: false, effect: "移动速度+10%" }
    ],
    inventory: [
      { id: 1, name: "月华草", icon: "🌿", count: 3, desc: "稀有灵草，可用于炼制疗伤丹药。" },
      { id: 2, name: "回春丹", icon: "💊", count: 5, desc: "恢复气血的初级丹药。" },
      { id: 3, name: "火属性符纸", icon: "🔥", count: 1, desc: "可绘制火焰类符箓的材料。" }
    ],
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };
}

function savePlayer(player) {
  // 如果玩家没有ID，生成一个
  if (!player.id) {
    player.id = generateUserId();
  }
  // 保存到localStorage，使用player_前缀
  localStorage.setItem(`player_${player.id}`, JSON.stringify(player));
  // 同时保存当前玩家ID
  localStorage.setItem('currentPlayerId', player.id);
}

// 获取所有玩家数据
function getAllPlayers() {
  let players = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('player_')) {
      try {
        const playerData = JSON.parse(localStorage.getItem(key));
        players.push(playerData);
      } catch (e) {
        console.error('解析玩家数据失败:', e);
      }
    }
  }
  return players;
}

// 删除玩家数据
function deletePlayer(playerId) {
  localStorage.removeItem(`player_${playerId}`);
  // 如果删除的是当前玩家，清除当前玩家ID
  const currentPlayerId = localStorage.getItem('currentPlayerId');
  if (currentPlayerId === playerId) {
    localStorage.removeItem('currentPlayerId');
  }
}

// 保存游戏设置
function saveGameSettings(settings) {
  localStorage.setItem('gameSettings', JSON.stringify(settings));
}

// 加载游戏设置
function loadGameSettings() {
  const saved = localStorage.getItem('gameSettings');
  if (saved) {
    return JSON.parse(saved);
  }
  // 默认设置
  return {
    gameVersion: "1.0.0",
    maxUsers: 1000,
    serverStatus: "online",
    welcomeMessage: "欢迎来到灵月仙途！"
  };
}

function showNotification(message, type = "info") {
  let notif = document.getElementById('notification');
  if (!notif) {
    notif = document.createElement('div');
    notif.id = 'notification';
    notif.className = 'notification';
    document.body.appendChild(notif);
  }
  notif.textContent = message;
  notif.className = 'notification ' + type;
  notif.classList.add('show');
  setTimeout(() => notif.classList.remove('show'), 3000);
}

// 根据当前页面高亮侧边栏
function setActiveSidebar(pageName) {
  document.querySelectorAll('.nav-item').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === pageName + '.html') {
      link.classList.add('active');
    }
  });
}