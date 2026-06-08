# 灵月仙途 - 语音朗读功能说明

## 🎤 功能概述

开场动画现已支持**文字语音朗读**功能，使用浏览器原生的 Web Speech API 实现，无需额外音频文件。

---

## ✨ 主要特性

### 1. 语音控制按钮
**位置**: 左上角，音频按钮右侧  
**图标**: 
- 🔇 (灰色) - 语音关闭
- 🔊 (金色) - 语音开启

**操作**: 点击切换语音朗读开关

### 2. 自动朗读场景文字
- **第一幕**: 鸿蒙纪元三千载...（10 列竖排文字）
- **第二幕**: 传闻飞升者...（11 行横排文字）
- **第三幕**: 路在脚下，道在心中...（7 行居中文字）

### 3. 场景切换自动继续
转场后自动朗读新场景的文字内容

---

## 🎛️ 使用方法

### 方式一：手动开启
1. 点击左上角 **语音按钮**（🔇）
2. 图标变为 **🔊**（金色）
3. 立即开始朗读当前场景文字

### 方式二：自动开启（需修改代码）
```javascript
// 在 playIntro() 函数开始处添加
isVoiceEnabled = true;
document.getElementById('voiceBtn').textContent = '🔊';
document.getElementById('voiceBtn').style.color = '#e6c749';
```

---

## 🗣️ 语音参数

### 语速设置（rate）
| 场景 | 语速 | 说明 |
|------|------|------|
| 第一幕 | 0.7 | 缓慢庄重 |
| 第二幕 | 0.75 | 中等悬疑 |
| 第三幕 | 0.8 | 稍快激昂 |

### 音调设置（pitch）
| 场景 | 音调 | 说明 |
|------|------|------|
| 第一幕 | 0.9 | 低沉 |
| 第二幕 | 1.0 | 标准 |
| 第三幕 | 1.1 | 稍高 |

### 音量
固定为 100%（不受 BGM 静音影响）

---

## 🔊 语音质量

### 浏览器支持

| 浏览器 | 支持度 | 中文语音 |
|--------|--------|----------|
| Chrome 90+ | ✅ 完美 | ✅ 有 |
| Firefox 88+ | ✅ 良好 | ✅ 有 |
| Safari 14+ | ✅ 良好 | ✅ 有（质量最好） |
| Edge 90+ | ✅ 完美 | ✅ 有 |
| 微信内置 | ⚠️ 部分支持 | 取决于系统 |

### 语音质量排名
1. **Safari (iOS/macOS)** - 苹果原生 TTS，最自然
2. **Chrome** - Google TTS，清晰标准
3. **Edge** - Microsoft TTS，较好
4. **Firefox** - 系统依赖，一般

---

## 🎯 朗读内容

### 第一幕：乱世之始（16 秒）
```
鸿蒙纪元三千载，天裂地崩九气散，仙尊化阵难挡厄，
冬夏无序冰封城，王朝更迭如走马，宗门林立似繁星，
你生东华洲一角，本是凡尘微末身，偶得灵月残碎片，
窥见惊天大秘密
```
**时长**: 约 14-16 秒

### 第二幕：迷雾重重（22 秒）
```
传闻飞升者，皆入三千灵域迷局。南宫氏欲铸神器逆天改命。
慕容氏誓以杀伐破障。百里氏独守古卷沉默不语。
是天命不可违？还是有人在编织谎言？
丹炉中那一抹异香能解百毒？铁锤下那一缕器灵能破万古？
阵图上那一笔玄机能困神魔？符箓间那一道金光能换生死？
真相，藏在你的指尖技艺之中
```
**时长**: 约 20-22 秒

### 第三幕：问道之心（14 秒）
```
路在脚下，道在心中。独善其身，逍遥山水，结庐而居？
广收门徒，建立圣地，率领万宗？
集齐九道鸿蒙紫气，重开天门？改写命运，直面混沌。
灵月已升，仙途始开。道友，请入局
```
**时长**: 约 12-14 秒

---

## 🔧 自定义配置

### 调整语速
```javascript
function speakText(text, rate = 0.8, pitch = 1.0) {
  currentUtterance.rate = rate;  // 修改这里：0.5-1.5
  currentUtterance.pitch = pitch;
  // ...
}
```

**推荐值**:
- 更快：1.0-1.2
- 标准：0.8-1.0
- 更慢：0.5-0.7

### 调整音调
```javascript
currentUtterance.pitch = 1.2;  // 更高音调（0-2）
```

**推荐值**:
- 低沉：0.7-0.9
- 标准：1.0-1.1
- 高昂：1.2-1.4

### 更改语音
```javascript
// 在 speakText 函数中
const voices = synth.getVoices();

// 查看所有可用语音
console.log(voices);

// 选择特定语音
const specificVoice = voices.find(voice => voice.name.includes('Ting-Ting'));
if (specificVoice) {
  currentUtterance.voice = specificVoice;
}
```

