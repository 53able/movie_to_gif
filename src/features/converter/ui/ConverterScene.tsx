import { useRef, useState, type CSSProperties } from 'react'
import {
  Background,
  Html,
  LiquidCanvas,
  Padding,
  ZStack,
} from '@liquid-dom/react'
import { UnsupportedScreen } from '../../../app/UnsupportedScreen'
import type { FfmpegConvertState } from '../hooks/useFfmpegConvert'
import { useSafeMaxDpr } from '../hooks/useSafeMaxDpr'
import { isViewportReady, useCanvasHostSize, useWideLayout } from '../hooks/useLayoutMedia'
import type { VideoBackdropState } from '../hooks/useVideoBackdrop'
import { resolveConverterSceneLayout } from '../lib/computeSceneLayout'
import { BackdropContent } from './BackdropContent'
import { ConvertingOverlay, ConvertingOverlayPortal } from './ConvertingOverlay'
import { ScenePanelStack } from './ScenePanelStack'
import './converter.css'

type ConverterSceneProps = {
  readonly backdrop: VideoBackdropState
  readonly convertState: FfmpegConvertState
}

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

  const sceneLayout = resolveConverterSceneLayout(canvasLayout, wide)

  const liquidCanvasKey = layoutReady
    ? `${sceneLayout.canvasWidth}x${sceneLayout.canvasHeight}x${safeMaxDpr}x${sceneLayout.liquidCanvasKeySuffix}`
    : 'pending'

  return (
    <div
      ref={hostRef}
      className={sceneLayout.hostClassName}
      style={sceneLayout.hostStyle}
    >
      {layoutReady ? (
        <LiquidCanvas
          key={liquidCanvasKey}
          style={sceneLayout.liquidCanvasStyle}
          canvasStyle={LIQUID_CANVAS_ELEMENT_STYLE}
          proposal={{ width: sceneLayout.canvasWidth, height: sceneLayout.canvasHeight }}
          maxDpr={safeMaxDpr}
          onError={(error: unknown) => {
            const message =
              error instanceof Error ? error.message : 'LiquidCanvas の描画に失敗しました。'
            setRenderError(message)
          }}
        >
          <ZStack alignment={sceneLayout.stackAlignment}>
            <Background
              background={
                <Html sizing="fill">
                  <BackdropContent backdrop={backdrop} />
                </Html>
              }
            >
              <Padding insets={24}>
                <ScenePanelStack
                  wide={wide}
                  backdrop={backdrop}
                  convertState={convertState}
                  panelWidth={sceneLayout.panelWidth}
                />
              </Padding>
            </Background>

            {sceneLayout.showInCanvasOverlay ? (
              <ConvertingOverlay
                convertState={convertState}
                viewportWidth={sceneLayout.canvasWidth}
                viewportHeight={sceneLayout.canvasHeight}
              />
            ) : null}
          </ZStack>
        </LiquidCanvas>
      ) : null}

      {sceneLayout.showPortalOverlay ? (
        <ConvertingOverlayPortal
          convertState={convertState}
          panelWidth={sceneLayout.panelWidth}
        />
      ) : null}
    </div>
  )
}
