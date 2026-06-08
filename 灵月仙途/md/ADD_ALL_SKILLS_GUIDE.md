# 为角色添加所有技能

## 目标
让角色 45 在技能页面显示的所有技能都显示为"已学习"状态。

## 方法一：直接执行 SQL（推荐）

### 步骤

1. **打开 MySQL 客户端**
   ```bash
   mysql -u root -p
   ```

2. **选择数据库**
   ```sql
   USE lingyue_xiantu;
   ```

3. **执行 SQL 脚本**
   ```bash
   source /Users/macbook/前端项目/灵月仙途/add_all_skills_for_role_45.sql;
   ```

   或者直接复制粘贴以下内容到 MySQL 客户端：

   ```sql
   INSERT INTO role_skill (role_id, skill_id, skill_level, experience, equipped) VALUES
   (45, 1, 5, 2500, true),    -- 基础剑法 - 已装备
   (45, 2, 3, 1200, false),   -- 灵力护盾
   (45, 3, 7, 5800, true),    -- 聚气诀 - 已装备
   (45, 4, 4, 1800, false),   -- 瞬影步
   (45, 5, 6, 3200, false),   -- 火球术
   (45, 6, 4, 1600, false),   -- 冰魄术
   (45, 7, 5, 2400, false),   -- 金刚诀
   (45, 8, 3, 900, false),    -- 天雷诀
   (45, 9, 4, 1500, false),   -- 五行遁术
   (45, 10, 2, 600, false)    -- 九转玄功
   ON DUPLICATE KEY UPDATE 
       skill_level = VALUES(skill_level),
       experience = VALUES(experience),
       equipped = VALUES(equipped);
   ```

4. **验证结果**
   ```sql
   SELECT 
       rs.role_id,
       s.skill_name,
       s.skill_type,
       rs.skill_level,
       rs.experience,
       CASE 
           WHEN rs.equipped = 1 THEN '已装备'
           WHEN rs.role_id IS NOT NULL THEN '已学习'
           ELSE '未学习'
       END as status
   FROM role_skill rs
   JOIN skill s ON rs.skill_id = s.id
   WHERE rs.role_id = 45
   ORDER BY s.skill_type, s.skill_name;
   ```

### 预期结果

执行成功后，应该看到：

```
+--------+------------+------------+-------------+------------+----------+
| role_id| skill_name | skill_type | skill_level | experience | status   |
+--------+------------+------------+-------------+------------+----------+
|     45 | 基础剑法   | 攻击       |           5 |       2500 | 已装备   |
|     45 | 冰魄术     | 攻击       |           4 |       1600 | 已学习   |
|     45 | 火球术     | 攻击       |           6 |       3200 | 已学习   |
|     45 | 天雷诀     | 攻击       |           3 |        900 | 已学习   |
|     45 | 灵力护盾   | 防御       |           3 |       1200 | 已学习   |
|     45 | 金刚诀     | 防御       |           5 |       2400 | 已学习   |
|     45 | 五行遁术   | 辅助       |           4 |       1500 | 已学习   |
|     45 | 聚气诀     | 功法       |           7 |       5800 | 已装备   |
|     45 | 九转玄功   | 功法       |           2 |        600 | 已学习   |
|     45 | 瞬影步     | 身法       |           4 |       1800 | 已学习   |
+--------+------------+------------+-------------+------------+----------+
10 rows in set
```

## 方法二：使用 Navicat 或其他数据库管理工具

1. 打开 Navicat，连接到 MySQL 数据库
2. 打开 `lingyue_xiantu` 数据库
3. 点击"查询" -> "创建查询"
4. 复制上面的 SQL 语句并执行
5. 查看结果

## 方法三：通过后端 API 批量添加（需要开发）

目前后端没有提供批量添加技能的 API，需要手动调用单个接口。

## 验证前端显示

执行 SQL 后，刷新技能页面：`http://localhost:8080/skills/skills.html`

### 预期显示效果

- **基础剑法**：显示"已装备"（绿色高亮）
- **聚气诀**：显示"已装备"（绿色高亮）
- **其他 8 个技能**：显示"已学习"（金色文字）

## 技能详细数据

| 技能 ID | 技能名称 | 技能类型 | 等级 | 熟练度 | 状态 |
|--------|---------|---------|-----|--------|------|
| 1 | 基础剑法 | 攻击 | 5 | 2500 | 已装备 |
| 2 | 灵力护盾 | 防御 | 3 | 1200 | 已学习 |
| 3 | 聚气诀 | 功法 | 7 | 5800 | 已装备 |
| 4 | 瞬影步 | 身法 | 4 | 1800 | 已学习 |
| 5 | 火球术 | 攻击 | 6 | 3200 | 已学习 |
| 6 | 冰魄术 | 攻击 | 4 | 1600 | 已学习 |
| 7 | 金刚诀 | 防御 | 5 | 2400 | 已学习 |
| 8 | 天雷诀 | 攻击 | 3 | 900 | 已学习 |
| 9 | 五行遁术 | 辅助 | 4 | 1500 | 已学习 |
| 10 | 九转玄功 | 功法 | 2 | 600 | 已学习 |

## 注意事项

1. **角色 ID**：脚本中使用的角色 ID 是 45，如果需要为其他角色添加，请修改 `role_id` 值
2. **技能等级**：可以根据需要调整每个技能的等级和熟练度
3. **装备状态**：设置为 `true` 的技能会显示"已装备"，设置为 `false` 的显示"已学习"
4. **数据冲突**：使用了 `ON DUPLICATE KEY UPDATE`，如果记录已存在会更新数据

## 常见问题

### Q: 执行后前端仍然显示"未学习"？
A: 请检查：
1. 角色 ID 是否正确（前端使用的 roleId 是否是 45）
2. 数据库连接是否正确
3. 刷新浏览器页面
4. 检查浏览器控制台的 API 返回数据

### Q: 如何为其他角色添加技能？
A: 修改 SQL 中的 `role_id` 值，例如改为 46：
```sql
INSERT INTO role_skill (role_id, skill_id, ...) VALUES
(46, 1, 5, 2500, true),
...
```

### Q: 如何清空角色的所有技能？
A: 执行以下 SQL：
```sql
DELETE FROM role_skill WHERE role_id = 45;
```
