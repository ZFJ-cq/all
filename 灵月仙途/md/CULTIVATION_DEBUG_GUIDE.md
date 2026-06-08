# 修炼持久化调试指南

## 🔍 问题诊断

如果刷新页面后倒计时仍然重置，请按以下步骤调试：

### 步骤 1: 检查 localStorage 是否有数据

打开浏览器控制台，执行：

```javascript
// 查看修炼状态
const state = localStorage.getItem('cultivation_state');
console.log('localStorage 中的修炼状态:', state);

if (state) {
  const parsed = JSON.parse(state);
  console.log('解析后的状态:', parsed);
  console.log('endTime:', new Date(parsed.endTime).toLocaleTimeString());
  console.log('now:', new Date().toLocaleTimeString());
  console.log('remaining:', Math.max(0, Math.ceil((parsed.endTime - Date.now()) / 1000)), '秒');
} else {
  console.log('❌ localStorage 中没有修炼状态');
}
```

**预期结果**:
```
localStorage 中的修炼状态：{"roleId":1,"startTime":1234567890,"endTime":1234567920}
解析后的状态：{roleId: 1, startTime: 1234567890, endTime: 1234567920}
endTime: 14:30:20
now: 14:30:15
remaining: 5 秒
```

### 步骤 2: 手动保存修炼状态

在控制台执行：

```javascript
// 手动保存一个修炼状态（30 秒后结束）
const endTime = Date.now() + 30000;
localStorage.setItem('cultivation_state', JSON.stringify({
  roleId: 1,
  startTime: Date.now(),
  endTime: endTime
}));

console.log('已手动保存修炼状态，endTime:', new Date(endTime).toLocaleTimeString());
console.log('请刷新页面，看倒计时是否从 30 秒开始');
```

然后刷新页面（F5），观察控制台日志。

### 步骤 3: 检查代码逻辑

在控制台执行以下代码，模拟页面加载时的检查：

```javascript
// 模拟 loadCultivationState 函数
function loadCultivationState() {
  const state = localStorage.getItem('cultivation_state');
  if (state) {
    return JSON.parse(state);
  }
  return null;
}

// 模拟 getRemainingTime 函数
function getRemainingTime(endTime) {
  const now = Date.now();
  const remaining = Math.ceil((endTime - now) / 1000);
  return Math.max(0, remaining);
}

// 检查
const savedState = loadCultivationState();
if (savedState) {
  console.log('savedState:', savedState);
  console.log('roleId:', savedState.roleId);
  console.log('endTime:', new Date(savedState.endTime).toLocaleTimeString());
  console.log('now:', new Date().toLocaleTimeString());
  
  const remaining = getRemainingTime(savedState.endTime);
  console.log('remaining:', remaining, '秒');
  
  if (remaining > 0 && remaining <= 30) {
    console.log('✅ 应该恢复倒计时，剩余时间:', remaining, '秒');
  } else if (remaining <= 0) {
    console.log('修炼已完成，应该清除状态');
  } else {
    console.log('❌ 剩余时间异常:', remaining, '秒');
  }
} else {
  console.log('❌ 没有保存的修炼状态');
}
```

### 步骤 4: 查看详细日志

刷新页面后，控制台应该显示：

```
=== 检查持久化状态 ===
savedState: {roleId: 1, startTime: 1234567890, endTime: 1234567920}
endTime: 14:30:20
now: 14:30:15
remaining: 5 秒
✅ 恢复持久化修炼状态，剩余时间：5 秒
修炼倒计时开始：5
```

如果看到的是：

```
开始新的修炼，倒计时 30 秒
```

说明持久化状态没有被正确读取或已过期。

---

## 🐛 常见问题及解决方案

### 问题 1: localStorage 中没有数据

**原因**: 
- 从来没有保存过
- 浏览器清除了 localStorage
- 使用了不同的域名/端口

**解决**:
```javascript
// 手动初始化
localStorage.setItem('cultivation_state', JSON.stringify({
  roleId: 1,
  startTime: Date.now(),
  endTime: Date.now() + 30000
}));
console.log('已初始化修炼状态');
```

### 问题 2: remaining 总是 <= 0

**原因**: 
- endTime 时间戳计算错误
- 系统时间被修改

**解决**:
```javascript
// 检查时间戳
const state = JSON.parse(localStorage.getItem('cultivation_state'));
console.log('endTime:', state.endTime);
console.log('endTime 日期:', new Date(state.endTime));
console.log('当前时间:', new Date());
console.log('差值 (秒):', (state.endTime - Date.now()) / 1000);

// 如果差值是负数，说明已过期
if (state.endTime < Date.now()) {
  console.log('修炼已过期，清除状态');
  localStorage.removeItem('cultivation_state');
}
```

### 问题 3: remaining > 30

**原因**: 
- endTime 计算错误
- 保存了错误的时间戳

**解决**:
```javascript
// 检查 endTime 是否合理
const state = JSON.parse(localStorage.getItem('cultivation_state'));
const remaining = (state.endTime - Date.now()) / 1000;

if (remaining > 30) {
  console.log('endTime 异常，剩余时间:', remaining, '秒');
  console.log('可能是保存了错误的时间戳');
  
  // 修正：设置为 30 秒后
  const newEndTime = Date.now() + 30000;
  state.endTime = newEndTime;
  localStorage.setItem('cultivation_state', JSON.stringify(state));
  console.log('已修正 endTime');
}
```

### 问题 4: 刷新页面后倒计时从 0 开始

**原因**: 
- `loadCultivationState()` 返回 null
- `getRemainingTime()` 计算错误
- 条件判断 `remaining > 0 && remaining <= 30` 不满足

