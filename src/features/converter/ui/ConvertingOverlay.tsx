import type { CSSProperties } from 'react'
import {
  Frame,
  Glass,
  GlassContainer,
  Html,
  ZStack,
} from '@liquid-dom/react'
import type { FfmpegConvertState } from '../hooks/useFfmpegConvert'
import {
  GLASS_SHAPE_PROPS,
  OVERLAY_CARD_GLASS_PROPS,
  OVERLAY_GLASS_PROPS,
  OVERLAY_PROGRESS_CARD_HEIGHT,
  OVERLAY_PROGRESS_CARD_MAX_WIDTH,
  OVERLAY_PROGRESS_CARD_WIDTH,
  OVERLAY_SCRIM_GLASS_PROPS,
} from '../types'
import { ConvertingProgressCard } from './ConvertingProgressCard'
import './converter.css'

type ConvertingOverlayProps = {
  readonly convertState: FfmpegConvertState
  readonly viewportWidth: number
  readonly viewportHeight: number
}

/** 変換中の全画面半透明オーバーレイ + 中央 progress カード（ワイドレイアウト専用） */
export const ConvertingOverlay = ({
  convertState,
  viewportWidth,
  viewportHeight,
}: ConvertingOverlayProps) => {
  if (!convertState.converting) return null

  return (
    <ZStack alignment="center">
      <Frame width={viewportWidth} height={viewportHeight}>
        <GlassContainer {...OVERLAY_GLASS_PROPS}>
          <Glass {...OVERLAY_SCRIM_GLASS_PROPS}>
            <Html sizing="fill">
              <div className="overlay-scrim" aria-hidden />
            </Html>
          </Glass>
        </GlassContainer>
      </Frame>

      <Frame width={OVERLAY_PROGRESS_CARD_WIDTH} height={OVERLAY_PROGRESS_CARD_HEIGHT}>
        <GlassContainer {...OVERLAY_CARD_GLASS_PROPS}>
          <Glass {...GLASS_SHAPE_PROPS}>
            <Html sizing="fill">
              <ConvertingProgressCard convertState={convertState} />
            </Html>
          </Glass>
        </GlassContainer>
      </Frame>
    </ZStack>
  )
}

type ConvertingOverlayPortalProps = {
  readonly convertState: FfmpegConvertState
  readonly panelWidth: number
}

/**
 * ナローレイアウト向け DOM 固定オーバーレイ。
 * LiquidCanvas 内では viewport 固定が効かないため、Glass 風カードを body 直下に描画する。
 */
export const ConvertingOverlayPortal = ({
  convertState,
  panelWidth,
}: ConvertingOverlayPortalProps) => {
  if (!convertState.converting) return null

  return (
    <div
      className="converting-overlay-portal"
      style={{ '--overlay-card-width': `${Math.min(panelWidth, OVERLAY_PROGRESS_CARD_MAX_WIDTH)}px` } as CSSProperties}
      aria-hidden={false}
    >
      <div className="converting-overlay-portal__card">
        <ConvertingProgressCard convertState={convertState} />
      </div>
    </div>
  )
}
