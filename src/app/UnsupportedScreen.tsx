type UnsupportedScreenProps = {
  readonly reason: string | null
}

/** WebGPU / HTML-in-Canvas 非対応時の説明画面 */
export const UnsupportedScreen = ({ reason }: UnsupportedScreenProps) => (
  <main className="gate-screen">
    <div className="gate-screen__card">
      <h1>Liquid UI を利用できません</h1>
      <p>
        このアプリは WebGPU と HTML-in-Canvas 実験 API が必要です。対応環境で再度アクセスしてください。
      </p>
      {reason && <p>{reason}</p>}
      <ul>
        <li>Chrome（WebGPU 対応版）</li>
        <li>
          フラグ <code>chrome://flags/#canvas-draw-element</code> を有効化
        </li>
        <li>
          詳細:{' '}
          <a href="https://53able.github.io/docs-site/docs/liquid-dom.html" target="_blank" rel="noreferrer">
            Liquid DOM ドキュメント
          </a>
        </li>
      </ul>
    </div>
  </main>
)
