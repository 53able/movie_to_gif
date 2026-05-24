import { useEffect, useLayoutEffect, useState, type RefObject } from 'react'

/**
 * LiquidCanvas ホスト要素の getBoundingClientRect 寸法を読む。
 * liquid-dom の syncCanvasSize と同じ CSS サイズ源を使う。
 */
const readHostLayoutSize = (
  host: HTMLElement,
): { readonly width: number; readonly height: number } => {
  const rect = host.getBoundingClientRect()
  return {
    width: Math.ceil(rect.width),
    height: Math.ceil(rect.height),
  }
}

/**
 * viewport が wide レイアウト（≥1024px）かどうか。
 */
export const useWideLayout = (): boolean => {
  const [wide, setWide] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches,
  )

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)')
    const onChange = (): void => setWide(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return wide
}

/**
 * LiquidCanvas を載せるホスト要素の CSS レイアウト寸法。
 * ResizeObserver + getBoundingClientRect で liquid-dom と同じサイズ源を使う。
 */
export const useCanvasHostSize = (
  hostRef: RefObject<HTMLElement | null>,
): { readonly width: number; readonly height: number } => {
  const [size, setSize] = useState({ width: 0, height: 0 })

  useLayoutEffect(() => {
    const host = hostRef.current
    if (!host) {
      return
    }

    const syncSize = (): void => {
      setSize(readHostLayoutSize(host))
    }

    syncSize()
    const observer = new ResizeObserver(syncSize)
    observer.observe(host)

    return () => observer.disconnect()
  }, [hostRef])

  return size
}

/**
 * viewport 寸法が LiquidCanvas マウントに十分かどうか。
 */
export const isViewportReady = (
  viewport: { readonly width: number; readonly height: number },
): boolean => viewport.width > 0 && viewport.height > 0
