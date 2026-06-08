# 技能系统问题诊断与修复

## 问题现象
- 前端控制台显示 `GET http://localhost:8088/api/role/45` 返回 500 错误
- 技能列表获取失败，显示为空

## 问题诊断

### 1. 检查数据库表结构

执行以下 SQL 检查表是否存在：

```sql
-- 检查 skill 表
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = DATABASE() AND table_name = 'skill';

-- 检查 role_skill 表
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = DATABASE() AND table_name = 'role_skill';

-- 查看 skill 表结构
DESC skill;

-- 查看 role_skill 表结构
DESC role_skill;
```

### 2. 检查数据是否存在

```sql
-- 查看技能数据
SELECT * FROM skill;

-- 查看角色技能数据
SELECT * FROM role_skill WHERE role_id = 45;
```

### 3. 检查后端日志

查看后端控制台是否有以下错误：
- `Table 'skill' doesn't exist`
- `Column 'equipped' not found`
- `Unknown column 'xxx' in 'field list'`

## 解决方案

### 方案 1：执行数据库迁移脚本

如果表不存在或字段缺失，执行：

```bash
# 方式 1：使用 Flyway 自动迁移
# 重启后端服务，Flyway 会自动执行 V5__create_skill_tables.sql

# 方式 2：手动执行 SQL
mysql -u root -p your_database < /Users/macbook/前端项目/灵月仙途/lingyuexiantu-server/src/main/resources/db/migration/V5__create_skill_tables.sql
```

### 方案 2：手动创建表和插入数据

```sql
-- 创建技能表
CREATE TABLE IF NOT EXISTS skill (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(100) NOT NULL COMMENT '技能名称',
    description VARCHAR(500) COMMENT '技能描述',
    skill_type VARCHAR(50) NOT NULL COMMENT '技能类型：攻击、防御、辅助、身法、功法',
    skill_level INT NOT NULL DEFAULT 1 COMMENT '技能等级',
    max_level INT NOT NULL DEFAULT 12 COMMENT '最大等级',
    attack_bonus INT DEFAULT 0 COMMENT '增加攻击力',
    defense_bonus INT DEFAULT 0 COMMENT '增加防御力',
    xiuwei_bonus INT DEFAULT 0 COMMENT '增加修为',
    spirit_power_bonus INT DEFAULT 0 COMMENT '增加神力',
    speed_bonus INT DEFAULT 0 COMMENT '增加速度',
    critical_bonus INT DEFAULT 0 COMMENT '增加暴击率',
    dodge_bonus INT DEFAULT 0 COMMENT '增加闪避率',
    status INT DEFAULT 1 COMMENT '状态：1 启用，0 禁用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技能表';

-- 创建角色技能表
CREATE TABLE IF NOT EXISTS role_skill (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_id BIGINT NOT NULL COMMENT '角色 ID',
    skill_id BIGINT NOT NULL COMMENT '技能 ID',
    skill_level INT NOT NULL DEFAULT 1 COMMENT '技能等级',
    experience INT DEFAULT 0 COMMENT '技能熟练度',
    equipped BOOLEAN DEFAULT FALSE COMMENT '是否装备',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role_id (role_id),
    INDEX idx_skill_id (skill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色技能表';

-- 插入初始技能数据
INSERT INTO skill (skill_name, description, skill_type, skill_level, max_level, attack_bonus, defense_bonus, xiuwei_bonus, spirit_power_bonus, speed_bonus, critical_bonus, dodge_bonus, status) VALUES
('基础剑法', '最基础的剑法招式，简单易学', '攻击', 1, 12, 100, 0, 50, 0, 0, 0, 0, 1),
('灵力护盾', '凝聚灵力形成护盾，抵御伤害', '防御', 1, 12, 0, 150, 30, 0, 0, 0, 0, 1),
('聚气诀', '快速聚集灵气的功法', '功法', 1, 12, 0, 0, 200, 50, 0, 0, 0, 1),
('瞬影步', '快速移动的身法', '身法', 1, 12, 0, 0, 50, 0, 100, 0, 50, 1),
('火球术', '操控火焰形成火球攻击敌人', '攻击', 1, 12, 200, 0, 80, 50, 0, 10, 0, 1),
('冰魄术', '极寒之力凝结成冰，冻结敌人', '攻击', 1, 12, 180, 0, 100, 80, 0, 5, 0, 1),
('金刚诀', '强化肉身的防御功法', '防御', 1, 12, 50, 300, 100, 0, 0, 0, 0, 1),
('天雷诀', '引动天雷之力，威力巨大', '攻击', 1, 12, 500, 0, 200, 100, 0, 20, 0, 1),
('五行遁术', '借助五行之力快速遁走', '辅助', 1, 12, 0, 100, 150, 0, 200, 0, 100, 1),
('九转玄功', '上古修炼功法，全面提升修为', '功法', 1, 12, 100, 100, 500, 200, 50, 10, 10, 1);
```

