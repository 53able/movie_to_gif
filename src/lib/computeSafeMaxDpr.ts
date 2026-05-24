/** liquid-dom が requestDevice で昇格しない WebGPU デフォルト 2D テクスチャ上限 */
export const DEFAULT_MAX_TEXTURE_DIMENSION_2D = 8192

const MIN_MAX_DPR = 0.25

export { MIN_MAX_DPR }

export type SafeMaxDprInput = {
  readonly viewportWidth: number
  readonly viewportHeight: number
  readonly devicePixelRatio: number
  readonly preferredMaxDpr?: number
  readonly maxTextureDimension?: number
}

/**
 * liquid-dom Renderer.syncCanvasSize と同じ丸めでデバイスピクセル幅を返す。
 */
export const liquidDomDevicePixels = (cssPx: number, dpr: number): number =>
  Math.max(1, Math.round(cssPx * dpr))

/**
 * liquid-dom の syncCanvasSize と同じ条件でテクスチャ上限内に収まるか判定する。
 * ceil も併用し、サブピクセル境界の余裕を確保する。
 */
const fitsTextureLimits = (
  cssWidth: number,
  cssHeight: number,
  dpr: number,
  maxTextureDimension: number,
): boolean =>
  liquidDomDevicePixels(cssWidth, dpr) <= maxTextureDimension &&
  liquidDomDevicePixels(cssHeight, dpr) <= maxTextureDimension &&
  Math.ceil(cssWidth * dpr) <= maxTextureDimension &&
  Math.ceil(cssHeight * dpr) <= maxTextureDimension

/**
 * 浮動小数点誤差を避けるため、安全側に 1e-3 刻みで量子化する。
 */
const quantizeMaxDprDown = (dpr: number): number => Math.floor(dpr * 1000) / 1000

/**
 * viewport と DPR から、WebGPU テクスチャ上限内に収まる LiquidCanvas maxDpr を算出する。
 * liquid-dom は getBoundingClientRect × min(devicePixelRatio, maxDpr) を Math.round する。
 */
export const computeSafeMaxDpr = ({
  viewportWidth,
  viewportHeight,
  devicePixelRatio,
  preferredMaxDpr = 2,
  maxTextureDimension = DEFAULT_MAX_TEXTURE_DIMENSION_2D,
}: SafeMaxDprInput): number => {
  const cssWidth = Math.max(viewportWidth, 1)
  const cssHeight = Math.max(viewportHeight, 1)
  const upperBound = Math.min(preferredMaxDpr, devicePixelRatio)

  const conservativeUpper = quantizeMaxDprDown(
    Math.min(
      upperBound,
      maxTextureDimension / cssWidth,
      maxTextureDimension / cssHeight,
    ),
  )

  if (fitsTextureLimits(cssWidth, cssHeight, conservativeUpper, maxTextureDimension)) {
    return Math.max(MIN_MAX_DPR, conservativeUpper)
  }

  let lo = MIN_MAX_DPR
  let hi = conservativeUpper
  for (let step = 0; step < 64; step += 1) {
    const mid = (lo + hi) / 2
    if (fitsTextureLimits(cssWidth, cssHeight, mid, maxTextureDimension)) {
      lo = mid
    } else {
      hi = mid
    }
  }

  return Math.max(MIN_MAX_DPR, quantizeMaxDprDown(lo))
}

/**
 * liquid-dom Renderer.syncCanvasSize と同じ丸めでデバイスピクセルサイズを返す。
 */
export const computeDevicePixelSize = (
  viewportWidth: number,
  viewportHeight: number,
  devicePixelRatio: number,
  maxDpr: number,
): { readonly width: number; readonly height: number; readonly effectiveDpr: number } => {
  const effectiveDpr = Math.min(devicePixelRatio, maxDpr)
  return {
    effectiveDpr,
    width: liquidDomDevicePixels(viewportWidth, effectiveDpr),
    height: liquidDomDevicePixels(viewportHeight, effectiveDpr),
  }
}

/**
 * ceil ベースの厳密上限チェック（テスト・検証用）。
 */
export const computeCeilDevicePixelSize = (
  viewportWidth: number,
  viewportHeight: number,
  devicePixelRatio: number,
  maxDpr: number,
): { readonly width: number; readonly height: number; readonly effectiveDpr: number } => {
  const effectiveDpr = Math.min(devicePixelRatio, maxDpr)
  return {
    effectiveDpr,
    width: Math.ceil(viewportWidth * effectiveDpr),
    height: Math.ceil(viewportHeight * effectiveDpr),
  }
}
