import type { ReactNode } from 'react'
import { PANEL_MIN_HEIGHT, PANEL_WIDTH } from '../types'

type FlatPanelShellProps = {
  readonly children: ReactNode
  readonly variant?: 'control' | 'result' | 'peek'
  readonly width?: number
  readonly minHeight?: number
}

/** CSS ガラス風パネルシェル（Flat UI 用） */
export const FlatPanelShell = ({
  children,
  variant = 'control',
  width = PANEL_WIDTH,
  minHeight = PANEL_MIN_HEIGHT,
}: FlatPanelShellProps) => (
  <section
    className={`flat-glass-panel flat-glass-panel--${variant}`}
    style={{ width: `${width}px`, minHeight: `${minHeight}px` }}
  >
    {children}
  </section>
)
