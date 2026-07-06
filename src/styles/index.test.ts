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

it('places finance voucher actions at the right edge of the finance action row', () => {
  const rule = cssRule('.finance-voucher-actions')
  const actionsRule = cssRule('.finance-page-actions')
  const financeToolbarRule = cssRule('.finance-page-actions .management-compact-toolbar')

  expect(actionsRule).toContain('width: 100%')
  expect(actionsRule).toContain('justify-content: space-between')
  expect(financeToolbarRule).toContain('flex: 1 1 28rem')
  expect(financeToolbarRule).toContain('width: auto')
  expect(rule).toContain('margin-left: auto')
  expect(rule).toContain('flex-wrap: nowrap')
  expect(cssRule('.finance-voucher-actions .button')).toContain('white-space: nowrap')
  expect(cssRule('.finance-voucher-actions .button')).toContain('flex: 0 0 auto')
  expect(rule).not.toContain('position: fixed')
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
  expect(cssRule('.management-kpis .metric-card:first-child')).toContain('border-radius: var(--radius-sm) var(--radius-sm) 0 0')
  expect(cssRule('.management-kpis .metric-card:last-child')).toContain('border-radius: 0 0 var(--radius-sm) var(--radius-sm)')
  expect(cssRule('.management-kpis .metric-card > span')).toContain('color: var(--color-text)')
  expect(cssRule('.management-kpis .metric-card > span')).toContain('font-weight: 400')
  expect(cssRule('.management-kpis .metric-card > small')).toContain('display: none')
  expect(cssRule('.management-filter-sidebar')).toContain('position: relative')
  expect(cssRule('.management-filter-sidebar')).toContain('gap: 0')
  expect(cssRule('.management-filter-collapse-button')).toContain('position: absolute')
  expect(cssRule('.management-filter-group h2')).toContain('margin: 0')
  expect(cssRule('.management-filter-group h2')).toContain('padding: var(--space-2) 0')
  expect(cssRule('.management-filter-group h2')).toContain('line-height: 1.25')
})

it('keeps management filter selects styled as shared compact controls', () => {
  const rule = cssRule('.management-filter-select')

  expect(rule).toContain('appearance: none')
  expect(rule).toContain('min-height: 2.5rem')
  expect(rule).toContain('border: 1px solid var(--color-border)')
  expect(rule).toContain('border-radius: var(--radius-sm)')
  expect(rule).toContain('background-color: var(--color-surface)')
  expect(rule).toContain('background-image:')
  expect(rule).toContain('background-position: right var(--space-2) center')
  expect(rule).toContain('padding: 0 calc(var(--space-4) + 1.25rem) 0 var(--space-3)')
  expect(rule).toContain('box-shadow: var(--shadow-sm)')
})

it('lets feature forms live inside the shared filter sidebar without custom layout CSS', () => {
  expect(cssRule('.management-filter-sidebar-form')).toContain('display: contents')
  expect(cssRule('.management-filter-actions')).toContain('position: sticky')
  expect(cssRule('.management-filter-actions')).toContain('display: grid')
  expect(cssRule('.management-filter-actions')).toContain('grid-template-columns: 1fr')
  expect(cssRule('.management-filter-actions')).toContain('padding-bottom: var(--space-1)')
  expect(cssRule('.management-filter-actions .button')).toContain('width: 100%')
  expect(cssRule('.management-filter-actions .button')).toContain('white-space: normal')
  expect(cssRule('.finance-cashbook-filter')).toBe('')
})

it('right aligns money values in shared tables', () => {
  expect(cssRule('td:has(.money-text)')).toContain('text-align: right')
  expect(cssRule('.money-text')).toContain('font-variant-numeric: tabular-nums')
})

