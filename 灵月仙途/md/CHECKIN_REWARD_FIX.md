# 签到奖励发放修复指南

## 问题描述

用户反馈：**签到成功了，但灵石没有增加，灵石显示为 `---`**

## 问题分析

### 1. 灵石显示 `---` 的原因

前端代码在 `index.html` 第 3126 行判断资产数据:

```javascript
<span class="res-value">${assetMap.LINGSHI !== undefined ? formatNumber(assetMap.LINGSHI) : '---'}</span>
```

- 前端从 `role_asset` 表读取资产数据
- 根据 `assetTypeName` 判断资产类型 (如 "灵石"、"仙石"、"寿命")
- 如果后端返回的数据中没有 `assetTypeName === '灵石'` 的记录，则显示 `---`

### 2. 签到后灵石不增加的原因

后端在 `RewardServiceImpl.java` 第 75 行发放资源奖励:

```java
roleResourceService.addResource(roleId, resourceTypeId, quantity);
```

**核心问题**: 
- 后端签到奖励发放到 **旧的 `role_resource` 表**
- 前端显示的是 **新的 `role_asset` 表** 的数据
- 这是两套不同的资源/资产系统，数据不互通

## 解决方案

### 修改内容

修改 `RewardServiceImpl.java`,将资源奖励发放到新的 `role_asset` 表:

#### 1. 添加依赖注入

```java
private final RoleAssetService roleAssetService;
private final AssetTypeService assetTypeService;

public RewardServiceImpl(...,
                        RoleAssetService roleAssetService,
                        AssetTypeService assetTypeService) {
    ...
    this.roleAssetService = roleAssetService;
    this.assetTypeService = assetTypeService;
}
```

#### 2. 修改奖励发放逻辑

```java
if (resources != null && !resources.isEmpty()) {
    for (Map.Entry<String, Integer> entry : resources.entrySet()) {
        String resourceCode = entry.getKey();
        int quantity = entry.getValue();
        // 使用新的资产系统发放奖励
        Long assetTypeId = getAssetTypeIdByCode(resourceCode);
        if (assetTypeId != null) {
            // 先获取现有资产，如果不存在则创建
            RoleAsset asset = roleAssetService.getRoleAsset(roleId, assetTypeId);
            if (asset == null) {
                // 创建新资产
                roleAssetService.updateRoleAsset(roleId, assetTypeId, (long)quantity);
            } else {
                // 更新现有资产
                roleAssetService.updateRoleAsset(roleId, assetTypeId, asset.getQuantity() + quantity);
            }
        }
    }
}
```

#### 3. 添加辅助方法

```java
private Long getAssetTypeIdByCode(String code) {
    // 将资源代码转换为资产类型代码
    String assetTypeCode = convertResourceCodeToAssetCode(code);
    AssetType assetType = assetTypeService.getAssetTypeByCode(assetTypeCode);
    return assetType != null ? assetType.getId() : null;
}

private String convertResourceCodeToAssetCode(String resourceCode) {
    // 资源代码到资产代码的映射
    switch (resourceCode.toLowerCase()) {
        case "lingshi":
            return "LINGSHI";
        case "xiuwei":
            return "XIUWEI";
        case "hunshi":
            return "HUNSHI";
        case "shouming":
            return "SHOUMING";
        case "xianshi":
            return "XIANSHI";
        default:
            return resourceCode.toUpperCase();
    }
}
```

## 数据流对比

### 修复前 (错误)

```
签到成功
  ↓
CheckinController.doCheckin()
  ↓
RewardServiceImpl.distributeRewards()
  ↓
roleResourceService.addResource()  →  role_resource 表 (旧系统)
  ↓
前端从 role_asset 表读取 → 没有数据 → 显示 "---"
```

### 修复后 (正确)

```
签到成功
  ↓
CheckinController.doCheckin()
  ↓
RewardServiceImpl.distributeRewards()
  ↓
roleAssetService.updateRoleAsset()  →  role_asset 表 (新系统)
  ↓
前端从 role_asset 表读取 → 显示正确数值
```

## 测试验证

### 1. 启动后端服务

```bash
cd lingyuexiantu-server
mvn spring-boot:run
```

### 2. 执行签到

1. 打开前端页面 `index.html`
2. 选择角色
3. 点击签到按钮
4. 观察控制台日志

### 3. 验证数据

