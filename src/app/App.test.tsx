import { render, screen } from '@testing-library/react'
import { App } from './App'

it('renders the QC-OMS application name', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: 'QC-OMS' })).toBeInTheDocument()
})
