import type { CSSProperties } from 'react'
import type { FfmpegConvertState } from '../hooks/useFfmpegConvert'
import { useWideLayout } from '../hooks/useLayoutMedia'
import type { VideoBackdropState } from '../hooks/useVideoBackdrop'
import { OVERLAY_PROGRESS_CARD_MAX_WIDTH, PANEL_WIDTH } from '../types'
import { BackdropContent } from './BackdropContent'
import { ConvertingProgressCard } from './ConvertingProgressCard'
import { FlatPanelStack } from './FlatPanelStack'
import './converter.css'

type FlatSceneProps = {
  readonly backdrop: VideoBackdropState
  readonly convertState: FfmpegConvertState
}

/** HTML-in-Canvas 非対応環境向け CSS ガラス UI シーン */
export const FlatScene = ({ backdrop, convertState }: FlatSceneProps) => {
  const wide = useWideLayout()
  const panelWidth = PANEL_WIDTH

  return (
    <div className={`flat-scene ${wide ? 'flat-scene--wide' : 'flat-scene--narrow'}`}>
      <div className="flat-scene__backdrop" aria-hidden>
        <BackdropContent backdrop={backdrop} />
      </div>

      <div className="flat-scene__content">
        <FlatPanelStack
          wide={wide}
          backdrop={backdrop}
          convertState={convertState}
          panelWidth={panelWidth}
        />
      </div>

      {convertState.converting ? (
        <div
          className="flat-scene__overlay"
          style={
            {
              '--overlay-card-width': `${Math.min(panelWidth, OVERLAY_PROGRESS_CARD_MAX_WIDTH)}px`,
            } as CSSProperties
          }
        >
          <div className="flat-scene__overlay-scrim" aria-hidden />
          <div className="flat-scene__overlay-card">
            <ConvertingProgressCard convertState={convertState} />
          </div>
        </div>
      ) : null}
    </div>
  )
}
