import { useState, useEffect } from 'react'
import { X, Key, Check, AlertCircle } from 'lucide-react'
import { SpeechProvider, SpeechProviderConfig } from '@/services/speechRecognition'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  config: SpeechProviderConfig
  provider: SpeechProvider
  onSave: (provider: SpeechProvider, config: SpeechProviderConfig) => void
}

const PROVIDERS: { value: SpeechProvider; label: string; desc: string; needsKey: boolean; free: boolean }[] = [
  {
    value: 'groq',
    label: 'Groq Whisper',
    desc: 'OpenAI Whisper 加速版，免费额度充足，中文识别优秀',
    needsKey: true,
    free: true,
  },
  {
    value: 'xunfei',
    label: '讯飞语音识别',
    desc: '国内领先语音服务，中文识别最准确，需注册讯飞开放平台',
    needsKey: false,
    free: true,
  },
  {
    value: 'baidu',
    label: '百度语音识别',
    desc: '百度 AI 开放平台，免费调用额度，中文识别良好',
    needsKey: false,
    free: true,
  },
]

export default function SettingsModal({ isOpen, onClose, config, provider, onSave }: SettingsModalProps) {
  const [localProvider, setLocalProvider] = useState<SpeechProvider>(provider)
  const [localConfig, setLocalConfig] = useState<SpeechProviderConfig>(config)
  const [showSaved, setShowSaved] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setLocalProvider(provider)
      setLocalConfig({ ...config })
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, provider, config])

  if (!isOpen) return null

  const handleSave = () => {
    localStorage.setItem('shouna-speech-provider', localProvider)
    localStorage.setItem('shouna-speech-config', JSON.stringify(localConfig))
    onSave(localProvider, localConfig)
    setShowSaved(true)
    setTimeout(() => {
      setShowSaved(false)
      onClose()
    }, 800)
  }

  const currentProvider = PROVIDERS.find((p) => p.value === localProvider)

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up mx-4">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">语音识别设置</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2.5">识别引擎</label>
            <div className="space-y-2">
              {PROVIDERS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setLocalProvider(p.value)}
                  className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all ${
                    localProvider === p.value
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      localProvider === p.value ? 'bg-primary/15 text-primary' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {p.label.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm ${localProvider === p.value ? 'text-primary' : 'text-gray-800'}`}>
                          {p.label}
                        </span>
                        {p.free && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-green-50 text-green-600">免费</span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5 truncate">{p.desc}</p>
                    </div>
                    {localProvider === p.value && <Check size={16} className="text-primary shrink-0" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {localProvider === 'groq' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Key size={14} className="inline mr-1" /> Groq API Key
              </label>
              <input
                type="password"
                value={localConfig.apiKey || ''}
                onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
                placeholder="gsk_..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
              />
              <p className="text-[11px] text-gray-400 mt-2 flex items-start gap-1">
                <AlertCircle size={12} className="shrink-0 mt-0.5" />
                <span>获取方式：访问 console.groq.com 注册账号 → API Keys → Create API Key（免费额度：每天 200 次转录）</span>
              </p>
            </div>
          )}

          {localProvider === 'xunfei' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">App ID</label>
                <input
                  type="text"
                  value={localConfig.appId || ''}
                  onChange={(e) => setLocalConfig({ ...localConfig, appId: e.target.value })}
                  placeholder="从讯飞控制台获取"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">API Secret</label>
                <input
                  type="password"
                  value={localConfig.apiSecret || ''}
                  onChange={(e) => setLocalConfig({ ...localConfig, apiSecret: e.target.value })}
                  placeholder="从讯飞控制台获取"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                />
              </div>
              <p className="text-[11px] text-gray-400 flex items-start gap-1">
                <AlertCircle size={12} className="shrink-0 mt-0.5" />
                <span>获取方式：访问 xfyun.cn 注册 → 控制台 → 创建应用 → 语音听写(流式) → 获取 AppID 和 APISecret</span>
              </p>
            </div>
          )}

          {localProvider === 'baidu' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">API Key</label>
                <input
                  type="text"
                  value={localConfig.apiKey || ''}
                  onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
                  placeholder="从百度 AI 开放平台获取"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Secret Key</label>
                <input
                  type="password"
                  value={localConfig.apiSecret || ''}
                  onChange={(e) => setLocalConfig({ ...localConfig, apiSecret: e.target.value })}
                  placeholder="从百度 AI 开放平台获取"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                />
              </div>
              <p className="text-[11px] text-gray-400 flex items-start gap-1">
                <AlertCircle size={12} className="shrink-0 mt-0.5" />
                <span>获取方式：访问 ai.baidu.com 注册 → 创建应用 → 语音技术 → 获取 API Key 和 Secret Key</span>
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!localConfig.apiKey && localProvider === 'groq'}
            className={`flex-1 py-3 rounded-2xl text-white font-medium text-sm flex items-center justify-center gap-2 transition-all ${
              showSaved
                ? 'bg-green-500'
                : (!localConfig.apiKey && localProvider === 'groq')
                  ? 'bg-gray-200 cursor-not-allowed text-gray-400'
                  : 'bg-gradient-to-r from-primary to-blue-500 hover:shadow-lg active:scale-[0.98]'
            }`}
          >
            {showSaved ? <><Check size={17} /> 已保存</> : '保存配置'}
          </button>
        </div>
      </div>
    </div>
  )
}
