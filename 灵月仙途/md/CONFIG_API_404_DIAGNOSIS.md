# 🔍 配置接口 404 错误诊断报告

**诊断日期**: 2026-03-30  
**问题**: `/api/config/realm-breakthrough` 返回 404  
**状态**: 🔍 诊断中

---

## 📋 问题现象

### 前端请求

```javascript
GET http://localhost:8088/api/config/realm-breakthrough
```

### 后端响应

```json
{
  "code": 500,
  "message": "资源不存在",
  "data": null
}
```

### HTTP 状态码

```
404 Not Found
```

---

## 🔍 诊断步骤

### 步骤 1: 检查后端 Controller

**ConfigController.java** ✅

```java
@RestController
@RequestMapping("/api/config")  // ✅ 基础路径正确
public class ConfigController {
    
    @GetMapping("/realm-breakthrough")  // ✅ 映射路径正确
    public ResponseEntity<List<CfgRealmBreakthrough>> getRealmBreakthroughs() {
        return ResponseEntity.ok(configService.getAllRealmBreakthroughs());
    }
}
```

**结论**: Controller 代码正确，路径映射应该是 `/api/config/realm-breakthrough`

---

### 步骤 2: 检查是否有路径冲突

**发现的 Controller**:

1. **StatsController** (`/api/stats`)
   - `@GetMapping("/configs/{configKey}")`
   - 管理：`CfgNumericalRules`

2. **ConfigController** (`/api/config`)
   - `@GetMapping("/realm-breakthrough")`
   - 管理：`CfgRealmBreakthrough`

**结论**: 两个 Controller 路径不冲突

---

### 步骤 3: 检查后端服务状态

**服务运行状态**: ✅ 正在运行
- PID: 71788
- 端口：8088
- Redis: 已连接
- 数据库：已连接

**问题**: 服务虽然运行，但可能没有正确加载 ConfigController

---

### 步骤 4: 分析可能的原因

#### 原因 1: Bean 未加载 ❓

**检查点**:
- ConfigController 是否有 `@RestController` 注解？ ✅ 有
- 是否在 Spring 组件扫描范围内？ ❓ 待确认
- 是否有其他配置类排除了这个 Controller？ ❓ 待确认

#### 原因 2: 依赖注入失败 ❓

**检查点**:
- `ConfigService.getAllRealmBreakthroughs()` 方法是否存在？ ❓ 待确认
- `CfgRealmBreakthroughRepository` 是否可用？ ✅ 有

#### 原因 3: 启动时未扫描到 ❓

**检查点**:
- 应用启动日志中是否有 ConfigController 的映射信息？ ❓ 待确认
- 是否有启动错误被忽略？ ❓ 待确认

---

## 🛠️ 解决方案

### 方案 1: 强制重启后端服务 (推荐)

**步骤**:

```bash
# 1. 停止当前服务
# 在终端中按 Ctrl+C

# 2. 清理编译
cd /Users/macbook/前端项目/灵月仙途/lingyuexiantu-server
./mvnw clean

# 3. 重新编译
./mvnw compile

# 4. 重新启动
./mvnw spring-boot:run
```

**预期效果**: 重新编译后，Spring 会重新扫描所有 Controller

---

### 方案 2: 检查启动日志

**步骤**:

```bash
# 查看启动日志，搜索 ConfigController
grep -i "ConfigController" logs/application.log

# 或者查看启动时的请求映射日志
grep -i "Mapped.*config" logs/application.log
```

**预期输出**:

```
Mapped "{[/api/config/realm-breakthrough],methods=[GET]}" onto ...
```

---

### 方案 3: 添加显式组件扫描

如果方案 1 无效，可能需要显式指定组件扫描范围:

**修改**: `LingyuexiantuServerApplication.java`

```java
@SpringBootApplication
@ComponentScan(basePackages = {
    "com.lingyue",
    "com.lingyue.controller",
    "com.lingyue.service",
    "com.lingyue.repository"
})
public class LingyuexiantuServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(LingyuexiantuServerApplication.class, args);
    }
}
```

---

### 方案 4: 临时使用 StatsController

如果 ConfigController 一直无法加载，可以在 StatsController 中添加对应方法:

**添加**: `/api/stats/configs/realm-breakthrough`

```java
@RestController
@RequestMapping("/api/stats")
public class StatsController {
    
    @Autowired
    private CfgRealmBreakthroughRepository realmBreakthroughRepository;
    
    // 添加这个方法
    @GetMapping("/configs/realm-breakthrough")
    public List<CfgRealmBreakthrough> getRealmBreakthroughs() {
        return realmBreakthroughRepository.findAll();
    }
}
```

**前端调用**:

