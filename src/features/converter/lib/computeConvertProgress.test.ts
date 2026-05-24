// Run: node --experimental-strip-types --test src/features/converter/lib/computeConvertProgress.test.ts

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  computeConvertProgress,
  convertProgressLabel,
} from './computeConvertProgress.ts'

describe('computeConvertProgress', () => {
  it('shows non-zero progress before ffmpeg pass ratio updates', () => {
    assert.equal(computeConvertProgress({ phase: 'starting', mode: 'two-pass' }), 1)
    assert.equal(computeConvertProgress({ phase: 'loading', mode: 'two-pass' }), 8)
    assert.equal(computeConvertProgress({ phase: 'writing', mode: 'two-pass' }), 15)
  })

  it('maps two-pass palette and encoding ratios into separate ranges', () => {
    assert.equal(
      computeConvertProgress({ phase: 'palette', mode: 'two-pass', passRatio: 0 }),
      15,
    )
    assert.equal(
      computeConvertProgress({ phase: 'palette', mode: 'two-pass', passRatio: 1 }),
      55,
    )
    assert.equal(
      computeConvertProgress({ phase: 'encoding', mode: 'two-pass', passRatio: 0 }),
      55,
    )
    assert.equal(
      computeConvertProgress({ phase: 'encoding', mode: 'two-pass', passRatio: 1 }),
      85,
    )
  })

  it('maps single-pass encoding across one wider range', () => {
    assert.equal(
      computeConvertProgress({ phase: 'encoding', mode: 'single-pass', passRatio: 0 }),
      15,
    )
    assert.equal(
      computeConvertProgress({ phase: 'encoding', mode: 'single-pass', passRatio: 1 }),
      85,
    )
  })
})

describe('convertProgressLabel', () => {
  it('returns a label for each phase', () => {
    assert.match(convertProgressLabel('loading'), /FFmpeg/)
    assert.match(convertProgressLabel('palette'), /パレット/)
    assert.match(convertProgressLabel('encoding'), /GIF/)
  })
})
