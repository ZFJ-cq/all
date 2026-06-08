# 灵月仙途 - 音频快速开始指南

## 🚀 5 分钟快速配置

### 步骤 1: 准备音频文件（或占位文件）

创建以下文件结构：
```
灵月仙途/
├── intro.html
└── assets/
    └── audio/
        ├── bgm.mp3              # 可先用空文件占位
        ├── sfx-crack.mp3        # 可先用空文件占位
        ├── sfx-ink.mp3          # 可先用空文件占位
        ├── sfx-bell.mp3         # 可先用空文件占位
        └── sfx-stamp.mp3        # 可先用空文件占位
```

**快速创建占位文件**（终端命令）：
```bash
cd /Users/macbook/前端项目/灵月仙途
mkdir -p assets/audio
touch assets/audio/bgm.mp3
touch assets/audio/sfx-crack.mp3
touch assets/audio/sfx-ink.mp3
touch assets/audio/sfx-bell.mp3
touch assets/audio/sfx-stamp.mp3
```

### 步骤 2: 更新 HTML 中的音频路径

在 `intro.html` 中找到音频标签，更新 `src` 属性：

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

### 步骤 3: 测试音频系统

1. 打开浏览器访问：`http://localhost:8080/intro.html`
2. 点击右上角的音频按钮（🎵）
3. 如果有音频文件，图标会变为 🔊 并开始播放
4. 点击任意位置触发首次交互（初始化音频）

---

## 🎵 免费音频资源推荐

### 方案 A: 使用免费资源（推荐新手）

#### 1. Freesound.org
**网址**: https://freesound.org/

**搜索关键词**:
- **天裂**: `thunder crack`, `sky tear`, `lightning boom`
  - 推荐：https://freesound.org/people/InspectorJ/sounds/411107/
  
- **墨滴**: `ink drop`, `water drop`, `liquid drop`
  - 推荐：https://freesound.org/people/InspectorJ/sounds/392217/
  
- **铃声**: `wind chime`, `chinese bell`, `temple bell`
  - 推荐：https://freesound.org/people/InspectorJ/sounds/411094/
  
- **盖章**: `book close`, `thud`, `wooden hit`
  - 推荐：https://freesound.org/people/InspectorJ/sounds/411119/

**使用方法**:
1. 注册免费账号
2. 下载喜欢的音效（WAV 或 MP3 格式）
3. 转换为 MP3（如果需要）
4. 重命名并放入 `assets/audio/` 目录

#### 2. YouTube Audio Library
**网址**: https://www.youtube.com/audiolibrary/

**搜索**: `Chinese`, `Asian`, `Meditation`, `Epic`

**推荐曲目类型**:
- Chinese Traditional
- Asian Instrumental
- Cinematic Ambient

#### 3. OpenGameArt
**网址**: https://opengameart.org/

**搜索**: `Chinese BGM`, `Asian music`

---

### 方案 B: AI 生成（推荐个性化需求）

#### 1. AIVA (AI 作曲)
**网址**: https://www.aiva.ai/

**步骤**:
1. 注册免费账号
2. 选择风格：`Cinematic`, `Asian`
3. 生成 2-3 分钟曲目
4. 下载 MP3 格式

**提示词示例**:
```
Chinese ancient style, epic cinematic, 
traditional instruments (guqin, xiao, drums), 
mysterious intro building to heroic climax, 
2 minutes loop
```

#### 2. Soundraw (AI 生成)
**网址**: https://soundraw.io/

**步骤**:
1. 选择风格：`World`, `Cinematic`
2. 选择情绪：`Mysterious`, `Epic`
3. 选择时长：2-3 分钟
4. 生成并下载

#### 3. Boomy (快速生成)
**网址**: https://boomy.com/

**特点**: 30 秒快速生成，适合测试

---

### 方案 C: 付费资源（推荐商用项目）

#### 1. AudioJungle
**网址**: https://audiojungle.net/

**搜索**: `Chinese game BGM`

**价格**: $10-30/首

**推荐**:
- "Chinese Traditional Music Pack" - $19
- "Epic Chinese Trailer" - $15

#### 2. Epidemic Sound
**网址**: https://www.epidemicsound.com/

**价格**: $15/月（订阅制）

**优势**: 海量资源，商用授权

---

## 🎼 BGM 结构建议

### 完整结构（42 秒循环）

```
0:00 - 0:16  【第一幕：低沉神秘】
- 编钟点缀（每 4 秒一次）
- 低音弦乐 pad（持续）
- 氛围：压抑、沉重

0:16 - 0:38  【第二幕：悬疑展开】
- 箫/笛子主旋律进入
- 古琴分解和弦
- 加入轻微打击乐
- 氛围：神秘、未知

0:38 - 0:50  【第三幕：史诗高潮】
- 全编制弦乐
- 大鼓节奏（每拍一次）
- 琵琶/古筝快速演奏
- 氛围：激昂、宏大

0:50 - 1:00  【Logo 闪耀】
- 清脆铃声（50 秒）
- 音乐骤停（51 秒）
- 余韵回响（52-60 秒）

1:00 - 2:00  【循环段落】
- 无缝回到 0:00
```

### 简化结构（测试用）

