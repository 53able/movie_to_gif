# WebGPU と HTML-in-Canvas を Liquid UI の利用条件とする

Liquid DOM のグラス描画は `navigator.gpu`（WebGPU）必須。操作 UI を `Glass` > `Html` でネイティブ DOM 越しに表示するには HTML-in-Canvas 実験 API（Chrome `canvas-draw-element` フラグ）も必要。

当初は非対応時に説明画面のみとしたが、iOS Safari 26 など Html API 非対応環境でも変換を提供するため **ADR-0003** で Flat UI フォールバックを追加した。

**Considered Options:** WebGPU 必須 / 非対応時 CSS フォールバック / Chrome のみフラット UI

**Consequences:** Liquid UI は WebGPU + Html 両方必須。Html または WebGPU 単体不足時は FlatScene へ。README と Unsupported 画面に要件を明記する。
