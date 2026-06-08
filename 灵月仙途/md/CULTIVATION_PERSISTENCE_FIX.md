# 修炼系统持久化修复指南

## ✅ 已修复的问题

### 1. 倒计时结束后修为不增加 ✅
**问题**: 倒计时归零后没有调用后端接口
**修复**: 
- 在 `startCountdownTimer` 函数中，当 `countdownValue <= 0` 时调用 `executeCultivationCycle()`
- `executeCultivationCycle()` 会调用 `/cultivation/auto` 接口增加修为
- 修为增加后自动刷新 UI 显示

### 2. 刷新页面倒计时重置 ✅
**问题**: 没有持久化存储修炼状态
**修复**:
- 使用 `localStorage` 存储修炼开始时间和结束时间
- 页面加载时从 `localStorage` 恢复修炼状态
- 计算剩余时间 = 结束时间 - 当前时间

### 3. 离线修炼支持 ✅
**问题**: 用户离线后修炼进度丢失
**修复**:
- 每次修炼开始时保存 `endTime` 时间戳到 localStorage
- 页面重新打开时检查是否有未完成的修炼
- 如果有，继续倒计时；如果没有，重新开始

---

## 🔧 核心实现

### 持久化存储机制

```javascript
// 存储键名
const CULTIVATION_STORAGE_KEY = 'cultivation_state';

// 保存修炼状态
function saveCultivationState(state) {
  localStorage.setItem(CULTIVATION_STORAGE_KEY, JSON.stringify({
    roleId: roleId,
    startTime: Date.now(),      // 修炼开始时间戳
    endTime: Date.now() + 30000  // 修炼结束时间戳（30 秒后）
  }));
}

// 加载修炼状态
function loadCultivationState() {
  const state = localStorage.getItem(CULTIVATION_STORAGE_KEY);
  if (state) {
    return JSON.parse(state);
  }
  return null;
}

// 计算剩余时间
function getRemainingTime(endTime) {
  const now = Date.now();
  return Math.max(0, Math.ceil((endTime - now) / 1000));
}
```

### 倒计时流程

```
页面加载
  ↓
loadCountdownFromServer(roleId)
  ↓
1. 检查 localStorage
   ├─ 有未完成修炼 → 恢复倒计时
   └─ 无 → 继续下一步
  ↓
2. 检查后端状态
   ├─ 有进行中的任务 → 恢复倒计时
   └─ 无 → 继续下一步
  ↓
3. 重置倒计时（30 秒）
  ↓
startCountdownTimer(roleId)
  ↓
每秒检查：
  ├─ countdownValue--
  ├─ countdownValue <= 0 ?
  │   ├─ 调用 executeCultivationCycle()
  │   │   ├─ POST /cultivation/auto
  │   │   ├─ 获得修为
  │   │   ├─ 刷新资源显示
  │   │   └─ 更新进度条
  │   ├─ clearCultivationState()
  │   ├─ 重置 countdownValue = 30
  │   └─ saveCultivationState(新的 endTime)
  └─ 继续倒计时
```

---

## 📝 测试步骤

### 测试 1: 倒计时结束后修为增加

1. 打开修炼页面：`http://127.0.0.1:5502/cultivation.html?type=immortal`
2. 观察控制台日志
3. 等待倒计时归零
4. 检查修为是否增加（应该增加 30 点）
5. 页面应该弹出提示："获得 30 修为！"

**预期日志**:
```
修炼倒计时开始：30
修炼倒计时：29
修炼倒计时：28
...
修炼倒计时：0
执行修炼周期
执行自动修炼，roleId: 1
自动修炼响应：{success: true, totalXiuwei: 30, ...}
获得修为：30
=== 修炼完成，修为已更新 ===
获得 30 修为！
修炼完成，保存新的修炼状态
```

### 测试 2: 刷新页面倒计时继续

1. 打开修炼页面
2. 等待倒计时开始（例如显示 25 秒）
3. **不刷新页面**，等待 10 秒
4. 按 `F5` 或 `Ctrl+R` 刷新页面
5. 观察倒计时是否从 15 秒左右开始（而不是 30 秒）

**预期日志**:
```
从 localStorage 加载修炼状态：{roleId: 1, startTime: 1234567890, endTime: 1234567920}
恢复持久化修炼状态，剩余时间：15 秒
修炼倒计时开始：15
```

### 测试 3: 关闭页面后重新打开

1. 打开修炼页面
2. 等待倒计时开始
3. **关闭浏览器标签页**
4. 等待 5 秒
5. 重新打开修炼页面
6. 观察倒计时是否继续（而不是重置）

**预期结果**:
- 倒计时应该从剩余时间开始（例如 25 秒）
- 修为数据应该正确（如果之前已经完成了一轮修炼）

### 测试 4: 离线修炼

