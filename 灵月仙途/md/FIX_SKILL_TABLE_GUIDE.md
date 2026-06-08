# 修复技能表 - 添加 trigger_rate 字段

## 问题描述
后端服务报错：`Unknown column 's1_0.trigger_rate' in 'field list'`

原因：后端实体类 `Skill.java` 中定义了 `triggerRate` 字段，但数据库表 `skill` 中缺少对应的 `trigger_rate` 列。

## 解决方案

### 方法一：使用数据库管理工具（推荐）

1. **打开数据库管理工具**
   - Navicat
   - DBeaver
   - DataGrip
   - 或其他 MySQL 管理工具

2. **连接到数据库**
   - 主机：localhost
   - 端口：3306
   - 数据库：lingyue_xiantu
   - 用户名：root
   - 密码：你的密码

3. **执行 SQL 查询**
   打开查询窗口，复制粘贴以下 SQL 并执行：

```sql
USE lingyue_xiantu;

-- 添加字段
ALTER TABLE skill
ADD COLUMN IF NOT EXISTS trigger_rate INT DEFAULT 100 COMMENT '技能触发概率（百分比）';

-- 更新现有技能数据
UPDATE skill SET trigger_rate = 100 WHERE skill_name IN ('基础剑法', '火球术');
UPDATE skill SET trigger_rate = 150 WHERE skill_name IN ('冰魄术', '天雷诀');
UPDATE skill SET trigger_rate = 80 WHERE skill_name = '灵力护盾';
UPDATE skill SET trigger_rate = 120 WHERE skill_name = '金刚诀';
UPDATE skill SET trigger_rate = 200 WHERE skill_name = '聚气诀';
UPDATE skill SET trigger_rate = 180 WHERE skill_name = '九转玄功';
UPDATE skill SET trigger_rate = 90 WHERE skill_name = '瞬影步';
UPDATE skill SET trigger_rate = 110 WHERE skill_name = '五行遁术';

-- 验证结果
SELECT id, skill_name, skill_type, trigger_rate FROM skill ORDER BY id;
```

4. **验证执行结果**
   应该看到类似输出：
   ```
   id | skill_name | skill_type | trigger_rate
   ---|------------|------------|-------------
   1  | 基础剑法    | 攻击        | 100
   2  | 灵力护盾    | 防御        | 80
   3  | 聚气诀      | 功法        | 200
   4  | 瞬影步      | 身法        | 90
   5  | 火球术      | 攻击        | 100
   6  | 冰魄术      | 攻击        | 150
   7  | 金刚诀      | 防御        | 120
   8  | 天雷诀      | 攻击        | 150
   9  | 五行遁术    | 辅助        | 110
   10 | 九转玄功    | 功法        | 180
   ```

### 方法二：使用 MySQL 命令行（如果已安装）

```bash
mysql -u root -p lingyue_xiantu < /Users/macbook/前端项目/灵月仙途/fix_skill_table.sql
```

### 方法三：通过后端接口（如果有）

如果后端提供了数据库管理接口，可以通过接口执行。

## 执行后的操作

1. **重启后端服务**（可选，但推荐）
   ```bash
   cd /Users/macbook/前端项目/灵月仙途/lingyuexiantu-server
   # 先停止服务（Ctrl+C）
   # 然后重新启动
   mvn spring-boot:run
   ```

2. **刷新前端页面**
   - 清除浏览器缓存
   - 刷新功法页面：`http://localhost:8080/skills/skills.html`

3. **验证功能**
   - 检查技能列表是否正常显示
   - 检查是否还有 500 错误
   - 点击技能卡片查看详情
   - 确认触发概率显示正常

## 预期结果

执行成功后：
- ✅ 后端 API 不再返回 500 错误
- ✅ 技能列表正常加载
- ✅ 所有技能显示"已学习"状态
- ✅ 技能详情显示触发概率
- ✅ 控制台没有 API 错误

## 常见问题

### Q: 执行 SQL 报错怎么办？
A: 检查：
1. 数据库名称是否正确
2. 用户权限是否足够
3. 表 `skill` 是否存在

### Q: 字段已经存在怎么办？
A: SQL 中使用了 `IF NOT EXISTS`，如果字段已存在不会报错，直接跳过。

### Q: 更新后数据不变化怎么办？
A: 可能技能名称不匹配，可以手动设置：
```sql
UPDATE skill SET trigger_rate = 100 WHERE id = 1;
UPDATE skill SET trigger_rate = 80 WHERE id = 2;
-- 依此类推
```

## 验证 SQL

执行以下 SQL 验证字段是否添加成功：

```sql
DESCRIBE skill;
```

应该能看到 `trigger_rate` 字段在列表中。

---

**执行完成后，刷新功法页面即可正常使用！** 🎉
