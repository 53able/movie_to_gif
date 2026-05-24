# Vue 3 から React 19 + Liquid DOM へ一括移行

movie_to_gif は Vue 3 + Vite テンプレートで始まったが、UI 刷新に Liquid DOM を採用する。Liquid DOM は `@liquid-dom/react`（React 19）を公式バインディングとして提供し、Vue 向けパッケージは存在しない。

Vue のまま `@liquid-dom/core` 命令型 API をラップする案もあったが、グラス UI の宣言的記述・レイアウトコンポーネント（`LiquidCanvas`, `GlassContainer`, `Html`）の DX を優先し React へ移行する。コードベースは `Converter.vue` 中心の小規模のため、Vue/React 同居の段階移行ではなく一括置換とする。

**Considered Options:** Vue + core 命令型 / Vue + React 島 / React 19 + `@liquid-dom/react`

**Consequences:** Volar → React 型定義、Vite プラグイン差し替え、Netlify ビルドコマンド変更。Liquid DOM 前提のブラウザ要件は ADR-0002 を参照。
