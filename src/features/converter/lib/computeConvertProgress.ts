/** UI に表示する変換フェーズ */
export type ConvertProgressPhase =
  | 'starting'
  | 'loading'
  | 'writing'
  | 'palette'
  | 'encoding'
  | 'finishing'

/** 変換パイプラインの pass 構成 */
export type ConvertProgressMode = 'single-pass' | 'two-pass'

const STARTING_PROGRESS = 1
const LOADING_PROGRESS = 8
const WRITING_PROGRESS = 15

const TWO_PASS_PALETTE_START = WRITING_PROGRESS
const TWO_PASS_PALETTE_SPAN = 40
const TWO_PASS_ENCODING_START = TWO_PASS_PALETTE_START + TWO_PASS_PALETTE_SPAN
const TWO_PASS_ENCODING_SPAN = 85 - TWO_PASS_ENCODING_START

const SINGLE_PASS_ENCODING_START = WRITING_PROGRESS
const SINGLE_PASS_ENCODING_SPAN = 85 - SINGLE_PASS_ENCODING_START

/**
 * ffmpeg pass の ratio (0..1) を全体進捗 (0..100) へ写像する。
 */
export const computeConvertProgress = (input: {
  readonly phase: ConvertProgressPhase
  readonly mode: ConvertProgressMode
  readonly passRatio?: number
}): number => {
  const ratio = Math.min(1, Math.max(0, input.passRatio ?? 0))

  switch (input.phase) {
    case 'starting':
      return STARTING_PROGRESS
    case 'loading':
      return LOADING_PROGRESS
    case 'writing':
      return WRITING_PROGRESS
    case 'palette':
      return Math.round(TWO_PASS_PALETTE_START + ratio * TWO_PASS_PALETTE_SPAN)
    case 'encoding':
      if (input.mode === 'single-pass') {
        return Math.round(
          SINGLE_PASS_ENCODING_START + ratio * SINGLE_PASS_ENCODING_SPAN,
        )
      }
      return Math.round(
        TWO_PASS_ENCODING_START + ratio * TWO_PASS_ENCODING_SPAN,
      )
    case 'finishing':
      return 100
  }
}

/**
 * 進捗フェーズに対応するユーザー向けラベル。
 */
export const convertProgressLabel = (phase: ConvertProgressPhase): string => {
  switch (phase) {
    case 'starting':
      return '変換を開始しています…'
    case 'loading':
      return 'FFmpeg を読み込んでいます…'
    case 'writing':
      return '動画データを準備しています…'
    case 'palette':
      return 'パレットを生成しています…'
    case 'encoding':
      return 'GIF をエンコードしています…'
    case 'finishing':
      return '仕上げ中…'
  }
}
