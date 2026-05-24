import { z } from 'zod'
import type { ConvertParams, Dither } from '../types'

/** ffmpeg.wasm 0.11 の実効ヒープ上限（固定 WASM メモリ、バイト） */
export const FFMPEG_WASM_EFFECTIVE_HEAP_BYTES = 32 * 1024 * 1024

/** ffmpeg.wasm で GIF 変換に使える保守的なヒープ予算（バイト） */
export const FFMPEG_WASM_HEAP_BUDGET_BYTES = FFMPEG_WASM_EFFECTIVE_HEAP_BYTES

/** MEMFS 上の入力ファイルと ffmpeg 内部バッファ向けの固定見積もり */
export const FFMPEG_MEMFS_OVERHEAD_BYTES = 12 * 1024 * 1024

/** 動画メタデータ */
export const videoMetaSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  durationSec: z.number().positive(),
})

export type VideoMeta = z.infer<typeof videoMetaSchema>

/** 安全化後の GIF 変換パラメータ */
export type SafeGifConvertParams = {
  readonly frameRate: number
  readonly scale: number
  readonly dither: Dither
  readonly maxDurationSec: number
  readonly wasClamped: boolean
}

/** 2-pass 変換で ffmpeg.run に渡すコマンド列 */
export type GifConvertPass = {
  readonly args: readonly string[]
}

export type GifConvertMode = 'single-pass' | 'two-pass'

export type GifConvertPlan = {
  readonly params: SafeGifConvertParams
  readonly mode: GifConvertMode
  readonly palettePass: GifConvertPass | null
  readonly gifPass: GifConvertPass
  readonly estimatedPeakBytes: number
}

/**
 * アスペクト比を保った出力高さを算出する。
 */
export const computeScaledHeight = (
  sourceWidth: number,
  sourceHeight: number,
  outputWidth: number,
): number =>
  Math.max(1, Math.round((sourceHeight * outputWidth) / sourceWidth))

/**
 * RGBA 1 フレーム分のバイト数。
 */
export const rgbaFrameBytes = (width: number, height: number): number =>
  width * height * 4

/**
 * single-pass（split + palettegen）のピークメモリを見積もる。
 * split が同一解像度の 2 ストリームを同時保持するため、WASM では危険。
 */
export const estimateSinglePassPeakBytes = (input: {
  readonly sourceWidth: number
  readonly sourceHeight: number
  readonly outputWidth: number
}): number => {
  const outputHeight = computeScaledHeight(
    input.sourceWidth,
    input.sourceHeight,
    input.outputWidth,
  )
  const sourceFrameBytes = rgbaFrameBytes(input.sourceWidth, input.sourceHeight)
  const scaledFrameBytes = rgbaFrameBytes(input.outputWidth, outputHeight)
  const splitStreamBytes = scaledFrameBytes * 2
  const palettegenOverheadBytes = scaledFrameBytes

  return (
    FFMPEG_MEMFS_OVERHEAD_BYTES
    + sourceFrameBytes
    + splitStreamBytes
    + palettegenOverheadBytes
  )
}

/**
 * 2-pass（palettegen → paletteuse）のピークメモリを見積もる。
 * 各 pass は scaled ストリーム 1 本のみを保持する。
 */
export const estimateTwoPassPeakBytes = (input: {
  readonly sourceWidth: number
  readonly sourceHeight: number
  readonly outputWidth: number
}): number => {
  const outputHeight = computeScaledHeight(
    input.sourceWidth,
    input.sourceHeight,
    input.outputWidth,
  )
  const sourceFrameBytes = rgbaFrameBytes(input.sourceWidth, input.sourceHeight)
  const scaledFrameBytes = rgbaFrameBytes(input.outputWidth, outputHeight)
  const passOverheadBytes = Math.round(scaledFrameBytes * 0.5)

  return (
    FFMPEG_MEMFS_OVERHEAD_BYTES
    + sourceFrameBytes
    + scaledFrameBytes
    + passOverheadBytes
  )
}

const clampToStep = (value: number, min: number, step: number): number =>
  Math.max(min, Math.round(value / step) * step)

const buildScaleCandidates = (requestedScale: number): readonly number[] =>
  Array.from(
    { length: Math.floor((requestedScale - 160) / 8) + 1 },
    (_, index) => requestedScale - index * 8,
  )

const buildFrameRateCandidates = (requestedFrameRate: number): readonly number[] =>
  Array.from(
    { length: Math.floor((requestedFrameRate - 8) / 8) + 1 },
    (_, index) => requestedFrameRate - index * 8,
  )

const buildDurationCandidates = (durationSec: number): readonly number[] => {
  const raw = [
    durationSec,
    durationSec * 0.75,
    durationSec * 0.5,
    10,
    5,
  ] as const

  return [...new Set(raw.map((value) => Math.max(5, Math.round(value * 100) / 100)))]
}

type ParamCandidate = {
  readonly frameRate: number
  readonly scale: number
  readonly dither: Dither
  readonly maxDurationSec: number
}

const fitsBudget = (
  candidate: ParamCandidate,
  meta: VideoMeta,
  budgetBytes: number,
): boolean =>
  estimateTwoPassPeakBytes({
    sourceWidth: meta.width,
    sourceHeight: meta.height,
    outputWidth: candidate.scale,
  }) <= budgetBytes

