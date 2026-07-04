import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState, type FormEvent } from 'react'
import {
  ManagementActionIconButton,
  ManagementCompactSearch,
  ManagementCompactToolbar,
  ManagementDetailRow,
  ManagementFilterGroup,
  ManagementFilterSidebar,
  ManagementListSurface,
  ManagementPagination,
  ManagementPage,
  ManagementRowActionButton,
  ManagementTableFooter,
  ManagementSearchBar,
  ManagementTableViewport,
} from './management-layout'

it('renders a KV-style management page with filter sidebar and list surface', () => {
  render(
    <ManagementPage
      actions={<button type="button">Tìm nhanh</button>}
      filter={<ManagementFilterSidebar ariaLabel="Bộ lọc hàng hóa">Bộ lọc</ManagementFilterSidebar>}
      title="Hàng hóa"
    >
      <ManagementListSurface ariaLabel="Danh sách hàng hóa">Danh sách</ManagementListSurface>
    </ManagementPage>,
  )

  expect(screen.getByRole('heading', { name: 'Hàng hóa' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Tìm nhanh' }).closest('.management-page-header')).not.toBeNull()
  expect(screen.getByRole('complementary', { name: 'Bộ lọc hàng hóa' })).toBeInTheDocument()
  expect(screen.getByRole('region', { name: 'Danh sách hàng hóa' })).toBeInTheDocument()
  expect(screen.getByLabelText('Hàng hóa')).toHaveClass('management-layout')
})

it('keeps page title and search toolbar grouped in the management page header', () => {
  render(
    <ManagementPage
      actions={
        <ManagementCompactToolbar ariaLabel="Lọc chứng từ bán hàng" onSubmit={vi.fn()}>
          <ManagementCompactSearch
            label="Tìm chứng từ"
            placeholder="Mã chứng từ, khách hàng"
            value=""
            onChange={vi.fn()}
          />
        </ManagementCompactToolbar>
      }
      title="Chứng từ bán hàng"
    >
      <ManagementListSurface ariaLabel="Danh sách chứng từ">Danh sách</ManagementListSurface>
    </ManagementPage>,
  )

  const header = screen.getByRole('heading', { name: 'Chứng từ bán hàng' }).closest('.management-page-header')
  const search = screen.getByRole('search', { name: 'Lọc chứng từ bán hàng' })

  expect(header).not.toBeNull()
  expect(header).toContainElement(search)
  expect(search.closest('.management-page-actions')).not.toBeNull()
})

it('can hide the filter sidebar and let the list use the full width', () => {
  render(
    <ManagementPage
      filter={<ManagementFilterSidebar ariaLabel="Bộ lọc chứng từ">Bộ lọc</ManagementFilterSidebar>}
      filterVisible={false}
      title="Chứng từ"
    >
      <ManagementListSurface ariaLabel="Danh sách chứng từ">Danh sách</ManagementListSurface>
    </ManagementPage>,
  )

  expect(screen.queryByRole('complementary', { name: 'Bộ lọc chứng từ' })).not.toBeInTheDocument()
  expect(screen.getByLabelText('Chứng từ')).toHaveClass('management-layout-filters-hidden')
})

it('renders search and icon actions with accessible labels', async () => {
  const onSearchChange = vi.fn()
  const onAction = vi.fn()
  function SearchHarness() {
    const [value, setValue] = useState('')

    return (
      <ManagementSearchBar
        actions={
          <ManagementActionIconButton ariaLabel="Tạo hàng hóa" onClick={onAction}>
            +
          </ManagementActionIconButton>
        }
        searchLabel="Tìm hàng hóa"
        searchValue={value}
        onSearchChange={(nextValue) => {
          setValue(nextValue)
          onSearchChange(nextValue)
        }}
        onSubmit={(event) => event.preventDefault()}
      />
    )
  }

  render(<SearchHarness />)

  await userEvent.type(screen.getByLabelText('Tìm hàng hóa'), 'mica')
  await userEvent.click(screen.getByRole('button', { name: 'Tạo hàng hóa' }))

  expect(onSearchChange).toHaveBeenLastCalledWith('mica')
  expect(onAction).toHaveBeenCalledTimes(1)
})

it('renders reusable compact search toolbar with an icon action inside the search box', async () => {
  const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault())
  const onSearchChange = vi.fn()
  const onFilter = vi.fn()

  function CompactToolbarHarness() {
    const [value, setValue] = useState('')

    return (
      <ManagementCompactToolbar ariaLabel="Thanh công cụ chứng từ" onSubmit={onSubmit}>
        <ManagementCompactSearch
          label="Tìm chứng từ"
          placeholder="Theo mã chứng từ"
          trailingAction={
            <button aria-label="Mở bộ lọc nâng cao" type="button" onClick={onFilter}>
              F
            </button>
          }
          value={value}
          onChange={(nextValue) => {
            setValue(nextValue)
            onSearchChange(nextValue)
          }}
        />
        <ManagementActionIconButton ariaLabel="Đặt lại bộ lọc" onClick={vi.fn()}>
          R
        </ManagementActionIconButton>
      </ManagementCompactToolbar>
    )
  }

  render(<CompactToolbarHarness />)

  const toolbar = screen.getByRole('search', { name: 'Thanh công cụ chứng từ' })
  const searchInput = screen.getByLabelText('Tìm chứng từ')
  await userEvent.type(searchInput, 'HD000010')
  await userEvent.click(screen.getByRole('button', { name: 'Mở bộ lọc nâng cao' }))
  await userEvent.click(searchInput)
  await userEvent.keyboard('{Enter}')

  expect(toolbar).toHaveClass('management-compact-toolbar')
  expect(screen.getByLabelText('Tìm chứng từ').closest('.management-compact-search')).toContainElement(
    screen.getByRole('button', { name: 'Mở bộ lọc nâng cao' }),
  )
  expect(onSearchChange).toHaveBeenLastCalledWith('HD000010')
  expect(onFilter).toHaveBeenCalledTimes(1)
  expect(onSubmit).toHaveBeenCalled()
})

it('renders reusable scroll body and footer pagination outside the table scroll area', () => {
  render(
    <ManagementListSurface ariaLabel="Danh sách chứng từ">
      <ManagementTableViewport>
        <table>
          <tbody>
            <tr>
              <td>HD000010</td>
            </tr>
          </tbody>
        </table>
      </ManagementTableViewport>
      <ManagementPagination ariaLabel="Phân trang chứng từ">
        <span>12 chứng từ</span>
      </ManagementPagination>
    </ManagementListSurface>,
  )

  expect(document.querySelector('.management-table-viewport')).toContainElement(screen.getByText('HD000010'))
  expect(screen.getByRole('navigation', { name: 'Phân trang chứng từ' })).toHaveClass('management-pagination')
  expect(screen.getByRole('navigation', { name: 'Phân trang chứng từ' }).closest('.management-table-viewport')).toBeNull()
})

it('standardizes filter groups without rendering detail content by default', () => {
  render(
    <ManagementFilterSidebar ariaLabel="Bộ lọc phiếu nhập">
      <ManagementFilterGroup title="Trạng thái">
        <label>
          <input type="radio" />
          Phiếu tạm
        </label>
      </ManagementFilterGroup>
    </ManagementFilterSidebar>,
  )

  expect(screen.getByRole('heading', { name: 'Trạng thái' })).toBeInTheDocument()
  expect(screen.queryByRole('region', { name: /Chi tiết/ })).not.toBeInTheDocument()
})

it('renders a reusable filter sidebar title summary and action area', () => {
  render(
    <ManagementFilterSidebar
      activeSummary="Loại: Hóa đơn"
      ariaLabel="Bộ lọc chứng từ"
      title="Bộ lọc"
      actions={<button type="button">Đặt lại bộ lọc</button>}
    >
      <ManagementFilterGroup title="Loại chứng từ">
        <label>
          <input type="radio" />
          Hóa đơn
        </label>
      </ManagementFilterGroup>
    </ManagementFilterSidebar>,
  )

  const sidebar = screen.getByRole('complementary', { name: 'Bộ lọc chứng từ' })
  expect(within(sidebar).getByRole('heading', { name: 'Bộ lọc' })).toBeInTheDocument()
  expect(within(sidebar).getByText('Loại: Hóa đơn')).toHaveClass('management-filter-summary')
  expect(within(sidebar).getByRole('button', { name: 'Đặt lại bộ lọc' }).closest('.management-filter-actions')).not.toBeNull()
})

it('renders a reusable management table footer with range page and disabled controls', () => {
  render(
    <ManagementTableFooter
      ariaLabel="Phân trang chứng từ"
      canGoNext
      canGoPrevious={false}
      entityLabel="chứng từ"
      page={1}
      pageSize={15}
      total={40}
      onNext={vi.fn()}
      onPrevious={vi.fn()}
    />,
  )

  const footer = screen.getByRole('navigation', { name: 'Phân trang chứng từ' })
  expect(footer).toHaveClass('management-table-footer')
  expect(within(footer).getByText('1-15 / 40 chứng từ')).toBeInTheDocument()
  expect(within(footer).getByText('Trang 1 / 3')).toBeInTheDocument()
  expect(within(footer).getByRole('button', { name: 'Trang trước' })).toBeDisabled()
  expect(within(footer).getByRole('button', { name: 'Trang sau' })).toBeEnabled()
})

it('renders compact row action buttons and inline detail rows tied to the table', () => {
  render(
    <table>
      <tbody>
        <tr className="management-data-row-selected">
          <td>HD010985</td>
          <td>
            <ManagementRowActionButton ariaLabel="Mở chi tiết HD010985">Mở</ManagementRowActionButton>
          </td>
        </tr>
        <ManagementDetailRow colSpan={2} label="Chi tiết chứng từ HD010985">
          <p>Chi tiết</p>
        </ManagementDetailRow>
      </tbody>
    </table>,
  )

  expect(screen.getByRole('button', { name: 'Mở chi tiết HD010985' })).toHaveClass('management-row-action')
  expect(screen.getByRole('region', { name: 'Chi tiết chứng từ HD010985' })).toHaveClass('management-inline-detail')
  expect(screen.getByRole('cell', { name: /Chi tiết/ })).toHaveAttribute('colspan', '2')
})
