# 灵月仙途 - 开场动画音频配置指南

## 🎵 音频系统概述

开场动画已集成完整的音频系统，包括：
- **1 首 BGM**（背景音乐，循环播放）
- **4 种音效**（天裂、墨滴、铃声、盖章）

---

## 📁 音频文件清单

### 1. 背景音乐 (BGM)

**文件 ID**: `bgmAudio`  
**用途**: 全程背景音乐  
**时长**: 建议 2-3 分钟循环  
**音量**: 60% (可调整)

**推荐风格**:
- **0-16s (第一幕)**: 低沉、神秘、压抑
  - 乐器：编钟、大鼓、低音弦乐
  - 氛围：天裂降临的压迫感
  
- **16-38s (第二幕)**: 悬疑、神秘
  - 乐器：箫、古琴、合成器 pad
  - 氛围：迷雾重重的未知感
  
- **38s+ (第三幕)**: 激昂、史诗、宏大
  - 乐器：全编制交响乐
  - 氛围：问道之心的使命感

**推荐曲目结构**:
```
0:00-0:16 低沉引入（天裂）
0:16-0:38 神秘展开（迷雾）
0:38-1:00 史诗高潮（入局）
1:00-2:00 循环段落
```

---

### 2. 音效 (SFX)

#### 2.1 天裂音效 (sfxCrack)
**触发时机**: 第一幕转第二幕（16 秒）  
**音量**: 90%  
**时长**: 2-3 秒  
**描述**: 天空撕裂的巨响

**音效构成**:
- 低频：雷声轰鸣（50-100Hz）
- 中频：冰块碎裂（500Hz-2kHz）
- 高频：空气撕裂（8kHz+）

**参考声音**:
- 雷神 2 黑暗世界 - 彩虹桥启动声
- 星际穿越 - 时空扭曲声
- 自然雷声 + 玻璃破碎混合

---

#### 2.2 墨滴音效 (sfxInk)
**触发时机**: 第二幕转第三幕（38 秒）  
**音量**: 50%  
**时长**: 1-2 秒  
**描述**: 墨水晕染扩散的声音

**音效构成**:
- 液体滴落声（水滴 + 墨汁质感）
- 纸张晕染声（宣纸吸水）
- 轻微的回声（空间感）

**参考声音**:
- 毛笔蘸墨在宣纸上晕开的声音
- 水滴落入平静湖面
- 墨水在清水中扩散（拟音）

---

#### 2.3 铃声 (sfxBell)
**触发时机**: Logo 出现时（第三幕文字第 6 行，约 50 秒）  
**音量**: 70%  
**时长**: 1-2 秒  
**描述**: 清脆的铃音，标志 Logo 登场

**音效构成**:
- 主频：清脆铃铛（1kHz-4kHz）
- 泛音：悠长余韵（衰减 1-2 秒）
- 混响：空间感（大厅/山谷）

**参考声音**:
- 日本风铃（furin）
- 藏传佛教颂钵
- 水晶高脚杯敲击声

---

#### 2.4 盖章音效 (sfxStamp)
**触发时机**: 点击"道友，请入局"按钮  
**音量**: 100%  
**时长**: 0.5-1 秒  
**描述**: 印章盖下的厚重声音

**音效构成**:
- 接触声：印章按压（低频闷响）
- 摩擦声：印泥摩擦（中频）
- 回弹声：轻微回声

**参考声音**:
- 古代玉玺盖章声
- 厚重书本合上声
- 拳击沙袋的闷响

---

## 🔧 音频文件配置

### HTML 结构
```html
<!-- 背景音乐 -->
<audio id="bgmAudio" loop>
  <source src="assets/audio/bgm.mp3" type="audio/mp3">
</audio>

<!-- 音效 -->
<audio id="sfxCrack">
  <source src="assets/audio/sfx-crack.mp3" type="audio/mp3">
</audio>
<audio id="sfxInk">
  <source src="assets/audio/sfx-ink.mp3" type="audio/mp3">
</audio>
<audio id="sfxBell">
  <source src="assets/audio/sfx-bell.mp3" type="audio/mp3">
</audio>
<audio id="sfxStamp">
  <source src="assets/audio/sfx-stamp.mp3" type="audio/mp3">
</audio>
```

### 文件路径
建议将音频文件放置在：
```
灵月仙途/
├── intro.html
└── assets/
    └── audio/
        ├── bgm.mp3              # 背景音乐
        ├── sfx-crack.mp3        # 天裂音效
        ├── sfx-ink.mp3          # 墨滴音效
        ├── sfx-bell.mp3         # 铃声
        └── sfx-stamp.mp3        # 盖章音效
```

---

## 🎚️ 音量平衡

### 默认音量设置
```javascript
let bgmVolume = 0.6;  // BGM: 60%
let sfxVolume = 0.8;  // 音效：80%

// 特殊音效音量
playSFX('sfxCrack', 0.9);   // 天裂：90%
playSFX('sfxInk', 0.5);     // 墨滴：50%
playSFX('sfxBell', 0.7);    // 铃声：70%
playSFX('sfxStamp', 1.0);   // 盖章：100%
```

### 混音建议
1. **BGM 不要盖过音效**：BGM 保持在 -18dB 到 -12dB
2. **音效峰值**：控制在 -6dB 到 0dB
3. **动态范围**：保留足够的动态余量

---

## 🎵 音频格式建议

### 推荐格式
- **MP3**: 128kbps CBR（兼容性最好）
- **OGG**: 128kbps（Firefox 优化）
- **AAC**: 256kbps（Safari 优化）

