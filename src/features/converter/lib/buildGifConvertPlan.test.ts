// Run: node --experimental-strip-types --test src/features/converter/lib/buildGifConvertPlan.test.ts

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildGifConvertPlan,
  computeScaledHeight,
  estimateSinglePassPeakBytes,
  estimateTwoPassPeakBytes,
  FFMPEG_WASM_EFFECTIVE_HEAP_BYTES,
  formatFfmpegError,
  resolveConvertMode,
  resolveSafeGifParams,
} from './buildGifConvertPlan.ts'

/** ユーザー報告の ReplayKit 録画メタデータ */
const replayKitMeta = {
  width: 1972,
  height: 1704,
  durationSec: 17.37,
} as const

const replayKitRequest = {
  videoUrl: 'blob:replaykit',
  videoData: new Uint8Array(0),
  frameRate: 24,
  scale: 1024,
  dither: 'none' as const,
}

const smallVideoMeta = {
  width: 640,
  height: 480,
  durationSec: 5,
} as const

const smallVideoRequest = {
  videoUrl: 'blob:small',
  videoData: new Uint8Array(0),
  frameRate: 16,
  scale: 320,
  dither: 'none' as const,
}

describe('estimateGifMemoryBudget', () => {
  it('single-pass split graph exceeds effective wasm heap; two-pass per-run peak does not', () => {
    const input = {
      sourceWidth: replayKitMeta.width,
      sourceHeight: replayKitMeta.height,
      outputWidth: replayKitRequest.scale,
    }

    const singlePass = estimateSinglePassPeakBytes(input)
    const twoPass = estimateTwoPassPeakBytes(input)

    assert.ok(singlePass > twoPass)
    assert.ok(singlePass > FFMPEG_WASM_EFFECTIVE_HEAP_BYTES)
    assert.ok(twoPass <= FFMPEG_WASM_EFFECTIVE_HEAP_BYTES)
  })

  it('computes scaled height for ReplayKit aspect ratio', () => {
    assert.equal(
      computeScaledHeight(replayKitMeta.width, replayKitMeta.height, 1024),
      885,
    )
  })
})

describe('resolveSafeGifParams', () => {
  it('keeps ReplayKit defaults within wasm budget via two-pass plan', () => {
    const resolved = resolveSafeGifParams(replayKitRequest, replayKitMeta)

    assert.equal(resolved.frameRate, 24)
    assert.equal(resolved.scale, 1024)
    assert.equal(resolved.maxDurationSec, replayKitMeta.durationSec)
    assert.equal(resolved.wasClamped, false)
  })

  it('clamps scale when output width exceeds budget', () => {
    const resolved = resolveSafeGifParams(
      { ...replayKitRequest, scale: 1024 },
      replayKitMeta,
      24 * 1024 * 1024,
    )

    assert.ok(resolved.scale < 1024)
    assert.equal(resolved.wasClamped, true)
  })
})

describe('resolveConvertMode', () => {
  it('selects two-pass for ReplayKit-sized inputs', () => {
    assert.equal(resolveConvertMode(replayKitMeta, 1024), 'two-pass')
  })

  it('selects single-pass for small inputs within heap budget', () => {
    assert.equal(resolveConvertMode(smallVideoMeta, 320), 'single-pass')
  })
})

describe('buildGifConvertPlan', () => {
  it('builds two-pass ffmpeg args for large ReplayKit videos', () => {
    const plan = buildGifConvertPlan(replayKitRequest, replayKitMeta)

    assert.equal(plan.mode, 'two-pass')
    assert.equal(plan.params.wasClamped, false)
    assert.deepEqual(plan.palettePass?.args, [
      '-i',
      'input.mp4',
      '-an',
      '-t',
      '17.37',
      '-vf',
      'fps=24,scale=1024:-1:flags=bilinear,palettegen=stats_mode=single:max_colors=256',
      '-y',
      'palette.png',
    ])
    assert.deepEqual(plan.gifPass.args, [
      '-i',
      'input.mp4',
      '-i',
      'palette.png',
      '-an',
      '-t',
      '17.37',
      '-lavfi',
      'fps=24,scale=1024:-1:flags=bilinear[x];[x][1:v]paletteuse=dither=none',
      '-y',
      'output.gif',
    ])

    const joined = plan.palettePass?.args.join(' ') ?? ''
    assert.ok(!joined.includes('split'))
    assert.ok(!joined.includes('filter_complex'))
  })

  it('builds single-pass ffmpeg args for small videos', () => {
    const plan = buildGifConvertPlan(smallVideoRequest, smallVideoMeta)

    assert.equal(plan.mode, 'single-pass')
    assert.equal(plan.palettePass, null)
    assert.ok(plan.gifPass.args.join(' ').includes('split[s0][s1]'))
  })
})

describe('formatFfmpegError', () => {
  it('maps wasm OOM abort to user-facing Japanese message', () => {
    assert.equal(
      formatFfmpegError(new Error('RuntimeError: abort(OOM). Build with -s ASSERTIONS=1 for more info.')),
      'メモリ不足のため変換できませんでした。出力幅または FPS を下げて再試行してください。',
    )
  })
})
