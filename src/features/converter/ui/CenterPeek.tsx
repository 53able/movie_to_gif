import { Frame, Html } from '@liquid-dom/react'
import type { VideoBackdropState } from '../hooks/useVideoBackdrop'
import { CENTER_PEEK_WIDTH, PANEL_MIN_HEIGHT, PANEL_WIDTH } from '../types'
import { CenterPeekContent } from './CenterPeekContent'
import './converter.css'

type CenterPeekProps = {
  readonly backdrop: VideoBackdropState
  /** ナローレイアウト向けのコンパクト表示 */
  readonly compact?: boolean
  readonly panelWidth?: number
}

/**
 * ワイドレイアウト中央の Backdrop 露出エリア。Glass なしで動画/グラデを見せる。
 */
export const CenterPeek = ({
  backdrop,
  compact = false,
  panelWidth = PANEL_WIDTH,
}: CenterPeekProps) => (
  <Frame
    width={compact ? panelWidth : CENTER_PEEK_WIDTH}
    minHeight={compact ? 120 : PANEL_MIN_HEIGHT}
  >
    <Html sizing="fill">
      <CenterPeekContent backdrop={backdrop} compact={compact} />
    </Html>
  </Frame>
)