it('keeps the cashbook data table in a KV-like layout with project colors', () => {
  expect(cssRule('.finance-cashbook-data-table thead th')).toContain('text-transform: uppercase')
  expect(cssRule('.finance-cashbook-data-table thead th')).toContain('background: var(--color-surface-muted)')
  expect(cssRule('.finance-cashbook-data-table thead th')).not.toContain('#FEF3C7')
  expect(cssRule('.finance-cashbook-data-table tbody tr:hover td')).toContain('background: var(--color-surface-muted)')
  expect(cssRule('.finance-cashbook-code-link')).toContain('color: var(--color-primary)')
  expect(cssRule('.finance-cashbook-money-column')).toContain('text-align: right')
  expect(cssRule('.finance-cashbook-filter-summary .metric-grid')).toContain('grid-template-columns: 1fr')
  expect(cssRule('.finance-cashbook-filter-summary .metric-grid')).toContain('margin-bottom: var(--space-2)')
  expect(cssRule('.finance-cashbook-filter-summary .metric-card')).toContain('display: flex')
  expect(cssRule('.finance-cashbook-filter-summary .metric-card')).toContain('background: var(--color-surface)')
  expect(cssRule('.finance-cashbook-star-button')).toContain('background: transparent')
  expect(cssRule('.finance-cashbook-star-button')).toContain('cursor: pointer')
  expect(cssRule('.finance-cashbook-star-button')).toContain('display: inline-flex')
  expect(cssRule('.finance-cashbook-star-button')).toContain('height: 1.5rem')
  expect(cssRule('.finance-cashbook-star-column .finance-cashbook-star-button')).toContain('margin: 0 auto')
  expect(cssRule('.finance-cashbook-star-button:hover,\n.finance-cashbook-star-button-active')).toContain('color: var(--color-primary)')
})

it('keeps cashbook detail panel aligned to the KV expanded row structure', () => {
  expect(cssRule('.finance-cashbook-detail-header')).toContain('display: flex')
  expect(cssRule('.finance-cashbook-detail-header')).toContain('justify-content: space-between')
  expect(cssRule('.finance-cashbook-detail-title-line')).toContain('align-items: center')
  expect(cssRule('.finance-cashbook-detail-core-grid')).toContain('grid-template-columns: repeat(4, minmax(0, 1fr))')
  expect(cssRule('.finance-cashbook-detail-core-grid > div,\n.finance-cashbook-detail-extra-rows > div')).toContain('border-bottom: 1px solid var(--color-border-muted)')
  expect(cssRule('.finance-cashbook-linked-documents-inner')).toContain('border: 1px solid var(--color-border-muted)')
  expect(cssRule('.finance-cashbook-detail')).toContain('gap: var(--space-3)')
  expect(cssRule('.finance-cashbook-detail')).toContain('text-align: left')
  expect(cssRule('.finance-cashbook-linked-documents-inner')).toContain('padding: var(--space-2)')
  expect(cssRule('.finance-cashbook-detail footer')).toContain('align-items: center')
  expect(cssRule('.finance-cashbook-detail footer')).toContain('justify-content: space-between')
  expect(cssRule('.finance-cashbook-detail-actions')).toContain('justify-content: flex-start')
  expect(cssRule('.finance-cashbook-detail-actions-right')).toContain('justify-content: flex-end')
  expect(cssRule('.finance-cashbook-detail-actions-right')).toContain('margin-left: auto')
  expect(cssRule('.finance-cashbook-detail-action-cancel')).toContain('background: transparent')
  expect(cssRule('.finance-cashbook-detail-action-print')).toContain('background: var(--color-surface)')
})

it('keeps shared management table headers sticky and visually distinct', () => {
  const headerRule = cssRule('.management-list-surface thead th')

  expect(cssRule('.management-list-surface')).toContain('padding: var(--space-1)')
  expect(headerRule).toContain('position: sticky')
  expect(headerRule).toContain('top: 0')
  expect(headerRule).toContain('z-index: 2')
  expect(headerRule).toContain('background: color-mix(in srgb, var(--color-surface-raised) 88%, var(--color-primary))')
  expect(headerRule).toContain('box-shadow: inset 0 -1px 0 var(--color-border)')
})

