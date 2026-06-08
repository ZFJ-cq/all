# 弹窗系统使用指南

## 📋 弹窗类型

### 1. 通用弹窗 (actionModal)
用于显示各种信息和确认操作。

**使用方法：**
```javascript
openModal('assembly');  // 打开预设模块
openModal('tasks');
openModal('library');
```

**预设模块：**
- `assembly` - 议事殿
- `tasks` - 杂务堂
- `library` - 藏经阁
- `default` - 默认提示

---

### 2. 成功提示弹窗 (successModal)
显示操作成功的提示。

**使用方法：**
```javascript
showSuccess('任务完成', '您获得了 1000 贡献值奖励');
```

**参数：**
- `title` (可选): 标题，默认"操作成功"
- `message` (可选): 详细信息

**示例：**
```javascript
showSuccess();  // 使用默认文本
showSuccess('升级成功');  // 自定义标题
showSuccess('购买成功', '您已购买聚气丹 x1');  // 完整参数
```

---

### 3. 警告确认弹窗 (confirmModal)
需要用户二次确认的重要操作。

**使用方法：**
```javascript
showConfirm('确定要叛出宗门吗？', () => {
    // 确认后的操作
    leaveClan();
});
```

**参数：**
- `message`: 提示信息
- `onConfirm`: 确认回调函数
- `options` (可选): 额外配置

**示例：**
```javascript
// 简单确认
showConfirm('确定要删除吗？', () => {
    deleteItem();
});

// 重要操作确认
showConfirm('此操作将清空所有贡献值，确定继续？', () => {
    clearContribution();
}, {
    danger: true
});
```

---

### 4. 信息展示弹窗 (infoModal)
展示较长的信息内容。

**使用方法：**
```javascript
showInfo('宗门公告', `
    <div style="padding: 20px;">
        <h3>宗门大比通知</h3>
        <p>时间：三日后</p>
        <p>地点：演武场</p>
        <p>奖励：第一名可获得 10000 贡献值</p>
    </div>
`);
```

**参数：**
- `title`: 标题
- `content`: HTML 内容

---

### 5. 加载提示 (loadingToast)
显示加载中的状态。

**使用方法：**
```javascript
showLoading('正在保存...');

// 执行异步操作
await saveData();

hideLoading();
```

**参数：**
- `text` (可选): 加载提示文本，默认"加载中..."

---

### 6. 通知提示 (showNotification)
顶部显示的通知消息。

**使用方法：**
```javascript
showNotification('操作成功', 3000, 'success');
```

**参数：**
- `message`: 通知内容
- `duration` (可选): 显示时长（毫秒），默认 3000
- `type` (可选): 类型，支持 'success' | 'error' | 'info'，默认 'info'

**示例：**
```javascript
// 成功通知
showNotification('保存成功', 2000, 'success');

// 错误通知
showNotification('网络错误，请重试', 3000, 'error');

// 普通通知
showNotification('正在同步数据...');
```

---

## 🎨 样式定制

### 修改弹窗尺寸
```css
.modal-container.modal-sm { max-width: 300px; }  /* 小尺寸 */
.modal-container.modal-md { max-width: 350px; }  /* 中尺寸 */
.modal-container.modal-lg { max-width: 500px; }  /* 大尺寸 */
```

### 自定义弹窗颜色
```css
/* 成功弹窗 - 绿色主题 */
.success-modal .modal-container {
    border-color: #4CAF50;
    box-shadow: 0 0 40px rgba(76, 175, 80, 0.4);
}

/* 警告弹窗 - 橙色主题 */
.warning-modal .modal-container {
    border-color: #ff9800;
    box-shadow: 0 0 40px rgba(255, 152, 0, 0.4);
}

/* 错误弹窗 - 红色主题 */
.error-modal .modal-container {
    border-color: #ff4444;
    box-shadow: 0 0 40px rgba(255, 68, 68, 0.4);
}
```

---

## 📝 最佳实践

