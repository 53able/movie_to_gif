import { z } from 'zod'

/** ディザリング方式 */
export const ditherSchema = z.enum([
  'bayer',
  'floyd_steinberg',
  'heckbert',
  'none',
  'sierra2',
  'sierra2_4a',
])

export type Dither = z.infer<typeof ditherSchema>

/** 結果パネルの表示状態 */
export const resultPanelStateSchema = z.enum(['idle', 'success', 'error'])

export type ResultPanelState = z.infer<typeof resultPanelStateSchema>

/** Liquid ゲートの判定状態（checking 中は UI ルート未確定） */
export const liquidGateStatusSchema = z.enum([
  'checking',
  'ready-liquid',
  'ready-flat',
  'unsupported',
])

export type LiquidGateStatus = z.infer<typeof liquidGateStatusSchema>

/** 変換パラメータ */
export type ConvertParams = {
  readonly videoUrl: string
  readonly videoData: Uint8Array
  readonly frameRate: number
  readonly scale: number
  readonly dither: Dither
}

/** 変換成功時の結果 */
export type ConvertSuccess = {
  readonly gifUrl: string
  readonly gifSize: number
}

export const PALETTE_USE_OPTIONS: readonly Dither[] = [
  'bayer',
  'floyd_steinberg',
  'heckbert',
  'none',
  'sierra2',
  'sierra2_4a',
]

/**
 * GlassContainer に渡す光学プロパティ。
 *
 * 注意: liquid-dom の RgbaColor は 0..1 正規化値を使用する。
 * 以前の {r:6, g:8, b:18} は全て 1.0 にクランプされ白 (bright) になっていた。
 * 正しい値: 6/255≈0.024, 8/255≈0.031, 18/255≈0.071。
 */
/** パネル共通の GlassContainer ベース（役割別 props の土台） */
export const GLASS_CONTAINER_PROPS = {
  blur: 24,
  thickness: 88,
  spacing: 28,
  /** シネマティックダーク: 深紺 (0..1 正規化) + 半透明でバックドロップを透かす */
  tint: { r: 0.024, g: 0.031, b: 0.071, a: 0.72 },
  /** デフォルト specularStrength:1, specularOpacity:0.45 は明るすぎるため低減 */
  specularStrength: 0.28,
  specularOpacity: 0.16,
  shadowBlur: 32,
  shadowOffsetY: 14,
  shadowColor: { r: 0, g: 0, b: 0, a: 0.58 },
} as const

/** 変換操作パネル: やや厚め + 強いハイライトで操作感を出す */
export const CONTROL_GLASS_CONTAINER_PROPS = {
  ...GLASS_CONTAINER_PROPS,
  blur: 26,
  thickness: 94,
  spacing: 26,
  tint: { r: 0.02, g: 0.028, b: 0.062, a: 0.78 },
  specularStrength: 0.34,
  specularOpacity: 0.2,
  shadowBlur: 36,
  shadowOffsetY: 16,
} as const

/** 結果パネル: やや薄め + 落ち着いた tint でプレビューを主役に */
export const RESULT_GLASS_CONTAINER_PROPS = {
  ...GLASS_CONTAINER_PROPS,
  blur: 22,
  thickness: 82,
  spacing: 24,
  tint: { r: 0.018, g: 0.034, b: 0.078, a: 0.66 },
  specularStrength: 0.22,
  specularOpacity: 0.12,
  shadowBlur: 28,
  shadowOffsetY: 12,
} as const

export const GLASS_SHAPE_PROPS = {
  cornerRadius: 48,
  cornerSmoothing: 0.72,
  pointerEvents: true as const,
}

export const OVERLAY_GLASS_PROPS = {
  blur: 32,
  thickness: 72,
  spacing: 12,
  tint: { r: 0.01, g: 0.015, b: 0.04, a: 0.68 },
  specularStrength: 0.06,
  specularOpacity: 0.04,
} as const

/** 変換中 progress カード: 強い specular + 深い shadow で浮遊感 */
export const OVERLAY_CARD_GLASS_PROPS = {
  blur: 24,
  thickness: 98,
  spacing: 22,
  tint: { r: 0.026, g: 0.038, b: 0.088, a: 0.86 },
  specularStrength: 0.42,
  specularOpacity: 0.24,
  shadowBlur: 44,
  shadowOffsetY: 20,
  shadowColor: { r: 0, g: 0, b: 0, a: 0.68 },
} as const

/** 変換中の全画面スクリム用 Glass（操作ブロック + 暗転） */
export const OVERLAY_SCRIM_GLASS_PROPS = {
  cornerRadius: 0,
  cornerSmoothing: 0,
  pointerEvents: true as const,
}

/** 変換中 progress カードの Liquid Frame 寸法 (px) */
export const OVERLAY_PROGRESS_CARD_WIDTH = 360
export const OVERLAY_PROGRESS_CARD_HEIGHT = 168

/** 変換中 progress カードの最大幅 (px) — ナローポータルでもこの値を上限とする */
export const OVERLAY_PROGRESS_CARD_MAX_WIDTH = 360

/** ワイドレイアウト中央の Backdrop 露出幅 (px) */
export const CENTER_PEEK_WIDTH = 280

/** パネルの固定幅 (px) */
export const PANEL_WIDTH = 380

/** パネルの最小高さ (px) */
export const PANEL_MIN_HEIGHT = 480
