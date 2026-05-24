import type { VideoBackdropState } from '../hooks/useVideoBackdrop'

type CenterPeekContentProps = {
  readonly backdrop: VideoBackdropState
  readonly compact?: boolean
}

/** 中央タイトル露出エリアの DOM コンテンツ（Liquid / Flat 共通） */
export const CenterPeekContent = ({
  backdrop,
  compact = false,
}: CenterPeekContentProps) => {
  const stateClass = backdrop.hasVideo ? 'center-peek--live' : 'center-peek--idle'
  const layoutClass = compact ? 'center-peek--compact' : ''

  return (
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
  )
}
