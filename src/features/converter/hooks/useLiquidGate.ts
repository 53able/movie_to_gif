import { useEffect, useState } from 'react'
import { supportsHtmlInCanvas } from '../../../lib/supportsHtmlInCanvas'
import {
  resolveLiquidGate,
  type LiquidCapabilities,
} from '../lib/resolveLiquidGate'
import { liquidGateStatusSchema, type LiquidGateStatus } from '../types'

export type LiquidGateResult = {
  readonly status: LiquidGateStatus
  readonly capabilities: LiquidCapabilities
  readonly reason: string | null
}

const INITIAL_CAPABILITIES: LiquidCapabilities = {
  webgpu: false,
  htmlInCanvas: false,
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
 * ブラウザが WebAssembly 変換の前提を満たすか判定する。
 */
const supportsWasmConversion = (): boolean =>
  typeof WebAssembly !== 'undefined'

/**
 * WebGPU / HTML-in-Canvas の組み合わせから Liquid または Flat UI ルートを決める。
 */
export const useLiquidGate = (): LiquidGateResult => {
  const [status, setStatus] = useState<LiquidGateStatus>('checking')
  const [capabilities, setCapabilities] = useState<LiquidCapabilities>(INITIAL_CAPABILITIES)
  const [reason, setReason] = useState<string | null>(null)

  useEffect(() => {
    const check = async (): Promise<void> => {
      if (!supportsWasmConversion()) {
        setCapabilities(INITIAL_CAPABILITIES)
        setReason('WebAssembly が利用できないため、ブラウザ内変換を実行できません。')
        setStatus('unsupported')
        return
      }

      const htmlInCanvas = supportsHtmlInCanvas()
      const adapter = navigator.gpu ? await requestWebGpuAdapter() : null
      const webgpu = adapter !== null

      const resolved = resolveLiquidGate({ htmlInCanvas, webgpu })
      setCapabilities(resolved.capabilities)
      setReason(resolved.reason)
      setStatus(resolved.status)
    }

    void check().catch((error: unknown) => {
      const message = error instanceof Error ? error.message : '不明なエラー'
      setCapabilities(INITIAL_CAPABILITIES)
      setReason(`環境チェックに失敗しました: ${message}`)
      setStatus('unsupported')
    })
  }, [])

  const parsedStatus = liquidGateStatusSchema.safeParse(status)
  const safeStatus = parsedStatus.success ? parsedStatus.data : 'unsupported'

  return { status: safeStatus, capabilities, reason }
}
