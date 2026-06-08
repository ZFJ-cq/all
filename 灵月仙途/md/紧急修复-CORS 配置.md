# 🚨 紧急修复：CORS 配置

## 问题现状

CORS 配置代码已修改完成，但需要重新编译并运行才能生效。

## ✅ 已完成的修改

### SecurityConfig.java
```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    
    // 开发环境：允许所有 Origin
    configuration.addAllowedOriginPattern("*");
    configuration.setAllowCredentials(false);
    
    configuration.addAllowedMethod("GET");
    configuration.addAllowedMethod("POST");
    configuration.addAllowedMethod("PUT");
    configuration.addAllowedMethod("DELETE");
    configuration.addAllowedMethod("OPTIONS");
    configuration.addAllowedMethod("PATCH");
    
    configuration.addAllowedHeader("*");
    configuration.addExposedHeader("Authorization");
    configuration.setMaxAge(3600L);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

## 🔧 解决方案（3 选 1）

### 方案 1：使用 IDEA 运行（最简单，推荐 ⭐⭐⭐）

1. **打开 IDEA**
2. **打开项目**：`/Users/macbook/前端项目/灵月仙途/lingyuexiantu-server`
3. **等待 Maven 同步**（右下角进度条完成）
4. **找到主类**：`com.lingyue.LingyuexiantuServerApplication`
5. **右键点击 → Run 'LingyuexiantuServerApplication'**

IDEA 会自动编译并运行，包含最新的 CORS 配置。

**启动成功后，在手机上访问：**
```
http://192.168.110.98:5502
```

### 方案 2：安装 Maven 后重新打包

```bash
# 安装 Maven
brew install maven

# 重新打包
cd /Users/macbook/前端项目/灵月仙途/lingyuexiantu-server
mvn clean package -DskipTests

# 运行
java -jar target/lingyuexiantu-server-0.0.1-SNAPSHOT.jar
```

### 方案 3：使用编译后的 class 文件（复杂，不推荐）

需要配置 classpath 并手动运行，容易出错，不建议使用。

## 📱 验证步骤

### 1. 重启后端服务后，在手机上访问诊断页面
```
http://192.168.110.98:5502/diagnose-network.html
```

### 2. 点击"运行完整诊断"

### 3. 所有测试应该显示 ✅
- ✅ API_BASE_URL 配置正确
- ✅ 后端服务连通性
- ✅ CORS 跨域配置
- ✅ 网络延迟测试

### 4. 访问主页
```
http://192.168.110.98:5502
```

## ⚠️ 重要提示

1. **当前运行的后端服务是旧版本**，不包含最新的 CORS 配置
2. **必须重新启动后端服务**才能应用新配置
3. **前端服务不需要重启**（已经是最新的）

## ️ 重启后端服务（使用 IDEA）

1. 在 IDEA 中运行 `LingyuexiantuServerApplication`
2. 等待启动完成（看到 "Started LingyuexiantuServerApplication"）
3. 不要关闭 IDEA 窗口

## 📞 如果还有问题

请提供以下信息：
1. IDEA 启动日志
2. 诊断页面截图
3. 手机浏览器 Console 截图

---

**修改时间**：2026-04-03 20:12
**修改文件**：SecurityConfig.java
**修改内容**：允许所有 CORS Origin（开发环境）
