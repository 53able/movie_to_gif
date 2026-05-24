import { z } from 'zod'

/** Liquid DOM 描画に必要な API の利用可否 */
export const liquidCapabilitiesSchema = z.object({
  webgpu: z.boolean(),
  htmlInCanvas: z.boolean(),
})

export type LiquidCapabilities = z.infer<typeof liquidCapabilitiesSchema>

/** ゲート判定後の UI ルート */
export const liquidGateRouteSchema = z.enum([
  'ready-liquid',
  'ready-flat',
  'unsupported',
])

export type LiquidGateRoute = z.infer<typeof liquidGateRouteSchema>

export type ResolveLiquidGateInput = {
  readonly htmlInCanvas: boolean
  readonly webgpu: boolean
}

export type ResolvedLiquidGate = {
  readonly status: LiquidGateRoute
  readonly capabilities: LiquidCapabilities
  readonly reason: string | null
}

/**
 * WebGPU / HTML-in-Canvas の組み合わせから UI ルートを決める。
 * Flat UI は WebGPU 不要のため、Liquid 条件を満たさない場合は ready-flat にフォールバックする。
 */
export const resolveLiquidGate = (
  input: ResolveLiquidGateInput,
): ResolvedLiquidGate => {
  const capabilities: LiquidCapabilities = {
    webgpu: input.webgpu,
    htmlInCanvas: input.htmlInCanvas,
  }

  if (input.webgpu && input.htmlInCanvas) {
    return { status: 'ready-liquid', capabilities, reason: null }
  }

  return { status: 'ready-flat', capabilities, reason: null }
}

/** 非対応 API ごとの説明文を組み立てる（Unsupported 画面向け） */
export const formatCapabilityReasons = (
  capabilities: LiquidCapabilities,
): readonly string[] => {
  const reasons: string[] = []

  if (!capabilities.webgpu) {
    reasons.push('WebGPU (navigator.gpu) が利用できません。')
  }

  if (!capabilities.htmlInCanvas) {
    reasons.push(
      'HTML-in-Canvas API が利用できません。Chrome では chrome://flags/#canvas-draw-element を有効化してください。iOS Safari 26 など Html API 非対応環境では CSS フォールバック UI が表示されます。',
    )
  }

  return reasons
}
