# 快速为角色添加所有技能

## 最简单的方法（推荐）

### 步骤：

1. **打开技能页面**
   ```
   http://localhost:8080/skills/skills.html
   ```

2. **打开浏览器控制台**
   - Chrome/Edge: 按 `F12` 或 `Ctrl+Shift+J` (Mac: `Cmd+Option+J`)
   - 切换到 Console 标签

3. **复制粘贴以下代码并回车执行**

```javascript
// 为角色 45 添加所有技能的脚本
(async function addAllSkills() {
    const roleId = 45; // 可以修改这个角色 ID
    
    const skills = [
        { id: 1, name: '基础剑法', level: 5, exp: 2500 },
        { id: 2, name: '灵力护盾', level: 3, exp: 1200 },
        { id: 3, name: '聚气诀', level: 7, exp: 5800 },
        { id: 4, name: '瞬影步', level: 4, exp: 1800 },
        { id: 5, name: '火球术', level: 6, exp: 3200 },
        { id: 6, name: '冰魄术', level: 4, exp: 1600 },
        { id: 7, name: '金刚诀', level: 5, exp: 2400 },
        { id: 8, name: '天雷诀', level: 3, exp: 900 },
        { id: 9, name: '五行遁术', level: 4, exp: 1500 },
        { id: 10, name: '九转玄功', level: 2, exp: 600 }
    ];
    
    console.log('开始添加技能...');
    
    // 注意：由于后端没有批量添加接口，需要直接在数据库操作
    console.log('请执行以下 SQL 语句:');
    console.log('--- 复制下面的 SQL ---');
    
    let sql = `INSERT INTO role_skill (role_id, skill_id, skill_level, experience, equipped) VALUES\n`;
    sql += skills.map((s, i) => 
        `(${roleId}, ${s.id}, ${s.level}, ${s.exp}, ${i < 2 ? 'true' : 'false'})`
    ).join(',\n');
    sql += `\nON DUPLICATE KEY UPDATE \n    skill_level = VALUES(skill_level),\n    experience = VALUES(experience),\n    equipped = VALUES(equipped);`;
    
    console.log(sql);
    console.log('--- 复制上面的 SQL ---');
    console.log('\n然后在 MySQL 客户端中执行这条 SQL 语句');
})();
```

4. **执行 SQL**
   - 复制控制台输出的 SQL 语句
   - 在 MySQL 客户端中执行

## 使用工具页面

1. **打开工具页面**
   ```
   http://localhost:8080/tools/add-all-skills.html
   ```

2. **输入角色 ID**（默认 45）

3. **点击"添加所有技能"按钮**

4. **根据提示操作**

## 执行 SQL 后的效果

刷新技能页面后，你会看到：

- ✅ 所有 10 个技能都显示为"已学习"或"已装备"
- ✅ 不再有"未学习"的技能
- ✅ 技能卡片有金色或绿色的高亮边框

## 技能状态说明

- **已装备**（绿色文字）：基础剑法、聚气诀
- **已学习**（金色文字）：其他 8 个技能

## 如果仍然显示"未学习"

请检查：

1. **角色 ID 是否匹配**
   ```sql
   SELECT * FROM role_skill WHERE role_id = 45;
   ```

2. **数据是否正确插入**
   ```sql
   SELECT COUNT(*) FROM role_skill WHERE role_id = 45;
   -- 应该返回 10
   ```

3. **清除浏览器缓存并刷新**
   - Windows: `Ctrl+F5`
   - Mac: `Cmd+Shift+R`

4. **检查浏览器控制台**
   - 打开 F12
   - 查看是否有 API 调用错误
   - 查看返回的技能数据

## 快速验证 SQL

```sql
-- 查看角色 45 的所有技能
SELECT 
    s.skill_name as '技能名称',
    s.skill_type as '技能类型',
    rs.skill_level as '等级',
    rs.experience as '熟练度',
    CASE 
        WHEN rs.equipped = 1 THEN '已装备 ★'
        ELSE '已学习'
    END as '状态'
FROM role_skill rs
JOIN skill s ON rs.skill_id = s.id
WHERE rs.role_id = 45
ORDER BY s.skill_type, rs.skill_level DESC;
```

## 需要为其他角色添加？

只需修改 SQL 中的 `role_id` 值：

```sql
-- 将 45 改为你需要的角色 ID
INSERT INTO role_skill (role_id, skill_id, ...) VALUES
(46, 1, 5, 2500, true),  -- 改为角色 46
...
```
