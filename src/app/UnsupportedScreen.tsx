import type { LiquidCapabilities } from '../features/converter/lib/resolveLiquidGate'
import { formatCapabilityReasons } from '../features/converter/lib/resolveLiquidGate'

type UnsupportedScreenProps = {
  readonly reason: string | null
  readonly capabilities?: LiquidCapabilities
}

/** 変換機能を提供できない環境向けの説明画面 */
export const UnsupportedScreen = ({
  reason,
  capabilities,
}: UnsupportedScreenProps) => {
  const capabilityReasons =
    capabilities === undefined ? [] : formatCapabilityReasons(capabilities)

  return (
    <main className="gate-screen">
      <div className="gate-screen__card">
        <h1>このブラウザでは変換できません</h1>
        <p>
          movie_to_gif はブラウザ内 FFmpeg による MP4/MOV → GIF 変換を行います。
          現在の環境では変換に必要な機能が不足しています。
        </p>

        {reason ? <p className="gate-screen__reason">{reason}</p> : null}

        {capabilityReasons.length > 0 ? (
          <ul className="gate-screen__reasons">
            {capabilityReasons.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}

        <p className="gate-screen__hint">
          Liquid UI（WebGPU + HTML-in-Canvas）が使える Chrome ではグラス UI が表示されます。
          iOS Safari 26 など Html API 非対応環境では CSS フォールバック UI で変換できます。
        </p>

        <ul>
          <li>推奨: Chrome（WebGPU + canvas-draw-element フラグ ON）</li>
          <li>
            フラグ{' '}
            <code>chrome://flags/#canvas-draw-element</code> を有効化
          </li>
          <li>
            詳細:{' '}
            <a
              href="https://53able.github.io/docs-site/docs/liquid-dom.html"
              target="_blank"
              rel="noreferrer"
            >
              Liquid DOM ドキュメント
            </a>
          </li>
        </ul>
      </div>
    </main>
  )
}
