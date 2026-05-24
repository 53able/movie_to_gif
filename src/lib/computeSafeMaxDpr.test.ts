// Run: node --experimental-strip-types --test src/lib/computeSafeMaxDpr.test.ts

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  computeCeilDevicePixelSize,
  computeDevicePixelSize,
  computeSafeMaxDpr,
  DEFAULT_MAX_TEXTURE_DIMENSION_2D,
  liquidDomDevicePixels,
} from './computeSafeMaxDpr.ts'

const assertWithinTextureLimit = (
  viewportWidth: number,
  viewportHeight: number,
  devicePixelRatio: number,
  maxDpr: number,
): void => {
  const ceilPixels = computeCeilDevicePixelSize(
    viewportWidth,
    viewportHeight,
    devicePixelRatio,
    maxDpr,
  )
  const roundedPixels = computeDevicePixelSize(
    viewportWidth,
    viewportHeight,
    devicePixelRatio,
    maxDpr,
  )

  assert.ok(
    ceilPixels.width <= DEFAULT_MAX_TEXTURE_DIMENSION_2D,
    `ceil width ${ceilPixels.width} exceeds ${DEFAULT_MAX_TEXTURE_DIMENSION_2D}`,
  )
  assert.ok(
    ceilPixels.height <= DEFAULT_MAX_TEXTURE_DIMENSION_2D,
    `ceil height ${ceilPixels.height} exceeds ${DEFAULT_MAX_TEXTURE_DIMENSION_2D}`,
  )
  assert.ok(
    roundedPixels.width <= DEFAULT_MAX_TEXTURE_DIMENSION_2D,
    `round width ${roundedPixels.width} exceeds ${DEFAULT_MAX_TEXTURE_DIMENSION_2D}`,
  )
  assert.ok(
    roundedPixels.height <= DEFAULT_MAX_TEXTURE_DIMENSION_2D,
    `round height ${roundedPixels.height} exceeds ${DEFAULT_MAX_TEXTURE_DIMENSION_2D}`,
  )
}

describe('computeSafeMaxDpr', () => {
  it('caps ultra-wide 5771x2891 at DPR 2 within 8192 device pixels', () => {
    const maxDpr = computeSafeMaxDpr({
      viewportWidth: 5771,
      viewportHeight: 2891,
      devicePixelRatio: 2,
    })

    assert.ok(maxDpr < 2)
    assertWithinTextureLimit(5771, 2891, 2, maxDpr)
  })

  it('caps ultra-wide 4309x2158 at DPR 2 within 8192 device pixels', () => {
    const maxDpr = computeSafeMaxDpr({
      viewportWidth: 4309,
      viewportHeight: 2158,
      devicePixelRatio: 2,
    })

    assert.ok(maxDpr < 2)
    assertWithinTextureLimit(4309, 2158, 2, maxDpr)
    assert.equal(liquidDomDevicePixels(4309, maxDpr), 8191)
  })

  it('allows full DPR on small viewports', () => {
    const maxDpr = computeSafeMaxDpr({
      viewportWidth: 1280,
      viewportHeight: 720,
      devicePixelRatio: 2,
    })

    assert.equal(maxDpr, 2)
    assertWithinTextureLimit(1280, 720, 2, maxDpr)
  })

  it('documents innerWidth underestimate vs actual host width', () => {
    const underestimatedMaxDpr = computeSafeMaxDpr({
      viewportWidth: 4096,
      viewportHeight: 2158,
      devicePixelRatio: 2,
    })

    assert.equal(underestimatedMaxDpr, 2)
    assert.ok(liquidDomDevicePixels(4309, underestimatedMaxDpr) > DEFAULT_MAX_TEXTURE_DIMENSION_2D)

    const hostMeasuredMaxDpr = computeSafeMaxDpr({
      viewportWidth: 4309,
      viewportHeight: 2158,
      devicePixelRatio: 2,
    })

    assert.ok(hostMeasuredMaxDpr < 2)
    assertWithinTextureLimit(4309, 2158, 2, hostMeasuredMaxDpr)
  })

  it('caps the reported 8619 device-pixel failure at ultra-wide CSS width', () => {
    const cssWidth = 4309
    const cssHeight = 2158
    const maxDpr = computeSafeMaxDpr({
      viewportWidth: cssWidth,
      viewportHeight: cssHeight,
      devicePixelRatio: 2,
    })

    const deviceWidth = liquidDomDevicePixels(cssWidth, maxDpr)
    assert.ok(deviceWidth < 8619, `device width ${deviceWidth} would reproduce Texture size 8619x… errors`)
    assertWithinTextureLimit(cssWidth, cssHeight, 2, maxDpr)
  })
})