#### 检查 role_asset 表

```sql
SELECT 
    ra.role_id,
    at.code AS asset_type_code,
    at.name AS asset_type_name,
    ra.quantity
FROM role_asset ra
LEFT JOIN asset_type at ON ra.asset_type_code = at.code
WHERE ra.role_id = 45
  AND at.code IN ('LINGSHI', 'XIUWEI', 'HUNSHI');
```

#### 预期结果

| role_id | asset_type_code | asset_type_name | quantity |
|---------|----------------|-----------------|----------|
| 45      | LINGSHI         | 灵石            | 5050     |
| 45      | XIUWEI          | 修为            | 2200     |
| 45      | HUNSHI          | 魂石            | 50       |

### 4. 验证前端显示

- 灵石应该显示具体数值 (如 5050),而不是 `---`
- 签到成功后，灵石数量应该增加

## 影响范围

### 受影响的模块

1. **签到系统** - 每日签到奖励
2. **任务系统** - 任务奖励 (如也使用 RewardService)
3. **成就系统** - 成就奖励 (如也使用 RewardService)
4. **邮件系统** - 邮件附件领取 (不受影响，仍使用物品系统)

### 不受影响的模块

1. **物品系统** - 背包物品仍使用 `role_item` 表
2. **旧资源系统** - `role_resource` 表数据保持不变

## 注意事项

### 1. 数据库准备

确保 `asset_type` 表中存在以下资源类型:

```sql
INSERT INTO asset_type (code, name, type, category, unit_of_measure, status)
VALUES 
    ('LINGSHI', '灵石', 'CURRENCY', 'CURRENCY', '个', 'ACTIVE'),
    ('XIUWEI', '修为', 'VIRTUAL', 'CULTIVATION', '点', 'ACTIVE'),
    ('HUNSHI', '魂石', 'VIRTUAL', 'CULTIVATION', '点', 'ACTIVE'),
    ('SHOUMING', '寿命', 'VIRTUAL', 'CULTIVATION', '年', 'ACTIVE'),
    ('XIANSHI', '仙石', 'CURRENCY', 'CURRENCY', '个', 'ACTIVE')
ON DUPLICATE KEY UPDATE code = code;
```

### 2. 角色资产初始化

确保角色有对应的资产记录:

```sql
INSERT INTO role_asset (role_id, asset_type_code, quantity)
SELECT 
    45 AS role_id,
    'LINGSHI' AS asset_type_code,
    5000 AS quantity
WHERE NOT EXISTS (
    SELECT 1 FROM role_asset 
    WHERE role_id = 45 AND asset_type_code = 'LINGSHI'
);
```

### 3. 向后兼容性

- 保留了旧的 `role_resource` 相关代码
- 旧的 `getResourceTypeIdByCode()` 方法仍然保留
- 如有其他模块依赖旧系统，不会受到影响

## 后续优化建议

### 1. 统一资源系统

建议完全迁移到新的 `role_asset` 系统，移除旧的 `role_resource` 系统:

- 迁移历史数据
- 移除 `RoleResourceService` 相关代码
- 更新所有依赖旧系统的模块

### 2. 添加日志

在奖励发放时添加详细日志:

```java
logger.info("发放签到奖励，roleId={}, assetTypeCode={}, quantity={}", 
    roleId, assetTypeCode, quantity);
```

### 3. 错误处理

添加更完善的错误处理:

```java
if (assetTypeId == null) {
    logger.warn("未找到资产类型：code={}", resourceCode);
    continue; // 跳过该奖励，继续处理其他奖励
}
```

### 4. 批量操作优化

对于多个资源的发放，可以考虑批量操作:

```java
List<RoleAsset> assets = new ArrayList<>();
// 收集所有要更新的资产
roleAssetService.batchUpdateRoleAssets(roleId, assets);
```

## 修复完成标记

- [x] 修改 RewardServiceImpl 依赖注入
- [x] 修改奖励发放逻辑
- [x] 添加辅助方法
- [x] 编写修复文档
- [ ] 重启后端服务
- [ ] 执行 SQL 脚本初始化数据
- [ ] 测试签到功能
- [ ] 验证前端显示
- [ ] 测试其他奖励发放场景

---

**修复时间**: 2026-04-08  
**修复人员**: AI Assistant  
**影响模块**: 签到系统、奖励发放系统
