<template>
  <div class="home-page">
    <div class="home-bg"></div>
    <div class="home-content">
      <div class="title-section">
        <h1 class="game-title">
          <span class="title-cn">包公断案</span>
          <span class="title-sub">—— 明察秋毫，铁面无私 ——</span>
        </h1>
        <p class="game-desc">
          穿越千年，化身包青天，亲历千古奇案。<br />
          搜集证据、审讯嫌犯、还原真相，还世间一个公道！
        </p>
      </div>
      <div class="menu-section">
        <button class="menu-btn primary" @click="$router.push('/cases')">
          <span class="btn-icon">⚖️</span>
          <span>开始断案</span>
        </button>
        <button class="menu-btn" @click="$router.push('/achievements')">
          <span class="btn-icon">🏆</span>
          <span>成就殿堂</span>
        </button>
        <button class="menu-btn" @click="toggleSettings">
          <span class="btn-icon">⚙️</span>
          <span>游戏设置</span>
        </button>
      </div>
      <div v-if="showSettings" class="settings-panel">
        <div class="setting-item">
          <span>音效</span>
          <button class="toggle-btn" :class="{ active: settings.soundEnabled }" @click="settings.soundEnabled = !settings.soundEnabled; save()">
            {{ settings.soundEnabled ? '开' : '关' }}
          </button>
        </div>
        <div class="setting-item">
          <span>文字速度</span>
          <select v-model="settings.textSpeed" @change="save">
            <option value="slow">慢</option>
            <option value="normal">正常</option>
            <option value="fast">快</option>
          </select>
        </div>
        <div class="setting-actions">
          <button class="small-btn" @click="exportData">导出存档</button>
          <button class="small-btn danger" @click="importData">导入存档</button>
          <button class="small-btn danger" @click="clearData">清除数据</button>
        </div>
        <input type="file" ref="importInput" accept=".json" style="display:none" @change="handleImport" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { getSettings, saveSettings, exportAllData, importAllData, clearAllData } from '@/utils/storage'

const showSettings = ref(false)
const importInput = ref(null)
const settings = reactive(getSettings())

function save() {
  saveSettings({ ...settings })
}

function toggleSettings() {
  showSettings.value = !showSettings.value
}

function exportData() {
  const data = exportAllData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `包公断案存档_${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function importData() {
  importInput.value.click()
}

function handleImport(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result)
      if (importAllData(data)) {
        alert('存档导入成功！')
      } else {
        alert('存档格式无效')
      }
    } catch {
      alert('存档文件解析失败')
    }
  }
  reader.readAsText(file)
}

function clearData() {
  if (confirm('确定要清除所有游戏数据吗？此操作不可恢复！')) {
    clearAllData()
    alert('数据已清除')
  }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.home-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(201, 169, 110, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(201, 169, 110, 0.1) 0%, transparent 50%),
    linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.home-bg::before {
  content: '';
  position: absolute;
  top: 50px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(201, 169, 110, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.5; }
  50% { transform: translateX(-50%) scale(1.2); opacity: 0.8; }
}

.home-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 40px 20px;
}

.title-section {
  margin-bottom: 60px;
}

.game-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.title-cn {
  font-size: 52px;
  font-weight: bold;
  color: #c9a96e;
  text-shadow: 0 2px 20px rgba(201, 169, 110, 0.4);
  letter-spacing: 12px;
}

.title-sub {
  font-size: 14px;
  color: rgba(201, 169, 110, 0.6);
  letter-spacing: 6px;
}

.game-desc {
  margin-top: 24px;
  font-size: 15px;
  color: rgba(224, 213, 193, 0.7);
  line-height: 2;
}

.menu-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.menu-btn {
  width: 240px;
  padding: 16px 32px;
  border: 1px solid rgba(201, 169, 110, 0.3);
  border-radius: 12px;
  background: rgba(201, 169, 110, 0.08);
  color: #e0d5c1;
  font-size: 18px;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.3s;
}

.menu-btn:hover {
  background: rgba(201, 169, 110, 0.15);
  border-color: #c9a96e;
  transform: translateY(-2px);
}

.menu-btn.primary {
  background: rgba(201, 169, 110, 0.2);
  border-color: #c9a96e;
  font-size: 20px;
  padding: 20px 32px;
}

.menu-btn.primary:hover {
  background: rgba(201, 169, 110, 0.35);
}

.btn-icon {
  font-size: 22px;
}

.settings-panel {
  margin-top: 24px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(201, 169, 110, 0.2);
  border-radius: 12px;
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
}

.toggle-btn {
  padding: 4px 16px;
  border: 1px solid rgba(201, 169, 110, 0.3);
  border-radius: 6px;
  background: transparent;
  color: #e0d5c1;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
}

.toggle-btn.active {
  background: rgba(201, 169, 110, 0.2);
  border-color: #c9a96e;
}

select {
  padding: 4px 12px;
  border: 1px solid rgba(201, 169, 110, 0.3);
  border-radius: 6px;
  background: #1a1a2e;
  color: #e0d5c1;
  font-family: inherit;
  font-size: 13px;
}

.setting-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

.small-btn {
  padding: 6px 14px;
  border: 1px solid rgba(201, 169, 110, 0.3);
  border-radius: 6px;
  background: rgba(201, 169, 110, 0.08);
  color: #e0d5c1;
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.small-btn:hover {
  background: rgba(201, 169, 110, 0.15);
}

.small-btn.danger {
  border-color: rgba(220, 80, 80, 0.4);
}

.small-btn.danger:hover {
  background: rgba(220, 80, 80, 0.15);
}
</style>