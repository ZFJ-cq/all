# 技能系统功能更新

## 更新内容

### 1. 数据库变更

#### 新增字段：技能触发概率（trigger_rate）
- **表名**：`skill`
- **字段名**：`trigger_rate`
- **类型**：`INT`
- **默认值**：`100`
- **说明**：技能触发概率（百分比），数值越大触发概率越低
  - 例如：`100` 表示大约 100 次行动触发 1 次技能（1% 概率）
  - 例如：`50` 表示大约 50 次行动触发 1 次技能（2% 概率）

#### 迁移脚本
文件：`V19__add_skill_trigger_rate.sql`

```sql
-- 为技能表添加技能释放概率字段
ALTER TABLE skill
ADD COLUMN IF NOT EXISTS trigger_rate INT DEFAULT 100 COMMENT '技能触发概率（百分比），数值越大触发概率越低';

-- 更新现有技能数据，设置合理的触发概率
UPDATE skill SET trigger_rate = 100 WHERE skill_name IN ('基础剑法', '火球术');
UPDATE skill SET trigger_rate = 150 WHERE skill_name IN ('冰魄术', '天雷诀');
UPDATE skill SET trigger_rate = 80 WHERE skill_name = '灵力护盾';
UPDATE skill SET trigger_rate = 120 WHERE skill_name = '金刚诀';
UPDATE skill SET trigger_rate = 200 WHERE skill_name = '聚气诀';
UPDATE skill SET trigger_rate = 180 WHERE skill_name = '九转玄功';
UPDATE skill SET trigger_rate = 90 WHERE skill_name = '瞬影步';
UPDATE skill SET trigger_rate = 110 WHERE skill_name = '五行遁术';
```

### 2. 后端实体类更新

#### Skill.java
新增字段和 getter/setter：

```java
private Integer triggerRate; // 技能触发概率（百分比），数值越大触发概率越低

public Integer getTriggerRate() {
    return triggerRate;
}

public void setTriggerRate(Integer triggerRate) {
    this.triggerRate = triggerRate;
}
```

### 3. 前端技能页面更新

#### 技能详情弹窗
- **新增显示项**：触发概率
- **位置**：详情弹窗统计网格中
- **显示格式**：`X% (1/Y)`
  - X%：触发概率百分比
  - Y：trigger_rate 原始值

#### 显示逻辑
```javascript
// 计算并显示触发概率
const triggerRate = skill.triggerRate || 100;
const triggerPercent = (100 / triggerRate).toFixed(1);
document.getElementById('detailTriggerRate').textContent = `${triggerPercent}% (1/${triggerRate})`;
```

#### 示例显示
- `基础剑法`：trigger_rate = 100 → 显示 "1.0% (1/100)"
- `灵力护盾`：trigger_rate = 80 → 显示 "1.3% (1/80)"
- `九转玄功`：trigger_rate = 180 → 显示 "0.6% (1/180)"

### 4. 已学习技能显示逻辑

#### 判断规则
只要满足以下条件之一，就显示"已学习"：
1. 技能在 `role_skill` 表中有记录（`roleSkill !== undefined && roleSkill !== null`）
2. 技能数据从 API 成功获取

#### 状态显示优先级
1. **已装备**：`roleSkill.equipped === true || roleSkill.equipped === 1 || roleSkill.equipped === 'true'`
2. **已学习**：`roleSkill !== undefined && roleSkill !== null`
3. **未学习**：其他情况

## 使用方法

### 1. 应用数据库迁移
```bash
# 启动后端服务后，Flyway 会自动执行迁移脚本
# 或者手动执行：
mysql -u root -p lingyue_xiantu < V19__add_skill_trigger_rate.sql
```

### 2. 重启后端服务
```bash
cd /Users/macbook/前端项目/灵月仙途/lingyuexiantu-server
mvn spring-boot:run
```

### 3. 前端测试
访问技能页面：`http://localhost:8080/skills/skills.html`

- 查看技能列表，确认显示"已学习"状态
- 点击技能卡片，查看详情中的"触发概率"

## 后台管理建议

### 修改技能触发概率
可以通过以下方式修改技能触发概率：

#### 方法 1：直接修改数据库
```sql
UPDATE skill SET trigger_rate = 150 WHERE skill_name = '技能名称';
```

#### 方法 2：开发后台管理界面
在后台管理系统中添加技能编辑功能，允许管理员修改：
- 技能名称
- 技能描述
- 技能类型
- 触发概率
- 属性加成等

## 游戏平衡建议

### 触发概率设置建议
- **普通技能**：80-120（0.8%-1.25% 触发率）
- **强力技能**：150-200（0.5%-0.67% 触发率）
- **终极技能**：200-300（0.33%-0.5% 触发率）

### 触发概率与技能威力的关系
- 触发概率越低 → 技能威力应该越高
- 触发概率越高 → 技能威力应该越低
- 建议在游戏中保持平衡

## 注意事项

1. **数据库迁移**：确保在启动后端服务前执行数据库迁移
2. **缓存清理**：如果使用了缓存，需要清理技能相关缓存
3. **前端刷新**：修改后需要刷新浏览器才能看到最新效果
4. **概率计算**：实际触发概率 = 100 / trigger_rate

## 未来扩展

1. **技能升级提升触发率**：随着技能等级提升，降低 trigger_rate 值
2. **装备影响触发率**：某些装备可以降低技能的 trigger_rate
3. **技能组合效果**：多个技能组合可能触发特殊效果
4. **动态概率调整**：根据战斗情况动态调整触发概率
