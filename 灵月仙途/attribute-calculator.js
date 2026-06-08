/**
 * 角色属性计算模块
 * 根据基础属性动态计算战斗属性
 * 
 * 计算公式：
 * - HP = (根骨 * 100) * 境界血量系数
 * - ATK = (灵力 * 8 + 根骨 * 1) * 境界攻击系数
 * - DEF = (根骨 * 5 + 身法 * 2) * 境界防御系数
 * - Speed = 身法 * 10（无境界系数）
 * - Crit Rate = (气运 * 0.1% + 灵力 * 0.02%)
 * - Dodge Rate = (身法 * 0.5%)
 * - Exp Bonus = 1.0 + (悟性 * 1%)
 */

window.AttributeCalculator = {
  // 属性上限（从配置加载，带默认值）
  caps: {
    critRate: 0.60,   // 暴击上限 60%
    dodgeRate: 0.45,  // 闪避上限 45%
    hitRate: 0.95     // 命中上限 95%
  },
  
  // 公式系数（从配置加载，带默认值）
  formulaCoefficients: {
    hpBase: 100,      // HP 基础系数
    atkSpiCoeff: 8,   // 灵力对攻击贡献系数
    atkVitCoeff: 1,   // 根骨对攻击贡献系数
    defVitCoeff: 5,   // 根骨对防御贡献系数
    defAgiCoeff: 2,   // 身法对防御贡献系数
    speedCoeff: 10,   // 速度系数
    critLckCoeff: 0.001,  // 气运暴击系数
    critSpiCoeff: 0.0002, // 灵力暴击系数
    dodgeCoeff: 0.005,    // 闪避系数
    hitBase: 0.9,         // 基础命中率
    hitAgiCoeff: 0.003,   // 身法命中系数
    expBase: 1.0,         // 基础经验倍率
    expWisCoeff: 0.01     // 悟性经验系数
  },
  
  // 境界系数（初始为空，从 API 加载）
  realmMultipliers: {},
  
  /**
   * 计算角色属性
   * @param {Object} baseStats - 基础属性对象
   * @returns {Object} 计算后的属性对象
   */
  calculate(baseStats) {
    // 1. 聚合总属性
    const totalVit = this.getTotalStat(baseStats, 'vit');  // 根骨
    const totalSpi = this.getTotalStat(baseStats, 'spi');  // 灵力
    const totalAgi = this.getTotalStat(baseStats, 'agi');  // 身法
    const totalWis = this.getTotalStat(baseStats, 'wis');  // 悟性
    const totalLck = this.getTotalStat(baseStats, 'lck');  // 气运
    
    // 2. 获取境界系数
    const realmLevel = baseStats.realmLevel || 1;
    const realmMult = this.getRealmMultiplier(realmLevel);
    
    // 3. 检查配置是否加载成功
    if (!realmMult) {
      console.warn('⚠️ 境界系数未加载，无法计算属性');
      return {
        // 基础属性
        totalVit,
        totalSpi,
        totalAgi,
        totalWis,
        totalLck,
        
        // 战斗属性
        maxHp: '---',
        attack: '---',
        defense: '---',
        speed: '---',
        critRate: '---',
        critRateValue: 0,
        dodgeRate: '---',
        dodgeRateValue: 0,
        hitRate: '---',
        hitRateValue: 0,
        expBonus: '---',
        expBonusValue: 0,
        
        // 战力
        combatPower: '---',
        
        // 境界信息
        realmLevel,
        realmName: '---',
        
        // 详细计算信息
        details: {
          hpFormula: '配置未加载',
          atkFormula: '配置未加载',
          defFormula: '配置未加载',
          speedFormula: '配置未加载',
          critFormula: '配置未加载',
          dodgeFormula: '配置未加载',
          expFormula: '配置未加载'
        }
      };
    }
    
    // 4. 获取公式系数（支持动态配置）
    const coef = this.formulaCoefficients;
    if (!coef) {
      console.warn('⚠️ 公式系数未加载，无法计算属性');
      return {
        // 基础属性
        totalVit,
        totalSpi,
        totalAgi,
        totalWis,
        totalLck,
        
        // 战斗属性
        maxHp: '---',
        attack: '---',
        defense: '---',
        speed: '---',
        critRate: '---',
        critRateValue: 0,
        dodgeRate: '---',
        dodgeRateValue: 0,
        hitRate: '---',
        hitRateValue: 0,
        expBonus: '---',
        expBonusValue: 0,
        
        // 战力
        combatPower: '---',
        
        // 境界信息
        realmLevel,
        realmName: realmMult.name,
        
        // 详细计算信息
        details: {
          hpFormula: '配置未加载',
          atkFormula: '配置未加载',
          defFormula: '配置未加载',
          speedFormula: '配置未加载',
          critFormula: '配置未加载',
          dodgeFormula: '配置未加载',
          expFormula: '配置未加载'
        }
      };
    }
    
    // 5. 计算衍生属性（使用配置化系数）
    // HP = (根骨 * hpBase) * 境界血量系数
    const maxHp = Math.floor((totalVit * coef.hpBase) * realmMult.hp);
    
    // ATK = (灵力 * atkSpiCoeff + 根骨 * atkVitCoeff) * 境界攻击系数
    const rawAtk = (totalSpi * coef.atkSpiCoeff) + (totalVit * coef.atkVitCoeff);
    const attack = Math.floor(rawAtk * realmMult.atk);
    
    // DEF = (根骨 * defVitCoeff + 身法 * defAgiCoeff) * 境界防御系数
    const rawDef = (totalVit * coef.defVitCoeff) + (totalAgi * coef.defAgiCoeff);
    const defense = Math.floor(rawDef * realmMult.def);
    
    // Speed = 身法 * speedCoeff (无境界系数)
    const speed = totalAgi * coef.speedCoeff;
    
    // Crit Rate = (气运 * critLckCoeff + 灵力 * critSpiCoeff)
    const rawCrit = (totalLck * coef.critLckCoeff) + (totalSpi * coef.critSpiCoeff);
    const critRate = this.capValue(rawCrit, 'critRate');
    
    const critDmg = 1.5 + (totalSpi * 0.001);
    
    const rawDodge = totalAgi * coef.dodgeCoeff;
    const dodgeRate = this.capValue(rawDodge, 'dodgeRate');
    
    // Hit Rate = hitBase + (身法 * hitAgiCoeff)
    const rawHit = coef.hitBase + (totalAgi * coef.hitAgiCoeff);
    const hitRate = this.capValue(rawHit, 'hitRate');
    
    // Exp Bonus = expBase + (悟性 * expWisCoeff)
    const expBonus = coef.expBase + (totalWis * coef.expWisCoeff);
    
    // 6. 计算战力
    const combatPower = this.calculateCombatPower(
      attack, defense, maxHp, speed, critRate, dodgeRate, realmMult.weight
    );
    
    // 7. 构建结果对象
    return {
      // 基础属性
      totalVit,
      totalSpi,
      totalAgi,
      totalWis,
      totalLck,
      
      // 战斗属性
      maxHp,
      attack,
      defense,
      speed,
      critRate: (critRate * 100).toFixed(2) + '%',
      critRateValue: critRate,
      critDmg: (critDmg * 100).toFixed(0) + '%',
      critDmgValue: critDmg,
      dodgeRate: (dodgeRate * 100).toFixed(2) + '%',
      dodgeRateValue: dodgeRate,
      hitRate: (hitRate * 100).toFixed(2) + '%',
      hitRateValue: hitRate,
      expBonus: expBonus.toFixed(2) + 'x',
      expBonusValue: expBonus,
      tenacity: '0%',
      tenacityValue: 0,
      
      // 战力
      combatPower,
      
      // 境界信息
      realmLevel,
      realmName: realmMult.name,
      
      // 详细计算信息（用于悬停提示，显示实际系数）
      details: {
        hpFormula: `(${totalVit} × ${coef.hpBase}) × ${realmMult.hp.toFixed(1)} = ${maxHp.toLocaleString()}`,
        atkFormula: `(${totalSpi} × ${coef.atkSpiCoeff} + ${totalVit} × ${coef.atkVitCoeff}) × ${realmMult.atk.toFixed(1)} = ${attack.toLocaleString()}`,
        defFormula: `(${totalVit} × ${coef.defVitCoeff} + ${totalAgi} × ${coef.defAgiCoeff}) × ${realmMult.def.toFixed(1)} = ${defense.toLocaleString()}`,
        speedFormula: `${totalAgi} × ${coef.speedCoeff} = ${speed}`,
        critFormula: `(${totalLck} × ${(coef.critLckCoeff * 100).toFixed(2)}% + ${totalSpi} × ${(coef.critSpiCoeff * 100).toFixed(4)}%) = ${(critRate * 100).toFixed(2)}%`,
        dodgeFormula: `${totalAgi} × ${(coef.dodgeCoeff * 100).toFixed(2)}% = ${(dodgeRate * 100).toFixed(2)}%`,
        expFormula: `${coef.expBase.toFixed(1)} + (${totalWis} × ${(coef.expWisCoeff * 100).toFixed(1)}%) = ${expBonus.toFixed(2)}x`
      }
    };
  },
  
  /**
   * 获取单项总属性
   */
  getTotalStat(baseStats, statType) {
    const base = baseStats[`base${this.capitalize(statType)}`] || 0;
    const perm = baseStats[`perm${this.capitalize(statType)}`] || 0;
    const tmp = baseStats[`tmp${this.capitalize(statType)}`] || 0;
    const realmBonus = this.getRealmBonus(statType, baseStats.realmLevel || 1);
    
    return base + perm + tmp + realmBonus;
  },
  
  /**
   * 获取境界加成
   */
  getRealmBonus(statType, realmLevel) {
    const realmMult = this.realmMultipliers[realmLevel];
    if (!realmMult) {
      return 0;
    }
    const bonusMap = {
      vit: realmMult.vitBonus || 0,
      spi: realmMult.spiBonus || 0,
      agi: realmMult.agiBonus || 0,
      wis: realmMult.wisBonus || 0,
      lck: realmMult.lckBonus || 0
    };
    return bonusMap[statType] || 0;
  },
  
  /**
   * 获取境界系数
   */
  getRealmMultiplier(realmLevel) {
    if (this.realmMultipliers[realmLevel]) {
      return this.realmMultipliers[realmLevel];
    }
    const defaultLevel = 0;
    if (this.realmMultipliers[defaultLevel]) {
      return this.realmMultipliers[defaultLevel];
    }
    return null;
  },
  
  /**
   * 限制值不超过上限
   */
  capValue(value, capType) {
    const cap = this.caps[capType];
    if (cap !== undefined && value > cap) {
      return cap;
    }
    return value;
  },
  
  /**
   * 计算战力
   */
  calculateCombatPower(attack, defense, hp, speed, critRate, dodgeRate, realmWeight) {
    // 权重设计：攻击 > 境界 > 血量 > 防御 > 特殊
    const power = (
      attack * 10 +
      defense * 5 +
      hp * 0.1 +
      (speed * 2) +
      (critRate * 5000) +
      (dodgeRate * 5000) +
      (realmWeight * 1000)
    );
    
    return Math.floor(power);
  },
  
  /**
   * 字符串首字母大写
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },
  
  /**
   * 格式化百分比（带上限标识）
   */
  formatPercentage(value, capType) {
    const percentage = (value * 100).toFixed(2) + '%';
    const cap = this.caps[capType];
    
    if (cap !== undefined && value >= cap) {
      return `<span class="stat-max">${percentage} MAX</span>`;
    }
    
    return percentage;
  },
  
  /**
   * 加载配置（从 API）
   * 包括：境界系数、公式系数、属性上限
   */
  async loadConfig() {
    await Promise.all([
      this.loadRealmConfig(),
      this.loadFormulaCoefficients(),
      this.loadCaps()
    ]);
  },
  
  /**
   * 加载境界系数配置（从 API）
   */
  async loadRealmConfig() {
    try {
      if (!window.apiService || typeof window.apiService.getConfig !== 'function') {
        console.warn('⚠️ apiService.getConfig 不存在');
        this.realmMultipliers = {};
        console.log('✅ 境界系数配置未加载');
        return;
      }
      const response = await window.apiService.getConfig('realm_mult');
      if (response) {
        // 直接使用响应数据，因为后端返回的是 JSON 字符串
        let config;
        try {
          config = typeof response === 'string' ? JSON.parse(response) : response;
        } catch (e) {
          config = response;
        }
        this.realmMultipliers = {};
        
        if (typeof config === 'object' && config !== null) {
          Object.keys(config).forEach(key => {
            const level = parseInt(key);
            const data = config[key];
            this.realmMultipliers[level] = {
              name: data.name || `境界${level}`,
              hp: data.hp_mul || data.hp || 1.0,
              atk: data.atk_mul || data.atk || 1.0,
              def: data.def_mul || data.def || 1.0,
              speed: data.speed_mul || data.speed || 1.0,
              crit: data.crit_mul || data.crit || 1.0,
              dodge: data.dodge_mul || data.dodge || 1.0,
              exp: data.exp_mul || data.exp || 1.0,
              weight: data.weight || level,
              maxAge: data.max_age || data.maxAge || 100,
              vitBonus: data.vit_bonus || 0,
              spiBonus: data.spi_bonus || 0,
              agiBonus: data.agi_bonus || 0,
              wisBonus: data.wis_bonus || 0,
              lckBonus: data.lck_bonus || 0
            };
          });
          
          console.log('✅ 境界系数配置已加载');
        } else {
          // 不使用默认值，直接清空
          this.realmMultipliers = {};
          console.log('✅ 境界系数配置未加载');
        }
      } else {
        // API返回但数据为空，不使用默认值
        this.realmMultipliers = {};
        console.warn('⚠️ API返回空境界系数配置');
      }
    } catch (error) {
      console.error('❌ 加载境界系数配置失败:', error);
      // 不使用默认数据，直接清空
      this.realmMultipliers = {};
      console.log('✅ 境界系数配置未加载');
    }
  },
  
  /**
   * 加载公式系数配置（从 API）
   */
  async loadFormulaCoefficients() {
    try {
      if (!window.apiService || typeof window.apiService.getConfig !== 'function') {
        console.warn('⚠️ apiService.getConfig 不存在');
        return;
      }
      const response = await window.apiService.getConfig('formula_coef');
      if (response) {
        // 直接使用响应数据，因为后端返回的是 JSON 字符串
        let config;
        try {
          config = typeof response === 'string' ? JSON.parse(response) : response;
        } catch (e) {
          config = response;
        }
        if (typeof config === 'object' && config !== null) {
          this.formulaCoefficients = {
            hpBase: config.hp_base || config.hp,
            atkSpiCoeff: config.atk_spirit || config.attack,
            atkVitCoeff: config.atk_vit,
            defVitCoeff: config.def_vit || config.defense,
            defAgiCoeff: config.def_agi,
            speedCoeff: config.speed,
            critLckCoeff: config.crit_luck || config.crit,
            critSpiCoeff: config.crit_spirit,
            dodgeCoeff: config.dodge,
            hitBase: config.hit_base,
            hitAgiCoeff: config.hit_agi,
            expBase: config.exp_base,
            expWisCoeff: config.exp_wis
          };
          console.log('✅ 公式系数配置已加载');
        }
      }
    } catch (error) {
      console.error('❌ 加载公式系数配置失败:', error);
      // 保持现有值
    }
  },
  
  /**
   * 加载属性上限配置（从 API）
   */
  async loadCaps() {
    try {
      if (!window.apiService || typeof window.apiService.getConfig !== 'function') {
        console.warn('⚠️ apiService.getConfig 不存在');
        return;
      }
      const response = await window.apiService.getConfig('stat_caps');
      if (response) {
        // 直接使用响应数据，因为后端返回的是 JSON 字符串
        let config;
        try {
          config = typeof response === 'string' ? JSON.parse(response) : response;
        } catch (e) {
          config = response;
        }
        if (typeof config === 'object' && config !== null) {
          this.caps = {
            critRate: config.crit_rate || config.crit,
            dodgeRate: config.dodge_rate || config.dodge,
            hitRate: config.hit_rate || config.hit
          };
          console.log('✅ 属性上限配置已加载');
        }
      }
    } catch (error) {
      console.error('❌ 加载属性上限配置失败:', error);
      // 保持现有值
    }
  }
};

console.log('✅ AttributeCalculator 已加载');
