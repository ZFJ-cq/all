# 技能系统数据流梳理与问题排查

## 问题现象
在数据库中添加了技能数据，但前端没有显示。

---

## 完整数据流链路

### 1️⃣ 数据库层（2 张表）

#### **skill 表** - 技能定义表
存储所有技能的定义信息（技能模板）

```sql
CREATE TABLE skill (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(100) NOT NULL,        -- 技能名称
    skill_type VARCHAR(50) NOT NULL,         -- 技能类型
    skill_level INT DEFAULT 1,               -- 技能等级
    max_level INT DEFAULT 12,                -- 最大等级
    attack_bonus INT DEFAULT 0,              -- 攻击加成
    defense_bonus INT DEFAULT 0,             -- 防御加成
    xiuwei_bonus INT DEFAULT 0,              -- 修为加成
    status INT DEFAULT 1,                    -- 状态：1 启用，0 禁用
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### **role_skill 表** - 角色技能关联表
存储角色已学习的技能

```sql
CREATE TABLE role_skill (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_id BIGINT NOT NULL,                 -- 角色 ID
    skill_id BIGINT NOT NULL,                -- 技能 ID（外键）
    skill_level INT DEFAULT 1,               -- 当前技能等级
    experience INT DEFAULT 0,                -- 熟练度
    equipped BOOLEAN DEFAULT FALSE,          -- 是否装备
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    INDEX idx_role_id (role_id),
    INDEX idx_skill_id (skill_id)
);
```

---

### 2️⃣ 后端层

#### **SkillController.java** - 技能接口
```java
// 获取所有技能定义
GET /api/skill
返回：Result<List<Skill>>
```

#### **RoleSkillController.java** - 角色技能接口
```java
// 获取指定角色的所有技能
GET /api/role-skill/role/{roleId}
返回：Result<List<Map<String, Object>>>

返回数据结构：
[
  {
    "id": 1,                    // role_skill 的 ID
    "roleId": 45,
    "skillId": 1,
    "skillLevel": 5,
    "experience": 2500,
    "equipped": true,
    "skillName": "基础剑法",    // 从 skill 表关联查询
    "skillType": "攻击",
    "attackBonus": 100,
    "defenseBonus": 0,
    "xiuweiBonus": 50
  }
]
```

---

### 3️⃣ 前端 API 服务层

#### **api-service.js**
```javascript
// 获取所有技能定义
async getAllSkills() {
  return this.get('/skill');
}

// 获取角色技能
async getRoleSkills(roleId) {
  return this.get(`/role-skill/role/${roleId}`);
}
```

---

### 4️⃣ 前端页面层

#### **skills/skills.html**

**初始化流程**：
```javascript
// 1. 页面加载完成
document.addEventListener('DOMContentLoaded', async () => {
  // 2. 获取当前角色 ID
  roleId = localStorage.getItem('roleId');
  
  // 3. 加载技能定义数据
  await loadSkills();  // 调用 /api/skill
  
  // 4. 加载角色技能数据
  await loadRoleSkills();  // 调用 /api/role-skill/role/{roleId}
  
  // 5. 渲染技能列表
  renderSkills();
});
```

**数据加载函数**：
```javascript
// 加载所有技能定义
async function loadSkills() {
  const result = await window.apiService.getAllSkills();
  // 处理 Result 包装格式
  skills = (result && result.data) ? result.data : [];
  console.log('技能数据:', skills);
}

// 加载角色技能
async function loadRoleSkills() {
  const result = await window.apiService.getRoleSkills(roleId);
  // 处理 Result 包装格式
  roleSkills = (result && result.data) ? result.data : [];
  console.log('角色技能数据:', roleSkills);
}

