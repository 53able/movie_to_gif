import {
  Frame,
  Glass,
  GlassContainer,
  Html,
} from '@liquid-dom/react'
import type { FfmpegConvertState } from '../hooks/useFfmpegConvert'
import type { VideoBackdropState } from '../hooks/useVideoBackdrop'
import {
  CONTROL_GLASS_CONTAINER_PROPS,
  GLASS_SHAPE_PROPS,
  PANEL_MIN_HEIGHT,
  PANEL_WIDTH,
} from '../types'
import { ConvertPanelContent } from './ConvertPanelContent'
import './converter.css'

type ConvertPanelProps = {
  readonly backdrop: VideoBackdropState
  readonly convertState: FfmpegConvertState
  readonly panelWidth?: number
}

/** 左（または上）の変換操作パネル（Liquid DOM） */
export const ConvertPanel = ({
  backdrop,
  convertState,
  panelWidth = PANEL_WIDTH,
}: ConvertPanelProps) => (
  <Frame width={panelWidth} minHeight={PANEL_MIN_HEIGHT}>
    <GlassContainer {...CONTROL_GLASS_CONTAINER_PROPS}>
      <Glass {...GLASS_SHAPE_PROPS}>
        <Html sizing="fill">
          <ConvertPanelContent backdrop={backdrop} convertState={convertState} />
        </Html>
      </Glass>
    </GlassContainer>
  </Frame>
)
