# 启动后端服务说明

## 问题描述
前端页面在调用 API 时出现错误，原因是后端服务未启动。

## 解决方案

### 方法一：使用 Maven 启动（推荐）

1. **进入后端项目目录**
   ```bash
   cd /Users/macbook/前端项目/灵月仙途/lingyuexiantu-server
   ```

2. **启动服务**
   ```bash
   mvn spring-boot:run
   ```

3. **验证服务是否启动成功**
   - 打开浏览器访问：http://localhost:8088/api/health
   - 或者在终端执行：`curl http://localhost:8088/api/health`

### 方法二：使用 IDEA 启动

1. 用 IDEA 打开 `lingyuexiantu-server` 项目
2. 找到主类 `com.lingyue.LingyuexiantuServerApplication`
3. 右键点击，选择 `Run 'LingyuexiantuServerApplication'`

### 方法三：打包后运行

1. **打包项目**
   ```bash
   cd /Users/macbook/前端项目/灵月仙途/lingyuexiantu-server
   mvn clean package -DskipTests
   ```

2. **运行 JAR 包**
   ```bash
   java -jar target/lingyuexiantu-server-*.jar
   ```

## 验证 API 可用性

启动后端服务后，可以通过以下命令验证 API 是否正常：

### 1. 测试宗门列表 API
```bash
curl http://localhost:8088/api/clan/all
```

### 2. 测试技能列表 API
```bash
curl http://localhost:8088/api/skill
```

### 3. 测试健康检查
```bash
curl http://localhost:8088/api/health
```

## 前端测试页面

启动后端服务后，可以访问以下前端页面进行测试：

### 1. 宗门列表页面
```
http://localhost:8080/clan/clan-list.html
```

### 2. 功法页面
```
http://localhost:8080/skills/skills.html
```

### 3. 角色页面
```
http://localhost:8080/character/character.html
```

## 常见问题

### 问题 1：端口被占用
**错误信息**：`Port 8088 is already in use`

**解决方案**：
1. 修改配置文件 `application.properties` 中的端口号
2. 或者关闭占用 8088 端口的进程：`lsof -ti:8088 | xargs kill -9`

### 问题 2：数据库连接失败
**错误信息**：`Could not open JDBC Connection for transaction`

**解决方案**：
1. 确保 MySQL 服务已启动
2. 检查数据库配置是否正确（application.properties）
3. 确认数据库 `lingyue_xiantu` 已创建

### 问题 3：Maven 未安装
**错误信息**：`command not found: mvn`

**解决方案**：
1. 安装 Maven：`brew install maven`
2. 或者使用方法二（IDEA）或方法三（打包后运行）

## 数据说明

### 宗门系统
- **数据来源**：所有宗门数据都从数据库 `clan` 表获取
- **不使用模拟数据**：前端不硬编码任何宗门信息
- **API 接口**：`/api/clan/all`

### 技能系统
- **数据来源**：所有技能数据都从数据库 `skill` 表获取
- **不使用模拟数据**：前端不硬编码任何技能信息
- **API 接口**：`/api/skill`

## 申请加入宗门流程

1. 用户在宗门列表页面选择宗门
2. 点击"申请加入"按钮
3. 前端调用 API：`POST /api/clan/apply/join`
4. API 返回成功后，跳转到"我的宗门"页面（my-clan.html）
5. 在我的宗门页面可以查看申请状态

## 注意事项

1. **必须先启动后端服务**：前端页面依赖后端 API 提供数据
2. **确保数据库有数据**：如果宗门列表或技能列表为空，需要在数据库中添加数据
3. **CORS 配置**：如果使用不同的端口运行前端，需要配置 CORS

## 联系支持

如有其他问题，请查看项目文档或联系开发团队。
