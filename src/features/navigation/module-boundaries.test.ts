import type { CurrentUserData } from '../../lib/api/types'
import { canOpenModule, phaseOneModules } from './module-boundaries'

it('shows only MVP module entries for sales documents customers price book inventory finance and reports', () => {
  expect(phaseOneModules.map((module) => module.id)).toEqual([
    'pos',
    'sales-documents',
    'customers',
    'suppliers',
    'purchase-receipts',
    'price-book',
    'inventory',
    'finance',
    'reports',
  ])
})

it('names purchase receipts as the operator-facing import workflow', () => {
  expect(phaseOneModules.find((module) => module.id === 'purchase-receipts')?.label).toBe('Nhập hàng')
})

it('does not expose returns delivery cod e-invoice purchasing payroll online sales or tax modules', () => {
  const blocked = [
    'returns',
    'shipping',
    'cod',
    'e-invoice',
    'purchase',
    'payroll',
    'online-sales',
    'tax-accounting',
  ]
  expect(phaseOneModules.map((module) => module.id)).not.toEqual(expect.arrayContaining(blocked))
})

it('requires both finance and inventory permissions for reports', () => {
  const reports = phaseOneModules.find((module) => module.id === 'reports')
  const currentUser: CurrentUserData = {
    user: { id: 'u-1', email: 'owner@qc.local', display_name: 'Owner' },
    organization: { id: 'o-1', code: 'QC', name: 'QC OMS' },
    workstation: null,
    permissions: ['perm.manage_finance'],
  }

  expect(reports).toBeDefined()
  expect(canOpenModule(currentUser, reports!)).toBe(false)
  expect(canOpenModule({ ...currentUser, permissions: ['perm.manage_finance', 'perm.manage_inventory'] }, reports!)).toBe(true)
})
