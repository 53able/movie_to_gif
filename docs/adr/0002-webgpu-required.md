# WebGPU と HTML-in-Canvas を利用条件とする

Liquid DOM のグラス描画は `navigator.gpu`（WebGPU）必須。操作 UI を `Glass` > `Html` でネイティブ DOM 越しに表示するには HTML-in-Canvas 実験 API（Chrome `canvas-draw-element` フラグ）も必要。

フォールバックとして WebGPU 非対応時に通常 CSS UI を提供する案（graceful degradation）を検討したが、UI を二系統メンテするコストに対し、本ツールは開発者向け実験的 UI 刷新が主目的のため、要件を満たさない環境では変換機能を提供せず説明画面のみ表示する。

**Considered Options:** WebGPU 必須 / 非対応時 CSS フォールバック / Chrome のみフラット UI

**Consequences:** Safari・Firefox・フラグ OFF の Chrome では利用不可。README と Unsupported 画面に要件を明記する。
