import { Mic, MicOff, AlertTriangle, WifiOff, Settings, Loader2 } from 'lucide-react'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'
import { recognizeSpeech, SpeechProvider, SpeechProviderConfig } from '@/services/speechRecognition'
import { useState, useRef, useCallback, useEffect } from 'react'
import { useItemStore } from '@/store'
import SettingsModal from './SettingsModal'

interface VoiceButtonProps {
  onResult: (text: string) => void
}

function loadSavedConfig(): { provider: SpeechProvider; config: SpeechProviderConfig } {
  try {
    const provider = (localStorage.getItem('shouna-speech-provider') as SpeechProvider) || 'groq'
    const configStr = localStorage.getItem('shouna-speech-config')
    const config = configStr ? JSON.parse(configStr) : {}
    return { provider, config }
  } catch {
    return { provider: 'groq', config: {} }
  }
}

export default function VoiceButton({ onResult }: VoiceButtonProps) {
  const { isRecording, startRecording, stopRecording, cancelRecording, isSupported } = useAudioRecorder()
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorInfo, setErrorInfo] = useState<{ title: string; desc: string } | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [provider, setProvider] = useState<SpeechProvider>('groq')
  const [config, setConfig] = useState<SpeechProviderConfig>({})
  const [hasConfigured, setHasConfigured] = useState(false)

  const onResultRef = useRef(onResult)
  const usedTouchRef = useRef(false)
  const addToast = useItemStore((s) => s.addToast)

  useEffect(() => {
    onResultRef.current = onResult
  }, [onResult])

  useEffect(() => {
    const saved = loadSavedConfig()
    setProvider(saved.provider)
    setConfig(saved.config)
    setHasConfigured(!!(
      saved.config.apiKey ||
      (saved.config.appId && saved.config.apiSecret)
    ))
  }, [])

  const showErrorToast = useCallback((title: string, desc?: string) => {
    setErrorInfo({ title, desc: desc || '' })
    setShowError(true)
    setTimeout(() => setShowError(false), 5000)
  }, [])

  const handleToggle = useCallback(async () => {
    if (isTranscribing) return

    if (isRecording) {
      try {
        setShowError(false)
        setErrorInfo(null)
        setIsTranscribing(true)
        console.log('[VoiceButton] stopping recording...')

        const audioBlob = await stopRecording()

        if (!audioBlob || audioBlob.size < 1000) {
          console.warn('[VoiceButton] audio too small:', audioBlob?.size)
          setIsTranscribing(false)
          showErrorToast('录音太短', '请重新录音并说话')
          addToast('录音内容过短，请重试', 'info')
          return
        }

        console.log('[VoiceButton] sending to', provider, 'for transcription...')
        const text = await recognizeSpeech(audioBlob, provider, config)
        console.log('[VoiceButton] transcription result:', text)

        if (text && text.trim()) {
          if (onResultRef.current) {
            onResultRef.current(text.trim())
          }
        } else {
          showErrorToast('未识别到语音内容', '请尝试更清晰地说话或检查麦克风')
          addToast('未识别到语音，请重试', 'info')
        }
      } catch (err: any) {
        console.error('[VoiceButton] error:', err)
        let title = '识别失败'
        let desc = err.message || '未知错误'

        if (err.message?.includes('API Key') || err.message?.includes('apiKey')) {
          title = '未配置 API Key'
          desc = '点击齿轮图标配置语音识别服务'
          setShowSettings(true)
        } else if (err.message?.includes('超时')) {
          title = '请求超时'
          desc = '网络连接较慢，请稍后重试'
        }

        showErrorToast(title, desc)
        addToast(title, 'error')
      } finally {
        setIsTranscribing(false)
      }
    } else {
      try {
        await startRecording()
        console.log('[VoiceButton] recording started')
      } catch (err: any) {
        console.error('[VoiceButton] start error:', err)
        if (err.name === 'NotAllowedError' || err.message?.includes('Permission')) {
          showErrorToast('麦克风权限被拒绝', '请在浏览器设置中允许麦克风访问')
        } else if (err.name === 'NotFoundError' || err.message?.includes('device')) {
          showErrorToast('未找到麦克风', '请确认设备已连接麦克风')
        } else {
          showErrorToast('无法启动录音', err.message || '')
        }
        addToast('录音启动失败', 'error')
      }
    }
  }, [isRecording, isTranscribing, startRecording, stopRecording, provider, config, showErrorToast, addToast])

  const handleTouchStart = useCallback(() => {
    usedTouchRef.current = true
  }, [])

  const handleClick = useCallback(() => {
    if (usedTouchRef.current) {
      usedTouchRef.current = false
      return
    }
    handleToggle()
  }, [handleToggle])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    handleToggle()
  }, [handleToggle])

  const handleSaveSettings = useCallback((newProvider: SpeechProvider, newConfig: SpeechProviderConfig) => {
    setProvider(newProvider)
    setConfig(newConfig)
    setHasConfigured(!!(newConfig.apiKey || (newConfig.appId && newConfig.apiSecret)))
  }, [])

  const isBusy = isRecording || isTranscribing

  if (!isSupported) {
    return (
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center shadow-lg cursor-not-allowed">
          <MicOff size={26} className="text-white" />
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-1.5">浏览器不支持录音</p>
      </div>
    )
  }

  return (
    <>
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        config={config}
        provider={provider}
        onSave={handleSaveSettings}
      />

      {showError && errorInfo && (
        <div className="fixed inset-x-0 bottom-28 z-40 flex justify-center animate-fade-in">
          <div className="max-w-xs bg-white rounded-2xl px-5 py-4 shadow-xl border border-red-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle size={16} className="text-red-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{errorInfo.title}</p>
                {errorInfo.desc && (
                  <p className="text-xs text-gray-500 mt-0.5">{errorInfo.desc}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isRecording && !showError && (
        <div className="fixed inset-x-0 bottom-28 z-40 flex justify-center pointer-events-none animate-fade-in">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl px-6 py-3 shadow-xl border border-white/50">
            <div className="flex items-center gap-2 justify-center">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
              <p className="text-sm text-gray-600 font-medium">正在录音...</p>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-1">说完后点击按钮停止</p>
          </div>
        </div>
      )}

      {isTranscribing && !showError && (
        <div className="fixed inset-x-0 bottom-28 z-40 flex justify-center pointer-events-none animate-fade-in">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl px-6 py-3 shadow-xl border border-white/50">
            <div className="flex items-center gap-2 justify-center">
              <Loader2 size={16} className="text-primary animate-spin" />
              <p className="text-sm text-gray-600 font-medium">正在识别...</p>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-1">音频上传至云端处理</p>
          </div>
        </div>
      )}

      {!hasConfigured && !isBusy && !showError && (
        <div className="fixed inset-x-0 bottom-28 z-40 flex justify-center pointer-events-none animate-fade-in">
          <button
            onClick={(e) => { e.stopPropagation(); setShowSettings(true) }}
            className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2.5 shadow-sm"
          >
            <p className="text-xs text-amber-700 font-medium">⚠️ 请先配置语音识别 API</p>
            <p className="text-[10px] text-amber-500 text-center mt-0.5">点击此处设置</p>
          </button>
        </div>
      )}

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          {isRecording && !isTranscribing && (
            <>
              <div className="absolute w-20 h-20 rounded-full bg-accent/60 animate-pulse-ring" style={{ animationDelay: '0s' }} />
              <div className="absolute w-20 h-20 rounded-full bg-accent/40 animate-pulse-ring" style={{ animationDelay: '0.4s' }} />
              <div className="absolute w-20 h-20 rounded-full bg-accent/30 animate-pulse-ring" style={{ animationDelay: '0.8s' }} />
            </>
          )}

          <button
            onClick={handleClick}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            disabled={isTranscribing}
            className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 ${
              isTranscribing
                ? 'bg-gradient-to-br from-blue-400 to-indigo-500 cursor-wait'
                : isRecording
                  ? 'bg-gradient-to-br from-accent to-red-500 scale-110'
                  : 'bg-gradient-to-br from-accent to-orange-500 hover:shadow-lg hover:shadow-accent/30'
            }`}
            style={{
              boxShadow:
                isRecording
                  ? '0 8px 32px rgba(255, 107, 107, 0.45)'
                  : '0 6px 24px rgba(255, 107, 107, 0.3)',
            }}
          >
            {isTranscribing ? (
              <Loader2 size={26} className="text-white animate-spin" />
            ) : isRecording ? (
              <Mic size={28} className="text-white" />
            ) : (
              <Mic size={26} className="text-white ml-0.5" />
            )}
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); setShowSettings(true) }}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
              hasConfigured
                ? 'bg-white/80 hover:bg-white border border-gray-100 shadow-sm'
                : 'bg-amber-50 border border-amber-200 animate-pulse'
            }`}
          >
            <Settings size={15} className={hasConfigured ? 'text-gray-400' : 'text-amber-500'} />
          </button>
        </div>

        <p className={`text-[10px] font-medium transition-colors duration-200 ${
          isTranscribing ? 'text-blue-400' : isRecording ? 'text-accent' : 'text-gray-400'
        }`}>
          {isTranscribing
            ? '识别中...'
            : isRecording
              ? (
                <span className="flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  点击停止
                </span>
              )
              : '点击开始录音'
          }
        </p>
      </div>
    </>
  )
}
