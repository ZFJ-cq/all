// 宗门数据 - 从API获取
let sectData = {
  level: "五流",
  name: "青云门",
  reputation: 320,
  totalContribution: 12450,
  spiritStone: 89700,
  memberCount: 256,
  warStatus: "和平",
  defenseStatus: "完整",
  playerPosition: "内门弟子",
  playerContribution: 1250
};

// 职位数据
let positionData = {
  "弟子": {
    description: "宗门基础成员，分为外门、内门、核心三个等级",
    requirements: "外门：通过入门考核\n内门：修为达到筑基期，贡献值≥1000\n核心：修为达到金丹期，贡献值≥5000，通过核心考核",
    benefits: "外门：基础功法、每月灵石补贴\n内门：中级功法、洞府使用权\n核心：高级功法、长老指导、藏经阁三层权限",
    current: "内门弟子"
  },
  "执事": {
    description: "负责宗门日常事务管理",
    requirements: "修为达到金丹中期，贡献值≥10000，通过执事考核",
    benefits: "执事堂权限、月例加倍、可收徒",
    current: null
  },
  "长老": {
    description: "宗门高层，负责重要事务决策",
    requirements: "修为达到元婴期，贡献值≥50000，通过长老会议审核",
    benefits: "长老会席位、藏经阁全权限、洞天福地使用权",
    current: null
  },
  "护法": {
    description: "宗门武力代表，负责宗门安全",
    requirements: "修为达到元婴中期，贡献值≥80000，战斗力考核优秀",
    benefits: "护法堂权限、宗门宝库权限、战斗功法优先选择权",
    current: null
  },
  "副宗主": {
    description: "宗主副手，协助管理宗门事务",
    requirements: "修为达到化神期，贡献值≥200000，宗主提名，长老会通过",
    benefits: "仅次于宗主的权限、可调动宗门资源、拥有独立灵峰",
    current: null
  },
  "宗主": {
    description: "宗门最高领袖，决策一切宗门事务",
    requirements: "修为达到化神后期，贡献值≥500000，通过太上长老认可",
    benefits: "宗门最高权限、可决定宗门发展方向、掌控宗门大阵",
    current: "玄真道人"
  }
};

// 任务数据
let taskData = {
  daily: {
    title: "日常任务",
    tasks: [
      { name: "宗门巡逻", contribution: 50, desc: "巡视宗门周边，确保安全", time: "1小时" },
      { name: "灵药采集", contribution: 80, desc: "采集后山药园灵药", time: "2小时" },
      { name: "新弟子授课", contribution: 100, desc: "为新入门弟子讲解基础功法", time: "3小时" },
      { name: "丹炉看护", contribution: 60, desc: "看护炼丹房丹炉", time: "1.5小时" }
    ]
  },
  sect: {
    title: "宗门任务",
    tasks: [
      { name: "剿灭妖兽", contribution: 500, desc: "剿灭骚扰村民的狼妖", time: "1天" },
      { name: "探索遗迹", contribution: 800, desc: "探索上古修士洞府", time: "3天" },
      { name: "外交任务", contribution: 300, desc: "前往友宗传递消息", time: "2天" },
      { name: "收集材料", contribution: 400, desc: "收集炼制法宝的玄铁", time: "2天" }
    ]
  },
  major: {
    title: "重大贡献",
    tasks: [
      { name: "发现灵脉", contribution: 10000, desc: "发现一处小型灵石矿脉", time: "特殊任务" },
      { name: "夺得秘境", contribution: 20000, desc: "在宗门大比中为宗门夺得秘境掌控权", time: "特殊任务" },
      { name: "击退外敌", contribution: 15000, desc: "在宗门战争中击退来犯之敌", time: "特殊任务" }
    ]
  },
  special: {
    title: "特殊贡献",
    tasks: [
      { name: "捐献灵石", contribution: "1:1", desc: "每捐献1灵石获得1贡献", time: "即时" },
      { name: "捐献法宝", contribution: "按价值", desc: "根据法宝价值计算贡献", time: "即时" },
      { name: "捐献丹药", contribution: "按价值", desc: "根据丹药价值计算贡献", time: "即时" }
    ]
  }
};

