import { useState, useRef, useCallback, useEffect } from 'react'

export type VoiceError = 'not-allowed' | 'no-speech' | 'network' | 'aborted' | 'audio-capture' | 'service-not-allowed' | null

interface UseVoiceRecognitionReturn {
  isListening: boolean
  transcript: string
  interimTranscript: string
  isSupported: boolean
  isSecureContext: boolean
  error: VoiceError
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
  getFinalTranscript: () => string
  setOnErrorCallback: (cb: (error: VoiceError) => void) => void
  setOnResultCallback: (cb: (text: string) => void) => void
}

export function useVoiceRecognition(): UseVoiceRecognitionReturn {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<VoiceError>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const accumulatedRef = useRef('')
  const stoppedManually = useRef(false)
  const shouldRestart = useRef(false)
  const onErrorCallback = useRef<((error: VoiceError) => void) | null>(null)
  const onResultCallback = useRef<((text: string) => void) | null>(null)
  const restartCount = useRef(0)

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const isSecureContext = typeof window !== 'undefined' &&
    (window.isSecureContext === true ||
     window.location.protocol === 'https:' ||
     window.location.hostname === 'localhost' ||
     window.location.hostname === '127.0.0.1')

  const mapError = (errorName: string): VoiceError => {
    switch (errorName) {
      case 'not-allowed': return 'not-allowed'
      case 'no-speech': return 'no-speech'
      case 'network': return 'network'
      case 'aborted': return 'aborted'
      case 'audio-capture': return 'audio-capture'
      case 'service-not-allowed': return 'service-not-allowed'
      default: return null
    }
  }

  const createRecognition = useCallback(() => {
    if (!isSupported) return null

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognitionAPI()
    recognition.lang = 'zh-CN'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = ''
      let interimText = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalText += result[0].transcript
        } else {
          interimText += result[0].transcript
        }
      }

      if (finalText) {
        accumulatedRef.current += finalText
        setTranscript(accumulatedRef.current)
        setInterimTranscript('')
        setError(null)
        if (onResultCallback.current) {
          onResultCallback.current(accumulatedRef.current)
        }
      } else if (interimText) {
        setInterimTranscript(interimText)
      }
    }

    recognition.onerror = (event) => {
      const voiceError = mapError(event.error)
      console.warn('[SpeechRecognition] error:', event.error, voiceError)
      setError(voiceError)
      stoppedManually.current = false
      shouldRestart.current = false

      if (voiceError === 'aborted') return

      setIsListening(false)
      if (onErrorCallback.current) {
        onErrorCallback.current(voiceError)
      }
    }

    recognition.onend = () => {
      console.log('[SpeechRecognition] onend, stoppedManually=', stoppedManually.current, 'shouldRestart=', shouldRestart.current)

      if (shouldRestart.current && restartCount.current < 10) {
        restartCount.current++
        console.log('[SpeechRecognition] auto-restart, attempt', restartCount.current)
        try {
          recognition.start()
          return
        } catch (err) {
          console.error('[SpeechRecognition] restart failed:', err)
          shouldRestart.current = false
        }
      }

      setIsListening(false)
      stoppedManually.current = false
      shouldRestart.current = false
      restartCount.current = 0

      if (onErrorCallback.current) {
        onErrorCallback.current(null)
      }
    }

    recognition.addEventListener('speechstart', () => {
      console.log('[SpeechRecognition] speech detected')
    })

    recognition.addEventListener('speechend', () => {
      console.log('[SpeechRecognition] speech ended')
    })

    recognition.addEventListener('audiostart', () => {
      console.log('[SpeechRecognition] audio capture started')
    })

    recognition.addEventListener('audioend', () => {
      console.log('[SpeechRecognition] audio capture ended')
    })

    return recognition
  }, [isSupported])

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort()
      recognitionRef.current = null
    }

    const recognition = createRecognition()
    if (!recognition) return

    recognitionRef.current = recognition
    accumulatedRef.current = ''
    stoppedManually.current = false
    shouldRestart.current = true
    restartCount.current = 0
    setError(null)
    setTranscript('')
    setInterimTranscript('')

    try {
      recognition.start()
      setIsListening(true)
      console.log('[SpeechRecognition] started')
    } catch (err) {
      console.error('[SpeechRecognition] start failed:', err)
      setError('not-allowed')
      setIsListening(false)
      shouldRestart.current = false
    }
  }, [createRecognition])

  const stopListening = useCallback(() => {
    stoppedManually.current = true
    shouldRestart.current = false
    restartCount.current = 0
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)
    console.log('[SpeechRecognition] stopped manually')
  }, [])

  const resetTranscript = useCallback(() => {
    accumulatedRef.current = ''
    setTranscript('')
    setInterimTranscript('')
  }, [])

  const getFinalTranscript = useCallback(() => {
    return accumulatedRef.current.trim()
  }, [])

  const setOnErrorCallback = useCallback((cb: (error: VoiceError) => void) => {
    onErrorCallback.current = cb
  }, [])

  const setOnResultCallback = useCallback((cb: (text: string) => void) => {
    onResultCallback.current = cb
  }, [])

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    isSecureContext,
    error,
    startListening,
    stopListening,
    resetTranscript,
    getFinalTranscript,
    setOnErrorCallback,
    setOnResultCallback,
  }
}
