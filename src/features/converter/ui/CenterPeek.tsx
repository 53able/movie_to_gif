import { Frame, Html } from '@liquid-dom/react'
import type { VideoBackdropState } from '../hooks/useVideoBackdrop'
import { CENTER_PEEK_WIDTH, PANEL_MIN_HEIGHT, PANEL_WIDTH } from '../types'
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
}: CenterPeekProps) => {
  const stateClass = backdrop.hasVideo ? 'center-peek--live' : 'center-peek--idle'
  const layoutClass = compact ? 'center-peek--compact' : ''

  return (
    <Frame
      width={compact ? panelWidth : CENTER_PEEK_WIDTH}
      minHeight={compact ? 120 : PANEL_MIN_HEIGHT}
    >
      <Html sizing="fill">
        <div className={`center-peek ${stateClass} ${layoutClass}`}>
          <div className="center-peek__aura" aria-hidden />
          <div className="center-peek__frame" aria-hidden />
          <div className="center-peek__content">
            <p className="center-peek__eyebrow">movie to gif</p>
            <h1 className="center-peek__title">
              Liquid
              <span className="center-peek__title-accent">Glass</span>
            </h1>
            <p className="center-peek__hint">
              {backdrop.hasVideo
                ? '中央にソース動画を表示中'
                : '動画を選ぶとここにプレビュー'}
            </p>
          </div>
        </div>
      </Html>
    </Frame>
  )
}