// 藏阁数据
let treasureData = {
  treasure: {
    title: "藏宝阁",
    description: "宗门资源中枢，可使用贡献兑换灵石和各种材料",
    items: [
      { name: "下品灵石", contribution: 10, desc: "基础修炼资源" },
      { name: "中品灵石", contribution: 100, desc: "中级修炼资源" },
      { name: "九叶灵芝", contribution: 500, desc: "炼制筑基丹主药" },
      { name: "玄铁矿", contribution: 300, desc: "炼制飞剑材料" },
      { name: "赤铜精", contribution: 800, desc: "炼制法宝材料" }
    ]
  },
  artifact: {
    title: "藏器阁",
    description: "法宝传承圣地，可使用贡献兑换各种法器、灵器。宗门声望越高，兑换折扣越大。",
    discount: 0.9, // 当前折扣
    items: [
      { name: "青锋剑", contribution: 2000, desc: "下品法器，锋利无比" },
      { name: "玄铁盾", contribution: 3000, desc: "中品法器，防御力强" },
      { name: "离火扇", contribution: 8000, desc: "上品法器，蕴含离火之精" },
      { name: "青云舟", contribution: 15000, desc: "下品灵器，飞行法宝" },
      { name: "金蛟剪", contribution: 25000, desc: "中品灵器，攻击力惊人" }
    ]
  },
  pills: {
    title: "藏丹阁",
    description: "丹道秘传殿堂，可直接购买丹药或研习丹方自行炼制",
    items: [
      { name: "聚气丹", contribution: 200, desc: "加快灵气吸收" },
      { name: "筑基丹", contribution: 1000, desc: "突破筑基期必备" },
      { name: "凝元丹", contribution: 3000, desc: "巩固金丹期修为" },
      { name: "延寿丹", contribution: 10000, desc: "延长寿命十年" }
    ],
    formulas: [
      { name: "聚气丹丹方", contribution: 1000, desc: "一品丹方" },
      { name: "筑基丹丹方", contribution: 5000, desc: "二品丹方" },
      { name: "凝元丹丹方", contribution: 15000, desc: "三品丹方" }
    ]
  },
  pets: {
    title: "藏灵宠阁",
    description: "灵契共生秘境，可契约灵宠相伴。签订灵契后，灵宠与玩家因果联动，善果/恶果影响亲密度。",
    items: [
      { name: "寻宝鼠", contribution: 5000, desc: "可寻找灵物，战斗力弱" },
      { name: "火云狐", contribution: 12000, desc: "火系灵兽，善使火焰" },
      { name: "金翅雕", contribution: 20000, desc: "飞行灵兽，速度极快" },
      { name: "玄水龟", contribution: 15000, desc: "防御型灵兽，寿命极长" }
    ]
  }
};

// 战争数据
let warData = {
  declare: {
    title: "发起宣战",
    description: "向其他宗门宣战需要消耗大量宗门资源，请谨慎选择目标。",
    cost: "需要消耗：10万灵石，5万贡献值",
    cooldown: "宣战后有30天冷却时间",
    targets: ["天剑宗", "御兽门", "合欢派", "血煞教"]
  },
  defense: {
    title: "攻防战",
    description: "宗门护山大阵防御状态，可查看阵法强度和修复选项。",
    status: "当前阵法强度：85%\n修复需要：5000灵石/1%强度",
    history: "最近一次攻击：无"
  },
  disciple: {
    title: "弟子战",
    description: "派遣弟子与其他宗门弟子切磋，胜利可获得声望和资源。",
    mode: "可选择：1v1切磋、3v3团战、5v5宗门战",
    reward: "胜利奖励：声望+50，灵石+1000\n失败惩罚：声望-20"
  },
  elder: {
    title: "长老战",
    description: "宗门高层之间的对决，胜负影响宗门声望和资源分配。",
    condition: "需至少一名元婴期长老参战",
    reward: "胜利奖励：声望+200，灵石+10000\n失败惩罚：声望-100，灵石-5000"
  }
};

// 从API加载宗门数据
async function loadClanData(clanId) {
  try {
    // 显示加载状态
    uiComponents.showLoading(document.body, '加载宗门数据...');
    
    // 从API获取宗门详情
    const clanDetail = await apiService.getClanDetail(clanId);
    
    // 从API获取宗门成员信息
    const clanMember = await apiService.getClanMemberByRoleId(localStorage.getItem('currentRoleId'));
    
    // 从API获取宗门资源
    const clanResources = await apiService.getClanResources(clanId);
    
    // 更新宗门数据
    sectData = {
      level: clanDetail.level || "五流",
      name: clanDetail.name || "青云门",
      reputation: 320, // 后续从API获取
      totalContribution: clanResources.gongxian || 0,
      spiritStone: clanResources.lingshi || 0,
      memberCount: clanDetail.memberCount || 0,
      warStatus: "和平", // 后续从API获取
      defenseStatus: "完整", // 后续从API获取
      playerPosition: clanMember?.position || "外门弟子",
      playerContribution: clanMember?.contribution || 0
    };
    
    // 后续从API获取任务数据、藏阁数据和战争数据
    // loadClanTasks(clanId);
    // loadClanTreasures(clanId);
    // loadClanWarData(clanId);
    
    // 隐藏加载状态
    uiComponents.hideLoading(document.body);
    
    return sectData;
  } catch (error) {
    console.error('加载宗门数据失败:', error);
    // 隐藏加载状态
    uiComponents.hideLoading(document.body);
    // 显示错误信息
    uiComponents.showError('加载宗门数据失败，使用默认数据', document.body, 3000);
    return sectData; // 返回默认数据作为降级方案
  }
}

// 导出数据
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    sectData,
    positionData,
    taskData,
    treasureData,
    warData,
    loadClanData
  };
} else {
  // 浏览器环境
  window.clanData = {
    sectData,
    positionData,
    taskData,
    treasureData,
    warData,
    loadClanData
  };
}