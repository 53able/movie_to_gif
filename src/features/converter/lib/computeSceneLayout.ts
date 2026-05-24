import {
  PANEL_MIN_HEIGHT,
  PANEL_WIDTH,
} from '../types'

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
