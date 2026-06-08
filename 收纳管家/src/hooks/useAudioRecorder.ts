import { useState, useRef, useCallback } from 'react'

interface UseAudioRecorderReturn {
  isRecording: boolean
  audioBlob: Blob | null
  startRecording: () => Promise<void>
  stopRecording: () => Promise<Blob | null>
  cancelRecording: () => void
  isSupported: boolean
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const audioBlobRef = useRef<Blob | null>(null)

  const isSupported = typeof window !== 'undefined' &&
    'MediaRecorder' in window &&
    'navigator' in window &&
    'mediaDevices' in navigator

  const getSupportedMimeType = useCallback((): string => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ]
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }
    return ''
  }, [])

  const startRecording = useCallback(async (): Promise<void> => {
    if (!isSupported) throw new Error('浏览器不支持录音功能')

    try {
      chunksRef.current = []
      audioBlobRef.current = null

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      streamRef.current = stream
      const mimeType = getSupportedMimeType()

      const options: MediaRecorderOptions = mimeType ? { mimeType } : {}
      const recorder = new MediaRecorder(stream, options)

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' })
          audioBlobRef.current = blob
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
          streamRef.current = null
        }
      }

      mediaRecorderRef.current = recorder
      recorder.start(200)
      setIsRecording(true)
    } catch (err) {
      console.error('[AudioRecorder] start failed:', err)
      throw err
    }
  }, [isSupported, getSupportedMimeType])

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current
      if (!recorder || recorder.state === 'inactive') {
        resolve(audioBlobRef.current)
        return
      }

      recorder.onstop = () => {
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
          audioBlobRef.current = blob
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
          streamRef.current = null
        }
        mediaRecorderRef.current = null
        setIsRecording(false)
        resolve(audioBlobRef.current)
      }

      try {
        recorder.stop()
      } catch (err) {
        console.error('[AudioRecorder] stop failed:', err)
        resolve(audioBlobRef.current)
      }
    })
  }, [])

  const cancelRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      try {
        recorder.stop()
      } catch {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    chunksRef.current = []
    audioBlobRef.current = null
    mediaRecorderRef.current = null
    setIsRecording(false)
  }, [])

  return {
    isRecording,
    audioBlob: audioBlobRef.current,
    startRecording,
    stopRecording,
    cancelRecording,
    isSupported,
  }
}