### 1. 选择合适的弹窗类型
- ✅ **成功提示**：操作完成后使用 `showSuccess`
- ✅ **重要确认**：危险操作使用 `showConfirm`
- ✅ **信息展示**：复杂内容使用 `showInfo`
- ✅ **简单通知**：轻量提示使用 `showNotification`

### 2. 避免弹窗滥用
```javascript
// ❌ 不推荐：连续弹出多个弹窗
showSuccess('保存成功');
showNotification('数据已同步');
showInfo('提示', '请刷新页面');

// ✅ 推荐：只使用一个最合适的弹窗
showSuccess('保存成功，数据已同步');
```

### 3. 异步操作处理
```javascript
// ✅ 推荐：显示加载状态
async function saveData() {
    showLoading('正在保存...');
    try {
        await api.save();
        hideLoading();
        showSuccess('保存成功');
    } catch (error) {
        hideLoading();
        showNotification('保存失败', 3000, 'error');
    }
}
```

### 4. 确认回调简洁
```javascript
// ❌ 不推荐：回调函数过长
showConfirm('确定吗？', () => {
    // 50 行代码...
});

// ✅ 推荐：使用独立函数
showConfirm('确定吗？', handleConfirm);

function handleConfirm() {
    // 处理逻辑
}
```

---

## 🔄 关闭弹窗

### 手动关闭
```javascript
closeModal();        // 关闭通用弹窗
closeSuccessModal(); // 关闭成功弹窗
closeConfirmModal(); // 关闭确认弹窗
closeInfoModal();    // 关闭信息弹窗
hideLoading();       // 隐藏加载提示
```

### 自动关闭
通知提示会在指定时间后自动关闭：
```javascript
showNotification('消息', 3000);  // 3 秒后自动关闭
```

---

## 🎯 实际应用场景

### 场景 1：提交表单
```javascript
async function submitForm() {
    showLoading('正在提交...');
    
    try {
        const result = await api.submit(formData);
        hideLoading();
        showSuccess('提交成功', `您获得了 ${result.reward} 贡献值`);
    } catch (error) {
        hideLoading();
        showNotification('提交失败，请重试', 3000, 'error');
    }
}
```

### 场景 2：删除操作
```javascript
function deleteItem(id) {
    showConfirm('确定要删除此项吗？此操作不可恢复。', async () => {
        showLoading('删除中...');
        await api.delete(id);
        hideLoading();
        showSuccess('删除成功');
        refreshList();
    });
}
```

### 场景 3：购买确认
```javascript
async function buyItem(item) {
    showConfirm(
        `确定购买 ${item.name} 吗？\n消耗：${item.price} 贡献值`,
        async () => {
            showLoading('购买中...');
            const success = await api.buy(item.id);
            hideLoading();
            if (success) {
                showSuccess('购买成功', `获得 ${item.name}`);
                updateBalance();
            } else {
                showNotification('余额不足', 3000, 'error');
            }
        }
    );
}
```

---

## 📱 移动端优化

弹窗系统已针对移动端优化：
- ✅ 响应式尺寸
- ✅ 触摸友好的按钮
- ✅ 防止误触设计
- ✅ 流畅的动画效果

---

## 🔧 故障排除

### 弹窗无法关闭
检查是否正确调用了关闭函数：
```javascript
// ✅ 正确
closeModal();

// ❌ 错误 - 拼写错误
closeModl();
```

### 弹窗内容不显示
确保 HTML 结构正确：
```javascript
// ✅ 正确
showInfo('标题', '<div>内容</div>');

// ❌ 错误 - 缺少闭合标签
showInfo('标题', '<div>内容');
```

### 回调函数不执行
确保传递的是函数引用：
```javascript
// ✅ 正确
showConfirm('确定吗？', handleConfirm);

// ❌ 错误 - 立即执行
showConfirm('确定吗？', handleConfirm());
```

---

**版本**: v2.0  
**更新时间**: 2026-03-11