如果找不到完美匹配的 BGM，可以使用：
```
单段循环（2 分钟）
- 中等速度（80-100 BPM）
- 中国风乐器
- 中等情绪（不过于激烈）
- 无缝循环点
```

---

## 🔊 音效制作（DIY 方案）

### 天裂音效
**材料**: 雷声音效 + 玻璃破碎声

**步骤**:
1. 下载雷声音效（Freesound）
2. 下载玻璃破碎声（Freesound）
3. 使用 Audacity（免费）混合：
   - 轨道 1: 雷声（100% 音量）
   - 轨道 2: 玻璃破碎（50% 音量，延迟 0.5 秒）
4. 添加混响效果
5. 导出为 MP3

### 墨滴音效
**材料**: 水滴声 + 纸张摩擦声

**步骤**:
1. 录制水滴声（手机录音即可）
2. 下载宣纸摩擦声（或录制）
3. Audacity 混合：
   - 水滴（80% 音量）
   - 纸张（30% 音量，淡入淡出）
4. 添加回声效果
5. 导出为 MP3

### 铃声
**材料**: 风铃声或水晶杯

**步骤**:
1. 录制风铃/水晶杯声音
2. Audacity 处理：
   - 提高高频（2kHz-8kHz +3dB）
   - 添加长混响（3 秒衰减）
3. 导出为 MP3

### 盖章音效
**材料**: 厚重书本

**步骤**:
1. 录制书本合上的声音
2. Audacity 处理：
   - 增强低频（100Hz 以下 +6dB）
   - 压缩动态（4:1 压缩比）
3. 导出为 MP3

---

## 🎯 测试清单

### 基础测试
- [ ] 所有音频文件可播放
- [ ] BGM 循环正常
- [ ] 音效触发时机准确
- [ ] 静音按钮工作正常

### 音量平衡测试
- [ ] BGM 不盖过音效（60% 音量）
- [ ] 天裂音效够震撼（90% 音量）
- [ ] 墨滴音效轻柔（50% 音量）
- [ ] 铃声清脆不刺耳（70% 音量）
- [ ] 盖章音效厚重（100% 音量）

### 兼容性测试
- [ ] Chrome 桌面版
- [ ] Chrome 移动版（Android）
- [ ] Safari（iOS）
- [ ] 微信内置浏览器

---

## 📱 移动端注意事项

### 自动播放限制
**问题**: 移动端浏览器禁止自动播放音频

**解决方案**:
1. 默认静音（代码已实现）
2. 用户点击音频按钮后播放
3. 首次点击页面任何位置初始化 AudioContext

### 流量优化
**建议**:
- BGM 使用 128kbps（不要超过 192kbps）
- 音效使用 96kbps
- 总音频大小控制在 5MB 以内

### 性能优化
**建议**:
- 使用 MP3 格式（兼容性最好）
- 音效长度控制在 3 秒内
- BGM 使用循环（不要一次性加载长音频）

---

## 🎵 音频文件规格

### BGM 规格
```
格式：MP3
比特率：128kbps CBR
采样率：44.1kHz
声道：立体声
时长：2-3 分钟（循环）
文件大小：< 3MB
```

### 音效规格
```
格式：MP3
比特率：96kbps CBR
采样率：44.1kHz
声道：单声道（节省空间）
时长：< 3 秒
文件大小：< 200KB
```

---

## 🔧 故障排查

### 问题 1: 音频不播放
**原因**: 浏览器自动播放策略限制

**解决**:
1. 确保用户已点击页面
2. 检查音频文件路径是否正确
3. 查看浏览器控制台错误信息

### 问题 2: 音效不同步
**原因**: 音频文件加载延迟

**解决**:
1. 预加载音频文件：
   ```html
   <link rel="preload" href="assets/audio/sfx-crack.mp3" as="audio">
   ```
2. 在页面加载时预加载所有音效

### 问题 3: 音量太小
**原因**: 音频文件本身音量低

**解决**:
1. 使用 Audacity 提高音量（标准化到 -1dB）
2. 调整代码中的音量设置：
   ```javascript
   let bgmVolume = 0.8;  // 提高到 80%
   playSFX('sfxCrack', 1.0);  // 提高到 100%
   ```

---

## 📚 学习资源

### Audacity 教程
- 官网：https://www.audacityteam.org/
- 中文教程：https://www.audacityteam.org/about/tutorial/

### 音频理论基础
- 知乎专栏：音频后期入门
- B 站：Audacity 教程

### 游戏音频设计
- 书籍：《游戏音频设计》
- 网站：https://www.gamedeveloper.com/audio

---

## ✅ 快速检查清单

### 最低配置（能响就行）
- [ ] 1 首 BGM（任意古风音乐）
- [ ] 4 个音效（可用免费资源）
- [ ] 文件路径正确
- [ ] 静音功能正常

### 标准配置（良好体验）
- [ ] BGM 符合情绪变化
- [ ] 音效质量清晰
- [ ] 音量平衡合适
- [ ] 触发时机准确

### 完美配置（专业水准）
- [ ] 定制 BGM（AI 生成或购买）
- [ ] 定制音效（专业制作）
- [ ] 完整混音母带处理
- [ ] 多版本适配（不同设备）

---

**最后更新**: 2026-03-24  
**适用版本**: v1.3.0（带音频系统）  
**难度**: ⭐⭐☆☆☆（入门级）
