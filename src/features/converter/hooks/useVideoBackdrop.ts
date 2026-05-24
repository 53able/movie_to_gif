import { useCallback, useEffect, useState } from 'react'

export type VideoBackdropState = {
  readonly videoUrl: string | null
  readonly videoFile: File | null
  readonly frameUrl: string | null
  readonly fileName: string | null
  readonly videoSize: number | null
  readonly hasVideo: boolean
  readonly selectFile: (file: File) => void
  readonly clear: () => void
}

/**
 * 動画 URL から先頭フレームを canvas 経由で data URL 化する。
 */
const captureFirstFrame = (videoUrl: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    video.src = videoUrl

    const cleanup = (): void => {
      video.removeAttribute('src')
      video.load()
    }

    video.addEventListener(
      'loadeddata',
      () => {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth || 1280
        canvas.height = video.videoHeight || 720
        const context = canvas.getContext('2d')
        if (!context) {
          cleanup()
          reject(new Error('2D コンテキストを取得できません'))
          return
        }
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
        cleanup()
        resolve(dataUrl)
      },
      { once: true },
    )

    video.addEventListener(
      'error',
      () => {
        cleanup()
        reject(new Error('動画の読み込みに失敗しました'))
      },
      { once: true },
    )
  })

/**
 * Backdrop 用の動画 URL と先頭フレーム画像 URL を管理する。
 */
export const useVideoBackdrop = (): VideoBackdropState => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [frameUrl, setFrameUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [videoSize, setVideoSize] = useState<number | null>(null)

  const clear = useCallback((): void => {
    setVideoUrl(null)
    setVideoFile(null)
    setFrameUrl(null)
    setFileName(null)
    setVideoSize(null)
  }, [])

  const selectFile = useCallback((file: File): void => {
    const nextVideoUrl = URL.createObjectURL(file)
    setVideoUrl(nextVideoUrl)
    setVideoFile(file)
    setFrameUrl(null)
    setFileName(file.name)
    setVideoSize(file.size)
    void captureFirstFrame(nextVideoUrl)
      .then((dataUrl) => setFrameUrl(dataUrl))
      .catch(() => setFrameUrl(null))
  }, [])

  useEffect(
    () => () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl)
    },
    [videoUrl],
  )

  useEffect(
    () => () => {
      if (frameUrl?.startsWith('blob:')) URL.revokeObjectURL(frameUrl)
    },
    [frameUrl],
  )

  return {
    videoUrl,
    videoFile,
    frameUrl,
    fileName,
    videoSize,
    hasVideo: videoUrl !== null,
    selectFile,
    clear,
  }
}
