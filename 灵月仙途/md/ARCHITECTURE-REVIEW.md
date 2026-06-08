# 灵月仙途 - 全栈架构梳理文档

> 文档生成时间：2026-04-01  
> 项目类型：修仙题材 MMORPG 网页游戏  
> 技术栈：纯前端 + Spring Boot 后端 + MySQL 数据库

---

## 📋 目录

1. [整体架构概览](#整体架构概览)
2. [前端架构](#前端架构)
3. [后端架构](#后端架构)
4. [数据库架构](#数据库架构)
5. [核心业务流程](#核心业务流程)
6. [技术亮点与特色](#技术亮点与特色)
7. [优化建议](#优化建议)

---

## 🏗️ 整体架构概览

### 架构图

```
┌─────────────────────────────────────────────────────────┐
│                     用户浏览器                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │              前端 (Vanilla JS + HTML5)            │   │
│  │  - 角色创建/管理                                  │   │
│  │  - 修炼系统                                       │   │
│  │  - 宗门系统                                       │   │
│  │  - 战斗系统                                       │   │
│  │  - 背包系统                                       │   │
│  │  - 社交系统                                       │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────┐
│            后端 (Spring Boot 3.2.0 + Java 17)           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Controller 层 (REST API)                        │   │
│  │  - AuthController                                │   │
│  │  - RoleController                                │   │
│  │  - CultivationController                         │   │
│  │  - ClanController                                │   │
│  │  - CombatController                              │   │
│  │  - ... (24 个 Controller)                         │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Service 层 (业务逻辑)                           │   │
│  │  - GameRoleService                               │   │
│  │  - CultivationService                            │   │
│  │  - ClanService                                   │   │
│  │  - BreakthroughService                           │   │
│  │  - ... (22 个 Service)                            │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Repository 层 (数据访问)                        │   │
│  │  - GameRoleRepository                            │   │
│  │  - ClanRepository                                │   │
│  │  - ... (17 个 Repository)                         │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↕ JPA/Hibernate
┌─────────────────────────────────────────────────────────┐
│              数据库 (MySQL 8.0+)                        │
│  - 核心表：game_role, game_user                         │
│  - 属性表：role_base_stats, t_role_attribute_cache      │
│  - 装备表：equipment, role_equipment                    │
│  - 技能表：skill, role_skill                            │
│  - 宗门表：clan, clan_member                            │
│  - 配置表：cfg_attribute_rules, cfg_realm_attribute_mult│
│  - ... (60+ 张表)                                       │
└─────────────────────────────────────────────────────────┘
```

### 技术栈详情

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| **前端** | HTML5 | 5 | 纯静态页面 |
| | JavaScript | ES6+ | 原生 JS，无框架 |
| | CSS3 | 3 | 自定义样式 |
| | LocalStorage | - | 客户端状态管理 |
| **后端** | Java | 17 | JDK 17 |
| | Spring Boot | 3.2.0 | 核心框架 |
| | Spring Security | 3.2.0 | 安全认证 |
| | Spring Data JPA | 3.2.0 | ORM |
| | MySQL Connector | 8.0+ | 数据库驱动 |
| | Redis | - | 缓存 (可选) |
| | JWT | 0.9.1 | Token 认证 |
| | Flyway | 9.22.3 | 数据库迁移 |
| **数据库** | MySQL | 8.0+ | 主数据库 |

---

## 🎨 前端架构

### 1. 目录结构

```
灵月仙途/
├── index.html                    # 首页入口
├── intro.html                    # 介绍页
├── character-create/             # 角色创建模块
│   ├── character-create-step1.html
│   ├── character-create-step2.html
│   ├── character-create-step3.html
│   └── character-create-step4.html
├── character/                    # 角色信息模块
│   ├── character.html
│   ├── character-backup.html
│   └── stats-display.html
├── cultivation/                  # 修炼模块
│   ├── cultivation.html
│   └── cultivation-new.html
├── clan/                         # 宗门模块
│   ├── clan-list.html
│   ├── clan-home.html
│   ├── buildings.html
│   ├── chat.html
│   └── ...
├── equipment/                    # 装备模块
│   └── equipment.html
├── inventory/                    # 背包模块
│   └── inventory.html
├── combat/                       # 战斗模块
│   ├── combat.html
│   └── boos-conbat.html
├── admin/                        # 后台管理模块
│   ├── index.html
│   ├── login.html
│   └── modules/                  # 24 个管理页面
├── js/                           # JavaScript 核心库
│   ├── config.js                 # 全局配置
│   ├── store.js                  # 状态管理
│   ├── api-service.js            # API 调用
│   ├── api-interceptor.js        # API 拦截器
│   ├── character-store.js        # 角色数据管理
│   ├── character-service.js      # 角色服务
│   ├── auth-manager.js           # 认证管理
│   ├── login-manager.js          # 登录管理
│   ├── token-manager.js          # Token 管理
│   ├── role-sync.js              # 角色同步
│   ├── role-validator.js         # 角色验证
│   ├── game-data.js              # 游戏数据
│   ├── game-utils.js             # 游戏工具
│   ├── game-features.js          # 游戏特性
│   ├── cultivation-enhanced.js   # 修炼增强
│   ├── auto-cultivation.js       # 自动修炼
│   ├── achievement-system.js     # 成就系统
│   ├── achievement-ui.js         # 成就 UI
│   ├── achievement-events.js     # 成就事件
│   ├── ui-components.js          # UI 组件
│   ├── toast-utils.js            # 提示工具
│   ├── server-selector.js        # 服务器选择
│   ├── localStorage-monitor.js   # LocalStorage 监控
│   └── global-401-handler.js     # 401 全局处理
├── css/                          # 样式文件
│   ├── style.css                 # 主样式
│   └── avatar.css                # 头像样式
└── assets/                       # 静态资源
```

### 2. 核心模块

#### 2.1 状态管理 (store.js)

```javascript
class Store {
  constructor() {
    this.state = {
      role: {
        id: null,
        name: null,
        realm: null,
        assets: {},
        level: 0,
        experience: 0,
        attributes: {
          qi: 0,        // 气血
          mana: 0,      // 法力
          strength: 0,  // 力量
          agility: 0,   // 敏捷
          intelligence: 0 // 智力
        }
      },
      user: {
        id: null,
        username: null,
        token: null
      },
      cache: {
        timestamp: {},
        data: {}
      },
      loading: {
        global: false,
        individual: {}
      },
      error: null
    };
  }
  
  // 类似 Pinia 的响应式更新
  setState(updater) {
    const newState = typeof updater === 'function' 
      ? updater(this.state) 
      : updater;
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }
}
```

**特点：**
- 类 Pinia 设计模式
- 支持状态监听器
- 内置缓存管理（5 分钟默认过期）
- 加载状态追踪
- 错误统一管理

#### 2.2 API 服务层 (api-service.js)

```javascript
const apiService = {
  // 智能缓存系统
  cache: {
    defaultExpireTime: 5 * 60 * 1000, // 5 分钟
    maxCacheSize: 5 * 1024 * 1024,    // 5MB
    expireTimes: {
      '/asset-type': 30 * 60 * 1000,  // 静态数据 30 分钟
      '/role/': 1 * 60 * 1000,        // 动态数据 1 分钟
      '/activity': 5 * 60 * 1000,     // 活动数据 5 分钟
    },
    
    // 自动清理过期缓存
    cleanExpiredCache() { /* ... */ },
    
    // LRU 缓存淘汰策略
    cleanOldestCache() { /* ... */ }
  },
  
  // XSS 防护
  xssUtils: {
    escapeHtml(text) { /* ... */ },
    sanitizeInput(input) { /* ... */ },
    sanitizeObject(obj) { /* ... */ }
  }
};
```

**核心 API 方法：**
- `getUserInfo(userId)` - 获取用户信息
- `getRole(userId)` - 获取角色列表
- `getRoleAssets(roleId)` - 获取角色资产
- `getSkills(roleId)` - 获取技能列表
- `startCultivation(roleId, boostType)` - 开始修炼
- `checkin(roleId)` - 签到
- `acceptTask(roleId, taskId)` - 接受任务
- `joinClan(roleId, clanId)` - 加入宗门

#### 2.3 配置管理 (config.js)

```javascript
const environments = {
  development: {
    API_BASE_URL: 'http://localhost:8088/api',
    DEBUG_MODE: true
  },
  test: {
    API_BASE_URL: 'http://test-api.lingyuexiantu.com/api',
    DEBUG_MODE: true
  },
  production: {
    API_BASE_URL: 'https://api.lingyuexiantu.com/api',
    DEBUG_MODE: false
  }
};

// 自动环境检测
function detectEnvironment() {
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development';
  }
  
  if (hostname.includes('test') || port === '8081') {
    return 'test';
  }
  
  return 'production';
}
```

**特点：**
- 多环境配置
- 自动环境检测
- 角色 ID 自动获取和存储
- 全局错误处理

#### 2.4 认证与授权

```javascript
// auth-manager.js
const authManager = {
  async login(username, password) {
    // JWT Token 获取
    const token = await apiService.login(username, password);
    localStorage.setItem('token', token);
  },
  
  async checkAuth() {
    // Token 有效性验证
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      await apiService.verifyToken(token);
      return true;
    } catch (e) {
      localStorage.removeItem('token');
      return false;
    }
  }
};

// role-validator.js
const RoleValidator = {
  getUserId() {
    return localStorage.getItem('userId');
  },
  
  getRoleId() {
    return localStorage.getItem('roleId');
  },
  
  validateRoleOwnership(roleId, userId) {
    // 验证角色归属
    return roleService.getRole(roleId).then(role => {
      return role.userId === userId;
    });
  }
};
```

### 3. 前端架构特点

| 特点 | 说明 |
|------|------|
| **无框架依赖** | 纯 Vanilla JS，轻量级，无构建步骤 |
| **模块化设计** | 按功能划分模块，每个模块独立 HTML+JS |
| **状态管理** | 类 Pinia 设计，统一状态管理 |
| **缓存策略** | LocalStorage + 内存双重缓存，智能过期 |
| **安全防护** | XSS 防护、Token 认证、角色归属验证 |
| **错误处理** | 全局 401 处理器、统一错误提示 |
| **响应式设计** | 适配移动端和桌面端 |

---

## ⚙️ 后端架构

### 1. 技术架构

```
Spring Boot 3.2.0
├── Spring Security (认证授权)
├── Spring Data JPA (ORM)
├── Spring WebSocket (实时通信)
├── Spring Retry (重试机制)
├── JWT (Token 认证)
├── Redis (缓存，可选)
└── Flyway (数据库版本控制)
```

### 2. 目录结构

```
lingyuexiantu-server/
├── src/main/java/com/lingyue/
│   ├── annotation/           # 自定义注解
│   │   └── SectPermission.java
│   ├── aspect/               # AOP 切面
│   │   └── SectPermissionAspect.java
│   ├── config/               # 配置类
│   │   ├── CorsConfig.java
│   │   ├── DatabaseConfig.java
│   │   ├── GlobalCorsConfig.java
│   │   ├── GlobalExceptionHandler.java
│   │   ├── JwtAuthFilter.java
│   │   ├── RedisConfig.java
│   │   ├── SecurityConfig.java
│   │   ├── WebSocketConfig.java
│   │   └── WebMvcConfig.java
│   ├── controller/           # Controller 层 (24 个)
│   │   ├── ActivityController.java
│   │   ├── AuthController.java
│   │   ├── CheckinController.java
│   │   ├── ClanController.java
│   │   ├── CombatController.java
│   │   ├── ConfigController.java
│   │   ├── CultivationController.java
│   │   ├── FriendController.java
│   │   ├── GameUserController.java
│   │   ├── GiftController.java
│   │   ├── ItemController.java
│   │   ├── MailController.java
│   │   ├── MallController.java
│   │   ├── MapController.java
│   │   ├── PaymentController.java
│   │   ├── ResourceController.java
│   │   ├── RewardController.java
│   │   ├── RoleController.java
│   │   ├── SkillController.java
│   │   ├── StatsController.java
│   │   ├── SysMenuController.java
│   │   ├── SysRoleController.java
│   │   ├── SysUserController.java
│   │   ├── TaskController.java
│   │   └── TradeController.java
│   ├── dto/                  # 数据传输对象
│   │   ├── ActivityDTO.java
│   │   ├── AssetUpdateRequest.java
│   │   ├── AttributeDTO.java
│   │   ├── BodyCultivationDTO.java
│   │   ├── BreakthroughResult.java
│   │   ├── CultivateResult.java
│   │   ├── DerivedStats.java
│   │   ├── RoleAssetDTO.java
│   │   ├── RoleTaskDTO.java
│   │   ├── TaskDTO.java
│   │   └── ...
│   ├── entity/               # 实体类 (60+)
│   │   ├── Achievement.java
│   │   ├── Activity.java
│   │   ├── Clan.java
│   │   ├── ClanMember.java
│   │   ├── Equipment.java
│   │   ├── GameRole.java
│   │   ├── GameUser.java
│   │   ├── Inventory.java
│   │   ├── Item.java
│   │   ├── RoleBaseStats.java
│   │   ├── RoleAttributeCache.java
│   │   ├── RoleEquipment.java
│   │   ├── RoleSkill.java
│   │   ├── Skill.java
│   │   ├── Task.java
│   │   └── ... (60+ 实体)
│   ├── repository/           # Repository 层 (17 个)
│   │   ├── ActivityRepository.java
│   │   ├── ClanRepository.java
│   │   ├── GameRoleRepository.java
│   │   ├── GameUserRepository.java
│   │   ├── ItemRepository.java
│   │   ├── RoleClanRepository.java
│   │   ├── SkillRepository.java
│   │   ├── SysUserRepository.java
│   │   └── ...
│   ├── service/              # Service 层 (22 个)
│   │   ├── AchievementService.java
│   │   ├── AssetTypeService.java
│   │   ├── BreakthroughService.java
│   │   ├── ClanService.java
│   │   ├── ConfigService.java
│   │   ├── CultivationService.java
│   │   ├── EquipmentService.java
│   │   ├── GameRoleService.java
│   │   ├── GameUserService.java
│   │   ├── InventoryService.java
│   │   ├── ItemService.java
│   │   ├── MapService.java
│   │   ├── PlayerStatsService.java
│   │   ├── RoleAssetService.java
│   │   ├── RoleClanService.java
│   │   ├── RoleDataService.java
│   │   ├── RolePermissionService.java
│   │   ├── RoleRealmService.java
│   │   ├── RoleResourceService.java
│   │   ├── RoleSkillService.java
│   │   ├── RoleStatsService.java
│   │   └── ...
│   ├── handler/              # WebSocket 处理器
│   │   └── ClanWebSocketHandler.java
│   └── interceptor/          # 拦截器
│       └── AuthInterceptor.java
├── src/main/resources/
│   ├── db/migration/         # Flyway 迁移脚本
│   │   ├── V1__init.sql
│   │   ├── V2__add_menu_permission_tables.sql
│   │   ├── V17__attribute_calculation_and_longevity_system.sql
│   │   └── ... (30+ 迁移文件)
│   ├── data/                 # 初始化数据
│   │   ├── init-data.sql
│   │   ├── init-clan-data.sql
│   │   └── ...
│   └── application.yml       # 配置文件
└── pom.xml                   # Maven 配置
```

### 3. 核心 Controller

#### 3.1 RoleController (角色管理)

```java
@RestController
@RequestMapping("/role")
public class RoleController {
    
    // 创建角色
    @PostMapping("/create")
    public Result<GameRole> createRole(@RequestBody GameRole role)
    
    // 获取用户角色列表
    @GetMapping("/user/{userId}")
    public Result<List<GameRole>> getRolesByUserId(@PathVariable Long userId)
    
    // 获取角色详情
    @GetMapping("/{roleId}")
    public Result<GameRole> getRoleById(@PathVariable Long roleId)
    
    // 更新角色
    @PutMapping("/{roleId}")
    public Result<GameRole> updateRole(@PathVariable Long roleId, @RequestBody GameRole role)
    
    // 更新境界
    @PutMapping("/{roleId}/realm")
    public Result<GameRole> updateRealm(@PathVariable Long roleId, @RequestParam String realm)
}
```

#### 3.2 CultivationController (修炼系统)

```java
@RestController
@RequestMapping("/cultivation")
public class CultivationController {
    
    // 获取修炼状态
    @GetMapping("/{roleId}/status")
    public Result<Map<String, Object>> getCultivationStatus(@PathVariable Long roleId)
    
    // 开始修炼
    @PostMapping("/{roleId}/start")
    public Result<Map<String, Object>> startCultivation(
        @PathVariable Long roleId, 
        @RequestParam String boostType
    )
    
    // 领取修为
    @PostMapping("/{roleId}/collect")
    public Result<Map<String, Object>> collectCultivation(@PathVariable Long roleId)
    
    // 突破境界
    @PostMapping("/{roleId}/breakthrough")
    public Result<BreakthroughResult> breakthrough(@PathVariable Long roleId)
}
```

#### 3.3 ClanController (宗门系统)

```java
@RestController
@RequestMapping("/clan")
public class ClanController {
    
    // 创建宗门
    @PostMapping("/create")
    public Result<Clan> createClan(@RequestBody Clan clan)
    
    // 加入宗门
    @PostMapping("/join")
    public Result<Void> joinClan(@RequestParam Long roleId, @RequestParam Long clanId)
    
    // 退出宗门
    @PostMapping("/quit")
    public Result<Void> quitClan(@RequestParam Long roleId)
    
    // 获取宗门信息
    @GetMapping("/{clanId}")
    public Result<Clan> getClanById(@PathVariable Long clanId)
    
    // 获取宗门成员
    @GetMapping("/{clanId}/members")
    public Result<List<ClanMember>> getClanMembers(@PathVariable Long clanId)
    
    // 宗门聊天
    @PostMapping("/chat")
    public Result<Void> sendChatMessage(@RequestBody ChatMessage message)
}
```

### 4. 核心 Service

#### 4.1 CultivationService (修炼服务)

```java
@Service
public class CultivationService {
    
    // 核心参数
    private static final int BASE_XIUWEI_PER_SECOND = 1;
    private static final double LINGSHI_BOOST_MULTIPLIER = 2.0;
    private static final double PILL_BOOST_MULTIPLIER = 3.0;
    
    // 获取修炼状态（包含功法加成）
    public Map<String, Object> getCultivationStatus(Long roleId) {
        // 1. 获取角色信息
        GameRole role = gameRoleService.getRoleById(roleId);
        
        // 2. 获取功法加成
        Map<String, Object> techniqueBonus = techniqueService.calculateTotalBonus(roleId);
        
        // 3. 计算修炼效率
        double realmEfficiency = getRealmEfficiencyMultiplier(role.getRealm());
        
        // 4. 计算当前修为
        int currentXiuwei = calculateCurrentXiuwei(task, techniqueSpeedBonus, ...);
        
        // 5. 返回结果
        return result;
    }
    
    // 开始修炼
    @Transactional
    public Map<String, Object> startCultivation(Long roleId, String boostType) {
        // 1. 检查是否有进行中的任务
        // 2. 消耗灵石（如果有加成）
        // 3. 创建修炼任务
        // 4. 计算结束时间
        // 5. 保存任务
    }
    
    // 领取修为
    @Transactional
    public Map<String, Object> collectCultivation(Long roleId) {
        // 1. 获取修炼任务
        // 2. 计算剩余时间
        // 3. 增加修为
        // 4. 检查是否触发突破
        // 5. 更新任务状态
    }
}
```

#### 4.2 BreakthroughService (突破服务)

```java
@Service
public class BreakthroughService {
    
    // 境界突破
    @Transactional
    public BreakthroughResult breakthrough(Long roleId) {
        // 1. 获取角色信息和当前境界
        // 2. 检查修为是否足够
        // 3. 获取突破规则
        // 4. 计算成功率
        // 5. 随机判定是否成功
        // 6. 更新境界或扣除修为
        // 7. 记录突破历史
        // 8. 返回结果
    }
    
    // 获取突破规则
    public CfgRealmBreakthrough getBreakthroughRule(String currentRealm) {
        // 从配置表获取突破规则
    }
}
```

#### 4.3 ClanService (宗门服务)

```java
@Service
public class ClanService {
    
    // 创建宗门
    @Transactional
    public Clan createClan(Clan clan, Long roleId) {
        // 1. 检查宗门名称是否重复
        // 2. 保存宗门信息
        // 3. 创建宗门成员记录（宗主）
        // 4. 更新角色宗门关联
        // 5. 返回宗门信息
    }
    
    // 加入宗门
    @Transactional
    public void joinClan(Long roleId, Long clanId) {
        // 1. 检查宗门是否存在
        // 2. 检查角色是否已有宗门
        // 3. 创建宗门成员记录
        // 4. 更新角色宗门关联
    }
    
    // 退出宗门
    @Transactional
    public void quitClan(Long roleId) {
        // 1. 获取角色宗门信息
        // 2. 如果是宗主，转移或解散宗门
        // 3. 删除成员记录
        // 4. 清空角色宗门关联
    }
}
```

### 5. 后端架构特点

| 特点 | 说明 |
|------|------|
| **分层架构** | Controller → Service → Repository 清晰分层 |
| **RESTful API** | 统一 REST 风格，资源导向 |
| **JWT 认证** | 无状态认证，支持跨域 |
| **事务管理** | @Transactional 保证数据一致性 |
| **异常处理** | 全局异常处理器，统一错误格式 |
| **CORS 配置** | 支持多环境跨域 |
| **Flyway 迁移** | 数据库版本控制，自动迁移 |
| **AOP 切面** | 权限注解，统一权限校验 |
| **WebSocket** | 实时通信（宗门聊天） |

---

## 🗄️ 数据库架构

### 1. 核心表结构

#### 1.1 用户与角色表

```sql
-- 游戏用户表
CREATE TABLE game_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    status TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 游戏角色表
CREATE TABLE game_role (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    role_name VARCHAR(100) NOT NULL,
    gender INT,
    realm VARCHAR(50),              -- 境界：炼气、筑基、金丹...
    level INT,
    hp INT,
    mp INT,
    spirit_root VARCHAR(100),       -- 灵根
    avatar VARCHAR(255),
    body_level VARCHAR(50),         -- 体修等级
    body_strength INT,              -- 肉身强度
    age INT DEFAULT 18,             -- 当前年龄
    max_age INT DEFAULT 100,        -- 最大寿命
    life_status TINYINT DEFAULT 0,  -- 生命状态：0-存活，1-坐化，2-已故
    death_time DATETIME,            -- 死亡时间
    reincarnation_count INT DEFAULT 0, -- 轮回次数
    cultivation_base DECIMAL(10,4) DEFAULT 1.0, -- 修炼资质
    longevity_bonus INT DEFAULT 0,  -- 寿命加成
    create_time DATETIME,
    status INT DEFAULT 1,
    INDEX idx_user_id (user_id),
    INDEX idx_realm (realm),
    INDEX idx_status (status)
);

-- 角色基础属性表
CREATE TABLE role_base_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT NOT NULL UNIQUE,
    vit INT DEFAULT 10,    -- 根骨
    spi INT DEFAULT 10,    -- 灵力
    agi INT DEFAULT 10,    -- 身法
    wis INT DEFAULT 10,    -- 悟性
    lck INT DEFAULT 10,    -- 气运
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 1.2 属性计算配置表

```sql
-- 属性计算规则配置表
CREATE TABLE cfg_attribute_rules (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    rule_key VARCHAR(50) NOT NULL UNIQUE,
    rule_name VARCHAR(100) NOT NULL,
    rule_type TINYINT NOT NULL DEFAULT 1,
    attribute_type VARCHAR(20),
    formula VARCHAR(500),
    base_value DECIMAL(10,4),
    coeff_value DECIMAL(10,4),
    min_value DECIMAL(10,4) DEFAULT 0,
    max_value DECIMAL(10,4),
    description VARCHAR(500),
    priority INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    version INT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 境界属性倍率表
CREATE TABLE cfg_realm_attribute_mult (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    realm_name VARCHAR(50) NOT NULL,
    realm_level INT NOT NULL,
    hp_mult DECIMAL(10,4) DEFAULT 1.0,
    atk_mult DECIMAL(10,4) DEFAULT 1.0,
    def_mult DECIMAL(10,4) DEFAULT 1.0,
    speed_mult DECIMAL(10,4) DEFAULT 1.0,
    crit_mult DECIMAL(10,4) DEFAULT 1.0,
    dodge_mult DECIMAL(10,4) DEFAULT 1.0,
    exp_mult DECIMAL(10,4) DEFAULT 1.0,
    max_age INT DEFAULT 100,
    description VARCHAR(200)
);

-- 角色属性缓存表
CREATE TABLE t_role_attribute_cache (
    role_id BIGINT PRIMARY KEY,
    hp BIGINT DEFAULT 0,
    hp_max BIGINT DEFAULT 0,
    mp BIGINT DEFAULT 0,
    mp_max BIGINT DEFAULT 0,
    atk BIGINT DEFAULT 0,
    def BIGINT DEFAULT 0,
    speed BIGINT DEFAULT 0,
    crit_rate DECIMAL(10,4) DEFAULT 0,
    dodge_rate DECIMAL(10,4) DEFAULT 0,
    exp_bonus DECIMAL(10,4) DEFAULT 1.0,
    total_vit BIGINT DEFAULT 0,
    total_spi BIGINT DEFAULT 0,
    total_agi BIGINT DEFAULT 0,
    total_wis BIGINT DEFAULT 0,
    total_lck BIGINT DEFAULT 0,
    equipment_bonus JSON,
    skill_bonus JSON,
    buff_bonus JSON,
    calc_version BIGINT DEFAULT 0,
    calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 1.3 装备与物品表

```sql
-- 物品表
CREATE TABLE item (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50),
    description VARCHAR(255),
    price INT,
    stackable INT,
    max_stack INT,
    use_effect TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 装备表
CREATE TABLE equipment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    item_id BIGINT,
    type INT,                     -- 1-武器，2-衣服，3-饰品...
    attack INT,
    defense INT,
    hp_bonus INT,
    mp_bonus INT,
    speed_bonus INT,
    crit_rate_bonus INT,
    dodge_rate_bonus INT,
    hit_rate_bonus INT,
    level_requirement INT,
    stat_requirements TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 角色装备表
CREATE TABLE role_equipment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT,
    equipment_id BIGINT,
    item_id BIGINT,
    slot INT,                     -- 装备位置
    status INT,                   -- 1-已装备，0-未装备
    quantity INT,
    acquired_at DATETIME,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 角色背包表
CREATE TABLE inventory (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    quantity INT DEFAULT 1,
    slot_index INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_role_item (role_id, item_id)
);
```

#### 1.4 技能与功法表

```sql
-- 技能表
CREATE TABLE skill (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    description TEXT,
    type VARCHAR(50),
    skill_level INT,
    damage INT,
    cooldown INT,
    mana_cost INT,
    trigger_rate DECIMAL(5,4) DEFAULT 0,  -- 触发概率
    status VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 角色技能表
CREATE TABLE role_skill (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT,
    skill_id BIGINT,
    skill_level INT,
    experience INT,
    status VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 功法表
CREATE TABLE cultivation_techniques (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    speed_addition DOUBLE NOT NULL DEFAULT 0.0,  -- 修炼速度加成 (%)
    speed_addition_flat INT NOT NULL DEFAULT 0,  -- 修炼速度绝对值
    limit_addition BIGINT NOT NULL DEFAULT 0,    -- 修为上限加成
    rarity VARCHAR(20) NOT NULL DEFAULT 'COMMON',
    level_requirement INT NOT NULL DEFAULT 1,
    realm_requirement VARCHAR(50),
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL,
    updated_at DATETIME DEFAULT NULL
);

-- 用户功法表
CREATE TABLE user_techniques (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    technique_id BIGINT NOT NULL,
    is_equipped TINYINT(1) NOT NULL DEFAULT 0,
    acquired_at DATETIME NOT NULL,
    equipped_at DATETIME DEFAULT NULL,
    unequipped_at DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME DEFAULT NULL,
    UNIQUE KEY uk_user_technique (user_id, technique_id)
);
```

#### 1.5 宗门表

```sql
-- 宗门表
CREATE TABLE clan (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    clan_level INT DEFAULT 1,
    member_count INT DEFAULT 0,
    max_members INT DEFAULT 50,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 宗门成员表
CREATE TABLE clan_member (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    clan_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    position VARCHAR(50) DEFAULT 'MEMBER',  -- MASTER, ELDER, MEMBER
    contribution INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_clan_role (clan_id, role_id)
);

-- 宗门技能表
CREATE TABLE clan_skill (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    clan_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    skill_level INT DEFAULT 1,
    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_clan_skill (clan_id, skill_id)
);
```

#### 1.6 任务与活动表

```sql
-- 任务表
CREATE TABLE task (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    description TEXT,
    type VARCHAR(50),             -- DAILY, WEEKLY, MAIN, SIDE
    level_requirement INT,
    exp_reward INT,
    gold_reward INT,
    item_rewards TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 角色任务表
CREATE TABLE role_task (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT,
    task_id BIGINT,
    status VARCHAR(50) DEFAULT 'IN_PROGRESS',
    progress INT DEFAULT 0,
    started_at DATETIME,
    completed_at DATETIME,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 活动表
CREATE TABLE activity (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    description TEXT,
    start_time DATETIME,
    end_time DATETIME,
    rewards TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 1.7 签到与邮件表

```sql
-- 签到表
CREATE TABLE role_checkin (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT NOT NULL,
    checkin_date DATE NOT NULL,
    checkin_count INT DEFAULT 1,
    rewards_claimed TINYINT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_role_date (role_id, checkin_date)
);

-- 邮件表
CREATE TABLE mail (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    title VARCHAR(200),
    content TEXT,
    status VARCHAR(50) DEFAULT 'UNREAD',
    send_time DATETIME,
    read_time DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 邮件物品表
CREATE TABLE mail_item (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    mail_id BIGINT,
    item_id BIGINT,
    quantity INT,
    status VARCHAR(50) DEFAULT 'UNCLAIMED',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 1.8 系统管理表

```sql
-- 系统用户表
CREATE TABLE sys_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    email VARCHAR(100),
    phone VARCHAR(20),
    avatar VARCHAR(255),
    status TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 系统角色表
CREATE TABLE sys_role (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    role_code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    sort INT DEFAULT 0,
    status TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 系统菜单表
CREATE TABLE sys_menu (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    parent_id BIGINT DEFAULT 0,
    menu_name VARCHAR(50),
    menu_type VARCHAR(20),
    path VARCHAR(255),
    component VARCHAR(255),
    perms VARCHAR(100),
    icon VARCHAR(50),
    sort INT DEFAULT 0,
    status TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 系统权限表
CREATE TABLE sys_permission (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    permission_name VARCHAR(50) NOT NULL UNIQUE,
    permission_code VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 2. 数据库表分类

| 分类 | 表数量 | 主要表 |
|------|--------|--------|
| **核心表** | 2 | game_user, game_role |
| **属性表** | 4 | role_base_stats, cfg_attribute_rules, cfg_realm_attribute_mult, t_role_attribute_cache |
| **装备物品表** | 5 | item, equipment, pill, role_equipment, inventory |
| **技能功法表** | 5 | skill, role_skill, cultivation_techniques, user_techniques, technique_change_log |
| **宗门表** | 3 | clan, clan_member, clan_skill |
| **任务活动表** | 4 | task, role_task, activity, activity_reward |
| **签到邮件表** | 3 | role_checkin, mail, mail_item |
| **配置表** | 10+ | cfg_* 开头的配置表 |
| **系统管理表** | 10+ | sys_* 开头的管理表 |
| **日志表** | 5+ | *_log 结尾的日志表 |
| **其他表** | 20+ | 成就、好友、交易、地图等 |

**总计：60+ 张表**

### 3. 数据库设计特点

| 特点 | 说明 |
|------|------|
| **规范化设计** | 第三范式，减少数据冗余 |
| **配置化** | 属性计算、境界倍率等全部配置化 |
| **缓存策略** | t_role_attribute_cache 实时缓存属性 |
| **寿命系统** | 完整的年龄、寿命、轮回机制 |
| **JSON 字段** | equipment_bonus 等使用 JSON 存储复杂数据 |
| **索引优化** | 关键字段建立索引 |
| **审计字段** | created_at, updated_at 统一审计 |
| **软删除** | status 字段控制启用/禁用 |

---

## 🔄 核心业务流程

### 1. 角色创建流程

```
用户注册 → 创建 game_user
    ↓
填写角色信息 → 创建 game_role
    ↓
初始化属性 → role_base_stats (VIT=10, SPI=10, AGI=10, WIS=10, LCK=10)
    ↓
初始化资产 → role_asset (灵石、金币等)
    ↓
领取新手礼包 → gift 系统
    ↓
创建完成 → 返回角色信息
```

### 2. 修炼流程

```
开始修炼
    ↓
检查灵石 → 消耗灵石（可选加速）
    ↓
创建修炼任务 → cultivation_task
    ↓
计算修炼效率 → 境界效率 × 功法加成 × 加速倍率
    ↓
定时增加修为 → 每秒增加修为
    ↓
领取修为
    ↓
检查是否可突破 → 修为 >= 突破需求
    ↓
突破境界 → 随机成功率
    ↓
成功 → 更新境界，增加属性
    ↓
失败 → 扣除修为，可能受伤
```

### 3. 属性计算流程

```
读取基础属性 → role_base_stats (VIT, SPI, AGI, WIS, LCK)
    ↓
读取境界倍率 → cfg_realm_attribute_mult
    ↓
读取装备加成 → role_equipment
    ↓
读取技能加成 → role_skill
    ↓
读取 Buff 加成 → Buff 系统
    ↓
应用计算规则 → cfg_attribute_rules
    ↓
HP = (VIT × 100) × 境界 HP 系数 + 装备 HP + Buff HP
ATK = (SPI × 8 + VIT × 1) × 境界 ATK 系数 + 装备 ATK + Buff ATK
DEF = (VIT × 5 + AGI × 2) × 境界 DEF 系数 + 装备 DEF + Buff DEF
...
    ↓
写入缓存 → t_role_attribute_cache
    ↓
返回属性数据
```

### 4. 宗门加入流程

```
查看宗门列表
    ↓
申请加入 → sect_apply
    ↓
宗主/长老审批
    ↓
审批通过 → 创建 clan_member
    ↓
更新角色宗门关联 → role_clan
    ↓
加入宗门聊天室 → WebSocket
    ↓
学习宗门技能 → clan_skill
```

### 5. 装备穿戴流程

```
打开背包 → inventory
    ↓
选择装备
    ↓
检查等级要求
    ↓
检查属性要求
    ↓
卸下当前装备 → 更新 status=0
    ↓
穿上新装备 → 更新 status=1, slot=位置
    ↓
重新计算属性 → 触发属性缓存更新
    ↓
刷新 UI 显示
```

---

## ✨ 技术亮点与特色

### 1. 前端亮点

#### 1.1 无框架依赖的类 Pinia 状态管理

```javascript
// 类似 Vue3 Pinia 的响应式设计
class Store {
  setState(updater) {
    const newState = typeof updater === 'function' 
      ? updater(this.state) 
      : updater;
    this.state = { ...this.state, ...newState };
    this.notifyListeners(); // 响应式更新
  }
}
```

#### 1.2 智能缓存系统

```javascript
cache: {
  // 分级缓存策略
  expireTimes: {
    '/asset-type': 30 * 60 * 1000,  // 静态数据 30 分钟
    '/role/': 1 * 60 * 1000,        // 动态数据 1 分钟
    '/activity': 5 * 60 * 1000,     // 活动数据 5 分钟
  },
  
  // LRU 淘汰策略
  cleanOldestCache() {
    // 按时间戳排序，清理最旧缓存
  },
  
  // 自动空间管理
  ensureSpace() {
    if (this.getUsedSize() > this.maxCacheSize) {
      this.cleanOldestCache();
    }
  }
}
```

#### 1.3 XSS 防护体系

```javascript
xssUtils: {
  escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },
  
  sanitizeObject(obj) {
    // 递归清理对象中的所有字符串
  }
}
```

### 2. 后端亮点

#### 2.1 混合策略属性计算系统

```
数据库配置 + 实时计算 + 缓存
    ↓
cfg_attribute_rules (计算规则)
cfg_realm_attribute_mult (境界倍率)
    ↓
RoleStatsService.calculateAttributes()
    ↓
t_role_attribute_cache (缓存结果)
    ↓
Redis (可选，分布式缓存)
```

#### 2.2 完整的寿命系统

```sql
game_role 表：
- age: 当前年龄
- max_age: 最大寿命（受境界影响）
- life_status: 0-存活，1-坐化中，2-已故
- death_time: 死亡时间
- reincarnation_count: 轮回次数
- longevity_bonus: 寿命加成（丹药、功法）

t_longevity_log 表：
- 记录所有寿命相关事件
- 年龄增长、突破延寿、丹药延寿、坐化、轮回
```

#### 2.3 功法系统

```sql
cultivation_techniques:
- speed_addition: 修炼速度百分比加成
- speed_addition_flat: 修炼速度绝对值加成
- limit_addition: 修为上限加成

user_techniques:
- is_equipped: 是否装备
- equipped_at: 装备时间

technique_change_log:
- 完整的装备变更历史
- 用于追踪和回滚
```

#### 2.4 Flyway 数据库版本控制

```
db/migration/
├── V1__init.sql
├── V2__add_menu_permission_tables.sql
├── V3__add_avatar_column.sql
├── ...
├── V17__attribute_calculation_and_longevity_system.sql
├── V18__create_skill_tables.sql
├── V19__add_skill_trigger_rate.sql
├── V20__body_cultivation_enhancement.sql
└── ...

自动迁移流程：
1. 应用启动
2. Flyway 检查版本
3. 执行未执行的迁移脚本
4. 更新数据库版本
```

### 3. 数据库亮点

#### 3.1 配置化设计

```sql
-- 所有计算规则配置化
cfg_attribute_rules: 计算因子
cfg_realm_attribute_mult: 境界倍率
cfg_equipment_quality: 装备品质系数
cfg_pill_effect: 丹药效果
cfg_numerical_rules: 数值规则
cfg_skill_upgrade: 技能升级规则
cfg_realm_breakthrough: 突破规则
```

#### 3.2 实时属性缓存

```sql
t_role_attribute_cache:
- 实时存储计算后的属性
- 包含装备加成、技能加成、Buff 加成
- 支持缓存版本控制
- 支持过期时间
```

#### 3.3 完整的日志系统

```sql
-- 操作日志
sys_operation_log
audit_log

-- 业务日志
technique_change_log      -- 功法变更
breakthrough_history      -- 突破历史
body_cultivation_log      -- 体修日志
task_log                  -- 任务日志
stat_operation_log        -- 属性变更日志
asset_acquisition_record  -- 资产获取记录
asset_modification_log    -- 资产变更日志
asset_usage_record        -- 资产使用记录
```

---

## 💡 优化建议

### 1. 前端优化

#### 1.1 引入构建工具

**现状：** 纯静态文件，无构建步骤

**建议：**
- 使用 Vite 进行打包
- 代码压缩和混淆
- Tree Shaking 移除无用代码
- 按需加载模块

```bash
# 推荐方案
npm create vite@latest . -- --template vanilla
```

#### 1.2 模块化改造

**现状：** 全局变量较多

**建议：**
- 使用 ES6 Modules
- 统一导出/导入
- 避免全局污染

```javascript
// 推荐方式
// store.js
export const useStore = () => { ... }

// character.html
import { useStore } from './js/store.js'
```

#### 1.3 性能优化

- 图片懒加载
- 虚拟列表（长列表）
- 防抖节流
- Service Worker 离线缓存

### 2. 后端优化

#### 2.1 缓存优化

**现状：** 数据库直读较多

**建议：**
- 引入 Redis 缓存热点数据
- 属性计算结果缓存
- 配置数据缓存

```java
@Service
public class RoleStatsService {
    
    @Cacheable(value = "roleAttributes", key = "#roleId")
    public Map<String, Object> getRoleAttributes(Long roleId) {
        // 计算属性
    }
    
    @CacheEvict(value = "roleAttributes", key = "#roleId")
    public void updateRoleAttributes(Long roleId, ...) {
        // 更新属性，清除缓存
    }
}
```

#### 2.2 异步处理

**现状：** 同步处理所有请求

**建议：**
- 异步发送邮件
- 异步记录日志
- 异步处理成就

```java
@Service
public class MailService {
    
    @Async
    public void sendMailAsync(Long userId, Mail mail) {
        // 异步发送邮件
    }
}
```

#### 2.3 批量操作

**现状：** 单条操作较多

**建议：**
- 批量插入
- 批量更新
- 使用 JPA Batch

```java
@Transactional
public void batchUpdateAttributes(List<RoleAttribute> attributes) {
    // 批量更新
    attributeRepository.saveAll(attributes);
}
```

### 3. 数据库优化

#### 3.1 索引优化

```sql
-- 添加复合索引
CREATE INDEX idx_role_stats ON role_base_stats(role_id, vit, spi);
CREATE INDEX idx_cultivation_task ON cultivation_task(role_id, status, end_time);

-- 添加覆盖索引
CREATE INDEX idx_role_realm_covering ON game_role(user_id, status) INCLUDE (id, role_name, realm);
```

#### 3.2 分区表

```sql
-- 日志表按月分区
ALTER TABLE technique_change_log 
PARTITION BY RANGE (YEAR(change_time) * 100 + MONTH(change_time)) (
    PARTITION p202601 VALUES LESS THAN (202602),
    PARTITION p202602 VALUES LESS THAN (202603),
    ...
);
```

#### 3.3 读写分离

```yaml
# 多数据源配置
spring:
  datasource:
    master:
      url: jdbc:mysql://master:3306/lingyuexiantu
      username: root
      password: xxx
    slave:
      url: jdbc:mysql://slave:3306/lingyuexiantu
      username: root
      password: xxx
```

### 4. 架构优化

#### 4.1 微服务拆分（可选）

```
当前：单体应用

未来可拆分为：
- 用户服务 (User Service)
- 角色服务 (Role Service)
- 修炼服务 (Cultivation Service)
- 宗门服务 (Clan Service)
- 战斗服务 (Combat Service)
- 社交服务 (Social Service)
```

#### 4.2 消息队列

```
引入 RabbitMQ/Kafka：
- 异步处理耗时操作
- 解耦服务
- 削峰填谷

场景：
- 发送邮件
- 记录日志
- 成就判定
- 排行榜更新
```

#### 4.3 监控告警

```
引入：
- Prometheus + Grafana (监控)
- ELK Stack (日志)
- SkyWalking (链路追踪)

监控指标：
- API 响应时间
- 数据库连接数
- 缓存命中率
- 错误率
```

---

## 📊 总结

### 项目规模

| 指标 | 数量 |
|------|------|
| 前端页面 | 50+ |
| JavaScript 文件 | 20+ |
| 后端 Controller | 24 |
| 后端 Service | 22 |
| 后端 Repository | 17 |
| 实体类 | 60+ |
| 数据库表 | 60+ |
| API 接口 | 100+ |
| 代码行数 | 约 5 万行 |

### 技术评分

| 维度 | 评分 | 说明 |
|------|------|------|
| **架构设计** | ⭐⭐⭐⭐ | 分层清晰，职责明确 |
| **代码质量** | ⭐⭐⭐⭐ | 规范统一，注释充分 |
| **可扩展性** | ⭐⭐⭐⭐⭐ | 配置化设计，易于扩展 |
| **可维护性** | ⭐⭐⭐⭐ | 模块化好，但前端无构建 |
| **性能** | ⭐⭐⭐ | 有缓存，但优化空间大 |
| **安全性** | ⭐⭐⭐⭐ | JWT 认证，XSS 防护 |
| **文档** | ⭐⭐⭐⭐⭐ | 文档齐全，注释详细 |

### 核心优势

1. ✅ **完整的修仙体系** - 境界、修炼、突破、寿命、轮回
2. ✅ **配置化设计** - 所有数值、规则可配置
3. ✅ **混合策略属性计算** - 数据库 + 缓存 + 实时计算
4. ✅ **智能缓存系统** - 前端 LocalStorage + 后端 Redis
5. ✅ **完善的宗门系统** - 成员、职位、技能、聊天
6. ✅ **Flyway 版本控制** - 数据库迁移自动化
7. ✅ **安全防护** - JWT、XSS 防护、角色归属验证

### 待优化项

1. ⚠️ **前端构建** - 引入 Vite 等构建工具
2. ⚠️ **后端缓存** - 增加 Redis 缓存层
3. ⚠️ **异步处理** - 引入消息队列
4. ⚠️ **监控告警** - 完善监控体系
5. ⚠️ **性能优化** - 数据库索引、查询优化

---

## 📚 附录

### A. 环境搭建

#### 前端

```bash
# 无需安装依赖，直接启动
# 方式 1: VS Code Live Server
# 方式 2: Python HTTP Server
python -m http.server 5173

# 访问
http://localhost:5173
```

#### 后端

```bash
cd lingyuexiantu-server

# 配置环境变量
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=lingyuexiantu
export DB_USERNAME=root
export DB_PASSWORD=your_password

# 启动
./mvnw spring-boot:run

# 或打包后运行
./mvnw package
java -jar target/lingyuexiantu-server-0.0.1-SNAPSHOT.jar
```

#### 数据库

```bash
# 创建数据库
CREATE DATABASE lingyuexiantu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Flyway 自动迁移
# 或手动执行
source /path/to/mock_data.sql
```

### B. 常用命令

```bash
# 查看后端日志
tail -f logs/lingyuexiantu.log

# 查看数据库连接
SHOW PROCESSLIST;

# 查看表大小
SELECT table_name, 
       ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE table_schema = 'lingyuexiantu'
ORDER BY (data_length + index_length) DESC;
```

### C. 关键配置

```yaml
# application.yml
server:
  port: 8088
  servlet:
    context-path: /api

spring:
  datasource:
    url: jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME:lingyuexiantu}
    username: ${DB_USERNAME:root}
    password: ${DB_PASSWORD:12345678}
  
  jpa:
    hibernate:
      ddl-auto: none
    show-sql: true
  
  flyway:
    enabled: false
    baseline-on-migrate: true

jwt:
  secret: ${JWT_SECRET:your-secret-key}
  expire-time: ${JWT_EXPIRE_TIME:86400000}
```

---

**文档结束**

> 如有问题或建议，请联系开发团队。  
> 最后更新时间：2026-04-01
