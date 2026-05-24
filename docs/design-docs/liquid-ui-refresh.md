# Liquid UI 刷新 Design Doc

## 目的

movie_to_gif の UI を [Liquid DOM](https://53able.github.io/docs-site/docs/liquid-dom.html)（WebGPU リキッドグラス）で刷新する。変換ロジック（FFmpeg.wasm）は維持し、フレームワークを Vue 3 から React 19 へ移行する。

## 非目標（v1）

- ドラッグ＆ドロップによるファイル選択
- ~~WebGPU 非対応ブラウザ向けフォールバック UI~~ → **FlatScene** で Html 非対応時に CSS UI を提供（ADR-0003）
- Three.js / R3F 統合

## 実行要件

| 要件 | 詳細 |
|------|------|
| WebGPU + HTML-in-Canvas | 両方利用可 → **ConverterScene**（Liquid UI） |
| HTML-in-Canvas 不可 | **FlatScene**（CSS ガラス UI）。WebGPU 単体不足も Flat へ |
| WebAssembly | FFmpeg.wasm 実行に必須。欠如時のみ Unsupported |
| React | React 19（`@liquid-dom/react` peer 想定） |

## シーングラフ

```mermaid
flowchart TB
  LC[LiquidCanvas 全画面]
  BD[Backdrop Html]
  CP[変換パネル GlassContainer]
  RP[結果パネル GlassContainer]
  OV[変換中オーバーレイ Glass]

  LC --> BD
  LC --> CP
  LC --> RP
  LC -. converting .-> OV

  BD -->|未選択| GRAD[グラデーション]
  BD -->|選択後| FRAME[動画先頭フレーム]

  CP --> G1[Glass]
  G1 --> H1[Html: file / sliders / button / dither]

  RP --> G2[Glass]
  G2 --> H2[Html: preview / stats / download / error]
```

### z-order（手前 → 奥）

1. 変換中オーバーレイ（`converting` 時のみ）
2. 変換パネル（左 or 上）
3. 結果パネル（右 or 下）
4. Backdrop

## レイアウト

### Desktop（≥ 1024px）

```mermaid
flowchart LR
  subgraph viewport
    CP2[変換パネル]
    BD2[Backdrop 中央]
    RP2[結果パネル]
  end
  CP2 --- BD2 --- RP2
```

### Narrow（< 1024px）

```mermaid
flowchart TB
  CP3[変換パネル]
  BD3[Backdrop]
  RP3[結果パネル]
  CP3 --> BD3 --> RP3
```

## 状態遷移

### アプリ全体

```mermaid
stateDiagram-v2
  [*] --> GateCheck
  GateCheck --> Unsupported: WASM 不可 or チェック失敗
  GateCheck --> LiquidReady: WebGPU and Html API OK
  GateCheck --> FlatReady: Html API 不可 or WebGPU 不可
  Unsupported --> [*]
  LiquidReady --> Converting: 変換開始
  FlatReady --> Converting: 変換開始
  Converting --> LiquidReady: 完了 or 失敗
  Converting --> FlatReady: 完了 or 失敗
```

### Flat フォールバック（ADR-0003）

iOS Safari 26 など **WebGPU は使えるが HTML-in-Canvas が無い** 環境向け。

```mermaid
flowchart TB
  FS[FlatScene 全画面]
  BD2[Backdrop video 要素]
  FP[FlatPanelStack CSS ガラス]
  OV2[変換中 DOM オーバーレイ]

  FS --> BD2
  FS --> FP
  FS -. converting .-> OV2

  FP --> CP4[ConvertPanelContent]
  FP --> RP4[ResultPanelContent]
```

- Liquid の `Glass` / `Html` の代わりに `flat-glass-panel` + 既存 `panel-html` クラスを再利用
- 変換 hooks（`useFfmpegConvert` / `useVideoBackdrop` / `useLayoutMedia`）は Liquid と共通

### 結果パネル

```mermaid
stateDiagram-v2
  [*] --> idle
  idle --> success: 変換成功
  idle --> error: 変換失敗
  success --> success: 再変換成功
  success --> error: 再変換失敗
  error --> success: 再変換成功
  error --> error: 再変換失敗
  success --> idle: 新規ファイル選択
  error --> idle: 新規ファイル選択
```

- **idle**: プレースホルダ文言
- **success**: GIF プレビュー + 容量比 + ダウンロードボタン
- **error**: プレビュー領域をエラーメッセージに差し替え（前回 GIF は破棄）

## グラススタイル（シネマティックダーク）

| パラメータ | 目安 | 備考 |
|------------|------|------|
| `blur` | 16–24 | Container / GlassContainer |
| `thickness` | 80–100 | リキッド感 |
| `tint` | 暗め半透明 | Backdrop の動画を活かす |
| `cornerRadius` | 40–48 | squircle |
| `cornerSmoothing` | 高め | iOS 風 |
| テキスト | 白系 | `Html` 内 CSS |

変換中オーバーレイは同系統の半透明 Glass。中央に `<progress>` + ％。

## コード構成

```
src/
├── main.tsx
├── app/
│   ├── App.tsx                 # Liquid / Flat ゲート分岐
│   └── UnsupportedScreen.tsx   # 変換不能時の説明
├── features/converter/
│   ├── hooks/
│   │   ├── useLiquidGate.ts    # WebGPU + Html API → ルート判定
│   │   ├── useVideoBackdrop.ts # 先頭フレーム抽出
│   │   └── useFfmpegConvert.ts # 変換・progress・error
│   ├── lib/
│   │   └── resolveLiquidGate.ts
│   ├── ui/
│   │   ├── ConverterScene.tsx  # LiquidCanvas ルート
│   │   ├── FlatScene.tsx       # CSS フォールバック
│   │   ├── ConvertPanelContent.tsx
│   │   ├── ConvertPanel.tsx
│   │   ├── ResultPanel.tsx
│   │   └── ConvertingOverlay.tsx
│   └── types.ts
└── lib/
    └── formatFileSize.ts
```

## 依存関係（追加予定）

```bash
pnpm add @liquid-dom/react react react-dom @ffmpeg/ffmpeg @ffmpeg/core
pnpm add -D @types/react @types/react-dom @vitejs/plugin-react
```

Vue 関連（`vue`, `@vitejs/plugin-vue`, `vue-tsc`）は削除。

## v1 機能一覧

| 機能 | 備考 |
|------|------|
| MP4/MOV ファイル選択 | `Html` 内 `<input type="file">` |
| FPS / スケール / ディザ | 現行と同範囲 |
| 変換実行 | FFmpeg.wasm |
| 進捗 | 全画面オーバーレイ |
| 容量比表示 | 成功時 |
| GIF プレビュー | 成功時 |
| GIF ダウンロード | `<a download>` |
| エラー表示 | 結果パネル error 状態 |

## 移行方針

Vue SFC を一括削除し React 19 + Liquid DOM に置換（1 PR）。中間的な Vue/React 同居は行わない。

## 参考

- [Liquid DOM ドキュメント](https://53able.github.io/docs-site/docs/liquid-dom.html)
- ADR: `docs/adr/0001-vue-react-liquid.md`
- ADR: `docs/adr/0002-webgpu-required.md`（Liquid 描画条件）
- ADR: `docs/adr/0003-flat-fallback-ui.md`（Flat フォールバック）
