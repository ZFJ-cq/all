# 属性计算和寿命系统完整实现方案

## 📋 核心思想（混合策略）

### 设计原则
- **数据库**: 存储基础属性（"原材料"）和计算规则
- **缓存**: 存储实时计算结果
- **触发事件**: 装备变化、技能升级、Buff 变化时重新计算

### 为什么采用混合策略？
如果直接存最终值，当玩家换装备、升级技能时，很难及时更新这个值，容易出现数据不一致。

## 🗄️ 数据库设计

### 1. 数据库存储内容（"原材料"）

#### 1.1 装备表（equipment）
- `attack_bonus` - 装备攻击力加成
- `defense_bonus` - 装备防御力加成
- `hp_bonus` - 装备生命值加成
- 其他属性加成...

#### 1.2 技能表（user_skills）
- `buff_attack_percent` - 增益技能百分比
- `buff_defense_percent` - 防御加成百分比
- 其他 Buff...

#### 1.3 背包表（inventory）
- `attributes` - 消耗品效果（临时属性，JSON 格式）
- `durability` - 寿命/耐久度

#### 1.4 基础属性表（t_player_stats_base）
- `base_vit`, `base_spi`, `base_agi`, `base_wis`, `base_lck` - 先天基数
- `perm_vit`, `perm_spi`, ... - 后天永久加成
- `tmp_vit`, `tmp_spi`, ... - 临时/装备加成

### 2. 新增配置表

#### 2.1 属性计算规则配置表（cfg_attribute_rules）
存储计算系数，例如：
- `hp_base`: HP 基础系数 = 100
- `atk_spi_coeff`: 攻击灵力系数 = 8
- `crit_lck_coeff`: 暴击气运系数 = 0.001 (0.1%)

#### 2.2 境界属性倍率表（cfg_realm_attribute_mult）
存储每个境界的倍率和最大年龄：
- 炼气期：HP×1.5, ATK×1.2, 最大年龄 120
- 筑基期：HP×2.5, ATK×2.0, 最大年龄 150
- ...

#### 2.3 角色属性缓存表（t_role_attribute_cache）
存储实时计算结果：
- HP, MP, ATK, DEF, Speed
- Crit Rate, Dodge Rate, Exp Bonus
- 总属性点
- 计算版本号（用于缓存失效）

### 3. 寿命系统增强

#### 3.1 game_role 表新增字段
```sql
age INT DEFAULT 18              -- 当前年龄
max_age INT DEFAULT 100          -- 最大年龄（寿元）
life_status TINYINT DEFAULT 0    -- 生命状态：0-存活，1-坐化中，2-已故
death_time DATETIME              -- 死亡时间
reincarnation_count INT DEFAULT 0 -- 轮回次数
cultivation_base DECIMAL(10,4)   -- 修炼资质系数
longevity_bonus INT DEFAULT 0    -- 寿命加成
```

#### 3.2 寿命事件日志表（t_longevity_log）
记录年龄增长、突破延寿等事件。

## 📐 计算公式

### 属性计算公式

```
// HP = (根骨 × 100) × 境界血量系数
HP = (totalVit × coef.hpBase) × realmMult.hp

// ATK = (灵力 × 8 + 根骨 × 1) × 境界攻击系数
ATK = (totalSpi × coef.atkSpiCoeff + totalVit × coef.atkVitCoeff) × realmMult.atk

// DEF = (根骨 × 5 + 身法 × 2) × 境界防御系数
DEF = (totalVit × coef.defVitCoeff + totalAgi × coef.defAgiCoeff) × realmMult.def

// Speed = 身法 × 10
Speed = totalAgi × coef.speedCoeff

// Crit Rate = (气运 × 0.1% + 灵力 × 0.02%)
Crit = (totalLck × coef.critLckCoeff + totalSpi × coef.critSpiCoeff)

// Dodge Rate = (身法 × 0.5%)
Dodge = totalAgi × coef.dodgeCoeff

// Exp Bonus = 1.0 + (悟性 × 1%)
Exp = coef.expBase + (totalWis × coef.expWisCoeff)
```

### 配置表系数示例

| 规则标识 | 规则名称 | 系数值 | 说明 |
|---------|---------|--------|------|
| hp_base | HP 基础系数 | 100.0 | HP = 根骨 × 100 |
| atk_spi_coeff | 攻击灵力系数 | 8.0 | 每点灵力增加 8 点攻击 |
| atk_vit_coeff | 攻击根骨系数 | 1.0 | 每点根骨增加 1 点攻击 |
| def_vit_coeff | 防御根骨系数 | 5.0 | 每点根骨增加 5 点防御 |
| def_agi_coeff | 防御身法系数 | 2.0 | 每点身法增加 2 点防御 |
| speed_coeff | 速度系数 | 10.0 | 每点身法增加 10 点速度 |
| crit_lck_coeff | 暴击气运系数 | 0.001 | 每点气运增加 0.1% 暴击 |
| crit_spi_coeff | 暴击灵力系数 | 0.0002 | 每点灵力增加 0.02% 暴击 |
| dodge_coeff | 闪避系数 | 0.005 | 每点身法增加 0.5% 闪避 |
| exp_base | 经验基础倍率 | 1.0 | 基础经验倍率 |
| exp_wis_coeff | 经验悟性系数 | 0.01 | 每点悟性增加 1% 经验 |

