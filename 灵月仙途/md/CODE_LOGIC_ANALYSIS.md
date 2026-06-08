# 修炼系统完整逻辑梳理

## 🔄 完整数据流

### 流程 1: 页面加载 → 显示修为

```
用户打开修炼页面
    ↓
1. loadCultivationStatus(roleId)
    ↓
2. loadRoleResources(roleId)
    ├─ GET /api/resource/types
    │   └─ 返回：asset_types 表数据
    │       [{id: 1, code: "XIUXIUWEI", name: "修为"}, ...]
    │
    └─ GET /api/resource/role/{roleId}
        └─ 返回：role_asset 表数据
            [{assetTypeCode: "XIUXIUWEI", quantity: 1680}, ...]
    ↓
3. 处理资源数据
    ├─ 遍历资源列表
    ├─ 提取 assetTypeCode
    ├─ 存入 resourceMap['xiuxiuwei'] = 1680
    └─ 最终：resourceMap = {xiuxiuwei: 1680, lingshi: 5000, zhujidan: 10}
    ↓
4. updateXiuweiProgress()
    ├─ currentXiuwei = resourceMap['xiuxiuwei'] = 1680
    ├─ requiredXiuwei = 100 (从境界配置获取)
    ├─ 进度 = (1680 / 100) * 100 = 100%
    └─ 更新 UI：显示 "1680 / 100"，进度条 100%
```

**✅ 状态**: 正常工作

---

### 流程 2: 倒计时结束 → 增加修为

```
倒计时归零 (countdownValue = 0)
    ↓
1. startCountdownTimer() 触发
    ↓
2. executeCultivationCycle()
    ↓
3. POST /api/cultivation/auto
    请求：{roleId: 1}
    ↓
4. 后端处理：CultivationService.autoCultivation()
    ├─ 计算修为：totalXiuwei = 30
    ├─ 获取 assetTypeId: resourceTypeService.getResourceTypeByCode("XIUXIUWEI")
    ├─ ⚠️ 添加修为：roleAssetService.addAsset(roleId, assetTypeId, totalXiuwei)
    │   └─ 写入：role_asset 表
    │       INSERT INTO role_asset (role_id, asset_type_code, quantity)
    │       VALUES (1, 'XIUXIUWEI', 30)
    │       ON DUPLICATE KEY UPDATE quantity = quantity + 30
    └─ 返回：{success: true, totalXiuwei: 30}
    ↓
5. 前端处理响应
    ├─ 检查 response.success === true
    ├─ 获得修为：totalXiuwei = 30
    └─ 调用：loadRoleResources(roleId) 刷新数据
    ↓
6. loadRoleResources() 重新获取
    ├─ GET /api/resource/role/1
    │   └─ 查询：SELECT * FROM role_asset WHERE role_id = 1
    │       └─ 应该返回：[{assetTypeCode: "XIUXIUWEI", quantity: 1710}, ...]
    └─ 更新 resourceMap['xiuxiuwei'] = 1710
    ↓
7. updateXiuweiProgress()
    ├─ currentXiuwei = 1710
    ├─ 更新 UI：显示 "1710 / 100"
    └─ 弹出提示："获得 30 修为！"
```

**⚠️ 问题点**: 
- 后端 `roleAssetService.addAsset()` 是否正确实现？
- 数据库 `role_asset` 表是否正确更新？

---

### 流程 3: 持久化存储 → 刷新页面

```
页面加载
    ↓
1. loadCountdownFromServer(roleId)
    ↓
2. loadCultivationState() 从 localStorage 读取
    ├─ 读取：cultivation_state
    └─ 返回：{roleId: 1, startTime: 123, endTime: 456}
    ↓
3. getRemainingTime(endTime)
    ├─ now = Date.now()
    ├─ remaining = (endTime - now) / 1000
    └─ 如果 remaining > 0，恢复倒计时
    ↓
4. 如果 remaining <= 0
    ├─ 修炼已完成
    ├─ clearCultivationState() 清除状态
    └─ 重新开始 30 秒倒计时
```

**✅ 状态**: 逻辑正确

---

## 🗄️ 数据库表结构

### role_asset 表（正确的表）

