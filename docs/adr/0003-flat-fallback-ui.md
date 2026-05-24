# CSS Flat UI を HTML-in-Canvas 非対応時のフォールバックとする

Liquid DOM は WebGPU と HTML-in-Canvas の両方が必要。iOS Safari 26 など WebGPU は使えるが Html API が無い環境では Liquid UI を描画できない。

**Decision:** Html-in-Canvas が無い場合は **FlatScene**（通常 DOM + CSS ガラス風 UI）へフォールバックし、FFmpeg.wasm 変換は継続提供する。WebGPU + Html 両方が使える場合のみ **ConverterScene**（Liquid UI）を表示する。

**Considered Options:** 非対応時は説明画面のみ（ADR-0002 当初方針） / Flat フォールバック / WebGPU のみで Liquid 部分描画

**Consequences:** UI を Liquid / Flat の二系統メンテするが、パネル DOM は `*PanelContent` コンポーネントで共通化する。WebGPU 単体不足では Unsupported にせず Flat へ誘導する。変換不能（WebAssembly 欠如・環境チェック失敗）のみ Unsupported 画面。
