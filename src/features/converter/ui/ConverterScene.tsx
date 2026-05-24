import { useRef, useState, type CSSProperties } from 'react'
import {
  Background,
  HStack,
  Html,
  LiquidCanvas,
  Padding,
  VStack,
  ZStack,
} from '@liquid-dom/react'
import { UnsupportedScreen } from '../../../app/UnsupportedScreen'
import type { FfmpegConvertState } from '../hooks/useFfmpegConvert'
import { useSafeMaxDpr } from '../hooks/useSafeMaxDpr'
import { isViewportReady, useCanvasHostSize, useWideLayout } from '../hooks/useLayoutMedia'
import type { VideoBackdropState } from '../hooks/useVideoBackdrop'
import {
  computeNarrowCanvasHeight,
  computePanelWidth,
} from '../lib/computeSceneLayout'
import { BackdropContent } from './BackdropContent'
import { CenterPeek } from './CenterPeek'
import { ConvertPanel } from './ConvertPanel'
import { ConvertingOverlay, ConvertingOverlayPortal } from './ConvertingOverlay'
import { ResultPanel } from './ResultPanel'
import './converter.css'

type ConverterSceneProps = {
  readonly backdrop: VideoBackdropState
  readonly convertState: FfmpegConvertState
}

/** liquid-dom syncCanvasSize が backing store 寸法を canvas 属性に書くため、CSS 表示サイズをホストに固定する */
const LIQUID_CANVAS_FILL_STYLE: CSSProperties = { width: '100%', height: '100%' }

/** liquid-dom Renderer が生成する canvas の CSS 表示サイズ。属性 width/height とのフィードバックループを防ぐ */
const LIQUID_CANVAS_ELEMENT_STYLE: CSSProperties = { width: '100%', height: '100%', display: 'block' }

/** LiquidCanvas 上の変換 UI シーン */
export const ConverterScene = ({ backdrop, convertState }: ConverterSceneProps) => {
  const hostRef = useRef<HTMLDivElement>(null)
  const wide = useWideLayout()
  const canvasLayout = useCanvasHostSize(hostRef)
  const layoutReady = isViewportReady(canvasLayout)
  const safeMaxDpr = useSafeMaxDpr(canvasLayout)
  const [renderError, setRenderError] = useState<string | null>(null)

  if (renderError) {
    return <UnsupportedScreen reason={renderError} />
  }

  const panelWidth = computePanelWidth(canvasLayout.width, wide)
  const canvasHeight = wide ? canvasLayout.height : computeNarrowCanvasHeight()
  const canvasWidth = canvasLayout.width

  const hostStyle: CSSProperties = wide
    ? { width: '100%', height: '100%' }
    : { width: '100%', minHeight: '100vh', height: canvasHeight }

  const liquidCanvasStyle: CSSProperties = wide
    ? LIQUID_CANVAS_FILL_STYLE
    : { width: '100%', height: canvasHeight }

  const liquidCanvasKey = layoutReady
    ? `${canvasWidth}x${canvasHeight}x${safeMaxDpr}x${wide ? 'wide' : 'narrow'}`
    : 'pending'

  return (
    <div
      ref={hostRef}
      className={wide ? 'converter-scene-host' : 'converter-scene-host converter-scene-host--narrow'}
      style={hostStyle}
    >
      {layoutReady ? (
        <LiquidCanvas
          key={liquidCanvasKey}
          style={liquidCanvasStyle}
          canvasStyle={LIQUID_CANVAS_ELEMENT_STYLE}
          proposal={{ width: canvasWidth, height: canvasHeight }}
          maxDpr={safeMaxDpr}
          onError={(error: unknown) => {
            const message =
              error instanceof Error ? error.message : 'LiquidCanvas の描画に失敗しました。'
            setRenderError(message)
          }}
        >
          <ZStack alignment={wide ? 'center' : 'top'}>
            <Background
              background={
                <Html sizing="fill">
                  <BackdropContent backdrop={backdrop} />
                </Html>
              }
            >
              <Padding insets={24}>
                {wide ? (
                  <HStack spacing={28} alignment="center">
                    <ConvertPanel
                      backdrop={backdrop}
                      convertState={convertState}
                      panelWidth={panelWidth}
                    />
                    <CenterPeek backdrop={backdrop} />
                    <ResultPanel
                      backdrop={backdrop}
                      convertState={convertState}
                      panelWidth={panelWidth}
                    />
                  </HStack>
                ) : (
                  <VStack spacing={24} alignment="center">
                    <ConvertPanel
                      backdrop={backdrop}
                      convertState={convertState}
                      panelWidth={panelWidth}
                    />
                    <CenterPeek backdrop={backdrop} compact panelWidth={panelWidth} />
                    <ResultPanel
                      backdrop={backdrop}
                      convertState={convertState}
                      panelWidth={panelWidth}
                    />
                  </VStack>
                )}
              </Padding>
            </Background>

            {wide ? (
              <ConvertingOverlay
                convertState={convertState}
                viewportWidth={canvasWidth}
                viewportHeight={canvasHeight}
              />
            ) : null}
          </ZStack>
        </LiquidCanvas>
      ) : null}

      {!wide ? (
        <ConvertingOverlayPortal
          convertState={convertState}
          panelWidth={panelWidth}
        />
      ) : null}
    </div>
  )
}