**解决**:
```javascript
// 在控制台执行完整检查
const CULTIVATION_STORAGE_KEY = 'cultivation_state';

function loadCultivationState() {
  try {
    const state = localStorage.getItem(CULTIVATION_STORAGE_KEY);
    if (state) {
      const parsed = JSON.parse(state);
      console.log('加载状态成功:', parsed);
      return parsed;
    }
  } catch (e) {
    console.error('加载状态失败:', e);
  }
  console.log('加载状态失败，返回 null');
  return null;
}

function getRemainingTime(endTime) {
  const now = Date.now();
  const remaining = Math.ceil((endTime - now) / 1000);
  console.log('计算剩余时间:', remaining, '秒');
  return Math.max(0, remaining);
}

// 执行检查
const savedState = loadCultivationState();
if (savedState) {
  console.log('roleId:', savedState.roleId);
  console.log('startTime:', new Date(savedState.startTime).toLocaleTimeString());
  console.log('endTime:', new Date(savedState.endTime).toLocaleTimeString());
  
  const remaining = getRemainingTime(savedState.endTime);
  console.log('remaining:', remaining, '秒');
  console.log('条件检查:');
  console.log('  remaining > 0:', remaining > 0);
  console.log('  remaining <= 30:', remaining <= 30);
  console.log('  两者都满足:', remaining > 0 && remaining <= 30);
  
  if (remaining > 0 && remaining <= 30) {
    console.log('✅ 应该恢复倒计时');
  } else {
    console.log('❌ 不应该恢复倒计时');
  }
}
```

---

## 🛠️ 强制测试

### 测试 1: 强制保存状态并刷新

```javascript
// 1. 保存一个 25 秒后结束的状态
const endTime = Date.now() + 25000;
localStorage.setItem('cultivation_state', JSON.stringify({
  roleId: 1,
  startTime: Date.now(),
  endTime: endTime
}));

console.log('已保存修炼状态');
console.log('endTime:', new Date(endTime).toLocaleTimeString());
console.log('请在 3 秒内刷新页面（F5），看倒计时是否从 25 秒左右开始');
```

**操作**:
1. 执行上面的代码
2. 等待 2-3 秒
3. 按 F5 刷新页面
4. 观察控制台日志和倒计时显示

**预期**:
- 倒计时应该从 22-23 秒开始
- 控制台显示："✅ 恢复持久化修炼状态，剩余时间：22 秒"

### 测试 2: 清除状态并刷新

```javascript
// 清除修炼状态
localStorage.removeItem('cultivation_state');
console.log('已清除修炼状态');
console.log('请刷新页面，看是否从 30 秒重新开始');
```

**操作**:
1. 执行上面的代码
2. 刷新页面
3. 观察控制台日志

**预期**:
- 控制台显示："开始新的修炼，倒计时 30 秒"
- 倒计时从 30 秒开始

### 测试 3: 模拟修炼完成

```javascript
// 保存一个已过期的状态（1 秒前结束）
const endTime = Date.now() - 1000;
localStorage.setItem('cultivation_state', JSON.stringify({
  roleId: 1,
  startTime: endTime - 30000,
  endTime: endTime
}));

console.log('已保存过期的修炼状态');
console.log('endTime:', new Date(endTime).toLocaleTimeString());
console.log('请刷新页面，看是否清除过期状态并重新开始');
```

**操作**:
1. 执行上面的代码
2. 刷新页面
3. 观察控制台日志

**预期**:
- 控制台显示："修炼已完成，清除持久化状态"
- 然后显示："开始新的修炼，倒计时 30 秒"

---

## 📊 完整调试流程

### 第一次刷新（没有持久化状态）

**控制台应该显示**:
```
=== 检查持久化状态 ===
savedState: null
开始新的修炼，倒计时 30 秒
保存新的修炼状态，endTime: 14:30:50
修炼倒计时开始：30
```

### 等待 10 秒后刷新

**控制台应该显示**:
```
=== 检查持久化状态 ===
savedState: {roleId: 1, startTime: 1234567820, endTime: 1234567850}
endTime: 14:30:50
now: 14:30:30
remaining: 20 秒
✅ 恢复持久化修炼状态，剩余时间：20 秒
修炼倒计时开始：20
```

### 倒计时结束，自动重新开始

**控制台应该显示**:
```
=== 倒计时结束，执行修炼 ===
执行自动修炼，roleId: 1
获得修为：30
=== 修炼完成，修为已更新 ===
已清除旧的修炼状态
修炼完成，保存新的修炼状态，endTime: 1234567880
新的倒计时开始：30 秒
```

---

## ✅ 验证成功

如果看到以下日志，说明持久化成功：

1. ✅ 第一次加载："开始新的修炼，倒计时 30 秒"
2. ✅ 刷新后："✅ 恢复持久化修炼状态，剩余时间：XX 秒"
3. ✅ 倒计时结束时："=== 倒计时结束，执行修炼 ==="
4. ✅ 修为增加："获得 30 修为！"
5. ✅ 自动重新开始："新的倒计时开始：30 秒"

---

## 🎯 终极测试

**测试步骤**:

1. 打开修炼页面
2. 打开控制台
3. 等待倒计时开始
4. 等待 10 秒
5. **不要刷新**，观察控制台日志
6. 应该看到倒计时从 30 秒减少到 20 秒
7. 按 F5 刷新页面
8. 观察控制台日志
9. 应该看到："✅ 恢复持久化修炼状态，剩余时间：20 秒"
10. 倒计时应该从 20 秒左右继续

**如果失败**，请复制控制台的所有日志并发给我！

祝调试顺利！🔧✨
