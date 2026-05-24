import type { VideoBackdropState } from '../hooks/useVideoBackdrop'

type BackdropContentProps = {
  readonly backdrop: VideoBackdropState
}

/**
 * LiquidCanvas 最背面の Backdrop。
 * 未選択時はアニメーショングラデーション、選択後はループ動画（先頭フレームをフォールバック）。
 */
export const BackdropContent = ({ backdrop }: BackdropContentProps) => (
  <div className={`backdrop-html ${backdrop.videoUrl ? 'backdrop-html--video' : 'backdrop-html--idle'}`}>
    {backdrop.videoUrl ? (
      <>
        {backdrop.frameUrl ? (
          <img
            className="backdrop-html__poster frame-image"
            src={backdrop.frameUrl}
            alt=""
            aria-hidden
          />
        ) : null}
        <video
          className="backdrop-html__video"
          src={backdrop.videoUrl}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden
        />
      </>
    ) : (
      <div className="gradient gradient--animated">
        <div className="gradient__orb gradient__orb--a" aria-hidden />
        <div className="gradient__orb gradient__orb--b" aria-hidden />
        <div className="gradient__orb gradient__orb--c" aria-hidden />
      </div>
    )}
    <div className="backdrop-html__grain" aria-hidden />
    <div className="backdrop-html__vignette" aria-hidden />
  </div>
)
