import type { ChangeEvent } from 'react'
import type { FfmpegConvertState } from '../hooks/useFfmpegConvert'
import type { VideoBackdropState } from '../hooks/useVideoBackdrop'
import { PALETTE_USE_OPTIONS } from '../types'

type ConvertPanelContentProps = {
  readonly backdrop: VideoBackdropState
  readonly convertState: FfmpegConvertState
}

/** 変換操作パネルの DOM コンテンツ（Liquid / Flat 共通） */
export const ConvertPanelContent = ({
  backdrop,
  convertState,
}: ConvertPanelContentProps) => {
  const isDisabled =
    backdrop.videoUrl === null || convertState.converting

  const onFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    if (!file) return
    backdrop.selectFile(file)
    convertState.resetResult()
  }

  const onConvert = async (): Promise<void> => {
    if (!backdrop.videoUrl || !backdrop.videoFile) return
    const videoData = new Uint8Array(await backdrop.videoFile.arrayBuffer())
    void convertState.convert({
      videoUrl: backdrop.videoUrl,
      videoData,
      frameRate: convertState.frameRate,
      scale: convertState.scale,
      dither: convertState.dither,
    })
  }

  const filename = backdrop.fileName

  return (
    <div className="panel-html">
      <h2>変換設定</h2>

      <div className="file-zone">
        <input
          id="video-file"
          type="file"
          accept="video/mp4,.mov,video/quicktime"
          onChange={onFileChange}
        />
        <span className="file-zone__icon">🎬</span>
        {filename ? (
          <span className="file-zone__filename">{filename}</span>
        ) : (
          <span className="file-zone__text">
            動画をクリックまたはドロップ
            <br />
            <small>MP4 / MOV</small>
          </span>
        )}
      </div>

      <div className="field">
        <div className="field-row">
          <label htmlFor="frame-rate">フレームレート</label>
          <span className="field-value">{convertState.frameRate} FPS</span>
        </div>
        <input
          id="frame-rate"
          type="range"
          min={8}
          max={40}
          step={8}
          value={convertState.frameRate}
          onChange={(event) => convertState.setFrameRate(Number(event.target.value))}
        />
      </div>

      <div className="field">
        <div className="field-row">
          <label htmlFor="scale">出力幅</label>
          <span className="field-value">{convertState.scale} px</span>
        </div>
        <input
          id="scale"
          type="range"
          min={160}
          max={1024}
          step={8}
          value={convertState.scale}
          onChange={(event) => convertState.setScale(Number(event.target.value))}
        />
      </div>

      <div className="field">
        <label className="section-label">ディザリング</label>
        <ul className="dithers">
          {PALETTE_USE_OPTIONS.map((option) => (
            <li key={option}>
              <label>
                <input
                  type="radio"
                  name="dither"
                  value={option}
                  checked={convertState.dither === option}
                  onChange={() => convertState.setDither(option)}
                />
                {option}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        className="cta"
        disabled={isDisabled}
        onClick={onConvert}
      >
        変換する
      </button>
    </div>
  )
}