// 渲染技能列表
function renderSkills() {
  const list = document.getElementById('skillList');
  
  // 合并技能定义和角色技能数据
  skills.forEach(skill => {
    const roleSkill = roleSkills.find(rs => rs.skillId === skill.id);
    const mastery = roleSkill ? roleSkill.mastery : 0;
    const level = roleSkill ? roleSkill.currentLevel : '一成';
    
    // 渲染技能卡片
    const card = document.createElement('div');
    card.className = `skill-card rank-${skill.rank}`;
    card.innerHTML = `
      <div class="skill-name">${skill.skillName}</div>
      <div class="skill-type">${skill.skillType}</div>
      <div class="skill-level">等级：${level}</div>
      <div class="skill-mastery">熟练度：${mastery}</div>
    `;
    
    list.appendChild(card);
  });
}
```

---

## 问题排查步骤

### ✅ 步骤 1：检查数据库数据

```sql
-- 1. 检查 skill 表是否有数据
SELECT COUNT(*) FROM skill;
SELECT * FROM skill WHERE status = 1;

-- 2. 检查 role_skill 表是否有角色 45 的数据
SELECT COUNT(*) FROM role_skill WHERE role_id = 45;
SELECT * FROM role_skill WHERE role_id = 45;

-- 3. 检查关联查询（应该返回角色 45 的所有技能）
SELECT 
    rs.id,
    rs.role_id,
    rs.skill_id,
    rs.skill_level,
    rs.experience,
    rs.equipped,
    s.skill_name,
    s.skill_type
FROM role_skill rs
JOIN skill s ON rs.skill_id = s.id
WHERE rs.role_id = 45;
```

**预期结果**：
- skill 表应该有至少几条技能数据
- role_skill 表应该有 role_id=45 的记录
- 关联查询应该返回角色 45 的技能详情

---

### ✅ 步骤 2：检查后端接口

**使用 curl 或 Postman 测试**：

```bash
# 1. 测试技能定义接口
curl http://localhost:8088/api/skill

# 预期返回：
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "skillName": "基础剑法",
      "skillType": "攻击",
      ...
    }
  ]
}

# 2. 测试角色技能接口
curl http://localhost:8088/api/role-skill/role/45