**常见中文语音名称**:
- `Ting-Ting` (Safari, 女声)
- `Sinji` (Safari, 女声)
- `Hui Hui` (Chrome, 女声)
- `Kangkang` (Chrome, 男声)

---

## 📱 移动端注意事项

### iOS Safari
- ✅ 完美支持
- ✅ 语音质量高
- ⚠️ 需要用户交互后才能播放
- 💡 建议：用户点击任意位置后开启

### Android Chrome
- ✅ 支持良好
- ⚠️ 语音质量取决于系统
- ⚠️ 部分国产手机可能不支持

### 微信内置浏览器
- ⚠️ 部分支持
- ⚠️ 依赖系统 TTS 引擎
- 💡 建议：作为可选功能，不强求

---

## 🎵 与 BGM 的配合

### 音量平衡
```javascript
let bgmVolume = 0.5;  // BGM 降低到 50%
let sfxVolume = 0.7;  // 音效 70%
// 语音固定 100%
```

### 推荐配置
1. **仅 BGM**: 沉浸式体验
2. **仅语音**: 清晰听文案
3. **BGM + 语音**: 最佳体验（BGM 50%）
4. **全开**: BGM 40% + 语音 100% + 音效 70%

---

## 🐛 故障排查

### 问题 1: 点击语音按钮无反应
**原因**: 浏览器不支持 Web Speech API

**检测**:
```javascript
if (!window.speechSynthesis) {
  alert('您的浏览器不支持语音朗读功能');
}
```

**解决**: 更换浏览器（推荐 Chrome/Safari）

### 问题 2: 没有声音
**可能原因**:
1. 系统静音
2. 浏览器禁止自动播放
3. 语音包未安装（某些 Android）

**解决**:
1. 检查系统音量
2. 点击页面任意位置
3. 安装 Google TTS 或系统 TTS 引擎

### 问题 3: 语音是机器音
**原因**: 使用了系统默认语音

**解决**: 
```javascript
// 选择质量更好的语音
const voices = synth.getVoices();
const goodVoice = voices.find(v => v.lang === 'zh-CN' && v.name.includes('Ting'));
```

### 问题 4: 朗读中断
**原因**: 场景切换时被打断

**解决**: 代码已自动处理，转场后 1 秒继续朗读

---

## 🎯 最佳实践

### 使用建议
1. **首次体验**: 关闭语音，专注观看动画
2. **二次体验**: 开启语音，理解文案细节
3. **无障碍**: 为视障用户提供完整体验

### 性能优化
1. **预加载语音**: 页面加载时获取语音列表
2. **延迟朗读**: 等文字完全显示后再读
3. **清理资源**: 场景切换时停止旧朗读

### 用户体验
1. **默认关闭**: 让用户主动选择
2. **清晰标识**: 🔇/🔊图标直观
3. **随时控制**: 可随时开关

---

## 📊 技术实现

### Web Speech API
```javascript
// 创建语音
const utterance = new SpeechSynthesisUtterance(text);

// 设置参数
utterance.lang = 'zh-CN';     // 中文
utterance.rate = 0.8;         // 语速
utterance.pitch = 1.0;        // 音调
utterance.volume = 1.0;       // 音量

// 选择语音
const voices = synth.getVoices();
utterance.voice = voices.find(v => v.lang.includes('zh'));

// 播放
synth.speak(utterance);
```

### 兼容性检测
```javascript
if ('speechSynthesis' in window) {
  // 支持
} else {
  // 不支持
}
```

---

## 🎨 未来优化方向

### 1. 情感语音
- 第一幕：沉重悲伤
- 第二幕：悬疑神秘
- 第三幕：激昂振奋

### 2. 多语音切换
- 男声/女声选择
- 老年/中年/青年音色

### 3. 字幕同步
- 文字高亮跟随朗读
- 逐字/逐句高亮

### 4. 离线支持
- 预录制专业配音
- 作为 TTS 的备选方案

---

## ✅ 检查清单

### 功能测试
- [x] 语音按钮点击切换
- [x] 图标状态正确
- [x] 第一幕朗读正常
- [x] 第二幕朗读正常
- [x] 第三幕朗读正常
- [x] 场景切换继续朗读
- [x] 关闭语音立即停止

### 兼容性测试
- [ ] Chrome 桌面版
- [ ] Chrome 移动版
- [ ] Safari iOS
- [ ] Safari macOS
- [ ] Firefox
- [ ] Edge
- [ ] 微信内置

---

## 📚 参考资料

### Web Speech API
- MDN: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
- W3C: https://www.w3.org/TR/speech-api/

### 语音质量优化
- Google Cloud TTS: https://cloud.google.com/text-to-speech
- Azure Cognitive Services: https://azure.microsoft.com/zh-cn/services/cognitive-services/text-to-speech/

---

**功能版本**: v1.4.0  
**实现方式**: Web Speech API (TTS)  
**更新日期**: 2026-03-24  
**浏览器支持**: Chrome 90+, Safari 14+, Firefox 88+
