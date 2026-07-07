import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, test } from 'vitest'

const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'))

describe('package test script scope', () => {
  test('runs source tests and repository helper unit tests', () => {
    expect(packageJson.scripts.test).toContain('src')
    expect(packageJson.scripts.test).toContain('scripts/*.test.mjs')
    expect(packageJson.scripts.test).toContain('tests/e2e/*.test.ts')
  })
})
