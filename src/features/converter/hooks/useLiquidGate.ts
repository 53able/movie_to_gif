import { useEffect, useState } from 'react'
import { supportsHtmlInCanvas } from '../../../lib/supportsHtmlInCanvas'
import { liquidGateStatusSchema, type LiquidGateStatus } from '../types'

export type LiquidGateResult = {
  readonly status: LiquidGateStatus
  readonly reason: string | null
}

/**
 * WebGPU アダプタを取得する。環境によって powerPreference の有無で結果が変わることがある。
 */
const requestWebGpuAdapter = async (): Promise<GPUAdapter | null> => {
  const gpu = navigator.gpu
  if (!gpu) {
    return null
  }

  const highPerformance = await gpu.requestAdapter({ powerPreference: 'high-performance' })
  if (highPerformance) {
    return highPerformance
  }

  return gpu.requestAdapter()
}

/**
 * WebGPU と HTML-in-Canvas の両方が使えるか判定する。
 */
export const useLiquidGate = (): LiquidGateResult => {
  const [status, setStatus] = useState<LiquidGateStatus>('checking')
  const [reason, setReason] = useState<string | null>(null)

  useEffect(() => {
    const check = async (): Promise<void> => {
      if (!supportsHtmlInCanvas()) {
        setReason(
          'HTML-in-Canvas API が利用できません。Chrome で chrome://flags/#canvas-draw-element を有効化し、ブラウザを再起動してください。',
        )
        setStatus('unsupported')
        return
      }

      if (!navigator.gpu) {
        setReason('WebGPU (navigator.gpu) が利用できません。')
        setStatus('unsupported')
        return
      }

      const adapter = await requestWebGpuAdapter()
      if (!adapter) {
        setReason('WebGPU アダプタを取得できません。')
        setStatus('unsupported')
        return
      }

      setReason(null)
      setStatus('supported')
    }

    void check().catch((error: unknown) => {
      const message = error instanceof Error ? error.message : '不明なエラー'
      setReason(`環境チェックに失敗しました: ${message}`)
      setStatus('unsupported')
    })
  }, [])

  const parsedStatus = liquidGateStatusSchema.safeParse(status)
  const safeStatus = parsedStatus.success ? parsedStatus.data : 'unsupported'

  return { status: safeStatus, reason }
}
