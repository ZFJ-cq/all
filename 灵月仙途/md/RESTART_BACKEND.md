# 后端服务重启指南

## 当前状态
- ✅ 旧进程已停止（PID: 86397）
- ⚠️ Maven 未安装，无法通过命令行启动

## 重启方法

### 方法 1：使用 IDE（推荐）

如果您使用 **IntelliJ IDEA**：

1. 找到右侧的 Maven 面板
2. 展开 `lingyuexiantu-server` → `Lifecycle`
3. 双击 `spring-boot:run`

或者：

1. 找到 `LingyuexiantuServerApplication.java`
2. 右键点击 → Run 'LingyuexiantuServerApplication'

如果您使用 **Eclipse**：

1. 右键点击 `LingyuexiantuServerApplication.java`
2. 选择 `Run As` → `Spring Boot App`

### 方法 2：使用已编译的 JAR

如果已经编译过，可以直接运行 JAR：

```bash
# 找到 JAR 文件
find /Users/macbook/前端项目/灵月仙途/lingyuexiantu-server/target -name "*.jar" -type f

# 运行 JAR
java -jar /path/to/lingyuexiantu-server-0.0.1-SNAPSHOT.jar
```

### 方法 3：使用 Docker（如果配置了）

```bash
docker-compose up -d
```

## 验证启动成功

### 1. 检查端口占用

```bash
lsof -ti:8088
```

如果返回进程 ID，说明服务已启动。

### 2. 测试 API

```bash
# 测试技能接口
curl http://localhost:8088/api/skill

# 测试角色技能接口
curl http://localhost:8088/api/role-skill/role/45
```

应该返回 JSON 数据，而不是 403 错误。

### 3. 查看日志

启动成功后，日志中应该显示：

```
Started LingyuexiantuServerApplication in X.XXX seconds
Tomcat started on port(s): 8088 (http)
```

## 已修复的配置

已在 `SecurityConfig.java` 中添加：

```java
.requestMatchers("/skill/**").permitAll()
.requestMatchers("/role-skill/**").permitAll()
```

这样前端就可以正常访问技能相关接口了。

## 预期效果

重启后端并刷新前端页面后：

- ✅ 技能页面正常显示技能列表
- ✅ 控制台无 500 或 403 错误
- ✅ 可以正常学习和装备技能

---

**请通过 IDE 重启后端服务，然后刷新前端页面测试！**