/**
 * WASM ヒープ予算内に収まるよう変換パラメータを段階的に下げる。
 */
export const resolveSafeGifParams = (
  requested: ConvertParams,
  meta: VideoMeta,
  budgetBytes: number = FFMPEG_WASM_HEAP_BUDGET_BYTES,
): SafeGifConvertParams => {
  const scaleCandidates = buildScaleCandidates(clampToStep(requested.scale, 160, 8))
  const frameRateCandidates = buildFrameRateCandidates(
    clampToStep(requested.frameRate, 8, 8),
  )
  const durationCandidates = buildDurationCandidates(meta.durationSec)

  const candidates: readonly ParamCandidate[] = scaleCandidates.flatMap((scale) =>
    frameRateCandidates.flatMap((frameRate) =>
      durationCandidates.map((maxDurationSec) => ({
        scale,
        frameRate,
        maxDurationSec,
        dither: requested.dither,
      })),
    ),
  )

  const resolved =
    candidates.find((candidate) => fitsBudget(candidate, meta, budgetBytes))
    ?? {
      frameRate: 8,
      scale: 160,
      dither: requested.dither,
      maxDurationSec: Math.min(meta.durationSec, 5),
    }

  const wasClamped =
    resolved.frameRate !== requested.frameRate
    || resolved.scale !== requested.scale
    || resolved.maxDurationSec < meta.durationSec - 0.01

  return {
    frameRate: resolved.frameRate,
    scale: resolved.scale,
    dither: resolved.dither,
    maxDurationSec: resolved.maxDurationSec,
    wasClamped,
  }
}

const buildDurationArgs = (maxDurationSec: number): readonly string[] =>
  maxDurationSec > 0 ? ['-t', maxDurationSec.toFixed(2)] : []

/**
 * WASM ヒープ内で single-pass split graph が安全か判定する。
 */
export const resolveConvertMode = (
  meta: VideoMeta,
  outputWidth: number,
  budgetBytes: number = FFMPEG_WASM_HEAP_BUDGET_BYTES,
): GifConvertMode =>
  estimateSinglePassPeakBytes({
    sourceWidth: meta.width,
    sourceHeight: meta.height,
    outputWidth,
  }) <= budgetBytes
    ? 'single-pass'
    : 'two-pass'

const buildScaleFilter = (frameRate: number, scale: number): string =>
  `fps=${frameRate},scale=${scale}:-1:flags=bilinear`

const buildPaletteGenFilter = (): string =>
  'palettegen=stats_mode=single:max_colors=256'

/**
 * 2-pass GIF 変換計画を組み立てる。大きい入力は two-pass、小さい入力は single-pass。
 */
export const buildGifConvertPlan = (
  requested: ConvertParams,
  meta: VideoMeta,
  budgetBytes: number = FFMPEG_WASM_HEAP_BUDGET_BYTES,
): GifConvertPlan => {
  const params = resolveSafeGifParams(requested, meta, budgetBytes)
  const durationArgs = buildDurationArgs(params.maxDurationSec)
  const scaleFilter = buildScaleFilter(params.frameRate, params.scale)
  const mode = resolveConvertMode(meta, params.scale, budgetBytes)
  const memoryInput = {
    sourceWidth: meta.width,
    sourceHeight: meta.height,
    outputWidth: params.scale,
  }

  if (mode === 'single-pass') {
    const gifPass: GifConvertPass = {
      args: [
        '-i',
        'input.mp4',
        '-an',
        ...durationArgs,
        '-lavfi',
        `${scaleFilter},split[s0][s1];[s0]${buildPaletteGenFilter()}[s2];[s1][s2]paletteuse=dither=${params.dither}`,
        '-y',
        'output.gif',
      ],
    }

    return {
      params,
      mode,
      palettePass: null,
      gifPass,
      estimatedPeakBytes: estimateSinglePassPeakBytes(memoryInput),
    }
  }

  const palettePass: GifConvertPass = {
    args: [
      '-i',
      'input.mp4',
      '-an',
      ...durationArgs,
      '-vf',
      `${scaleFilter},${buildPaletteGenFilter()}`,
      '-y',
      'palette.png',
    ],
  }

  const gifPass: GifConvertPass = {
    args: [
      '-i',
      'input.mp4',
      '-i',
      'palette.png',
      '-an',
      ...durationArgs,
      '-lavfi',
      `${scaleFilter}[x];[x][1:v]paletteuse=dither=${params.dither}`,
      '-y',
      'output.gif',
    ],
  }

  return {
    params,
    mode,
    palettePass,
    gifPass,
    estimatedPeakBytes: estimateTwoPassPeakBytes(memoryInput),
  }
}

/**
 * ffmpeg.wasm の OOM 系エラーをユーザー向けメッセージへ変換する。
 */
export const formatFfmpegError = (caught: unknown): string => {
  const message =
    caught instanceof Error ? caught.message : String(caught)

  if (/OOM|out of memory|abort\(OOM\)/i.test(message)) {
    return 'メモリ不足のため変換できませんでした。出力幅または FPS を下げて再試行してください。'
  }

  return message || '変換中に不明なエラーが発生しました'
}
