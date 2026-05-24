# movie_to_gif — ドメイン用語

## UI / 技術

| 用語 | 定義 |
|------|------|
| **Liquid UI** | WebGPU 上で iOS 風リキッドグラスを描画する UI 層。`@liquid-dom/react` を使用する |
| **Flat UI** | HTML-in-Canvas 非対応時の CSS ガラス風フォールバック。`FlatScene` で描画 |
| **変換パネル** | 動画ファイル選択・変換パラメータ（FPS / スケール / ディザ）・変換実行を含む操作面。Glass パネル上に配置 |
| **変換中オーバーレイ** | FFmpeg 実行中に全画面を覆う半透明 Glass。中央に進捗表示。操作はブロック |
| **結果パネル** | 容量比・GIF プレビューを表示する Glass パネル |
| **Backdrop** | LiquidCanvas 最背面。**未選択時はグラデーション**、**動画選択後は先頭フレーム**を表示し、グラスの透過効果の素材になる |
| **グラススタイル** | シネマティックダーク。高 blur・暗め tint・白文字。Backdrop の動画を活かす |
| **変換** | FFmpeg.wasm による MP4/MOV → GIF 変換処理 |
| **変換結果** | 成功時は GIF プレビュー + ダウンロード。失敗時は結果パネル全体をエラーメッセージに差し替え（前回 GIF は消す） |

## 決定済み

- UI 刷新は **Vue 3 から React 19 へ移行**し、`@liquid-dom/react` で宣言的に Liquid UI を構築する（2026-05-24）
- **WebGPU + HTML-in-Canvas が両方使える環境では Liquid UI**（ConverterScene）。Html 非対応時は **Flat UI**（FlatScene）で変換を提供する（2026-05-24, ADR-0003）
- **WebAssembly が使えない環境のみ** Unsupported 画面（変換不可）
- 画面構成は **全画面 LiquidCanvas + Backdrop + 変換パネル + 結果パネル** の2 Glass 構成（2026-05-24）
- 操作 UI（ファイル選択・スライダー・ボタン等）は **`Glass` > `Html` 内のネイティブ DOM** に配置する。利用条件は WebGPU + HTML-in-Canvas 対応 Chrome（`canvas-draw-element` フラグ ON）とする（2026-05-24）
- Backdrop は **未選択＝グラデ / 選択後＝動画先頭フレーム** に切り替える（2026-05-24）
- 変換中は **全画面半透明 Glass オーバーレイ + 中央 progress** で進捗表示（2026-05-24）
- グラスビジュアルは **シネマティックダーク**（高 blur・暗 tint・白文字）（2026-05-24）
- パネル配置は **左＝変換パネル / 右＝結果パネル**、中央に Backdrop。狭い viewport では縦積み（2026-05-24）
- v1 スコープは **現機能パリティ + GIF ダウンロード + エラー表示**（D&D は対象外）（2026-05-24）
- 結果パネルの状態は **`idle | success | error`**。エラー時はプレビュー領域をメッセージに差し替える（2026-05-24）
- React 構成は **hooks（変換・Backdrop・Liquid ゲート）+ ui（Liquid パネル）** に分離（2026-05-24）
- Vue → React 移行は **一括置換**（Vue 削除 + React 19 + Liquid DOM、1 PR）（2026-05-24）
- 実装前に **`docs/design-docs/liquid-ui-refresh.md`** に Design Doc を書く。ADR で不可逆な決定を記録（2026-05-24）
- レスポンシブ breakpoint は **1024px 未満で縦積み**（上＝変換 / 下＝結果）（2026-05-24）
