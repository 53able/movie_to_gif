import { useCallback, useState } from 'react'
import {
  computeConvertProgress,
  convertProgressLabel,
  type ConvertProgressPhase,
} from '../lib/computeConvertProgress'
import {
  buildGifConvertPlan,
  formatFfmpegError,
} from '../lib/buildGifConvertPlan'
import { acquireFfmpeg, resetFfmpegWorkFiles } from '../lib/ffmpegRuntime'
import { probeVideoMeta } from '../lib/probeVideoMeta'
import type { ConvertParams, ConvertSuccess, Dither } from '../types'

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
    setResult((current) => {
      if (current?.gifUrl) URL.revokeObjectURL(current.gifUrl)
      return null
    })
    setError(null)
    setProgress(0)
    setProgressLabel('')
  }, [])

  const convert = useCallback(async (params: ConvertParams): Promise<void> => {
    setConverting(true)
    setError(null)
    setResult((current) => {
      if (current?.gifUrl) URL.revokeObjectURL(current.gifUrl)
      return null
    })

    try {
      const meta = await probeVideoMeta(params.videoUrl)
      const plan = buildGifConvertPlan(params, meta)
      applyProgress('starting', plan.mode)
      applyProgress('loading', plan.mode)
      const ffmpegInstance = await acquireFfmpeg()
      resetFfmpegWorkFiles(ffmpegInstance)
      applyProgress('writing', plan.mode)
      ffmpegInstance.FS('writeFile', 'input.mp4', params.videoData)

      const reportPassProgress = (phase: 'palette' | 'encoding') =>
        ({ ratio }: { ratio: number }): void => {
          applyProgress(phase, plan.mode, ratio)
        }

      ffmpegInstance.setProgress(reportPassProgress(
        plan.mode === 'single-pass' ? 'encoding' : 'palette',
      ))

      if (plan.palettePass) {
        await ffmpegInstance.run(...plan.palettePass.args)
        ffmpegInstance.setProgress(reportPassProgress('encoding'))
      }

      await ffmpegInstance.run(...plan.gifPass.args)
      applyProgress('finishing', plan.mode)

      const outputData = ffmpegInstance.FS('readFile', 'output.gif') as Uint8Array
      const gifBytes = new Uint8Array(outputData.length)
      gifBytes.set(outputData)
      const gifUrl = URL.createObjectURL(new Blob([gifBytes], { type: 'image/gif' }))
      setResult({ gifUrl, gifSize: gifBytes.byteLength })
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
