import type { CSSProperties } from 'react'
import {
  PANEL_MIN_HEIGHT,
  PANEL_WIDTH,
} from '../types'

/** ワイド / ナローのレイアウトモード */
export type SceneLayoutMode = 'wide' | 'narrow'

/** ConverterScene が参照するレイアウト寸法とスタイル一式 */
export type ConverterSceneLayout = {
  readonly mode: SceneLayoutMode
  readonly hostClassName: string
  readonly hostStyle: CSSProperties
  readonly liquidCanvasStyle: CSSProperties
  readonly canvasWidth: number
  readonly canvasHeight: number
  readonly panelWidth: number
  readonly stackAlignment: 'center' | 'top'
  readonly liquidCanvasKeySuffix: string
  readonly showInCanvasOverlay: boolean
  readonly showPortalOverlay: boolean
}

/** ナローレイアウトの VStack 要素間隔 (px) */
export const NARROW_STACK_SPACING = 24

/** ナローレイアウトのシーン外周パディング (px) */
export const NARROW_SCENE_PADDING = 24

/** ナローレイアウトの CenterPeek コンパクト高さ (px) */
export const NARROW_CENTER_PEEK_HEIGHT = 120

/**
 * ナローレイアウトで全パネルを縦積みしたときの LiquidCanvas 高さ (px)。
 * viewport より大きい場合はホスト側でスクロールさせる。
 */
export const computeNarrowCanvasHeight = (): number =>
  NARROW_SCENE_PADDING * 2
  + PANEL_MIN_HEIGHT
  + NARROW_STACK_SPACING
  + NARROW_CENTER_PEEK_HEIGHT
  + NARROW_STACK_SPACING
  + PANEL_MIN_HEIGHT

/**
 * ビューポート幅に収まるパネル幅 (px)。
 * ワイドでは固定幅、ナローでは左右パディングを差し引く。
 */
export const computePanelWidth = (
  viewportWidth: number,
  wide: boolean,
): number => {
  if (wide) {
    return PANEL_WIDTH
  }

  const maxWidth = viewportWidth - NARROW_SCENE_PADDING * 2
  return Math.min(PANEL_WIDTH, Math.max(280, maxWidth))
}

const LIQUID_CANVAS_FILL_STYLE: CSSProperties = { width: '100%', height: '100%' }

/**
 * ビューポートと wide 判定から ConverterScene の分岐を 1 か所に集約する。
 */
export const resolveConverterSceneLayout = (
  viewport: { readonly width: number; readonly height: number },
  wide: boolean,
): ConverterSceneLayout => {
  const mode: SceneLayoutMode = wide ? 'wide' : 'narrow'
  const panelWidth = computePanelWidth(viewport.width, wide)
  const canvasWidth = viewport.width
  const canvasHeight = wide ? viewport.height : computeNarrowCanvasHeight()
  const narrowCanvasStyle: CSSProperties = { width: '100%', height: canvasHeight }

  return {
    mode,
    hostClassName: wide
      ? 'converter-scene-host'
      : 'converter-scene-host converter-scene-host--narrow',
    hostStyle: wide
      ? LIQUID_CANVAS_FILL_STYLE
      : { width: '100%', minHeight: '100vh', height: canvasHeight },
    liquidCanvasStyle: wide ? LIQUID_CANVAS_FILL_STYLE : narrowCanvasStyle,
    canvasWidth,
    canvasHeight,
    panelWidth,
    stackAlignment: wide ? 'center' : 'top',
    liquidCanvasKeySuffix: mode,
    showInCanvasOverlay: wide,
    showPortalOverlay: !wide,
  }
}
