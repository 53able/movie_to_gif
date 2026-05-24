import { videoMetaSchema, type VideoMeta } from './buildGifConvertPlan'

/**
 * 動画 URL から変換計画に必要なメタデータを取得する。
 */
export const probeVideoMeta = (videoUrl: string): Promise<VideoMeta> =>
  new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.muted = true
    video.playsInline = true
    video.preload = 'metadata'
    video.src = videoUrl

    const cleanup = (): void => {
      video.removeAttribute('src')
      video.load()
    }

    video.addEventListener(
      'loadedmetadata',
      () => {
        const parsed = videoMetaSchema.safeParse({
          width: video.videoWidth,
          height: video.videoHeight,
          durationSec: video.duration,
        })
        cleanup()
        if (!parsed.success) {
          reject(new Error('動画メタデータの取得に失敗しました'))
          return
        }
        resolve(parsed.data)
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
