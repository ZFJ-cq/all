# 后端启动问题修复指南

## 🔍 问题诊断

### 当前状态
- ✅ Redis 已安装并运行正常
- ✅ 前端代码已修复（TokenManager, RoleSync, CharacterStore）
- ❌ 后端启动失败

### 错误信息
```
org.springframework.beans.factory.BeanCreationException: 
Error creating bean with name 'entityManagerFactory': 
scale has no meaning for floating point numbers
```

## 📋 问题原因

**Hibernate 配置错误**：代码中有 `@Column` 注解对浮点数类型（Float/Double）使用了 `scale` 属性，这是非法的。

### 错误示例
```java
// ❌ 错误：浮点数不能有 scale
@Column(precision = 10, scale = 2)
private Double price;

// ✅ 正确：浮点数只需要 precision
@Column(precision = 10)
private Double price;
```

## 🔧 解决步骤

### 步骤 1：找到问题代码

在项目中搜索使用了 `scale` 的浮点数字段：

```bash
cd /Users/macbook/前端项目/灵月仙途/lingyuexiantu-server
grep -r "scale.*=" src/main/java --include="*.java" | grep -E "(Double|Float)"
```

或者查找所有使用了 `@Column` 的实体类：

```bash
grep -r "@Column.*scale" src/main/java --include="*.java"
```

### 步骤 2：修复代码

找到问题后，移除浮点数字段的 `scale` 属性：

**修复前：**
```java
@Column(name = "some_field", precision = 10, scale = 2)
private Double someField;
```

**修复后：**
```java
@Column(name = "some_field", precision = 10)
private Double someField;
```

### 步骤 3：重新启动后端

```bash
cd /Users/macbook/前端项目/灵月仙途/lingyuexiantu-server
./mvnw spring-boot:run
```

## ✅ 已完成的修复

### 前端修复
1. ✅ **TokenManager** - Token 持久化管理
2. ✅ **RoleSync** - 角色 ID 同步
3. ✅ **CharacterStore** - 全局状态管理
4. ✅ **CharacterService** - 统一数据服务
5. ✅ **skills.html** - 移除默认数据，改进错误处理

### 后端修复
1. ✅ **Redis 安装** - Redis 8.6.1 已安装并运行
2. ✅ **RedisCacheService** - 类型转换处理
3. ✅ **GameRoleServiceImpl** - 缓存 JSON 字符串而非对象
4. ✅ **RedisConfig** - 保持简单配置

### 已集成的页面
- ✅ index.html
- ✅ skills/skills.html
- ✅ cultivation.html
- ✅ body-cultivation/index.html
- ✅ character/character.html
- ✅ equipment/equipment.html
- ✅ partner/partner.html
- ✅ clan/clan-list.html
- ✅ clan/clan-home.html
- ✅ clan/my-clan.html
- ✅ word/world.html
- ✅ news/news-list.html
- ✅ trade/trade.html

## 🎯 临时解决方案

如果暂时无法修复后端启动问题，可以：

### 方案 1：禁用 Redis 缓存

临时禁用 Redis 缓存功能，让后端直接从数据库读取数据：

**修改 GameRoleServiceImpl.java：**
```java
@Override
public GameRole getRoleById(Long roleId) {
    // 直接从数据库获取，跳过缓存
    return roleRepository.findById(roleId).orElse(null);
}
```

### 方案 2：使用内存缓存

使用现有的 MapCacheService 代替 Redis：

```java
// 使用内存缓存而不是 Redis
@Autowired
private MapCacheService mapCacheService;
```

## 📝 验证修复

修复后端启动问题后：

1. **启动后端**
   ```bash
   cd /Users/macbook/前端项目/灵月仙途/lingyuexiantu-server
   ./mvnw spring-boot:run
   ```

2. **测试 API**
   访问：http://localhost:8000/test-api-data.html
   点击"测试 getUserProfile"

3. **检查技能页面**
   访问：http://localhost:8000/skills/skills.html
   
   **预期结果：**
   - ✅ 显示真实的角色名称
   - ✅ 显示真实的境界
   - ✅ 显示真实的气血和灵力

## 🔍 常见问题排查

### 问题 1：找不到使用了 scale 的字段

**解决方法：**
```bash
# 搜索所有实体类
find src/main/java -name "*.java" -exec grep -l "@Column.*scale" {} \;

# 或者使用 IDE 的全局搜索
# 搜索：@Column.*scale.*\d
```

### 问题 2：修复后仍然启动失败

**检查：**
1. 数据库连接是否正常
2. MySQL 是否运行
3. 其他配置是否有误

### 问题 3：Redis 连接问题

**检查：**
```bash
# 检查 Redis 是否运行
redis-cli ping
# 应该返回：PONG

# 查看 Redis 进程
ps aux | grep redis
```

## 📚 相关文档

- [CHARACTER-STORE-GUIDE.md](CHARACTER-STORE-GUIDE.md) - 全局状态管理指南
- [INTEGRATION-CHECKLIST.md](INTEGRATION-CHECKLIST.md) - 页面集成清单
- [fix-redis-connection.md](fix-redis-connection.md) - Redis 连接问题修复

## 🎉 总结

**已完成：**
- ✅ 前端全局状态管理系统
- ✅ 多标签页数据同步
- ✅ Token 持久化
- ✅ 角色数据一致性
- ✅ Redis 安装和配置

**待完成：**
- ⏳ 修复后端启动问题（移除浮点数的 scale 属性）
- ⏳ 测试完整的角色数据加载

**预期效果：**
修复后，所有页面将显示真实、统一的角色数据！
