/** 闯荡江湖模拟器 - UI渲染引擎 (回合制战斗版) */

const UI = {
  currentPage: 'jianghu',
  activeWuxueCat: 'sword',
  activeWuxueSkill: null,
  activeBagCat: 'all',
  autoFightInterval: null,
  prevUnlocked: null,
  toastQueue: [],
  toastShowing: false,
  modalQueue: [],
  currentModal: null,
  confirmCallback: null,
  pendingUnlockFeature: null,
  pendingAchievements: [],
  showingAchievement: false,

  combatState: 'idle',
  inputLocked: false,
  combatTimers: [],

  init() {
    this.bindEvents();
    this.activeWuxueSkill = Game.state.currentSkill;
    this.renderAll();
    this.checkUnlocks();
    this.updatePlayerHpBar();
    if (Game.state.autoFight) {
      this.runAutoFightTick();
    }
  },

  setHeroImage() {},

  bindEvents() {
    const scene = document.getElementById('battle-scene');
    if (scene) {
      scene.addEventListener('click', (e) => {
        if (this.currentPage === 'jianghu') {
          this.onBattleClick(e);
        }
      });
    }
  },

  onBattleClick(e) {
    if (this.inputLocked || this.combatState !== 'idle') return;
    this.startPlayerAttack(e);
  },

  startPlayerAttack(e) {
    const { damage, isCrit } = Game.calcPlayerDamage();
    this.combatState = 'player_attack';
    this.inputLocked = true;
    this.clearCombatTimers();

    const hint = document.querySelector('.click-hint');
    if (hint) hint.style.opacity = '0';

    const scene = document.getElementById('battle-scene');

    if (scene) {
      scene.classList.remove('idle', 'player-attacking', 'enemy-attacking');
      scene.style.backgroundPosition = '50% center';
      void scene.offsetWidth;
      scene.classList.add('player-attacking');
    }

    const t1 = setTimeout(() => {
      if (scene) {
        scene.classList.remove('player-attacking');
        scene.style.backgroundPosition = '50% center';
      }

      const result = Game.applyDamageToEnemy(damage);
      if (!result) {
        this.combatState = 'idle';
        this.inputLocked = false;
        return;
      }
      result.isCrit = isCrit;

      this.showDamageOnEnemy(result.damage, result.isCrit);
      this.renderAll();
      this.updateEnemyHpBar();
      this.updatePlayerHpBar();

      if (result.isCrit) {
        this.showCritExplosion();
      }

      const t2 = setTimeout(() => {
        if (result.killed) {
          this.onEnemyKilled(result);
        } else {
          this.startEnemyCounter();
        }
      }, 500);
      this.combatTimers.push(t2);
    }, 1520);
    this.combatTimers.push(t1);
  },

  startEnemyCounter() {
    this.combatState = 'enemy_attack';
    const enemyResult = Game.applyEnemyAttack();
    if (enemyResult) {
      this.showDamageOnPlayer(enemyResult.damage);
      this.updatePlayerHpBar();

      if (enemyResult.playerDead) {
        this.onPlayerDead();
        return;
      }
    }

    const t = setTimeout(() => {
      this.combatState = 'idle';
      this.inputLocked = false;
    }, 400);
    this.combatTimers.push(t);
  },

  onEnemyKilled(result) {
    this.combatState = 'enemy_dying';
    const scene = document.getElementById('battle-scene');

    this.showKillEffect();

    const t1 = setTimeout(() => {
      if (result.stageComplete) {
        this.combatState = 'stage_complete';
        this.showStageCompleteModal(result.completedStageId);
        const t2 = setTimeout(() => {
          this.combatState = 'idle';
          this.inputLocked = false;
          this.renderAll();
          this.checkAndShowAchievements();
          this.checkTutorial();
        }, 800);
        this.combatTimers.push(t2);
      } else {
        this.combatState = 'idle';
        this.inputLocked = false;
        this.renderAll();
        this.checkAndShowAchievements();
        this.checkTutorial();
      }
    }, 600);
    this.combatTimers.push(t1);
  },

  onPlayerDead() {
    this.combatState = 'player_dead';
    const scene = document.getElementById('battle-scene');

    if (scene) {
      scene.style.backgroundPosition = '50% center';
    }

    this.showToast('力竭倒地，恢复中...');

    const t1 = setTimeout(() => {
      Game.resetPlayerHp();
      this.combatState = 'idle';
      this.inputLocked = false;
      this.renderAll();
      this.updatePlayerHpBar();
    }, 1500);
    this.combatTimers.push(t1);
  },

  clearCombatTimers() {
    this.combatTimers.forEach(t => clearTimeout(t));
    this.combatTimers = [];
  },

  showDamageOnEnemy(damage, isCrit) {
    const enemy = document.getElementById('enemy-figure');
    const scene = document.getElementById('battle-scene');
    if (!enemy || !scene) return;

    const el = document.createElement('div');
    el.className = 'damage-pop' + (isCrit ? ' crit' : '');
    el.textContent = (isCrit ? '暴击! ' : '') + '-' + damage;
    el.style.left = (enemy.offsetLeft + enemy.offsetWidth / 2) + 'px';
    el.style.top = (enemy.offsetTop) + 'px';
    scene.appendChild(el);
    setTimeout(() => el.remove(), 800);
  },

  showDamageOnPlayer(damage) {
    const hero = document.getElementById('hero-figure');
    const scene = document.getElementById('battle-scene');
    if (!hero || !scene) return;

    const el = document.createElement('div');
    el.className = 'damage-pop enemy-dmg';
    el.textContent = '-' + damage;
    el.style.left = (hero.offsetLeft + hero.offsetWidth / 2) + 'px';
    el.style.top = (hero.offsetTop) + 'px';
    scene.appendChild(el);
    setTimeout(() => el.remove(), 800);
  },

  showSlashEffect() {
    const scene = document.getElementById('battle-scene');
    if (!scene) return;
    const el = document.createElement('div');
    el.className = 'slash-effect';
    el.textContent = '⚔️';
    el.style.left = '55%';
    el.style.top = '35%';
    scene.appendChild(el);
    setTimeout(() => el.remove(), 400);

    const wave = document.createElement('div');
    wave.className = 'wave-effect';
    wave.style.left = '45%';
    wave.style.top = '50%';
    scene.appendChild(wave);
    setTimeout(() => wave.remove(), 500);
  },

  showEnemySlashEffect() {
    const scene = document.getElementById('battle-scene');
    if (!scene) return;
    const el = document.createElement('div');
    el.className = 'slash-effect enemy-slash';
    el.textContent = '💥';
    el.style.left = '25%';
    el.style.top = '40%';
    scene.appendChild(el);
    setTimeout(() => el.remove(), 400);
  },

  showCritExplosion() {
    const scene = document.getElementById('battle-scene');
    if (!scene) return;
    const el = document.createElement('div');
    el.className = 'crit-explosion';
    el.textContent = '💥';
    scene.appendChild(el);
    setTimeout(() => el.remove(), 600);
  },

  showKillEffect() {
    const scene = document.getElementById('battle-scene');
    if (!scene) return;
    const el = document.createElement('div');
    el.className = 'kill-pop';
    el.textContent = '击杀!';
    el.style.left = '50%';
    el.style.top = '40%';
    el.style.transform = 'translate(-50%, -50%)';
    scene.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  },

  updateEnemyHpBar() {
    const stage = GameData.stages.find(s => s.id === Game.state.player.currentStage);
    if (!stage) return;
    const progress = Game.state.currentStageProgress;
    const hpPercent = Math.max(0, (progress.bossHp / stage.bossHp) * 100);

    const bar = document.getElementById('enemy-hp-bar');
    const text = document.getElementById('enemy-hp-text');
    if (bar) bar.style.width = hpPercent + '%';
    if (text) text.textContent = hpPercent.toFixed(1) + '%';
  },

  updatePlayerHpBar() {
    const p = Game.state.player;
    const maxHp = p.maxHp || 100;
    const hp = p.hp != null ? p.hp : maxHp;
    const hpPercent = Math.max(0, Math.min(100, (hp / maxHp) * 100));

    const bar = document.getElementById('player-hp-bar');
    const text = document.getElementById('player-hp-text');
    if (bar) bar.style.width = hpPercent + '%';
    if (text) text.textContent = `${Math.floor(hp)}/${Math.floor(maxHp)}`;

    if (bar) {
      bar.classList.remove('hp-high', 'hp-mid', 'hp-low');
      if (hpPercent > 60) bar.classList.add('hp-high');
      else if (hpPercent > 30) bar.classList.add('hp-mid');
      else bar.classList.add('hp-low');
    }
  },

  checkUnlocks() {
    if (!Game.state) return;
    const unlocked = Game.state.unlocked;
    if (JSON.stringify(this.prevUnlocked) !== JSON.stringify(unlocked)) {
      if (this.prevUnlocked) {
        if (!this.prevUnlocked.wuxue && unlocked.wuxue) {
          this.showUnlockModal('wuxue');
        } else if (!this.prevUnlocked.shop && unlocked.shop) {
          this.showUnlockModal('shop');
        } else if (!this.prevUnlocked.bag && unlocked.bag) {
          this.showUnlockModal('bag');
        }
      }
      this.prevUnlocked = { ...unlocked };
      this.renderNav();
      this.checkTutorial();
    }
  },

  renderNav() {
    const unlocked = Game.state.unlocked;

    const wuxueBtn = document.getElementById('nav-wuxue');
    if (wuxueBtn) {
      if (unlocked.wuxue) wuxueBtn.classList.remove('locked');
      else wuxueBtn.classList.add('locked');
    }

    const shopBtn = document.getElementById('nav-shop');
    if (shopBtn) {
      if (unlocked.shop) shopBtn.classList.remove('locked');
      else shopBtn.classList.add('locked');
    }

    const bagBtn = document.getElementById('nav-bag');
    if (bagBtn) {
      if (unlocked.bag) bagBtn.classList.remove('locked');
      else bagBtn.classList.add('locked');
    }
  },

  tryOpenWuxue() {
    if (Game.state.unlocked.wuxue) this.switchPage('wuxue');
    else this.showToast('击败5个敌人解锁武学!');
  },

  tryOpenShop() {
    if (Game.state.unlocked.shop) this.switchPage('shop');
    else this.showToast('击败10个敌人解锁商店!');
  },

  tryOpenBag() {
    if (Game.state.unlocked.bag) this.switchPage('bag');
    else this.showToast('击败15个敌人解锁包裹!');
  },

  switchPage(page) {
    this.currentPage = page;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const targetPage = document.getElementById('page-' + page);
    if (targetPage) targetPage.classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const navBtn = document.getElementById('nav-' + page);
    if (navBtn) navBtn.classList.add('active');
    this.renderPage(page);
  },

  renderPage(page) {
    switch (page) {
      case 'jianghu': this.renderJianghu(); break;
      case 'wuxue': this.renderWuxue(); break;
      case 'shop': this.renderShop(); break;
      case 'bag': this.renderBag(); break;
    }
  },

  renderAll() {
    this.renderStatusBar();
    this.renderNav();
    this.renderPage(this.currentPage);
    this.renderTutorial();
  },

  renderStatusBar() {
    const p = Game.state.player;
    const powerEl = document.getElementById('power-value');
    const goldEl = document.getElementById('gold-value');
    if (powerEl) powerEl.textContent = Game.calcPower();
    if (goldEl) goldEl.textContent = p.gold.toLocaleString();
  },

  renderJianghu() {
    const stage = GameData.stages.find(s => s.id === Game.state.player.currentStage);
    if (!stage) return;
    const progress = Game.state.currentStageProgress;
    const hpPercent = Math.max(0, (progress.bossHp / stage.bossHp) * 100);

    const stageNameEl = document.getElementById('stage-name');
    const stageDescEl = document.getElementById('stage-desc');
    const killProgressEl = document.getElementById('kill-progress');
    const rewardTextEl = document.getElementById('reward-text');

    if (stageNameEl) stageNameEl.textContent = `第${stage.id}关 ${stage.name}`;
    if (stageDescEl) stageDescEl.textContent = stage.desc;
    if (killProgressEl) killProgressEl.textContent = `抓捕${stage.boss} ${progress.kills}/${stage.targetCount}`;
    if (rewardTextEl) rewardTextEl.textContent = `赏金: ${stage.reward}两`;

    const skill = GameData.skills.find(s => s.id === Game.state.currentSkill);
    const playerSkill = Game.state.skills[Game.state.currentSkill];
    if (skill && playerSkill) {
      const cat = GameData.skillCategories.find(c => c.id === skill.cat);
      const skillIconEl = document.getElementById('skill-icon');
      const skillNameEl = document.getElementById('skill-name');
      const skillDpsEl = document.getElementById('skill-dps');
      const critTextEl = document.getElementById('crit-text');
      if (skillIconEl) skillIconEl.textContent = cat?.icon || '⚔️';
      if (skillNameEl) skillNameEl.textContent = skill.name;
      const dps = Game.calcCurrentDps();
      if (skillDpsEl) skillDpsEl.textContent = `${isNaN(dps) ? '0.0' : dps.toFixed(1)}次/秒`;
      if (critTextEl) critTextEl.textContent = '暴击 5%';
    }

    const enemyHpBarEl = document.getElementById('enemy-hp-bar');
    const enemyHpTextEl = document.getElementById('enemy-hp-text');
    const enemyNameEl = document.getElementById('enemy-name');
    const enemyAvatarEl = document.getElementById('enemy-avatar');

    if (enemyHpBarEl) enemyHpBarEl.style.width = hpPercent + '%';
    if (enemyHpTextEl) enemyHpTextEl.textContent = hpPercent.toFixed(1) + '%';
    if (enemyNameEl) enemyNameEl.textContent = stage.boss;
    if (enemyAvatarEl) enemyAvatarEl.textContent = this.getEnemyEmoji(stage.boss);

    const enemyFigureEl = document.getElementById('enemy-figure');
    if (enemyFigureEl) enemyFigureEl.textContent = '';

    const wantedAvatarEl = document.getElementById('wanted-avatar');
    const wantedNameEl = document.getElementById('wanted-name');
    if (wantedAvatarEl) wantedAvatarEl.textContent = this.getEnemyEmoji(stage.boss);
    if (wantedNameEl) wantedNameEl.textContent = stage.boss;

    const taskNameEl = document.getElementById('task-name');
    const taskProgressEl = document.getElementById('task-progress');
    const taskHintEl = document.getElementById('task-hint');
    const taskIconEl = document.getElementById('task-icon');
    if (taskNameEl) taskNameEl.textContent = stage.boss;
    if (taskProgressEl) taskProgressEl.textContent = `(${progress.kills}/${stage.targetCount})`;

    const isTaskCompleted = progress.kills >= stage.targetCount;
    if (taskHintEl) {
      if (isTaskCompleted) {
        taskHintEl.classList.add('completed');
        if (taskIconEl) taskIconEl.textContent = '✅';
      } else {
        taskHintEl.classList.remove('completed');
        if (taskIconEl) taskIconEl.textContent = '📖';
      }
    }

    this.updateAutoFightBtn();
    this.updatePlayerHpBar();
  },

  claimTaskReward() {
    const result = Game.claimTaskReward();
    if (result.ok) {
      this.showRewardModal('悬赏领取', [
        { icon: '🥈', name: `${result.gold} 金币`, desc: `已完成关卡: ${result.stageName}` }
      ]);
      this.renderAll();
      this.checkTutorial();
    } else {
      this.showToast(result.msg);
    }
  },

  updateAutoFightBtn() {
    const iconEl = document.getElementById('auto-fight-icon');
    const textEl = document.getElementById('auto-fight-text');
    if (Game.state.autoFight) {
      if (iconEl) iconEl.textContent = '⏸️';
      if (textEl) textEl.textContent = '停止';
    } else {
      if (iconEl) iconEl.textContent = '▶️';
      if (textEl) textEl.textContent = '自动打怪';
    }
  },

  getEnemyEmoji(name) {
    return GameData.enemyEmoji[name] || '👾';
  },

  toggleAutoFight() {
    if (Game.state.autoFight) {
      Game.stopAutoFight();
      if (this.autoFightInterval) {
        clearInterval(this.autoFightInterval);
        this.autoFightInterval = null;
      }
      this.showToast('停止自动打怪');
    } else {
      Game.state.autoFight = true;
      this.showToast('开始自动打怪');
      this.runAutoFightTick();
    }
    this.updateAutoFightBtn();
    this.checkTutorial();
  },

  runAutoFightTick() {
    if (!Game.state.autoFight) return;
    if (this.combatState === 'idle' && !this.inputLocked) {
      this.startPlayerAttack(null);
    }
    this.autoFightInterval = setTimeout(() => this.runAutoFightTick(), 200);
  },

  showRanking() {
    this.showToast('排行榜功能开发中...');
  },

  renderWuxue() {
    const cats = GameData.skillCategories;
    let catHtml = '';
    cats.forEach(cat => {
      const active = this.activeWuxueCat === cat.id ? 'active' : '';
      const hasNew = GameData.skills.some(s => s.cat === cat.id && !Game.state.unlockedSkills.includes(s.id));
      const dot = hasNew ? '<span class="dot"></span>' : '';
      catHtml += `<div class="wuxue-cat ${active}" onclick="UI.setWuxueCat('${cat.id}')">${cat.name}${dot}</div>`;
    });
    document.getElementById('wuxue-cats').innerHTML = catHtml;

    const skills = GameData.skills.filter(s => s.cat === this.activeWuxueCat);

    let skillListHtml = '<div class="wuxue-skill-list">';
    skills.forEach(skill => {
      const playerSkill = Game.state.skills[skill.id];
      const unlocked = playerSkill && playerSkill.unlocked;
      const isCurrent = Game.state.currentSkill === skill.id;
      const cls = isCurrent ? 'current' : unlocked ? 'learned' : 'locked';
      const level = unlocked ? playerSkill.level : 0;
      skillListHtml += `<div class="wuxue-skill-item ${cls}" onclick="UI.selectWuxueSkill('${skill.id}')">`;
      skillListHtml += `<span class="wuxue-skill-item-icon">${GameData.skillCategories.find(c => c.id === skill.cat)?.icon || '⚔️'}</span>`;
      skillListHtml += `<span class="wuxue-skill-item-name">${skill.name}</span>`;
      if (unlocked) {
        skillListHtml += `<span class="wuxue-skill-item-level">Lv.${level}</span>`;
      } else {
        skillListHtml += `<span class="wuxue-skill-item-locked">🔒</span>`;
      }
      if (isCurrent) skillListHtml += '<span class="wuxue-skill-item-active">启用</span>';
      skillListHtml += '</div>';
    });
    skillListHtml += '</div>';
    document.getElementById('wuxue-skill-list').innerHTML = skillListHtml;

    const selectedId = this.activeWuxueSkill || skills[0]?.id;
    const currentSkill = GameData.skills.find(s => s.id === selectedId);
    if (!currentSkill) return;

    const playerSkill = Game.state.skills[currentSkill.id];
    const unlocked = playerSkill && playerSkill.unlocked;
    const isCurrent = Game.state.currentSkill === currentSkill.id;
    const level = unlocked ? playerSkill.level : 0;
    const cost = unlocked ? Math.floor(currentSkill.upgradeCost * Math.pow(1.5, level - 1)) : currentSkill.upgradeCost * 10;
    const canAfford = Game.state.player.gold >= cost;

    const cat = GameData.skillCategories.find(c => c.id === currentSkill.cat);

    let detailHtml = '';
    if (isCurrent) detailHtml += `<div class="wuxue-status">启用中</div>`;
    detailHtml += `<div class="wuxue-big-icon">${cat?.icon || '⚔️'}</div>`;
    detailHtml += `<div class="wuxue-stars">`;
    for (let i = 0; i < 5; i++) {
      detailHtml += `<span class="star ${i < Math.min(level, 5) ? 'on' : ''}">★</span>`;
    }
    detailHtml += `</div>`;
    detailHtml += `<div class="wuxue-detail-name">Lv.${level} ${currentSkill.name}</div>`;
    detailHtml += `<div class="wuxue-attr">伤害 ${currentSkill.damage * level} | 速度 ${(currentSkill.speed * 10).toFixed(0)}</div>`;
    const catName = cat?.name || '武学';
    detailHtml += `<div class="wuxue-attr-sub">${catName}+${level}</div>`;
    detailHtml += `<div class="wuxue-cost">🥈 ${cost}</div>`;

    if (unlocked && !isCurrent) {
      detailHtml += `<button class="wuxue-switch-btn" onclick="UI.switchToSkill('${currentSkill.id}')">切换使用</button>`;
    }
    if (unlocked) {
      detailHtml += `<button class="wuxue-upgrade-btn ${canAfford ? '' : 'disabled'}" onclick="UI.upgradeSkill('${currentSkill.id}')">升级</button>`;
    } else {
      detailHtml += `<button class="wuxue-upgrade-btn ${canAfford ? '' : 'disabled'}" onclick="UI.unlockSkill('${currentSkill.id}')">解锁</button>`;
    }
    detailHtml += `<div class="wuxue-desc-text">"${currentSkill.desc}"</div>`;
    detailHtml += `<div class="wuxue-desc-text" style="margin-top:4px;">*装备武器自动切换对应武学</div>`;

    document.getElementById('wuxue-detail').innerHTML = detailHtml;
  },

  setWuxueCat(cat) {
    this.activeWuxueCat = cat;
    const skills = GameData.skills.filter(s => s.cat === cat);
    this.activeWuxueSkill = skills[0]?.id || null;
    this.renderWuxue();
  },

  selectWuxueSkill(skillId) {
    this.activeWuxueSkill = skillId;
    this.renderWuxue();
  },

  switchToSkill(skillId) {
    Game.setCurrentSkill(skillId);
    this.showToast('已切换武学');
    this.renderAll();
  },

  upgradeSkill(skillId) {
    const result = Game.upgradeSkill(skillId);
    if (result.ok) {
      const skill = GameData.skills.find(s => s.id === skillId);
      this.showRewardModal('武学升级', [
        { icon: '⬆️', name: `${skill.name} 升至 Lv.${result.newLevel}`, desc: '战力提升!' }
      ]);
      this.renderAll();
    } else {
      this.showToast(result.msg);
    }
  },

  unlockSkill(skillId) {
    const result = Game.unlockSkill(skillId);
    if (result.ok) {
      const skill = GameData.skills.find(s => s.id === skillId);
      this.showRewardModal('武学解锁', [
        { icon: '✨', name: skill.name, desc: '新武学已解锁，可前往使用!' }
      ]);
      Game.setCurrentSkill(skillId);
      this.renderAll();
    } else {
      this.showToast(result.msg);
    }
  },

  renderShop() {
    if (!Game.state.shopInventory || Game.state.shopInventory.length === 0) {
      Game.generateShopInventory();
    }
    const items = Game.state.shopInventory
      .map(id => GameData.shopItems.find(i => i.id === id))
      .filter(Boolean);
    let html = '';
    items.forEach(item => {
      const owned = item.type === 'weapon' && Game.state.equipment.weapon?.id === item.id;
      const ownedBook = item.type === 'book' && Game.state.unlockedSkills.includes(item.skill);
      const isOwned = owned || ownedBook;
      const icon = item.type === 'weapon' ? '⚔️' : item.type === 'book' ? '📚' : '💊';
      const typeName = item.type === 'weapon' ? (item.cat === 'sword' ? '剑' : item.cat === 'spear' ? '枪棍' : item.cat === 'blade' ? '刀' : '武器') : item.type === 'book' ? '秘籍' : '丹药';
      const descText = item.type === 'weapon' ? `攻击+${item.atk}` : item.type === 'consumable' ? (item.desc || '') : '';
      const canAfford = Game.state.player.gold >= item.price;

      html += `<div class="shop-card ${isOwned ? 'owned' : ''} ${!canAfford && !isOwned ? 'expensive' : ''}" onclick="UI.buyShopItem('${item.id}')">`;
      html += `<div class="card-type">${typeName}</div>`;
      html += `<div class="card-icon">${icon}</div>`;
      html += `<div class="card-name">${item.name}</div>`;
      if (descText) html += `<div class="card-desc">${descText}</div>`;
      html += `<div class="card-price">🥈${item.price}</div>`;
      html += `</div>`;
    });
    document.getElementById('shop-grid').innerHTML = html;
    const refreshCost = 100 + Game.state.shopRefreshCount * 50;
    document.getElementById('shop-level').textContent = `${Game.state.shopLevel}级商店`;
    const refreshBtn = document.querySelector('.shop-action-btn.small');
    if (refreshBtn) refreshBtn.textContent = `刷新 🥈${refreshCost}`;
  },

  buyShopItem(itemId) {
    const item = GameData.shopItems.find(i => i.id === itemId);
    if (!item) return;

    if (!Game.state.shopInventory.includes(itemId)) {
      this.showToast('该物品不在当前货架');
      return;
    }

    const owned = item.type === 'weapon' && Game.state.equipment.weapon?.id === item.id;
    const ownedBook = item.type === 'book' && Game.state.unlockedSkills.includes(item.skill);
    if (owned || ownedBook) {
      this.showToast('已拥有该物品');
      return;
    }

    const result = Game.buyShopItem(itemId);
    if (result.ok) {
      Game.state.shopInventory = Game.state.shopInventory.filter(id => id !== itemId);
      const icon = item.type === 'weapon' ? '⚔️' : item.type === 'book' ? '📚' : '💊';
      const desc = item.type === 'weapon' ? `攻击力 +${item.atk}` : item.type === 'book' ? '武学秘籍，已自动学习' : `放入包裹`;
      this.showRewardModal('购买成功', [
        { icon, name: item.name, desc }
      ]);
      this.renderAll();
    } else {
      this.showToast(result.msg);
    }
  },

  refreshShop() {
    const result = Game.refreshShop();
    if (result.ok) {
      this.showToast(`刷新成功，花费 ${result.cost} 金币`);
      this.renderAll();
    } else {
      this.showToast(result.msg);
    }
  },

  upgradeShop() {
    const cost = Game.state.shopLevel * 500;
    if (Game.state.player.gold < cost) {
      this.showToast('金币不足!');
      return;
    }
    Game.state.player.gold -= cost;
    Game.state.shopLevel++;
    Game.generateShopInventory();
    this.showRewardModal('商店升级', [
      { icon: '🏪', name: `${Game.state.shopLevel}级商店`, desc: '更多好物等你来!' }
    ]);
    this.renderAll();
  },

  renderBag() {
    let items = Game.state.inventory;
    if (this.activeBagCat !== 'all') {
      items = items.filter(i => i.type === this.activeBagCat);
    }

    let html = '';

    const eq = Game.state.equipment.weapon;
    if (eq && (this.activeBagCat === 'all' || this.activeBagCat === 'weapon')) {
      html += `<div class="bag-item equipped">`;
      html += `<div class="bag-item-icon">⚔️</div>`;
      html += `<div class="bag-item-info">`;
      html += `<div class="bag-item-name">${eq.name} <span class="equipped-tag">(已装备)</span></div>`;
      html += `<div class="bag-item-desc">攻击力 +${eq.atk}</div>`;
      html += `</div>`;
      html += `<div class="bag-item-actions"><button class="bag-item-btn bag-btn-unequip" onclick="UI.unequipWeapon()">卸下</button></div>`;
      html += `</div>`;
    }

    if (items.length === 0 && !eq) {
      html += `<div class="empty">暂无物品</div>`;
    } else {
      items.forEach((item) => {
        const realIdx = Game.state.inventory.indexOf(item);
        const icon = item.type === 'weapon' ? '⚔️' : item.type === 'book' ? '📚' : '💊';
        html += `<div class="bag-item">`;
        html += `<div class="bag-item-icon">${icon}</div>`;
        html += `<div class="bag-item-info">`;
        html += `<div class="bag-item-name">${item.name}</div>`;
        const itemDesc = item.type === 'weapon' ? '攻击力 +' + item.atk : item.type === 'consumable' ? (item.desc || '恢复 ' + item.value + ' HP') : '武学秘籍';
        html += `<div class="bag-item-desc">${itemDesc}</div>`;
        html += `</div>`;
        html += `<div class="bag-item-actions">`;
        if (item.type === 'weapon') {
          html += `<button class="bag-item-btn bag-btn-equip" onclick="UI.equipWeapon(${realIdx})">装备</button>`;
        }
        if (item.type === 'consumable') {
          html += `<button class="bag-item-btn bag-btn-use" onclick="UI.useItem(${realIdx})">使用</button>`;
        }
        html += `<button class="bag-item-btn bag-btn-sell" onclick="UI.confirmSellItem(${realIdx})">出售</button>`;
        html += `</div>`;
        html += `</div>`;
      });
    }

    document.getElementById('bag-list').innerHTML = html;
  },

  setBagCat(cat) {
    this.activeBagCat = cat;
    document.querySelectorAll('.bag-cat').forEach(c => c.classList.remove('active'));
    const activeCat = document.querySelector(`.bag-cat[data-cat="${cat}"]`);
    if (activeCat) activeCat.classList.add('active');
    this.renderBag();
  },

  equipWeapon(idx) {
    const item = Game.state.inventory[idx];
    if (!item || item.type !== 'weapon') return;
    if (Game.state.equipment.weapon) {
      Game.state.inventory.push(Game.state.equipment.weapon);
    }
    Game.state.equipment.weapon = { ...item };
    Game.state.inventory.splice(idx, 1);
    Game.state.player.power = Game.calcPower();
    Game.autoSwitchSkillByWeapon(item.cat);
    this.showRewardModal('装备成功', [
      { icon: '⚔️', name: item.name, desc: `攻击力 +${item.atk}` }
    ]);
    this.renderAll();
  },

  unequipWeapon() {
    const eq = Game.state.equipment.weapon;
    if (!eq) return;
    Game.state.inventory.push(eq);
    Game.state.equipment.weapon = null;
    Game.state.player.power = Game.calcPower();
    this.showToast('卸下武器');
    this.renderAll();
  },

  useItem(idx) {
    const item = Game.state.inventory[idx];
    if (!item) return;
    const result = Game.useItem(idx);
    if (result.ok) {
      let desc = '';
      if (result.effect === 'heal') desc = `恢复 ${result.value} 点生命`;
      else if (result.effect === 'healFull') desc = '生命完全恢复';
      else if (result.effect === 'buffAtk') desc = `攻击力+${Math.round((result.value - 1) * 100)}%`;
      else if (result.effect === 'buffDef') desc = `受伤减少${Math.round((1 - result.value) * 100)}%`;

      this.showRewardModal('使用成功', [
        { icon: '💊', name: item.name, desc }
      ]);
      this.renderAll();
    } else {
      this.showToast(result.msg);
    }
  },

  confirmSellItem(idx) {
    const item = Game.state.inventory[idx];
    if (!item) return;
    const price = Math.floor((item.price || 100) * 0.5);
    this.showConfirmModal(
      `确定要出售「${item.name}」吗？\n将获得 ${price} 金币`,
      () => { this.sellItem(idx); }
    );
  },

  sellItem(idx) {
    const item = Game.state.inventory[idx];
    if (!item) return;
    const price = Math.floor((item.price || 100) * 0.5);
    Game.state.player.gold += price;
    Game.state.player.totalGoldEarned += price;
    Game.state.inventory.splice(idx, 1);
    this.showRewardModal('出售成功', [
      { icon: '🥈', name: `${price} 金币`, desc: `出售了 ${item.name}` }
    ]);
    this.renderAll();
  },

  claimDaily() {
    this.showDailyModal();
  },

  claimDailyFromModal() {
    const result = Game.claimDailyReward();
    if (result.ok) {
      const rewards = [];
      rewards.push({ icon: '🥈', name: `${result.reward.gold} 金币`, desc: '每日奖励' });
      if (result.reward.item) {
        const item = GameData.shopItems.find(i => i.id === result.reward.item);
        if (item) {
          const icon = item.type === 'book' ? '📚' : '💊';
          rewards.push({ icon, name: item.name, desc: item.type === 'book' ? '武学秘籍' : item.desc || '丹药' });
        }
      }
      this.closeModal('daily-modal');
      this.showRewardModal('每日奖励', rewards);
      this.renderAll();
      this.checkTutorial();
    } else {
      this.showToast(result.msg);
    }
  },

  showOfflineRewards() {
    const rewards = Game.state.offlineRewards;
    if (!rewards) return;
    const offlineGoldEl = document.getElementById('offline-gold');
    const offlineKillsEl = document.getElementById('offline-kills');
    if (offlineGoldEl) offlineGoldEl.textContent = rewards.gold;
    if (offlineKillsEl) offlineKillsEl.textContent = rewards.kills;
    const modal = document.getElementById('offline-modal');
    if (modal) modal.classList.remove('hidden');
    this.currentModal = 'offline-modal';
  },

  claimOffline() {
    const result = Game.claimOfflineRewards();
    this.closeModal('offline-modal');
    if (result) {
      this.showRewardModal('离线奖励', [
        { icon: '🥈', name: `${result.gold} 金币`, desc: `击杀 ${result.kills} 个敌人` }
      ]);
    }
    this.renderAll();
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
    if (this.currentModal === modalId) this.currentModal = null;
    this.processModalQueue();
  },

  queueModal(modalId) {
    if (!this.currentModal) {
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.remove('hidden');
      this.currentModal = modalId;
      return true;
    } else {
      this.modalQueue.push(modalId);
      return false;
    }
  },

  processModalQueue() {
    if (this.currentModal || this.modalQueue.length === 0) return;
    const nextModalId = this.modalQueue.shift();
    const modal = document.getElementById(nextModalId);
    if (modal) modal.classList.remove('hidden');
    this.currentModal = nextModalId;
  },

  showRewardModal(title, items) {
    const titleEl = document.getElementById('reward-modal-title');
    const itemsEl = document.getElementById('reward-items');
    if (titleEl) titleEl.textContent = title;
    if (itemsEl) {
      let html = '';
      items.forEach(item => {
        html += `<div class="reward-item">`;
        html += `<div class="reward-icon">${item.icon}</div>`;
        html += `<div class="reward-info">`;
        html += `<div class="reward-name">${item.name}</div>`;
        html += `<div class="reward-desc">${item.desc}</div>`;
        html += `</div></div>`;
      });
      itemsEl.innerHTML = html;
    }
    this.queueModal('reward-modal');
  },

  showAchievementModal(achId) {
    const ach = GameData.achievements.find(a => a.id === achId);
    if (!ach) return;
    const iconMap = { 'a1': '🗡️', 'a2': '⚔️', 'a3': '👑', 'a4': '📚', 'a5': '💰', 'a6': '🏆' };
    const iconEl = document.getElementById('achievement-icon');
    const nameEl = document.getElementById('achievement-name');
    const descEl = document.getElementById('achievement-desc');
    const rewardEl = document.getElementById('achievement-reward');
    if (iconEl) iconEl.textContent = iconMap[achId] || '🏆';
    if (nameEl) nameEl.textContent = ach.name;
    if (descEl) descEl.textContent = ach.desc;
    if (rewardEl) rewardEl.textContent = `🥈 ${ach.reward} 金币`;
    this.queueModal('achievement-modal');
    this.spawnParticles('#d0a030', 12);
  },

  checkAndShowAchievements() {
    const newAchs = Game.checkAchievements();
    if (newAchs.length > 0) {
      newAchs.forEach(achId => this.pendingAchievements.push(achId));
      this.processAchievementQueue();
    }
  },

  processAchievementQueue() {
    if (this.showingAchievement || this.pendingAchievements.length === 0) return;
    this.showingAchievement = true;
    const achId = this.pendingAchievements.shift();
    this.showAchievementModal(achId);
    const checkNext = () => {
      if (this.currentModal !== 'achievement-modal') {
        this.showingAchievement = false;
        this.processAchievementQueue();
        return;
      }
      setTimeout(checkNext, 300);
    };
    setTimeout(checkNext, 300);
  },

  showStageCompleteModal(stageId) {
    const stage = GameData.stages.find(s => s.id === stageId);
    if (!stage) return;
    const nameEl = document.getElementById('stage-complete-name');
    const descEl = document.getElementById('stage-complete-desc');
    const summaryEl = document.getElementById('stage-reward-summary');
    const hintEl = document.getElementById('stage-next-hint');
    if (nameEl) nameEl.textContent = `第${stage.id}关 ${stage.name}`;
    if (descEl) descEl.textContent = stage.desc;
    if (summaryEl) summaryEl.textContent = `🥈 获得赏金 ${stage.reward} 两`;
    const nextStage = GameData.stages.find(s => s.id === stageId + 1);
    if (hintEl) hintEl.textContent = nextStage ? `下一关: 第${nextStage.id}关 ${nextStage.name}` : '恭喜通关所有关卡!';
    this.queueModal('stage-complete-modal');
    this.spawnParticles('#4a8a4a', 15);
  },

  showUnlockModal(feature) {
    const featureMap = {
      wuxue: { icon: '⚔️', name: '武学', desc: '江湖中武学为立身之本，\n现在可以修炼各种武学来提升战力了!' },
      shop: { icon: '🏪', name: '商店', desc: '行走江湖怎能没有趁手的兵器和丹药，\n商店已为你敞开大门!' },
      bag: { icon: '🎒', name: '包裹', desc: '江湖所得皆可收入包裹，\n装备武器、使用丹药，全靠它了!' },
    };
    const info = featureMap[feature];
    if (!info) return;
    this.pendingUnlockFeature = feature;
    const iconEl = document.getElementById('unlock-icon');
    const nameEl = document.getElementById('unlock-feature-name');
    const descEl = document.getElementById('unlock-feature-desc');
    if (iconEl) iconEl.textContent = info.icon;
    if (nameEl) nameEl.textContent = info.name;
    if (descEl) descEl.textContent = info.desc;
    this.queueModal('unlock-modal');
    this.spawnParticles('#c8a030', 10);
  },

  onUnlockConfirm() {
    this.closeModal('unlock-modal');
    if (this.pendingUnlockFeature) {
      this.switchPage(this.pendingUnlockFeature);
      this.pendingUnlockFeature = null;
    }
  },

  showDailyModal() {
    this.renderDailyCalendar();
    const today = new Date().toDateString();
    const claimed = Game.state.lastDailyClaim === today;
    const claimBtn = document.getElementById('daily-claim-btn');
    const claimedText = document.getElementById('daily-claimed-text');
    if (claimBtn) claimBtn.style.display = claimed ? 'none' : 'inline-block';
    if (claimedText) claimedText.style.display = claimed ? 'block' : 'none';
    this.queueModal('daily-modal');
  },

  renderDailyCalendar() {
    const calendarEl = document.getElementById('daily-calendar');
    if (!calendarEl) return;
    const currentDay = Game.state.dailyDay;
    const today = new Date().toDateString();
    const claimed = Game.state.lastDailyClaim === today;
    let html = '';
    GameData.dailyRewards.forEach((reward, i) => {
      const dayNum = i + 1;
      const isClaimed = dayNum < currentDay || (dayNum === currentDay && claimed);
      const isCurrent = dayNum === currentDay && !claimed;
      const cls = isClaimed ? 'claimed' : isCurrent ? 'current' : '';
      const icon = reward.item ? (GameData.shopItems.find(it => it.id === reward.item)?.type === 'book' ? '📚' : '💊') : '🥈';
      html += `<div class="daily-day ${cls}">`;
      html += `<div class="daily-day-num">第${dayNum}天</div>`;
      html += `<div class="daily-day-icon">${icon}</div>`;
      html += `<div class="daily-day-reward">${reward.gold}两</div>`;
      if (isClaimed) html += `<div class="check">✓</div>`;
      html += `</div>`;
    });
    calendarEl.innerHTML = html;
  },

  showConfirmModal(msg, onConfirm) {
    const msgEl = document.getElementById('confirm-msg');
    if (msgEl) msgEl.textContent = msg;
    this.confirmCallback = onConfirm;
    this.queueModal('confirm-modal');
  },

  onConfirmOk() {
    this.closeModal('confirm-modal');
    if (this.confirmCallback) {
      this.confirmCallback();
      this.confirmCallback = null;
    }
  },

  spawnParticles(color, count) {
    const container = document.getElementById('particle-container');
    if (!container) return;
    const colors = [color, '#e8c870', '#fff', color];
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = (30 + Math.random() * 40) + '%';
      p.style.top = (30 + Math.random() * 40) + '%';
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.width = (4 + Math.random() * 8) + 'px';
      p.style.height = p.style.width;
      p.style.setProperty('--px', (Math.random() * 200 - 100) + 'px');
      p.style.setProperty('--py', (Math.random() * 200 - 100) + 'px');
      p.style.animationDelay = (Math.random() * 0.3) + 's';
      container.appendChild(p);
      setTimeout(() => p.remove(), 1500);
    }
  },

  renderTutorial() {
    const step = Game.state.tutorialStep;
    const el = document.getElementById('tutorial-bar');
    if (!el) return;
    if (step <= 0 || step > GameData.tutorialSteps.length) {
      el.style.display = 'none';
      return;
    }
    const tutorial = GameData.tutorialSteps[step - 1];
    if (!tutorial) { el.style.display = 'none'; return; }
    el.style.display = 'flex';
    const iconEl = document.getElementById('tutorial-icon');
    const titleEl = document.getElementById('tutorial-title');
    const descEl = document.getElementById('tutorial-desc');
    const stepEl = document.getElementById('tutorial-step-num');
    if (iconEl) iconEl.textContent = tutorial.icon;
    if (titleEl) titleEl.textContent = tutorial.title;
    if (descEl) descEl.textContent = tutorial.desc;
    if (stepEl) stepEl.textContent = `${step}/${GameData.tutorialSteps.length}`;
    this.highlightTutorialTarget(tutorial.target);
  },

  highlightTutorialTarget(targetId) {
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight');
    });
    if (!targetId) return;
    const target = document.getElementById(targetId);
    if (target) target.classList.add('tutorial-highlight');
  },

  skipTutorial() {
    Game.state.tutorialStep = -1;
    this.renderTutorial();
  },

  checkTutorial() {
    const advanced = Game.checkTutorialProgress();
    if (advanced) {
      this.renderTutorial();
      const step = Game.state.tutorialStep;
      if (step > 0 && step <= GameData.tutorialSteps.length) {
        const tutorial = GameData.tutorialSteps[step - 1];
        this.showToast(`${tutorial.icon} ${tutorial.title}`);
      }
    }
  },

  showToast(msg) {
    this.toastQueue.push(msg);
    if (!this.toastShowing) this.processToastQueue();
  },

  processToastQueue() {
    if (this.toastQueue.length === 0) {
      this.toastShowing = false;
      return;
    }
    this.toastShowing = true;
    const msg = this.toastQueue.shift();
    const toast = document.getElementById('toast');
    if (!toast) { this.toastShowing = false; return; }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => this.processToastQueue(), 300);
    }, 1800);
  },
};
