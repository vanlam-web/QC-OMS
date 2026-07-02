import { phaseOneModules } from './module-boundaries'

it('shows only MVP module entries for sales documents customers price book inventory and finance', () => {
  expect(phaseOneModules.map((module) => module.id)).toEqual([
    'pos',
    'sales-documents',
    'customers',
    'suppliers',
    'price-book',
    'inventory',
    'finance',
  ])
})

it('does not expose returns delivery cod e-invoice purchasing payroll reports online sales or tax modules', () => {
  const blocked = [
    'returns',
    'shipping',
    'cod',
    'e-invoice',
    'purchase',
    'payroll',
    'reports',
    'online-sales',
    'tax-accounting',
  ]
  expect(phaseOneModules.map((module) => module.id)).not.toEqual(expect.arrayContaining(blocked))
})
