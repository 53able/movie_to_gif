import { createFFmpeg, type FFmpeg } from '@ffmpeg/ffmpeg'

/** MEMFS 上で変換ごとに使うファイル名 */
const MEMFS_WORK_FILES = ['input.mp4', 'palette.png', 'output.gif'] as const

let ffmpegInstance: FFmpeg | null = null
let ffmpegLoadPromise: Promise<FFmpeg> | null = null

/**
 * ffmpeg.wasm コアを 1 回だけロードし、以降の変換で再利用する。
 */
export const acquireFfmpeg = (): Promise<FFmpeg> => {
  if (ffmpegInstance) return Promise.resolve(ffmpegInstance)

  if (!ffmpegLoadPromise) {
    const instance = createFFmpeg({ log: true })
    ffmpegLoadPromise = instance
      .load()
      .then(() => {
        ffmpegInstance = instance
        return instance
      })
      .catch((error: unknown) => {
        ffmpegLoadPromise = null
        throw error
      })
  }

  return ffmpegLoadPromise
}

/**
 * 前回変換の MEMFS 残骸を削除する。失敗時は無視する。
 */
export const resetFfmpegWorkFiles = (instance: FFmpeg): void => {
  MEMFS_WORK_FILES.forEach((fileName) => {
    try {
      instance.FS('unlink', fileName)
    } catch {
      /* 初回変換など、存在しないファイルは無視 */
    }
  })
}
