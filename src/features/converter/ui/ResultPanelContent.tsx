import { formatFileSize } from '../../../lib/formatFileSize'
import type { FfmpegConvertState } from '../hooks/useFfmpegConvert'
import type { VideoBackdropState } from '../hooks/useVideoBackdrop'
import type { ResultPanelState } from '../types'

type ResultPanelContentProps = {
  readonly backdrop: VideoBackdropState
  readonly convertState: FfmpegConvertState
  readonly panelState: ResultPanelState
}

/** 結果パネルの DOM コンテンツ（Liquid / Flat 共通） */
export const ResultPanelContent = ({
  backdrop,
  convertState,
  panelState,
}: ResultPanelContentProps) => {
  const gifPercentage =
    backdrop.videoSize && convertState.result
      ? ((convertState.result.gifSize / backdrop.videoSize) * 100).toFixed(1)
      : null
  const isSizeUp =
    backdrop.videoSize && convertState.result
      ? convertState.result.gifSize > backdrop.videoSize
      : false

  return (
    <div className={`panel-html panel-html--result panel-html--${panelState}`}>
      <h2>変換結果</h2>

      {panelState === 'idle' && (
        <div className="result-idle">
          <span className="result-idle__icon" aria-hidden>
            ✦
          </span>
          <p className="placeholder">
            変換が完了するとここに結果が表示されます
          </p>
        </div>
      )}

      {panelState === 'error' && (
        <div className="result-error">
          <p className="error-message">{convertState.error}</p>
        </div>
      )}

      {panelState === 'success' && convertState.result && (
        <div className="result-success">
          {backdrop.videoSize !== null && (
            <p className="stats">
              <strong>元の動画</strong>{' '}
              {formatFileSize(backdrop.videoSize)}
              <br />
              <strong>GIF</strong>{' '}
              {formatFileSize(convertState.result.gifSize)}
              {gifPercentage && (
                <>
                  {' '}
                  <span className={isSizeUp ? 'up' : 'down'}>
                    ({isSizeUp ? '▲' : '▼'} {gifPercentage}%)
                  </span>
                </>
              )}
            </p>
          )}

          <div className="preview">
            <img src={convertState.result.gifUrl} alt="変換後の GIF プレビュー" />
          </div>

          <a
            className="download-link"
            href={convertState.result.gifUrl}
            download="output.gif"
          >
            GIF をダウンロード
          </a>
        </div>
      )}
    </div>
  )
}
