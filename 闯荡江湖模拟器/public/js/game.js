/** 闯荡江湖模拟器 - 核心游戏引擎 (回合制战斗版) */

const Game = {
  state: null,
  fightTimer: null,
  buffTimers: { atk: null, def: null },
  buffMultipliers: { atk: 1, def: 1 },

  init() {
    this.state = {
      version: 4,
      player: {
        name: '江湖侠客',
        gold: 0,
        power: 35,
        currentStage: 1,
        totalGoldEarned: 0,
        totalKills: 0,
        hp: 100,
        maxHp: 100,
      },
      unlocked: {
        wuxue: false,
        shop: false,
        bag: false,
      },
      skills: {
        s1: { level: 1, unlocked: true },
      },
      equipment: {
        weapon: null,
      },
      inventory: [],
      currentStageProgress: {
        kills: 0,
        bossHp: 0,
        targetKills: 0,
      },
      autoFight: false,
      shopLevel: 1,
      shopRefreshCount: 0,
      shopInventory: null,
      dailyDay: 1,
      lastDailyClaim: null,
      achievements: [],
      unlockedSkills: ['s1'],
      currentSkill: 's1',
      completedStages: [],
      offlineRewards: null,
      lastSaveTime: Date.now(),
      tutorialStep: 1,
    };
    this.state.player.maxHp = this.calcPlayerMaxHp();
    this.state.player.hp = this.state.player.maxHp;
    this.resetStage();
    this.generateShopInventory();
    return this.state;
  },

  resetStage() {
    const stage = GameData.stages.find(s => s.id === this.state.player.currentStage);
    if (stage) {
      this.state.currentStageProgress = {
        kills: 0,
        bossHp: stage.bossHp,
        targetKills: stage.targetCount,
      };
    }
  },

  calcPower() {
    let power = 10;
    Object.keys(this.state.skills).forEach(skillId => {
      const skill = GameData.skills.find(s => s.id === skillId);
      const playerSkill = this.state.skills[skillId];
      if (skill && playerSkill && playerSkill.unlocked) {
        power += skill.baseDps * playerSkill.level;
      }
    });
    const eq = this.state.equipment.weapon;
    if (eq) power += eq.atk || 0;
    return Math.floor(power);
  },

  calcCurrentDps() {
    const skillId = this.state.currentSkill;
    const skill = GameData.skills.find(s => s.id === skillId);
    const playerSkill = this.state.skills[skillId];
    if (!skill || !playerSkill || !playerSkill.unlocked) return 5;
    return skill.baseDps * playerSkill.level * skill.speed;
  },

  calcPlayerMaxHp() {
    const power = this.calcPower();
    return 80 + power * 2;
  },

  calcEnemyAttack(stageId) {
    const sid = stageId || this.state.player.currentStage;
    const stage = GameData.stages.find(s => s.id === sid);
    if (!stage) return 5;
    return Math.floor(stage.bossHp * 0.03) + sid * 3;
  },

  calcPlayerDamage() {
    const skill = GameData.skills.find(s => s.id === this.state.currentSkill);
    const playerSkill = this.state.skills[this.state.currentSkill];
    if (!skill || !playerSkill || !playerSkill.unlocked) return { damage: 5, isCrit: false };

    const baseDamage = skill.damage * playerSkill.level;
    const bonusDamage = this.state.equipment.weapon?.atk || 0;
    const isCrit = Math.random() < 0.05;
    const critMult = isCrit ? 2 : 1;
    const totalDamage = Math.floor((baseDamage + bonusDamage) * critMult * this.buffMultipliers.atk);

    return { damage: totalDamage, isCrit };
  },

  applyDamageToEnemy(damage) {
    const stage = GameData.stages.find(s => s.id === this.state.player.currentStage);
    if (!stage) return null;

    this.state.currentStageProgress.bossHp -= damage;
    this.state.player.power = this.calcPower();

    let result = { damage, killed: false, stageComplete: false, completedStageId: null, isCrit: false };

    if (this.state.currentStageProgress.bossHp <= 0) {
      this.state.currentStageProgress.kills++;
      this.state.player.totalKills++;
      const killGold = Math.floor(stage.reward / stage.targetCount);
      this.state.player.gold += killGold;
      this.state.player.totalGoldEarned += killGold;

      if (this.state.currentStageProgress.kills >= stage.targetCount) {
        const bonusGold = Math.floor(stage.reward * 0.5);
        this.state.player.gold += bonusGold;
        this.state.player.totalGoldEarned += bonusGold;
        result.stageComplete = true;
        result.completedStageId = stage.id;
        if (!this.state.completedStages) this.state.completedStages = [];
        if (!this.state.completedStages.includes(stage.id)) {
          this.state.completedStages.push(stage.id);
        }
        if (this.state.player.currentStage < GameData.stages.length) {
          this.state.player.currentStage++;
        }
        this.resetStage();
      } else {
        this.state.currentStageProgress.bossHp = stage.bossHp;
      }
      result.killed = true;
      this.healPlayer(0.3);
    }

    this.checkUnlocks();
    return result;
  },

  applyEnemyAttack() {
    const stage = GameData.stages.find(s => s.id === this.state.player.currentStage);
    if (!stage) return null;

    const enemyAtk = this.calcEnemyAttack();
    const variance = 0.8 + Math.random() * 0.4;
    const damage = Math.max(1, Math.floor(enemyAtk * variance * this.buffMultipliers.def));

    this.state.player.hp = Math.max(0, this.state.player.hp - damage);

    return { damage, playerDead: this.state.player.hp <= 0 };
  },

  healPlayer(percent) {
    const maxHp = this.calcPlayerMaxHp();
    this.state.player.maxHp = maxHp;
    if (percent >= 1) {
      this.state.player.hp = maxHp;
    } else {
      this.state.player.hp = Math.min(maxHp, this.state.player.hp + Math.floor(maxHp * percent));
    }
  },

  healPlayerByValue(value) {
    const maxHp = this.calcPlayerMaxHp();
    this.state.player.maxHp = maxHp;
    this.state.player.hp = Math.min(maxHp, this.state.player.hp + value);
  },

  resetPlayerHp() {
    this.state.player.maxHp = this.calcPlayerMaxHp();
    this.state.player.hp = this.state.player.maxHp;
  },

  clickAttack() {
    const { damage, isCrit } = this.calcPlayerDamage();
    const result = this.applyDamageToEnemy(damage);
    if (result) {
      result.isCrit = isCrit;
    }
    return result;
  },

  checkUnlocks() {
    const totalKills = this.state.player.totalKills || 0;

    if (!this.state.unlocked.wuxue && totalKills >= 5) {
      this.state.unlocked.wuxue = true;
    }
    if (!this.state.unlocked.shop && totalKills >= 10) {
      this.state.unlocked.shop = true;
    }
    if (!this.state.unlocked.bag && totalKills >= 15) {
      this.state.unlocked.bag = true;
    }
  },

  startAutoFight() {
    this.state.autoFight = true;
  },

  stopAutoFight() {
    this.state.autoFight = false;
  },

  upgradeSkill(skillId) {
    const skill = GameData.skills.find(s => s.id === skillId);
    const playerSkill = this.state.skills[skillId];
    if (!skill || !playerSkill || !playerSkill.unlocked) return { ok: false, msg: '未解锁' };

    const cost = Math.floor(skill.upgradeCost * Math.pow(1.5, playerSkill.level - 1));
    if (this.state.player.gold < cost) return { ok: false, msg: '金币不足' };

    this.state.player.gold -= cost;
    playerSkill.level++;
    this.state.player.power = this.calcPower();
    this.state.player.maxHp = this.calcPlayerMaxHp();
    return { ok: true, cost, newLevel: playerSkill.level };
  },

  unlockSkill(skillId) {
    const skill = GameData.skills.find(s => s.id === skillId);
    if (!skill) return { ok: false, msg: '武学不存在' };
    if (this.state.unlockedSkills.includes(skillId)) return { ok: false, msg: '已解锁' };

    const cost = skill.upgradeCost * 10;
    if (this.state.player.gold < cost) return { ok: false, msg: '金币不足' };

    this.state.player.gold -= cost;
    this.state.unlockedSkills.push(skillId);
    this.state.skills[skillId] = { level: 1, unlocked: true };
    this.state.player.power = this.calcPower();
    this.state.player.maxHp = this.calcPlayerMaxHp();
    return { ok: true, cost };
  },

  setCurrentSkill(skillId) {
    if (this.state.unlockedSkills.includes(skillId)) {
      this.state.currentSkill = skillId;
      return true;
    }
    return false;
  },

  autoSwitchSkillByWeapon(weaponCat) {
    if (!weaponCat) return;
    const matchingSkill = GameData.skills.find(s =>
      s.cat === weaponCat && this.state.unlockedSkills.includes(s.id)
    );
    if (matchingSkill) {
      this.state.currentSkill = matchingSkill.id;
    }
  },

  buyShopItem(itemId) {
    const item = GameData.shopItems.find(i => i.id === itemId);
    if (!item) return { ok: false, msg: '物品不存在' };
    if (this.state.player.gold < item.price) return { ok: false, msg: '金币不足' };

    if (item.type === 'weapon' && this.state.equipment.weapon?.id === item.id) {
      return { ok: false, msg: '已装备该武器' };
    }
    if (item.type === 'book' && this.state.unlockedSkills.includes(item.skill)) {
      return { ok: false, msg: '已学会该武学' };
    }

    this.state.player.gold -= item.price;

    if (item.type === 'weapon') {
      if (this.state.equipment.weapon) {
        this.state.inventory.push({ ...this.state.equipment.weapon });
      }
      this.state.equipment.weapon = { ...item };
      this.autoSwitchSkillByWeapon(item.cat);
    } else if (item.type === 'book') {
      if (!this.state.unlockedSkills.includes(item.skill)) {
        this.state.unlockedSkills.push(item.skill);
        this.state.skills[item.skill] = { level: 1, unlocked: true };
      }
    } else if (item.type === 'consumable') {
      this.state.inventory.push({ ...item });
    }

    this.state.player.power = this.calcPower();
    this.state.player.maxHp = this.calcPlayerMaxHp();
    return { ok: true };
  },

  useItem(idx) {
    const item = this.state.inventory[idx];
    if (!item || item.type !== 'consumable') return { ok: false, msg: '无法使用' };

    let result = { ok: true, effect: '', value: 0 };

    if (item.effect === 'heal') {
      this.healPlayerByValue(item.value);
      result.effect = 'heal';
      result.value = item.value;
    } else if (item.effect === 'healFull') {
      this.healPlayer(1);
      result.effect = 'healFull';
      result.value = this.state.player.maxHp;
    } else if (item.effect === 'buffAtk') {
      this.buffMultipliers.atk = item.value;
      if (this.buffTimers.atk) clearTimeout(this.buffTimers.atk);
      this.buffTimers.atk = setTimeout(() => {
        this.buffMultipliers.atk = 1;
        this.buffTimers.atk = null;
        if (UI) UI.showToast('聚气丹效果消失');
      }, (item.duration || 60) * 1000);
      result.effect = 'buffAtk';
      result.value = item.value;
    } else if (item.effect === 'buffDef') {
      this.buffMultipliers.def = item.value;
      if (this.buffTimers.def) clearTimeout(this.buffTimers.def);
      this.buffTimers.def = setTimeout(() => {
        this.buffMultipliers.def = 1;
        this.buffTimers.def = null;
        if (UI) UI.showToast('铁壁丹效果消失');
      }, (item.duration || 60) * 1000);
      result.effect = 'buffDef';
      result.value = item.value;
    }

    this.state.inventory.splice(idx, 1);
    return result;
  },

  refreshShop() {
    const cost = 100 + this.state.shopRefreshCount * 50;
    if (this.state.player.gold < cost) return { ok: false, msg: '金币不足' };
    this.state.player.gold -= cost;
    this.state.shopRefreshCount++;
    this.generateShopInventory();
    return { ok: true, cost };
  },

  generateShopInventory() {
    const level = this.state.shopLevel || 1;
    const count = 4 + level;
    const allItems = GameData.shopItems.filter(item => {
      if (item.type === 'weapon' && this.state.equipment.weapon?.id === item.id) return false;
      if (item.type === 'book' && this.state.unlockedSkills.includes(item.skill)) return false;
      return true;
    });
    const maxPrice = level * 3000;
    const affordable = allItems.filter(i => i.price <= maxPrice);
    const pool = affordable.length > 0 ? affordable : allItems;
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    this.state.shopInventory = shuffled.slice(0, count).map(i => i.id);
  },

  claimDailyReward() {
    const today = new Date().toDateString();
    if (this.state.lastDailyClaim === today) return { ok: false, msg: '今日已领取' };

    const reward = GameData.dailyRewards[(this.state.dailyDay - 1) % 7];
    if (!reward) return { ok: false, msg: '无奖励' };

    this.state.player.gold += reward.gold;
    this.state.player.totalGoldEarned += reward.gold;
    if (reward.item) {
      const item = GameData.shopItems.find(i => i.id === reward.item);
      if (item) {
        if (item.type === 'book') {
          if (!this.state.unlockedSkills.includes(item.skill)) {
            this.state.unlockedSkills.push(item.skill);
            this.state.skills[item.skill] = { level: 1, unlocked: true };
          }
        } else {
          this.state.inventory.push({ ...item });
        }
      }
    }

    this.state.lastDailyClaim = today;
    this.state.dailyDay++;
    this.state.player.power = this.calcPower();
    return { ok: true, reward };
  },

  checkAchievements() {
    const newAchievements = [];
    const cs = this.state.completedStages || [];

    if (!this.state.achievements.includes('a1') && cs.includes(1)) {
      newAchievements.push('a1');
    }
    if (!this.state.achievements.includes('a2') && cs.includes(5)) {
      newAchievements.push('a2');
    }
    if (!this.state.achievements.includes('a3') && cs.includes(10)) {
      newAchievements.push('a3');
    }
    if (!this.state.achievements.includes('a4') && this.state.unlockedSkills.length >= GameData.skills.length) {
      newAchievements.push('a4');
    }
    if (!this.state.achievements.includes('a5') && this.state.player.totalGoldEarned >= 100000) {
      newAchievements.push('a5');
    }
    if (!this.state.achievements.includes('a6') && this.state.player.totalKills >= 100) {
      newAchievements.push('a6');
    }

    newAchievements.forEach(achId => {
      const ach = GameData.achievements.find(a => a.id === achId);
      if (ach) {
        this.state.player.gold += ach.reward;
        this.state.player.totalGoldEarned += ach.reward;
        this.state.achievements.push(achId);
      }
    });

    return newAchievements;
  },

  calcOfflineRewards() {
    if (!this.state.lastSaveTime) return null;
    const now = Date.now();
    const elapsed = Math.floor((now - this.state.lastSaveTime) / 1000);
    if (elapsed < 60) return null;

    const offlineSec = Math.min(elapsed, 8 * 3600);
    const stage = GameData.stages.find(s => s.id === this.state.player.currentStage);
    if (!stage) return null;
    const dps = this.calcCurrentDps();
    const kills = Math.floor((offlineSec * dps) / stage.bossHp);
    const goldEarned = Math.floor(kills * (stage.reward / stage.targetCount));

    return { seconds: offlineSec, gold: goldEarned, kills };
  },

  claimOfflineRewards() {
    const rewards = this.calcOfflineRewards();
    if (!rewards) return null;
    this.state.player.gold += rewards.gold;
    this.state.player.totalGoldEarned += rewards.gold;
    this.state.offlineRewards = null;
    return rewards;
  },

  save(slot = 'auto') {
    if (!this.state) return false;
    this.state.lastSaveTime = Date.now();
    try {
      const json = JSON.stringify(this.state);
      localStorage.setItem('game_save_' + slot, json);
      try {
        fetch('/api/save/' + slot, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: json,
          keepalive: true,
        }).catch(() => {});
      } catch (e) {}
    } catch (e) {}
    return true;
  },

  load(slot = 'auto') {
    const local = localStorage.getItem('game_save_' + slot);
    if (local) {
      try {
        this.state = JSON.parse(local);

        if (!this.state.unlocked) {
          this.state.unlocked = { wuxue: false, shop: false, bag: false };
        }
        if (this.state.player.totalKills === undefined) {
          this.state.player.totalKills = 0;
        }
        if (!this.state.completedStages) {
          this.state.completedStages = [];
        }
        if (this.state.player.hp === undefined || this.state.player.maxHp === undefined || this.state.player.maxHp === 0) {
          this.state.player.maxHp = this.calcPlayerMaxHp();
          this.state.player.hp = this.state.player.maxHp;
        }
        if (this.state.player.hp > this.state.player.maxHp) {
          this.state.player.hp = this.state.player.maxHp;
        }
        if (!this.state.unlockedSkills) {
          this.state.unlockedSkills = Object.keys(this.state.skills).filter(k => this.state.skills[k].unlocked);
        }
        if (!this.state.currentSkill) {
          this.state.currentSkill = this.state.unlockedSkills[0] || 's1';
        }
        if (!this.state.inventory) {
          this.state.inventory = [];
        }
        if (!this.state.achievements) {
          this.state.achievements = [];
        }
        if (!this.state.shopInventory) {
          this.generateShopInventory();
        }
        if (!this.state.claimedTasks) {
          this.state.claimedTasks = [];
        }
        if (this.state.tutorialStep === undefined) {
          this.state.tutorialStep = -1;
        }

        const rewards = this.calcOfflineRewards();
        if (rewards) this.state.offlineRewards = rewards;
        return true;
      } catch (e) {
        this.init();
        return false;
      }
    }
    return false;
  },

  claimTaskReward() {
    const cs = this.state.completedStages || [];
    if (cs.length === 0) return { ok: false, msg: '暂无已通关卡' };
    const lastCompleted = cs[cs.length - 1];
    const stage = GameData.stages.find(s => s.id === lastCompleted);
    if (!stage) return { ok: false, msg: '关卡数据异常' };
    if (this.state.claimedTasks && this.state.claimedTasks.includes(lastCompleted)) {
      return { ok: false, msg: '该关卡悬赏已领取' };
    }
    if (!this.state.claimedTasks) this.state.claimedTasks = [];
    this.state.claimedTasks.push(lastCompleted);
    const bonus = Math.floor(stage.reward * 0.3);
    this.state.player.gold += bonus;
    this.state.player.totalGoldEarned += bonus;
    return { ok: true, gold: bonus, stageName: `${stage.name} (${stage.boss})` };
  },

  checkTutorialProgress() {
    const step = this.state.tutorialStep;
    if (step <= 0 || step > GameData.tutorialSteps.length) return false;
    let advanced = false;
    if (step === 1) { this.state.tutorialStep = 2; advanced = true; }
    else if (step === 2 && this.state.player.totalKills >= 1) { this.state.tutorialStep = 3; advanced = true; }
    else if (step === 3 && this.state.lastDailyClaim) { this.state.tutorialStep = 4; advanced = true; }
    else if (step === 4 && this.state.unlocked.wuxue) { this.state.tutorialStep = 5; advanced = true; }
    else if (step === 5 && this.state.unlocked.shop) { this.state.tutorialStep = 6; advanced = true; }
    else if (step === 6 && this.state.autoFight) { this.state.tutorialStep = 7; advanced = true; }
    else if (step === 7 && (this.state.completedStages || []).length > 0) { this.state.tutorialStep = 8; advanced = true; }
    else if (step === 8) { this.state.tutorialStep = -1; advanced = true; }
    return advanced;
  },

  deleteSave(slot = 'auto') {
    localStorage.removeItem('game_save_' + slot);
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Game;
}
