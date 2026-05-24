import { HStack, VStack } from '@liquid-dom/react'
import type { FfmpegConvertState } from '../hooks/useFfmpegConvert'
import type { VideoBackdropState } from '../hooks/useVideoBackdrop'
import { CenterPeek } from './CenterPeek'
import { ConvertPanel } from './ConvertPanel'
import { ResultPanel } from './ResultPanel'

type ScenePanelStackProps = {
  readonly wide: boolean
  readonly backdrop: VideoBackdropState
  readonly convertState: FfmpegConvertState
  readonly panelWidth: number
}

/** ワイドは横並び、ナローは縦積みの変換 UI パネル群 */
export const ScenePanelStack = ({
  wide,
  backdrop,
  convertState,
  panelWidth,
}: ScenePanelStackProps) => {
  const convertPanel = (
    <ConvertPanel
      backdrop={backdrop}
      convertState={convertState}
      panelWidth={panelWidth}
    />
  )
  const centerPeek = wide ? (
    <CenterPeek backdrop={backdrop} />
  ) : (
    <CenterPeek backdrop={backdrop} compact panelWidth={panelWidth} />
  )
  const resultPanel = (
    <ResultPanel
      backdrop={backdrop}
      convertState={convertState}
      panelWidth={panelWidth}
    />
  )

  if (wide) {
    return (
      <HStack spacing={28} alignment="center">
        {convertPanel}
        {centerPeek}
        {resultPanel}
      </HStack>
    )
  }

  return (
    <VStack spacing={24} alignment="center">
      {convertPanel}
      {centerPeek}
      {resultPanel}
    </VStack>
  )
}
