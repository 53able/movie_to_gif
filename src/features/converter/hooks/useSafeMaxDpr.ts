import { useMemo } from 'react'
import {
  computeSafeMaxDpr,
  MIN_MAX_DPR,
} from '../../../lib/computeSafeMaxDpr'

/**
 * viewport 未確定時に LiquidCanvas へ渡す保守的 maxDpr。
 */
const CONSERVATIVE_UNKNOWN_VIEWPORT_MAX_DPR = MIN_MAX_DPR

/**
 * 現在の viewport に対して WebGPU テクスチャ上限内に収まる maxDpr を返す。
 */
export const useSafeMaxDpr = (
  viewport: { readonly width: number; readonly height: number },
): number => {
  return useMemo(() => {
    if (viewport.width <= 0 || viewport.height <= 0) {
      return CONSERVATIVE_UNKNOWN_VIEWPORT_MAX_DPR
    }

    return computeSafeMaxDpr({
      viewportWidth: viewport.width,
      viewportHeight: viewport.height,
      devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
    })
  }, [viewport.width, viewport.height])
}