```sql
CREATE TABLE role_asset (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT NOT NULL,
    asset_type_code VARCHAR(50) NOT NULL,  -- 'XIUXIUWEI', 'LINGSHI', ...
    quantity BIGINT NOT NULL,
    created_at DATETIME,
    updated_at DATETIME,
    UNIQUE KEY uk_role_asset (role_id, asset_type_code)
);
```

**关键索引**: `uk_role_asset (role_id, asset_type_code)` - 唯一索引

**数据示例**:
```
id | role_id | asset_type_code | quantity | created_at
1  | 1       | XIUXIUWEI       | 1680     | 2026-04-02
2  | 1       | LINGSHI         | 5000     | 2026-04-02
3  | 1       | ZHUJIDAN        | 10       | 2026-04-02
```

### asset_types 表

```sql
CREATE TABLE asset_types (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL UNIQUE,  -- 'XIUXIUWEI'
    name VARCHAR(50) NOT NULL,         -- '修为'
    type VARCHAR(20),
    category VARCHAR(20),
    unit_of_measure VARCHAR(10)        -- '点'
);
```

**数据示例**:
```
id | code        | name  | type    | category    | unit
1  | XIUXIUWEI   | 修为   | VIRTUAL | CULTIVATION | 点
2  | LINGSHI     | 灵石   | CURRENCY| CURRENCY    | 个
3  | ZHUJIDAN    | 筑基丹 | ITEM    | CONSUMABLE  | 颗
```

---

## 🔧 RoleAssetService.addAsset() 实现检查

让我检查这个关键方法是否正确实现：

```java
// RoleAssetServiceImpl.java 第 271 行
public void addAsset(Long roleId, Long assetTypeId, int quantity) {
    if (quantity <= 0) {
        throw new IllegalArgumentException("增加数量必须大于 0");
    }
    updateRoleAsset(roleId, assetTypeId, (long) quantity);
}

// updateRoleAsset 方法（需要检查）
private void updateRoleAsset(Long roleId, Long assetTypeId, Long quantity) {
    // 关键：是否正确实现增量更新？
    // 应该是：UPDATE role_asset SET quantity = quantity + ? WHERE role_id = ? AND asset_type_id = ?
}
```

**⚠️ 需要验证**: `updateRoleAsset()` 方法是否正确实现增量更新？

---

## 🐛 可能的问题点

### 问题 1: RoleAssetService.addAsset() 实现错误

**可能情况**:
- 方法存在但没有正确更新数据库
- 使用了 INSERT 而不是 UPDATE
- 没有使用 `ON DUPLICATE KEY UPDATE`

**验证方法**:
```sql
-- 查看当前修为
SELECT quantity FROM role_asset WHERE role_id = 1 AND asset_type_code = 'XIUXIUWEI';

-- 等待倒计时结束，再次查询
-- 如果 quantity 没有增加，说明 addAsset() 有问题
```

### 问题 2: 后端代码没有重启

**可能情况**:
- 修改了 Java 代码但没有重启后端
- 后端仍在运行旧代码

**验证方法**:
```bash
# 检查后端进程
ps aux | grep spring-boot

# 查看后端日志
tail -f /Users/macbook/前端项目/灵月仙途/lingyuexiantu-server/logs/app.log

# 应该看到："✅ 角色 1 获得 30 修为（assetTypeId: X）"
```

### 问题 3: 数据库连接问题

**可能情况**:
- 后端连接了错误的数据库
- 事务没有提交

**验证方法**:
```sql
-- 检查数据库版本
SELECT DATABASE();

-- 检查是否有未提交的事务
SELECT * FROM information_schema.innodb_trx;
```

### 问题 4: 前端没有重新加载资源

**可能情况**:
- `executeCultivationCycle()` 中没有调用 `loadRoleResources()`
- 调用顺序错误

**验证方法**:
查看前端代码第 1378 行：
```javascript
await executeCultivationCycle();
  ↓
console.log('获得修为:', totalXiuwei);
  ↓
await loadRoleResources(currentRoleId);  // ← 这行是否存在？
```

---

## ✅ 验证清单

### 后端验证

- [ ] `CultivationService.java` 第 625 行使用 `roleAssetService.addAsset()`
- [ ] `RoleAssetServiceImpl.addAsset()` 正确实现
- [ ] 后端已重启
- [ ] 后端日志显示："✅ 角色 1 获得 30 修为"

