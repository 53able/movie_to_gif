type CanvasWithHtmlInCanvas = HTMLCanvasElement & {
  readonly layoutSubtree?: boolean
  readonly onpaint?: unknown
  readonly requestPaint?: () => void
}

type Canvas2dWithHtmlInCanvas = CanvasRenderingContext2D & {
  readonly drawElementImage?: unknown
}

/**
 * HTML-in-Canvas（canvas-draw-element）の実験 API が使えるか判定する。
 * liquid-dom は `layoutsubtree` 属性と `paint` イベントに依存する（WICG HTML-in-Canvas）。
 */
export const supportsHtmlInCanvas = (): boolean => {
  if (typeof HTMLCanvasElement === 'undefined') {
    return false
  }

  const canvasProto = HTMLCanvasElement.prototype as CanvasWithHtmlInCanvas

  if ('layoutSubtree' in canvasProto || 'onpaint' in canvasProto) {
    return true
  }

  if (typeof canvasProto.requestPaint === 'function') {
    return true
  }

  if (typeof CanvasRenderingContext2D !== 'undefined') {
    const contextProto = CanvasRenderingContext2D.prototype as Canvas2dWithHtmlInCanvas
    if (typeof contextProto.drawElementImage === 'function') {
      return true
    }
  }

  const canvas = document.createElement('canvas') as CanvasWithHtmlInCanvas
  return 'layoutSubtree' in canvas || 'onpaint' in canvas
}
