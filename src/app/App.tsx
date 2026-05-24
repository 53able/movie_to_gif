import { useFfmpegConvert } from '../features/converter/hooks/useFfmpegConvert'
import { useLiquidGate } from '../features/converter/hooks/useLiquidGate'
import { useVideoBackdrop } from '../features/converter/hooks/useVideoBackdrop'
import { ConverterScene } from '../features/converter/ui/ConverterScene'
import { FlatScene } from '../features/converter/ui/FlatScene'
import '../features/converter/ui/converter.css'
import { UnsupportedScreen } from './UnsupportedScreen'

/** アプリルート。Liquid / Flat ゲート通過後に変換シーンを描画する。 */
export const App = () => {
  const gate = useLiquidGate()
  const backdrop = useVideoBackdrop()
  const convertState = useFfmpegConvert()

  if (gate.status === 'checking') {
    return <div className="app-loading">環境を確認しています…</div>
  }

  if (gate.status === 'unsupported') {
    return (
      <UnsupportedScreen
        reason={gate.reason}
        capabilities={gate.capabilities}
      />
    )
  }

  if (gate.status === 'ready-flat') {
    return <FlatScene backdrop={backdrop} convertState={convertState} />
  }

  return <ConverterScene backdrop={backdrop} convertState={convertState} />
}
