import {
  Frame,
  Glass,
  GlassContainer,
  Html,
} from '@liquid-dom/react'
import type { FfmpegConvertState } from '../hooks/useFfmpegConvert'
import type { VideoBackdropState } from '../hooks/useVideoBackdrop'
import {
  GLASS_SHAPE_PROPS,
  PANEL_MIN_HEIGHT,
  PANEL_WIDTH,
  RESULT_GLASS_CONTAINER_PROPS,
  type ResultPanelState,
} from '../types'
import { ResultPanelContent } from './ResultPanelContent'
import './converter.css'

type ResultPanelProps = {
  readonly backdrop: VideoBackdropState
  readonly convertState: FfmpegConvertState
  readonly panelWidth?: number
}

const resolvePanelState = (convertState: FfmpegConvertState): ResultPanelState => {
  if (convertState.error) return 'error'
  if (convertState.result) return 'success'
  return 'idle'
}

/** 右（または下）の結果表示パネル（Liquid DOM） */
export const ResultPanel = ({
  backdrop,
  convertState,
  panelWidth = PANEL_WIDTH,
}: ResultPanelProps) => {
  const panelState = resolvePanelState(convertState)

  return (
    <Frame width={panelWidth} minHeight={PANEL_MIN_HEIGHT}>
      <GlassContainer {...RESULT_GLASS_CONTAINER_PROPS}>
        <Glass {...GLASS_SHAPE_PROPS}>
          <Html sizing="fill">
            <ResultPanelContent
              backdrop={backdrop}
              convertState={convertState}
              panelState={panelState}
            />
          </Html>
        </Glass>
      </GlassContainer>
    </Frame>
  )
}
