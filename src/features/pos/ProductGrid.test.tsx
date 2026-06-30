import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductGrid } from './ProductGrid'

it('renders active products and selects one', async () => {
  const onSelectProduct = vi.fn()
  render(
    <ProductGrid
      products={[
        {
          id: 'p-1',
          code: 'MICA-3MM',
          name: 'Mica 3mm',
          status: 'active',
          unit_name: 'm',
          sell_method: 'linear_m',
        },
      ]}
      prices={{
        'p-1': {
          product_id: 'p-1',
          unit_price: 120000,
          price_source: 'default_price_list',
          price_list_id: 'pl-1',
        },
      }}
      loading={false}
      onSelectProduct={onSelectProduct}
    />,
  )

  expect(screen.getByText('Mica 3mm')).toBeInTheDocument()
  expect(screen.getByText('120.000/m')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: /Mica 3mm/ }))
  expect(onSelectProduct).toHaveBeenCalledWith(expect.objectContaining({ id: 'p-1' }))
})

it('shows an empty state when no active product is available', () => {
  render(<ProductGrid products={[]} prices={{}} loading={false} onSelectProduct={vi.fn()} />)
  expect(screen.getByText('Chưa có sản phẩm đang bán.')).toBeInTheDocument()
})