it('shares inline detail tab styling outside customer-only pages', () => {
  expect(css).toContain('.customer-detail-tabs,\n.inline-detail-tabs')
  expect(css).toContain(".customer-detail-tabs button[aria-selected='true'],\n.inline-detail-tabs button[aria-selected='true']")
})

it('keeps inline detail surfaces unframed and summary rows single-line', () => {
  expect(css).toContain('--color-selected-border: var(--color-primary)')
  expect(css).toContain('.management-compact-search:focus-within')
  expect(css).toContain('border-color: var(--color-selected-border)')
  expect(cssRule('.management-data-row-selected td')).toContain('border-top: 1px solid var(--color-selected-border)')
  expect(cssRule('.management-data-row-selected td')).toContain('box-shadow: inset 0 1px 0 var(--color-selected-border)')
  expect(cssRule('.management-detail-row > td')).toContain('border: 0')
  expect(cssRule('.management-detail-row > td')).toContain('background: transparent')
  expect(cssRule('.management-detail-row > td')).toContain('padding: 0')
  expect(cssRule('.management-detail-row-selected > td')).toContain('border-right: 1px solid var(--color-selected-border)')
  expect(cssRule('.management-detail-row-selected > td')).toContain('border-bottom: 1px solid var(--color-selected-border)')
  expect(cssRule('.management-detail-row-selected > td')).toContain('border-left: 1px solid var(--color-selected-border)')
  expect(cssRule('.management-detail-row-selected > td')).toContain('background: transparent')
  expect(cssRule('.management-inline-detail')).toContain('border: 0')
  expect(cssRule('.management-inline-detail')).toContain('background: transparent')
  expect(cssRule('.management-inline-detail')).toContain('padding: 0')
  expect(cssRule('.sales-document-detail')).toContain('padding: 0 var(--space-3) var(--space-3)')
  expect(cssRule('.sales-document-detail > section')).toContain('gap: var(--space-3)')
  expect(cssRule('.sales-document-lines-table')).toContain('table-layout: fixed')
  expect(cssRule('.sales-document-lines-table th:nth-child(2),\n.sales-document-lines-table td:nth-child(2)')).toContain('width: 26%')
  expect(cssRule('.sales-document-lines-table th:nth-child(n + 3):nth-child(-n + 5),\n.sales-document-lines-table td:nth-child(n + 3):nth-child(-n + 5)')).toContain('width: 10%')
  expect(cssRule('.sales-document-lines-table th:nth-child(n + 6),\n.sales-document-lines-table td:nth-child(n + 6)')).toContain('width: 16%')
  expect(cssRule('.sales-document-summary-box')).toContain('grid-template-columns: 12% 26% repeat(3, 10%) repeat(2, 16%)')
  expect(cssRule('.sales-document-summary-box')).toContain('column-gap: 0')
  expect(cssRule('.sales-document-summary-box')).toContain('row-gap: var(--space-2)')
  expect(cssRule('.sales-document-summary-box')).toContain('margin: 0')
  expect(cssRule('.sales-document-summary-box-right')).toContain('grid-column: 1 / -1')
  expect(cssRule('.sales-document-summary-box div')).toContain('display: contents')
  expect(cssRule('.sales-document-summary-box dt')).toContain('grid-column: 1 / 7')
  expect(cssRule('.sales-document-summary-box dd')).toContain('grid-column: 7')
  expect(cssRule('.sales-document-summary-box dt')).toContain('padding: 0 var(--space-2)')
  expect(cssRule('.sales-document-summary-box dd')).toContain('padding: 0 var(--space-2)')
  expect(cssRule('.sales-document-summary-box dt')).toContain('color: var(--color-text)')
  expect(cssRule('.sales-document-summary-box dt')).toContain('font-weight: 400')
  expect(cssRule('.sales-document-summary-box dt')).toContain('white-space: nowrap')
})
