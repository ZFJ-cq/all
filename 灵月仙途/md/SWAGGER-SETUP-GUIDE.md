# Swagger/OpenAPI API 文档使用指南

## 📖 快速开始

### 访问 Swagger UI

启动服务器后，可以通过以下地址访问 API 文档：

**Swagger UI（推荐）**:
```
http://localhost:8088/swagger-ui.html
```

**OpenAPI JSON**:
```
http://localhost:8088/v3/api-docs
```

---

## 🔧 配置说明

### 1. 依赖添加

已在 `pom.xml` 中添加：

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.3.0</version>
</dependency>
```

### 2. 配置类

- **OpenApiConfig.java**: 配置 API 文档基本信息、安全认证、服务器地址
- **位置**: `lingyuexiantu-server/src/main/java/com/lingyue/config/OpenApiConfig.java`

### 3. application.yml 配置

```yaml
springdoc:
  api-docs:
    enabled: true
    path: /v3/api-docs
  swagger-ui:
    enabled: true
    path: /swagger-ui.html
    operations-sorter: alpha
    tags-sorter: alpha
    doc-expansion: none
```

---

## 📝 如何使用

### 1. 查看 API 列表

打开 Swagger UI 后，可以看到所有 Controller 的分类：
- **Role Management**: 角色管理相关 API
- 其他 Controller（需要添加注解）

### 2. 测试需要认证的 API

对于需要 JWT Token 的 API：

1. 点击页面右上角的 **Authorize** 按钮
2. 在弹出的对话框中输入：`Bearer {your-jwt-token}`
3. 点击 **Authorize** 确认
4. 现在可以测试所有需要认证的接口

**示例**:
```
Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiZXhwIjoxNjc1OTk5OTk5fQ.xxx
```

### 3. 测试 API 请求

以创建角色为例：

1. 展开 **POST /role/create** 接口
2. 点击 **Try it out**
3. 在 Request body 中填写：
```json
{
  "name": "张三",
  "avatar": "https://example.com/avatar.jpg",
  "gender": "male",
  "background": "散修"
}
```
4. 点击 **Execute** 执行请求
5. 查看响应结果

---

## 🎯 为其他 Controller 添加文档

参考 `RoleController.java` 的示例，为其他 Controller 添加注解：

### 基本注解

```java
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@Tag(name = "模块名称", description = "模块描述")
@RestController
@RequestMapping("/xxx")
public class XxxController {
    
    @Operation(summary = "接口摘要", description = "详细描述")
    @SecurityRequirement(name = "bearerAuth")  // 需要认证的接口
    @PostMapping("/create")
    public Result<Xxx> create(@RequestBody @Valid CreateXxxRequest request) {
        // ...
    }
    
    @Operation(summary = "获取详情")
    @GetMapping("/{id}")
    public Result<Xxx> getById(
        @Parameter(description = "ID") @PathVariable Long id
    ) {
        // ...
    }
}
```

### 推荐添加文档的 Controller

按优先级排序：

1. **P0 - 核心功能**:
   - `AuthController.java` - 认证相关
   - `CultivationController.java` - 修炼相关
   - `CombatController.java` - 战斗相关

2. **P1 - 重要功能**:
   - `ClanController.java` - 宗门相关
   - `SkillController.java` - 技能相关
   - `InventoryController.java` - 背包相关
   - `EquipmentController.java` - 装备相关

3. **P2 - 辅助功能**:
   - `TaskController.java` - 任务相关
   - `MailController.java` - 邮件相关
   - `CheckinController.java` - 签到相关
   - `LeaderboardController.java` - 排行榜相关

---

## 🔐 安全配置

### JWT Token 认证

Swagger UI 已配置 JWT Bearer Token 认证：

- **Scheme**: Bearer
- **Format**: JWT
- **Header**: Authorization

### 在代码中使用

```java
@SecurityRequirement(name = "bearerAuth")
@Operation(summary = "需要认证的接口")
@GetMapping("/protected")
public Result<?> protectedEndpoint() {
    // ...
}
```

---

## 📊 自定义配置

### 修改 API 文档信息

编辑 `OpenApiConfig.java`:

```java
@Bean
public OpenAPI customOpenAPI() {
    return new OpenAPI()
        .info(new Info()
            .title("灵月仙途 API")  // 修改标题
            .version("2.0.0")        // 修改版本
            .description("描述信息")  // 修改描述
            // ...
        );
}
```

### 修改服务器地址

```java
.servers(List.of(
    new Server()
        .url("http://localhost:8088/api")  // 开发环境
        .description("Development server"),
    new Server()
        .url("https://api.lingyuexiantu.com/api")  // 生产环境
        .description("Production server")
))
```

---

## 🚀 生产环境部署

### 禁用 Swagger UI

在生产环境中，建议禁用 Swagger UI：

```yaml
# application-prod.yml
springdoc:
  api-docs:
    enabled: false
  swagger-ui:
    enabled: false
```

### 使用 Profile 激活配置

```bash
java -jar app.jar --spring.profiles.active=prod
```

---

## 🐛 常见问题

### 1. Swagger UI 无法访问

**检查项**:
- 服务器是否正常启动（端口 8088）
- context-path 是否正确（/api）
- 防火墙是否阻止访问

**完整 URL**: `http://localhost:8088/swagger-ui.html`

### 2. API 不显示

**解决方法**:
- 检查 Controller 是否添加了 `@Tag` 注解
- 检查方法是否添加了 `@Operation` 注解
- 重启服务器

### 3. 认证失败

**检查项**:
- Token 格式是否正确（Bearer + 空格 + token）
- Token 是否过期
- 接口是否确实需要认证（@SecurityRequirement）

---

## 📚 参考资源

- [SpringDoc 官方文档](https://springdoc.org/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI 使用指南](https://swagger.io/docs/open-source-tools/swagger-ui/usage/)

---

## 📝 更新日志

### v1.0.0 (2026-04-07)
- ✅ 初始版本
- ✅ 添加 SpringDoc OpenAPI 支持
- ✅ 配置 Swagger UI
- ✅ 为 RoleController 添加完整文档注解
- ✅ 配置 JWT 认证支持

---

**开发团队**: 灵月仙途开发团队  
**最后更新**: 2026-04-07
