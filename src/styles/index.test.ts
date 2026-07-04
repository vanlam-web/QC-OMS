/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const css = readFileSync(join(process.cwd(), 'src/styles/index.css'), 'utf8')

function cssRule(selector: string) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, 'm'))
  return match?.[1] ?? ''
}

it('keeps shell account controls aligned with the management page header row', () => {
  expect(cssRule('.app-shell')).toContain('grid-template-rows: auto minmax(0, 1fr)')
  expect(cssRule('.shell-action-rail')).toContain('position: absolute')
  expect(cssRule('.shell-action-rail')).toContain('top: var(--shell-action-rail-top)')
  expect(cssRule('.management-page-header')).toContain('padding-right: var(--shell-action-rail-reserved-width)')
})

it('keeps login controls on theme colors so entered text remains visible', () => {
  expect(cssRule('.auth-shell')).toContain('background: var(--color-background)')
  expect(cssRule('.auth-shell form')).toContain('background: var(--color-surface)')
  expect(cssRule('.auth-shell input')).toContain('color: var(--color-text)')
  expect(cssRule('.auth-shell input')).toContain('background: var(--color-surface-muted)')
})

it('keeps compact create action styling in one shared CSS rule', () => {
  const rule = cssRule('.management-compact-create-action')

  expect(rule).toContain('background: transparent')
  expect(rule).toContain('border: 0')
  expect(rule).toContain('color: var(--color-text)')
  expect(rule).toContain('width: 2rem')
  expect(rule).toContain('height: 2rem')
  expect(rule).toContain('min-height: 2rem')
})

it('keeps management KPI summaries compact above filters', () => {
  expect(cssRule('.management-kpis .metric-grid')).toContain('grid-template-columns: 1fr')
  expect(cssRule('.management-kpis .metric-grid')).toContain('margin-bottom: 0')
  expect(cssRule('.management-filter-column')).toContain('gap: 0')
  expect(cssRule('.management-filter-column')).toContain('padding: var(--space-3)')
  expect(cssRule('.management-kpis .metric-card')).toContain('display: flex')
  expect(cssRule('.management-kpis .metric-card')).toContain('min-height: 2rem')
  expect(cssRule('.management-kpis .metric-card')).toContain('border-color: var(--color-border)')
  expect(cssRule('.management-kpis .metric-card')).toContain('background: var(--color-surface)')
  expect(cssRule('.management-kpis .metric-card > small')).toContain('display: none')
  expect(cssRule('.management-filter-sidebar')).toContain('position: relative')
  expect(cssRule('.management-filter-collapse-button')).toContain('position: absolute')
})
