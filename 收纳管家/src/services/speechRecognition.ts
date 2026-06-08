export type SpeechProvider = 'groq' | 'xunfei' | 'baidu' | 'web-speech'

export interface SpeechRecognitionResult {
  text: string
  isFinal: boolean
  confidence?: number
}

export interface SpeechProviderConfig {
  apiKey?: string
  apiUrl?: string
  appId?: string
  apiSecret?: string
  language?: string
}

interface SpeechProviderInstance {
  name: SpeechProvider
  transcribe: (audioBlob: Blob, config: SpeechProviderConfig) => Promise<string>
}

class GroqWhisperProvider implements SpeechProviderInstance {
  name = 'groq' as const

  async transcribe(audioBlob: Blob, config: SpeechProviderConfig): Promise<string> {
    if (!config.apiKey) throw new Error('请配置 Groq API Key')

    const formData = new FormData()
    formData.append('file', audioBlob, 'recording.webm')
    formData.append('model', 'whisper-large-v3')
    formData.append('language', config.language || 'zh')
    formData.append('response_format', 'json')

    console.log('[Groq] sending audio for transcription, size:', audioBlob.size)

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('[Groq] error:', response.status, errorBody)
      throw new Error(`Groq API 错误 (${response.status}): ${errorBody}`)
    }

    const data = await response.json()
    console.log('[Groq] result:', data)
    return data.text || ''
  }
}

class XunfeiProvider implements SpeechProviderInstance {
  name = 'xunfei' as const

  async transcribe(audioBlob: Blob, config: SpeechProviderConfig): Promise<string> {
    if (!config.appId || !config.apiSecret) throw new Error('请配置讯飞 AppId 和 APISecret')

    const arrayBuffer = await audioBlob.arrayBuffer()
    const base64Audio = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    )

    const wsUrl = `wss://iat-api.xfyun.cn/v2/iat?authorization=${this.getAuthHeader(config)}&date=${this.getDate()}&host=iat-api.xfyun.cn`

    return new Promise((resolve, reject) => {
      const ws = new WebSocket(wsUrl)
      let resultText = ''
      let timeout: ReturnType<typeof setTimeout>

      timeout = setTimeout(() => {
        ws.close()
        reject(new Error('讯飞语音识别超时'))
      }, 15000)

      ws.onopen = () => {
        const params = {
          common: { app_id: config.appId },
          business: { language: 'zh_cn', domain: 'iat', accent: 'mandarin', vad_eos: 3000 },
          data: { status: 0, format: 'audio/L16;rate=16000', encoding: 'raw', audio: base64Audio },
        }
        ws.send(JSON.stringify(params))
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.data && data.data.result) {
          const wsResult = data.data.result
          if (wsResult.ws) {
            for (const w of wsResult.ws) {
              for (const cw of w.cw) {
                resultText += cw.w
              }
            }
          }
        }
        if (data.data && data.data.status === 2) {
          clearTimeout(timeout)
          ws.close()
          resolve(resultText)
        }
      }

      ws.onerror = (err) => {
        clearTimeout(timeout)
        reject(new Error('讯飞 WebSocket 连接错误'))
      }

      ws.onclose = () => {
        clearTimeout(timeout)
        if (resultText) resolve(resultText)
      }
    })
  }

  private getAuthHeader(config: SpeechProviderConfig): string {
    const date = this.getDate()
    const signatureOrigin = `host: iat-api.xfyun.cn\ndate: ${date}\nGET /v2/iat HTTP/1.1`
    const signatureSha = btoa(signatureOrigin)
    return btoa(`${config.appId}:${signatureSha}`)
  }

  private getDate(): string {
    return new Date().toUTCString().replace(/GMT/, '+0000')
  }
}

class BaiduProvider implements SpeechProviderInstance {
  name = 'baidu' as const

  async transcribe(audioBlob: Blob, config: SpeechProviderConfig): Promise<string> {
    if (!config.apiKey || !config.apiSecret) throw new Error('请配置百度 API Key 和 Secret Key')

    const tokenRes = await fetch(`https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${config.apiKey}&client_secret=${config.apiSecret}`, {
      method: 'POST',
    })
    const tokenData = await tokenRes.json()

    if (!tokenData.access_token) throw new Error('百度 Token 获取失败')

    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.webm')
    formData.append('format', 'webm')
    formData.append('rate', '16000')
    formData.append('channel', '1')
    formData.append('cuid', 'shouna-guanjia')
    formData.append('token', tokenData.access_token)
    formData.append('dev_pid', '1537')

    const res = await fetch('https://vop.baidu.com/server_api', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()
    if (data.err_no !== 0) throw new Error(`百度识别错误: ${data.err_msg || data.err_no}`)
    return data.result?.[0] || ''
  }
}

const providers: Record<SpeechProvider, SpeechProviderInstance> = {
  groq: new GroqWhisperProvider(),
  xunfei: new XunfeiProvider(),
  baidu: new BaiduProvider(),
  'web-speech': null as unknown as SpeechProviderInstance,
}

export function getProvider(providerName: SpeechProvider): SpeechProviderInstance | null {
  return providers[providerName] || null
}

export async function recognizeSpeech(
  audioBlob: Blob,
  providerName: SpeechProvider,
  config: SpeechProviderConfig
): Promise<string> {
  if (providerName === 'web-speech') {
    throw new Error('Web Speech API 不支持外部录音模式，请选择其他提供商')
  }

  const provider = getProvider(providerName)
  if (!provider) throw new Error(`未知的语音识别提供商: ${providerName}`)

  return provider.transcribe(audioBlob, config)
}