```javascript
// 修改 api-service.js
async getConfig(configKey) {
  if (configKey === 'realm_breakthrough') {
    return this.get('/stats/configs/realm-breakthrough');
  }
  // ... 其他配置
}
```

---

## 📊 验证步骤

### 验证 1: 使用 curl 测试

```bash
# 测试接口
curl -X GET http://localhost:8088/api/config/realm-breakthrough

# 预期输出: JSON 数组 (境界突破配置列表)
```

### 验证 2: 浏览器访问

```
http://localhost:8088/api/config/realm-breakthrough
```

### 验证 3: 查看网络请求

1. 打开浏览器开发者工具 (F12)
2. 切换到 Network 标签
3. 刷新页面
4. 查看 `/api/config/realm-breakthrough` 请求
5. 确认状态码为 200

---

## 🎯 立即执行

### 推荐操作顺序

1. **立即重启后端服务** (方案 1)
2. **查看启动日志** (方案 2)
3. **测试接口** (验证步骤)
4. **如果仍无效**, 使用方案 4 (临时方案)

---

## 📝 根本原因分析

### 为什么会出现这个问题？

#### 可能原因 1: 编译缓存

**现象**: 
- 修改了 Controller 代码
- 但没有重新编译
- Spring 仍然使用旧的字节码

**解决**: 
```bash
./mvnw clean compile
```

#### 可能原因 2: 热部署失败

**现象**:
- 使用了 Spring DevTools
- 但热部署未生效
- 需要手动重启

**解决**: 
手动重启服务

#### 可能原因 3: 组件扫描问题

**现象**:
- Controller 不在默认扫描范围内
- 或者被排除了

**解决**:
显式指定扫描包

---

## ✅ 预期结果

### 修复后的表现

**前端**:
```javascript
✅ GET /api/config/realm-breakthrough 200 OK
✅ 返回 7 条境界突破配置
✅ 页面正常显示
```

**后端日志**:
```
INFO  - Mapped "{[/api/config/realm-breakthrough],methods=[GET]}" onto ...
INFO  - 200 OK - GET /api/config/realm-breakthrough
```

**数据库查询**:
```sql
Hibernate: 
    select
        c1_0.id,
        c1_0.base_defense_bonus,
        c1_0.base_hp_bonus,
        c1_0.base_strength_bonus,
        c1_0.breakthrough_success_rate,
        c1_0.description,
        c1_0.failure_penalty,
        c1_0.from_realm,
        c1_0.mutation_probability,
        c1_0.pain_growth_rate,
        c1_0.required_exp,
        c1_0.realm_order,
        c1_0.to_realm 
    from
        cfg_realm_breakthrough c1_0
```

---

## 📋 检查清单

### 后端检查

- [ ] ConfigController 有 `@RestController` 注解
- [ ] 方法有 `@GetMapping` 注解
- [ ] ConfigService 有 `getAllRealmBreakthroughs()` 方法
- [ ] Repository 可以正常访问
- [ ] 服务已重启
- [ ] 启动日志中有映射信息

### 前端检查

- [ ] API 路径正确: `/config/realm-breakthrough`
- [ ] Token 已设置
- [ ] Authorization Header 正确
- [ ] 网络请求格式正确

### 数据库检查

- [ ] `cfg_realm_breakthrough` 表存在
- [ ] 表中有数据
- [ ] 字段映射正确

---

## 🚀 快速修复命令

```bash
# 一键修复脚本
cd /Users/macbook/前端项目/灵月仙途/lingyuexiantu-server

# 1. 停止服务 (在运行服务的终端按 Ctrl+C)

# 2. 清理并重新编译
./mvnw clean compile

# 3. 启动服务
./mvnw spring-boot:run

# 4. 测试接口 (新开终端)
curl http://localhost:8088/api/config/realm-breakthrough
```

---

**诊断完成时间**: 2026-03-30  
**建议操作**: 立即重启后端服务  
**预计修复时间**: 2 分钟

---

## 💡 后续优化

### 防止类似问题

1. **添加启动日志**
   ```java
   @PostConstruct
   public void logMapping() {
       logger.info("ConfigController 已加载，映射路径：/api/config");
   }
   ```

2. **使用 Actuator 监控**
   ```xml
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-actuator</artifactId>
   </dependency>
   ```

3. **添加健康检查**
   ```java
   @GetMapping("/health/config")
   public String configHealth() {
       return "ConfigController: OK";
   }
   ```

4. **完善 API 文档**
   - 使用 Swagger/OpenAPI
   - 自动生成接口文档
   - 方便前后端对接

---

**报告生成时间**: 2026-03-30  
**维护人员**: 技术团队  
**保密级别**: 内部公开
