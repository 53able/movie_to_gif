export type BackdropUrlSnapshot = {
  readonly videoUrl: string | null
  readonly frameUrl: string | null
}

/**
 * スナップショット遷移で revoke すべき blob URL を返す。
 * 各 URL は自身が差し替わった／クリアされたときだけ対象にする。
 */
export const blobUrlsToRevoke = (
  previous: BackdropUrlSnapshot,
  next: BackdropUrlSnapshot,
): readonly string[] => {
  const staleUrls: string[] = []

  if (previous.videoUrl !== null && previous.videoUrl !== next.videoUrl) {
    staleUrls.push(previous.videoUrl)
  }

  if (
    previous.frameUrl !== null &&
    previous.frameUrl.startsWith('blob:') &&
    previous.frameUrl !== next.frameUrl
  ) {
    staleUrls.push(previous.frameUrl)
  }

  return staleUrls
}