# 预期返回：
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "roleId": 45,
      "skillId": 1,
      "skillLevel": 5,
      "skillName": "基础剑法",
      ...
    }
  ]
}
```

**如果接口返回 403**：
- 检查 SecurityConfig 是否配置了白名单
- 确保 `/skill/**` 和 `/role-skill/**` 在白名单中

---

### ✅ 步骤 3：检查前端 API 调用

**打开浏览器控制台（F12）**：

1. **查看网络请求**
   - Network 标签页
   - 查找 `/api/skill` 和 `/api/role-skill/role/45` 请求
   - 检查请求状态码（应该是 200）
   - 检查响应数据

2. **查看 Console 日志**
   ```javascript
   // 应该看到以下日志：
   "开始从 API 加载技能数据"
   "API 返回结果：{code: 0, data: [...]}"
   "技能数据：[...]"
   
   "开始从 API 加载角色技能数据，roleId: 45"
   "API 返回结果：{code: 0, data: [...]}"
   "角色技能数据：[...]"
   "开始渲染技能列表，技能数量：5"
   ```

3. **检查 roleId 是否正确**
   ```javascript
   // 在控制台执行
   console.log('roleId:', localStorage.getItem('roleId'));
   // 应该输出：roleId: 45
   ```

---

### ✅ 步骤 4：检查前端渲染逻辑

**在控制台执行**：
```javascript
// 1. 检查技能数据
console.log('skills:', skills);
console.log('roleSkills:', roleSkills);

// 2. 手动调用渲染函数
renderSkills();

// 3. 检查 DOM 元素
console.log('skillList:', document.getElementById('skillList'));
console.log('skillList 子元素数量:', document.getElementById('skillList').children.length);
```

---

## 常见问题及解决方案

### ❌ 问题 1：数据库中有数据，但接口返回空数组

**可能原因**：
1. skill 表的 status 字段不是 1
2. role_skill 表的 role_id 不匹配

**解决方案**：
```sql
-- 检查并修复 status
UPDATE skill SET status = 1 WHERE status != 1;

-- 检查并修复 role_id
UPDATE role_skill SET role_id = 45 WHERE role_id != 45;
```

---

### ❌ 问题 2：接口返回 403 Forbidden

**可能原因**：
- 安全配置未放行技能接口

**解决方案**：
```java
// SecurityConfig.java
.requestMatchers("/skill/**").permitAll()
.requestMatchers("/role-skill/**").permitAll()
```

然后重启后端服务。

---

### ❌ 问题 3：接口返回 500 Internal Server Error

**可能原因**：
1. 数据库表不存在
2. 字段名不匹配
3. 外键约束问题

**解决方案**：
```sql
-- 检查表是否存在
SHOW TABLES LIKE 'skill';
SHOW TABLES LIKE 'role_skill';

-- 检查字段是否完整
DESC skill;
DESC role_skill;
```

---

### ❌ 问题 4：前端显示"暂无功法"

**可能原因**：
1. skills 数组为空
2. roleSkills 数组为空
3. 渲染逻辑有问题

**排查方法**：
```javascript
// 在控制台执行
console.log('skills 长度:', skills.length);
console.log('roleSkills 长度:', roleSkills.length);
console.log('skills 内容:', skills);
console.log('roleSkills 内容:', roleSkills);
```

---

### ❌ 问题 5：roleId 为 null

**可能原因**：
- 未登录或登录状态已过期

**解决方案**：
```javascript
// 在控制台执行
console.log('token:', localStorage.getItem('token'));
console.log('roleId:', localStorage.getItem('roleId'));

// 如果为 null，需要重新登录
window.location.href = '/login.html';
```

---

## 快速验证 SQL

执行以下 SQL 快速添加测试数据：

```sql
-- 1. 插入技能定义（如果为空）
INSERT INTO skill (skill_name, skill_type, skill_level, max_level, attack_bonus, defense_bonus, xiuwei_bonus, status) VALUES
('基础剑法', '攻击', 1, 12, 100, 0, 50, 1),
('灵力护盾', '防御', 1, 12, 0, 150, 30, 1),
('聚气诀', '功法', 1, 12, 0, 0, 200, 1),
('瞬影步', '身法', 1, 12, 0, 0, 50, 1),
('火球术', '攻击', 1, 12, 200, 0, 80, 1);

-- 2. 为角色 45 添加技能
INSERT INTO role_skill (role_id, skill_id, skill_level, experience, equipped) VALUES
(45, 1, 5, 2500, TRUE),
(45, 2, 3, 1200, FALSE),
(45, 3, 7, 5800, TRUE),
(45, 4, 4, 1800, FALSE),
(45, 5, 6, 4200, TRUE)
ON DUPLICATE KEY UPDATE 
    skill_level = VALUES(skill_level),
    experience = VALUES(experience),
    equipped = VALUES(equipped);

-- 3. 验证数据
SELECT rs.*, s.skill_name, s.skill_type
FROM role_skill rs
JOIN skill s ON rs.skill_id = s.id
WHERE rs.role_id = 45;
```

---

## 完整调试流程

### 1. 数据库检查
```sql
SELECT * FROM skill WHERE status = 1;
SELECT * FROM role_skill WHERE role_id = 45;
```

### 2. 后端接口检查
```bash
curl http://localhost:8088/api/skill
curl http://localhost:8088/api/role-skill/role/45
```

### 3. 前端控制台检查
打开 skills/skills.html，按 F12 查看：
- Network 标签页的请求
- Console 标签页的日志

### 4. 手动触发刷新
```javascript
// 在控制台执行
await loadSkills();
await loadRoleSkills();
renderSkills();
```

---

## 总结

数据流链路：
```
数据库 (skill + role_skill)
    ↓
后端 API (/api/skill + /api/role-skill/role/{roleId})
    ↓
前端 API 服务 (api-service.js)
    ↓
前端页面 (skills.html)
    ↓
渲染显示 (renderSkills())
```

**关键点**：
1. ✅ 数据库表必须有数据
2. ✅ 后端接口必须正常返回
3. ✅ 前端 roleId 必须正确
4. ✅ 安全配置必须放行
5. ✅ 数据格式必须匹配

按照上述步骤逐一排查，一定能找到问题所在！
