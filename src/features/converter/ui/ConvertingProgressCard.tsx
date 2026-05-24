import type { FfmpegConvertState } from '../hooks/useFfmpegConvert'
import './converter.css'

type ConvertingProgressCardProps = {
  readonly convertState: FfmpegConvertState
}

/** 変換進捗カード（Html オーバーレイ / DOM ポータル共通） */
export const ConvertingProgressCard = ({ convertState }: ConvertingProgressCardProps) => (
  <div className="overlay-html" role="status" aria-live="polite">
    <div className="overlay-html__header">
      <span className="overlay-html__pulse" aria-hidden />
      <p className="overlay-html__label">変換中</p>
    </div>
    <div className="overlay-html__percent">{convertState.progress}%</div>
    <div
      className="progress-track"
      role="progressbar"
      aria-valuenow={convertState.progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="progress-track__fill"
        style={{ width: `${convertState.progress}%` }}
      />
    </div>
    <p className="overlay-html__hint">{convertState.progressLabel || 'ブラウザ内で FFmpeg が GIF を生成しています'}</p>
  </div>
)
