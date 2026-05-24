// Run: node --experimental-strip-types --test src/features/converter/lib/backdropBlobUrls.test.ts

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { blobUrlsToRevoke } from './backdropBlobUrls.ts'

describe('blobUrlsToRevoke', () => {
  it('does not revoke videoUrl when only frameUrl updates', () => {
    const videoUrl = 'blob:http://localhost/video'

    const staleUrls = blobUrlsToRevoke(
      { videoUrl, frameUrl: null },
      { videoUrl, frameUrl: 'data:image/jpeg;base64,abc' },
    )

    assert.deepEqual(staleUrls, [])
  })

  it('revokes replaced videoUrl', () => {
    const previousVideoUrl = 'blob:http://localhost/old'
    const nextVideoUrl = 'blob:http://localhost/new'

    const staleUrls = blobUrlsToRevoke(
      { videoUrl: previousVideoUrl, frameUrl: null },
      { videoUrl: nextVideoUrl, frameUrl: null },
    )

    assert.deepEqual(staleUrls, [previousVideoUrl])
  })

  it('revokes cleared videoUrl', () => {
    const videoUrl = 'blob:http://localhost/video'

    const staleUrls = blobUrlsToRevoke(
      { videoUrl, frameUrl: 'data:image/jpeg;base64,abc' },
      { videoUrl: null, frameUrl: null },
    )

    assert.deepEqual(staleUrls, [videoUrl])
  })

  it('revokes replaced blob frameUrl only', () => {
    const previousFrameUrl = 'blob:http://localhost/frame-old'
    const nextFrameUrl = 'blob:http://localhost/frame-new'

    const staleUrls = blobUrlsToRevoke(
      { videoUrl: 'blob:http://localhost/video', frameUrl: previousFrameUrl },
      { videoUrl: 'blob:http://localhost/video', frameUrl: nextFrameUrl },
    )

    assert.deepEqual(staleUrls, [previousFrameUrl])
  })
})
