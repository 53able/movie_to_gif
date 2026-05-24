import { useCallback, useState } from 'react'
import {
  computeConvertProgress,
  convertProgressLabel,
  type ConvertProgressPhase,
} from '../lib/computeConvertProgress'
import {
  buildGifConvertPlan,
  formatFfmpegError,
  type GifConvertMode,
  type GifConvertPlan,
} from '../lib/buildGifConvertPlan'
import { acquireFfmpeg, resetFfmpegWorkFiles } from '../lib/ffmpegRuntime'
import { probeVideoMeta } from '../lib/probeVideoMeta'
import type { ConvertParams, ConvertSuccess, Dither } from '../types'

/** 結果 GIF の blob URL を破棄して state をクリアする */
const clearGifResult = (current: ConvertSuccess | null): null => {
  if (current?.gifUrl) URL.revokeObjectURL(current.gifUrl)
  return null
}

/** single-pass では最初から encoding、two-pass では palette から進捗を報告する */
const initialFfmpegProgressPhase = (
  mode: GifConvertMode,
): 'palette' | 'encoding' =>
  mode === 'single-pass' ? 'encoding' : 'palette'

/** MEMFS から output.gif を読み、表示用 blob URL を生成する */
const readGifOutput = (ffmpegInstance: {
  FS: (command: 'readFile', path: string) => Uint8Array
}): ConvertSuccess => {
  const outputData = ffmpegInstance.FS('readFile', 'output.gif')
  const gifBytes = new Uint8Array(outputData.length)
  gifBytes.set(outputData)
  const gifUrl = URL.createObjectURL(new Blob([gifBytes], { type: 'image/gif' }))
  return { gifUrl, gifSize: gifBytes.byteLength }
}

/** plan に従って ffmpeg.run を実行し GIF バイト列を返す */
const runGifConversion = async (
  ffmpegInstance: Awaited<ReturnType<typeof acquireFfmpeg>>,
  plan: GifConvertPlan,
  onPassProgress: (phase: 'palette' | 'encoding', ratio: number) => void,
): Promise<ConvertSuccess> => {
  const reportPassProgress = (phase: 'palette' | 'encoding') =>
    ({ ratio }: { ratio: number }): void => {
      onPassProgress(phase, ratio)
    }

  ffmpegInstance.setProgress(reportPassProgress(initialFfmpegProgressPhase(plan.mode)))

  if (plan.palettePass) {
    await ffmpegInstance.run(...plan.palettePass.args)
    ffmpegInstance.setProgress(reportPassProgress('encoding'))
  }

  await ffmpegInstance.run(...plan.gifPass.args)
  return readGifOutput(ffmpegInstance)
}

export type FfmpegConvertState = {
  readonly converting: boolean
  readonly progress: number
  readonly progressLabel: string
  readonly result: ConvertSuccess | null
  readonly error: string | null
  readonly frameRate: number
  readonly scale: number
  readonly dither: Dither
  readonly setFrameRate: (value: number) => void
  readonly setScale: (value: number) => void
  readonly setDither: (value: Dither) => void
  readonly convert: (params: ConvertParams) => Promise<void>
  readonly resetResult: () => void
}

/**
 * FFmpeg.wasm による GIF 変換と進捗・エラー状態を管理する。
 */
export const useFfmpegConvert = (): FfmpegConvertState => {
  const [converting, setConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [result, setResult] = useState<ConvertSuccess | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [frameRate, setFrameRate] = useState(24)
  const [scale, setScale] = useState(504)
  const [dither, setDither] = useState<Dither>('none')

  const applyProgress = useCallback(
    (phase: ConvertProgressPhase, mode: 'single-pass' | 'two-pass', passRatio?: number): void => {
      setProgress(computeConvertProgress({ phase, mode, passRatio }))
      setProgressLabel(convertProgressLabel(phase))
    },
    [],
  )

  const resetResult = useCallback((): void => {
    setResult(clearGifResult)
    setError(null)
    setProgress(0)
    setProgressLabel('')
  }, [])

  const convert = useCallback(async (params: ConvertParams): Promise<void> => {
    setConverting(true)
    setError(null)
    setResult(clearGifResult)

    try {
      const meta = await probeVideoMeta(params.videoUrl)
      const plan = buildGifConvertPlan(params, meta)
      applyProgress('starting', plan.mode)
      applyProgress('loading', plan.mode)
      const ffmpegInstance = await acquireFfmpeg()
      resetFfmpegWorkFiles(ffmpegInstance)
      applyProgress('writing', plan.mode)
      ffmpegInstance.FS('writeFile', 'input.mp4', params.videoData)

      const conversionResult = await runGifConversion(
        ffmpegInstance,
        plan,
        (phase, ratio) => applyProgress(phase, plan.mode, ratio),
      )

      applyProgress('finishing', plan.mode)
      setResult(conversionResult)
      setProgress(100)
      setProgressLabel(convertProgressLabel('finishing'))
    } catch (caught) {
      setError(formatFfmpegError(caught))
    } finally {
      setConverting(false)
    }
  }, [applyProgress])

  return {
    converting,
    progress,
    progressLabel,
    result,
    error,
    frameRate,
    scale,
    dither,
    setFrameRate,
    setScale,
    setDither,
    convert,
    resetResult,
  }
}