1. 打开修炼页面
2. 等待倒计时开始
3. **关闭浏览器**（模拟离线）
4. 等待 1 分钟
5. 重新打开浏览器和修炼页面
6. 检查修为是否增加

**预期结果**:
- 如果离线时间超过 30 秒，应该已经完成至少一轮修炼
- 修为应该增加了 30 点（或更多，取决于离线时间）
- 倒计时应该重新开始（因为之前的修炼已完成）

---

## 🔍 调试技巧

### 查看 localStorage 数据

打开浏览器控制台，执行：

```javascript
// 查看修炼状态
console.log(JSON.parse(localStorage.getItem('cultivation_state')));

// 清除修炼状态
localStorage.removeItem('cultivation_state');

// 查看所有 localStorage
console.log(localStorage);
```

### 手动触发修炼

在控制台执行：

```javascript
// 手动执行一轮修炼
await executeCultivationCycle();

// 手动保存修炼状态
saveCultivationState({
  roleId: 1,
  startTime: Date.now(),
  endTime: Date.now() + 30000
});

// 手动清除修炼状态
clearCultivationState();
```

### 模拟倒计时结束

在控制台执行：

```javascript
// 立即结束倒计时
countdownValue = 0;
```

---

## 📊 数据结构

### localStorage 存储格式

```json
{
  "roleId": 1,
  "startTime": 1712048400000,
  "endTime": 1712048430000
}
```

**字段说明**:
- `roleId`: 角色 ID（数字）
- `startTime`: 修炼开始时间戳（毫秒）
- `endTime`: 修炼结束时间戳（毫秒）= startTime + 30000

### 后端接口响应格式

**GET /cultivation/status/{roleId}**:
```json
{
  "success": true,
  "data": {
    "hasActiveTask": true,
    "startTime": 1712048400000,
    "endTime": 1712048430000,
    "remainingTime": 25
  }
}
```

**POST /cultivation/auto**:
```json
{
  "success": true,
  "totalXiuwei": 30,
  "baseXiuwei": 30,
  "techniqueSpeedBonus": 0,
  "techniqueSpeedFlat": 0,
  "effectiveLimit": 100,
  "realmEfficiency": 1
}
```

---

## 🐛 常见问题

### Q1: 倒计时结束后没有获得修为
**原因**: 后端接口调用失败
**解决**: 
1. 检查控制台是否有错误日志
2. 确认后端服务正在运行
3. 检查网络请求是否成功

### Q2: 刷新页面后倒计时重置
**原因**: localStorage 被清除或数据过期
**解决**:
1. 检查 localStorage 是否有数据：`localStorage.getItem('cultivation_state')`
2. 如果没有，说明数据被清除或修炼已完成
3. 这是正常行为，会重新开始倒计时

### Q3: 倒计时显示负数
**原因**: 计算剩余时间时出错
**解决**:
1. 检查 `getRemainingTime()` 函数
2. 确保使用了 `Math.max(0, remaining)`
3. 刷新页面重置

### Q4: 修为不更新
**原因**: `loadRoleResources()` 没有正确执行
**解决**:
1. 检查控制台日志
2. 确认 `/resource/role/{roleId}` 接口返回正确数据
3. 检查 `resourceMap['xiuxiuwei']` 是否正确

---

## ✅ 验证清单

### 功能验证
- [ ] 倒计时每 30 秒自动执行修炼
- [ ] 倒计时结束后修为增加
- [ ] 刷新页面倒计时继续（不重置）
- [ ] 关闭页面后重新打开，倒计时继续
- [ ] localStorage 正确存储修炼状态
- [ ] 修炼完成后自动清除旧状态

### 日志验证
- [ ] 看到"从 localStorage 加载修炼状态"日志
- [ ] 看到"恢复持久化修炼状态，剩余时间：XX 秒"日志
- [ ] 看到"执行自动修炼，roleId: X"日志
- [ ] 看到"获得修为：XX"日志
- [ ] 看到"=== 修炼完成，修为已更新 ==="日志
- [ ] 看到"修炼完成，保存新的修炼状态"日志

### UI 验证
- [ ] 倒计时数字显示为黄色
- [ ] 倒计时结束时弹出"获得 XX 修为！"提示
- [ ] 修为进度条实时更新
- [ ] 突破按钮根据修为自动启用/禁用

---

## 🎯 成功标志

完成所有修复后，应该看到：

1. ✅ 倒计时每 30 秒自动归零
2. ✅ 归零时弹出"获得 XX 修为！"提示
3. ✅ 修为数值自动增加
4. ✅ 刷新页面倒计时继续（不重置为 30 秒）
5. ✅ 关闭页面后重新打开，倒计时继续
6. ✅ localStorage 中有 `cultivation_state` 数据
7. ✅ 控制台显示完整的修炼日志

祝修仙愉快！🎮✨
