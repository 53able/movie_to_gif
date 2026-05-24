import type { FfmpegConvertState } from '../hooks/useFfmpegConvert'
import type { VideoBackdropState } from '../hooks/useVideoBackdrop'
import { CENTER_PEEK_WIDTH, PANEL_MIN_HEIGHT, PANEL_WIDTH } from '../types'
import { CenterPeekContent } from './CenterPeekContent'
import { ConvertPanelContent } from './ConvertPanelContent'
import { FlatPanelShell } from './FlatPanelShell'
import { ResultPanelContent } from './ResultPanelContent'

type FlatPanelStackProps = {
  readonly wide: boolean
  readonly backdrop: VideoBackdropState
  readonly convertState: FfmpegConvertState
  readonly panelWidth?: number
}

const resolvePanelState = (
  convertState: FfmpegConvertState,
): 'idle' | 'success' | 'error' => {
  if (convertState.error) return 'error'
  if (convertState.result) return 'success'
  return 'idle'
}

/** Flat UI 向けのパネル配置（ワイド横並び / ナロー縦積み） */
export const FlatPanelStack = ({
  wide,
  backdrop,
  convertState,
  panelWidth = PANEL_WIDTH,
}: FlatPanelStackProps) => {
  const panelState = resolvePanelState(convertState)
  const stackClass = wide ? 'flat-panel-stack flat-panel-stack--wide' : 'flat-panel-stack'

  return (
    <div className={stackClass}>
      <FlatPanelShell variant="control" width={panelWidth}>
        <ConvertPanelContent backdrop={backdrop} convertState={convertState} />
      </FlatPanelShell>

      <FlatPanelShell
        variant="peek"
        width={wide ? CENTER_PEEK_WIDTH : panelWidth}
        minHeight={wide ? PANEL_MIN_HEIGHT : 120}
      >
        <CenterPeekContent backdrop={backdrop} compact={!wide} />
      </FlatPanelShell>

      <FlatPanelShell variant="result" width={panelWidth}>
        <ResultPanelContent
          backdrop={backdrop}
          convertState={convertState}
          panelState={panelState}
        />
      </FlatPanelShell>
    </div>
  )
}