### 文件大小目标
- **BGM**: < 3MB（2 分钟循环）
- **音效**: < 200KB（每个）
- **总大小**: < 4MB

### 编码参数
```
BGM:
- 格式：MP3
- 比特率：128kbps CBR
- 采样率：44.1kHz
- 声道：立体声

音效:
- 格式：MP3
- 比特率：96kbps CBR
- 采样率：44.1kHz
- 声道：单声道（节省空间）
```

---

## 🎬 音频时间轴

```
0s      BGM 开始（低沉引入）
2s      第一列文字出现
16s     SFX: 天裂 (90%) → 转场
16.5s   第二幕文字开始
38s     SFX: 墨滴 (50%) → 转场
38.5s   第三幕文字开始
50s     SFX: 铃声 (70%) → Logo 闪耀
42s+    等待用户点击
点击时  SFX: 盖章 (100%) → 跳转
```

---

## 🔊 音频控制功能

### 静音切换
```javascript
function toggleAudio() {
  // 点击音频按钮切换静音
  // 图标：🎵 (静音) ↔ 🔊 (播放)
}
```

### 音量控制
```javascript
let bgmVolume = 0.6;  // BGM 音量 60%
let sfxVolume = 0.8;  // 音效音量 80%
```

### 浏览器兼容性
- ✅ Chrome: 完全支持
- ✅ Firefox: 完全支持
- ✅ Safari: 需要用户交互后才能播放
- ✅ 微信内置：需要用户交互

---

## 🎯 音频资源推荐

### 免费资源网站
1. **Freesound** (https://freesound.org/)
   - 天裂：搜索 "thunder crack", "sky tear"
   - 墨滴：搜索 "ink drop", "water drop"
   - 铃声：搜索 "wind chime", "bell"
   - 盖章：搜索 "thud", "book close"

2. **OpenGameArt** (https://opengameart.org/)
   - 古风 BGM
   - 中国风音效

3. **YouTube Audio Library**
   - 免费古风音乐
   - 需标注来源

### 付费资源网站
1. **AudioJungle** (https://audiojungle.net/)
   - 高质量古风 BGM ($10-30)
   
2. **Epidemic Sound** (https://www.epidemicsound.com/)
   - 订阅制，海量资源

3. **Artlist** (https://artlist.io/)
   - 订阅制，商用授权

### AI 生成工具
1. **AIVA** (https://www.aiva.ai/)
   - AI 作曲古风音乐
   
2. **Soundraw** (https://soundraw.io/)
   - AI 生成定制化 BGM

---

## 📱 移动端优化

### 自动播放策略
由于移动端浏览器限制：
1. **首次点击初始化**：用户首次点击任何地方时初始化 AudioContext
2. **静音启动**：BGM 默认静音，用户点击音频按钮后播放
3. **音量渐变**：BGM 淡入（0 → 60%，1 秒内）

### 性能优化
1. **预加载**：
   ```html
   <link rel="preload" href="assets/audio/bgm.mp3" as="audio">
   ```

2. **按需加载**：
   - BGM 优先加载
   - 音效延迟加载

3. **内存管理**：
   - 音效播放后释放
   - BGM 循环使用同一实例

---

## 🎼 BGM 创作建议

### 结构建议
```
Intro (0:00-0:16)
- 低沉弦乐 pad
- 零星编钟点缀
- 营造压抑氛围

Build-up (0:16-0:38)
- 加入箫/笛子旋律
- 古琴分解和弦
- 悬疑感增强

Climax (0:38-1:00)
- 全编制弦乐
- 大鼓节奏
- 史诗感爆发

Loop (1:00-2:00)
- 回到 Intro 主题
- 无缝循环点
```

### 乐器配置
- **弦乐组**: 小提琴、中提琴、大提琴、低音提琴
- **民族乐器**: 古琴、箫、笛子、琵琶
- **打击乐**: 大鼓、编钟、锣
- **合成器**: Pad、Bass、FX

---

## ✅ 检查清单

### 音频文件
- [ ] BGM 文件准备（2-3 分钟循环）
- [ ] 天裂音效（2-3 秒）
- [ ] 墨滴音效（1-2 秒）
- [ ] 铃声（1-2 秒）
- [ ] 盖章音效（0.5-1 秒）

### 文件配置
- [ ] 文件放入 `assets/audio/` 目录
- [ ] 更新 HTML 中的 src 路径
- [ ] 测试所有音频加载

### 功能测试
- [ ] BGM 循环播放正常
- [ ] 音效触发时机准确
- [ ] 静音切换正常
- [ ] 音量平衡合适

### 兼容性测试
- [ ] Chrome 桌面版
- [ ] Chrome 移动版
- [ ] Safari iOS
- [ ] 微信内置浏览器

---

## 🎯 使用示例

### 添加音频文件后
```html
<!-- 更新 src 路径 -->
<audio id="bgmAudio" loop>
  <source src="assets/audio/bgm.mp3" type="audio/mp3">
</audio>
<audio id="sfxCrack">
  <source src="assets/audio/sfx-crack.mp3" type="audio/mp3">
</audio>
<!-- ... 其他音效 ... -->
```

### 调整音量
```javascript
// 在 JavaScript 中调整
let bgmVolume = 0.5;  // 降低 BGM 到 50%
let sfxVolume = 0.9;  // 提高音效到 90%
```

### 自定义触发时机
```javascript
// 在任意时刻播放音效
playSFX('sfxBell', 0.8);
```

---

**文档版本**: v1.0.0  
**更新时间**: 2026-03-24  
**音频系统**: 已集成，待添加音频文件