### 方案 3：检查后端配置

确保 `application.properties` 或 `application.yml` 中配置正确：

```properties
# 数据库配置
spring.datasource.url=jdbc:mysql://localhost:3306/your_database?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
spring.datasource.username=root
spring.datasource.password=your_password

# Flyway 配置
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
spring.flyway.baseline-on-migrate=true
```

## 测试验证

### 1. 测试 API 接口

```bash
# 测试获取技能列表
curl http://localhost:8088/api/skill

# 测试获取角色技能
curl http://localhost:8088/api/role-skill/role/45
```

### 2. 前端验证

打开浏览器控制台，查看：
- 是否有 500 错误
- API 返回的数据格式是否正确
- 技能数据是否正常显示

## 常见问题

### 问题 1：Table doesn't exist

**原因**：数据库迁移脚本未执行

**解决**：执行 V5__create_skill_tables.sql

### 问题 2：Column 'equipped' not found

**原因**：数据库字段类型不匹配

**解决**：修改字段类型
```sql
ALTER TABLE role_skill MODIFY equipped TINYINT(1) DEFAULT 0;
```

### 问题 3：数据为空

**原因**：没有初始化数据

**解决**：执行 INSERT 语句插入初始技能

## 完整修复流程

1. **停止后端服务**
   ```bash
   # 找到进程 ID
   lsof -ti:8088
   
   # 杀死进程
   kill -9 <PID>
   ```

2. **执行数据库修复脚本**
   ```bash
   mysql -u root -p your_database < V14__check_and_fix_skills.sql
   ```

3. **重启后端服务**
   ```bash
   cd lingyuexiantu-server
   mvn spring-boot:run
   ```

4. **刷新前端页面**
   - 打开 skills/skills.html
   - 查看控制台是否有错误
   - 检查技能列表是否正常显示

## 预期结果

- ✅ skill 表和 role_skill 表存在
- ✅ skill 表有 10 条初始数据
- ✅ API 接口返回 200 状态码
- ✅ 前端正常显示技能列表
- ✅ 控制台无 500 错误

## 相关文件

- 实体类：[Skill.java](file:///Users/macbook/前端项目/灵月仙途/lingyuexiantu-server/src/main/java/com/lingyue/entity/Skill.java)
- 实体类：[RoleSkill.java](file:///Users/macbook/前端项目/灵月仙途/lingyuexiantu-server/src/main/java/com/lingyue/entity/RoleSkill.java)
- 控制器：[SkillController.java](file:///Users/macbook/前端项目/灵月仙途/lingyuexiantu-server/src/main/java/com/lingyue/controller/SkillController.java)
- 控制器：[RoleSkillController.java](file:///Users/macbook/前端项目/灵月仙途/lingyuexiantu-server/src/main/java/com/lingyue/controller/RoleSkillController.java)
- 迁移脚本：[V5__create_skill_tables.sql](file:///Users/macbook/前端项目/灵月仙途/lingyuexiantu-server/src/main/resources/db/migration/V5__create_skill_tables.sql)
- 修复脚本：[V14__check_and_fix_skills.sql](file:///Users/macbook/前端项目/灵月仙途/lingyuexiantu-server/src/main/resources/db/migration/V14__check_and_fix_skills.sql)