## 🔄 触发重新计算的事件

当发生以下事件时，必须**强制重新计算**并刷新缓存：

### 1. 装备穿戴/卸下
```java
// 修改装备后，立即调用计算服务更新
attributeCalculatorService.clearCache(roleId);
attributeCalculatorService.calculateAttributes(roleId);
```

### 2. 技能升级
```java
// 技能生效范围改变，更新角色属性
attributeCalculatorService.clearCache(roleId);
attributeCalculatorService.calculateAttributes(roleId);
```

### 3. 战斗 Buff/Debuff
```java
// 战斗中受到增益/减益，实时修改中的数值
// 或在计算时动态叠加
```

### 4. 在线状态变化
```java
// 玩家上线时计算一次
attributeCalculatorService.calculateAttributes(roleId);
// 下线时可选择不保存（除非有离线成长）
```

## 📊 示例数据（角色 ID: 45）

### 角色基础属性
- 根骨 (Vit): 120
- 灵力 (Spi): 100
- 身法 (Agi): 100
- 悟性 (Wis): 15
- 气运 (Lck): 50
- 境界：炼气期 (Level 1)

### 计算结果

```
HP = (120 × 100) × 1.5 = 18,000
MP = 100 × 50 = 5,000
ATK = (100 × 8 + 120 × 1) × 1.2 = 1,104
DEF = (120 × 5 + 100 × 2) × 1.2 = 960
Speed = 100 × 10 = 1,000
Crit Rate = (50 × 0.1% + 100 × 0.02%) = 7%
Dodge Rate = (100 × 0.5%) = 5%
Exp Bonus = 1.0 + (15 × 1%) = 1.15
```

### 寿命信息
- 当前年龄：18 岁
- 最大年龄：120 岁（炼气期）
- 生命状态：0（存活）
- 轮回次数：0

## 🚀 执行步骤

### 1. 执行 SQL 脚本

```bash
# 方法 1: 使用 MySQL 命令行
mysql -u root -p lingyuexiantu < V17__attribute_calculation_and_longevity_system.sql

# 方法 2: 使用数据库管理工具（Navicat、DBeaver 等）
# 直接执行 SQL 脚本内容
```

### 2. 编译后端代码

```bash
cd /Users/macbook/前端项目/灵月仙途/lingyuexiantu-server
./mvnw clean compile -DskipTests
```

### 3. 重启后端服务

```bash
./mvnw spring-boot:run
```

### 4. 验证 API 接口

```bash
# 获取角色属性
curl http://localhost:8088/api/attributes/45

# 重新计算角色属性
curl -X POST http://localhost:8088/api/attributes/45/recalculate

# 获取境界最大年龄
curl http://localhost:8088/api/attributes/realm-max-age/1
```

## 📁 相关文件

### SQL 脚本
- `V17__attribute_calculation_and_longevity_system.sql` - 完整的数据库脚本

### Java 实体类
- `CfgAttributeRule.java` - 属性计算规则实体
- `CfgRealmAttributeMult.java` - 境界属性倍率实体
- `RoleAttributeCache.java` - 角色属性缓存实体
- `GameRole.java` - 游戏角色实体（已添加寿命字段）

### Repository
- `CfgAttributeRuleRepository.java`
- `CfgRealmAttributeMultRepository.java`
- `RoleAttributeCacheRepository.java`

### Service
- `AttributeCalculatorService.java` - 属性计算服务（核心）

### Controller
- `AttributeController.java` - 属性计算 API 接口

### DTO
- `AttributeDTO.java` - 属性数据传输对象

## ✅ 验证方法

### 1. 验证数据库表

```sql
-- 查看属性规则
SELECT * FROM cfg_attribute_rules;

-- 查看境界倍率
SELECT * FROM cfg_realm_attribute_mult;

-- 查看角色属性缓存
SELECT * FROM t_role_attribute_cache WHERE role_id = 45;
```

### 2. 验证前端显示

打开角色页面，应该显示：
- ✅ HP: 18000
- ✅ ATK: 1104
- ✅ DEF: 960
- ✅ Speed: 1000
- ✅ Crit Rate: 7.00%
- ✅ Dodge Rate: 5.00%
- ✅ Exp Bonus: 1.15
- ✅ 年龄：18
- ✅ 寿元：120

## 🎯 后续优化建议

1. **装备集成**
   - 在 EquipmentController 中添加装备穿戴/卸下时触发属性重新计算

2. **技能集成**
   - 在 SkillController 中添加技能升级时触发属性重新计算

3. **Buff 系统**
   - 实现临时 Buff 的叠加和移除逻辑
   - 战斗结束后清除临时 Buff

4. **寿命系统**
   - 实现年龄增长定时器
   - 实现突破延寿功能
   - 实现坐化和轮回功能

5. **性能优化**
   - 使用 Redis 缓存热点数据
   - 实现属性计算的懒加载
   - 批量计算优化

---

**创建时间**: 2026-03-31  
**实现人员**: AI Assistant  
**测试状态**: 待测试
