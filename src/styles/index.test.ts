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