### 数据库验证

- [ ] `role_asset` 表有角色 1 的修为记录
- [ ] `asset_types` 表有 `XIUXIUWEI` 记录
- [ ] 修为数量可以正确增加

### 前端验证

- [ ] `executeCultivationCycle()` 调用了 `loadRoleResources()`
- [ ] 控制台显示："=== 修炼完成，修为已更新 ==="
- [ ] 修为数值正确增加

---

## 🔍 立即诊断步骤

### 步骤 1: 检查后端是否运行

```bash
# 查看端口 8088 是否监听
lsof -i :8088

# 或者
netstat -an | grep 8088
```

### 步骤 2: 手动测试后端接口

在浏览器控制台执行：

```javascript
// 测试自动修炼接口
fetch('http://localhost:8088/api/cultivation/auto', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({roleId: 1})
})
.then(r => r.json())
.then(data => {
  console.log('修炼响应:', data);
  // 应该看到：{success: true, totalXiuwei: 30, ...}
})
.catch(e => console.error('修炼失败:', e));
```

### 步骤 3: 检查数据库修为是否增加

在数据库客户端执行：

```sql
-- 执行前查询
SELECT quantity FROM role_asset WHERE role_id = 1 AND asset_type_code = 'XIUXIUWEI';

-- 等待 1 分钟或手动触发修炼

-- 执行后查询
SELECT quantity FROM role_asset WHERE role_id = 1 AND asset_type_code = 'XIUXIUWEI';

-- 差值应该是 30
```

### 步骤 4: 检查 RoleAssetService 实现

查看 `RoleAssetServiceImpl.java` 的 `updateRoleAsset()` 方法：

```bash
# 打开文件
open /Users/macbook/前端项目/灵月仙途/lingyuexiantu-server/src/main/java/com/lingyue/service/impl/RoleAssetServiceImpl.java

# 查找 updateRoleAsset 方法
grep -n "updateRoleAsset" *.java
```

---

## 📋 完整修复流程

如果发现问题，按以下顺序修复：

1. **修复后端代码** → 重启后端 → 验证日志
2. **修复数据库数据** → 执行 SQL → 验证查询
3. **修复前端代码** → 刷新页面 → 验证 UI
4. **端到端测试** → 等待倒计时 → 验证修为增加

---

## 🎯 成功标志

所有步骤完成后，应该看到：

1. ✅ 后端日志："✅ 角色 1 获得 30 修为（assetTypeId: X）"
2. ✅ 数据库修为：1680 → 1710
3. ✅ 前端显示：1710 / 100
4. ✅ 控制台日志："=== 修炼完成，修为已更新 ==="
5. ✅ 用户提示："获得 30 修为！"

---

## 📊 数据流对比

### 正确的数据流

```
前端调用 → POST /cultivation/auto
    ↓
后端处理 → autoCultivation()
    ↓
计算修为 → totalXiuwei = 30
    ↓
写入数据库 → roleAssetService.addAsset()
    ↓
SQL: UPDATE role_asset SET quantity = quantity + 30 
     WHERE role_id = 1 AND asset_type_code = 'XIUXIUWEI'
    ↓
返回结果 → {success: true, totalXiuwei: 30}
    ↓
前端刷新 → loadRoleResources()
    ↓
查询数据库 → SELECT * FROM role_asset WHERE role_id = 1
    ↓
更新 UI → 显示 1710 / 100
```

### 错误的数据流（当前可能）

```
前端调用 → POST /cultivation/auto
    ↓
后端处理 → autoCultivation()
    ↓
计算修为 → totalXiuwei = 30
    ↓
写入数据库 → roleAssetService.addAsset()
    ↓
❌ SQL 执行失败或没有执行
    ↓
返回结果 → {success: true, totalXiuwei: 30}
    ↓
前端刷新 → loadRoleResources()
    ↓
查询数据库 → SELECT * FROM role_asset WHERE role_id = 1
    ↓
❌ 修为仍然是 1680
    ↓
❌ UI 显示 1680 / 100（没有变化）
```

---

请按照上述诊断步骤逐一检查，并告诉我每一步的结果！这样我就能准确定位问题所在。🔍
