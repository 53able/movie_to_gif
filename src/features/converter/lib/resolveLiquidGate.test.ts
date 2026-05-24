// Run: node --experimental-strip-types --test src/features/converter/lib/resolveLiquidGate.test.ts

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { formatCapabilityReasons, resolveLiquidGate } from './resolveLiquidGate.ts'

describe('resolveLiquidGate', () => {
  it('returns ready-liquid when WebGPU and HTML-in-Canvas are both available', () => {
    const result = resolveLiquidGate({ webgpu: true, htmlInCanvas: true })

    assert.equal(result.status, 'ready-liquid')
    assert.equal(result.reason, null)
    assert.deepEqual(result.capabilities, { webgpu: true, htmlInCanvas: true })
  })

  it('returns ready-flat when HTML-in-Canvas is unavailable (iOS 26 Safari case)', () => {
    const result = resolveLiquidGate({ webgpu: true, htmlInCanvas: false })

    assert.equal(result.status, 'ready-flat')
    assert.equal(result.reason, null)
    assert.deepEqual(result.capabilities, { webgpu: true, htmlInCanvas: false })
  })

  it('returns ready-flat when WebGPU is unavailable but HTML-in-Canvas works', () => {
    const result = resolveLiquidGate({ webgpu: false, htmlInCanvas: true })

    assert.equal(result.status, 'ready-flat')
    assert.deepEqual(result.capabilities, { webgpu: false, htmlInCanvas: true })
  })

  it('returns ready-flat when neither API is available', () => {
    const result = resolveLiquidGate({ webgpu: false, htmlInCanvas: false })

    assert.equal(result.status, 'ready-flat')
    assert.deepEqual(result.capabilities, { webgpu: false, htmlInCanvas: false })
  })
})

describe('formatCapabilityReasons', () => {
  it('lists missing APIs separately', () => {
    const reasons = formatCapabilityReasons({ webgpu: false, htmlInCanvas: false })

    assert.equal(reasons.length, 2)
    assert.match(reasons[0] ?? '', /WebGPU/)
    assert.match(reasons[1] ?? '', /HTML-in-Canvas/)
  })

  it('returns empty list when both APIs are available', () => {
    assert.deepEqual(formatCapabilityReasons({ webgpu: true, htmlInCanvas: true }), [])
  })
})
