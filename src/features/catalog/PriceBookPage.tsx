import { useEffect, useState } from 'react'
import { formatApiError } from '../../lib/api/error-message'
import type { CatalogService } from './catalog-service'
import type {
  PriceFormulaInput,
  PriceFormulaPreview,
  PriceFormulaPreviewItem,
  PriceFormulaPreviewPrice,
  PriceList,
  Product,
  ProductStatus,
  SellMethod,
} from './types'

interface PriceBookState {
  products: Product[]
  priceLists: PriceList[]
  total: number
}

const sellMethodLabels: Record<SellMethod, string> = {
  quantity: 'Số lượng',
  area_m2: 'm²',
  linear_m: 'm tới',
  sheet: 'Tấm',
  combo: 'Combo',
}

type AdjustmentMode = 'none' | 'amount' | 'percent'

export function PriceBookPage({
  service,
  onOpenDashboard,
}: {
  service: CatalogService
  onOpenDashboard: () => void
}) {
  const [state, setState] = useState<PriceBookState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formulaOpen, setFormulaOpen] = useState(false)
  const [previewingFormula, setPreviewingFormula] = useState(false)
  const [applyingFormula, setApplyingFormula] = useState(false)
  const [formulaPreview, setFormulaPreview] = useState<PriceFormulaPreview | null>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ProductStatus | 'all'>('active')
  const [formulaForm, setFormulaForm] = useState({
    name: '',
    codeContains: '',
    nameContains: '',
    sellMethod: '',
    costMode: 'fixed' as 'fixed' | 'amount_plus_percent',
    costAmount: '',
    costPercent: '',
    profitMode: 'fixed' as 'fixed' | 'tiers',
    fixedProfit: '',
    tierOperator: '>' as '<' | '<=' | '>' | '>=' | '=',
    tierValue: '',
    tierAmount: '',
    adjustments: {} as Record<string, { mode: AdjustmentMode; value: string }>,
  })

  async function load(filters = { search, status }) {
    setError(null)
    try {
      const result = await service.listProducts({ search: filters.search, status: filters.status })
      setState((current) => ({
        products: result.items,
        priceLists: current?.priceLists ?? [],
        total: result.total,
      }))
    } catch (cause) {
      setError(formatApiError(cause, 'Không tải được bảng giá.'))
    }
  }

  useEffect(() => {
    let active = true

    async function loadInitialPriceBook() {
      setError(null)
      try {
        const [result, priceListResult] = await Promise.all([
          service.listProducts({ status: 'active' }),
          service.listPriceLists(),
        ])
        if (!active) return
        setState({ products: result.items, priceLists: priceListResult.items, total: result.total })
      } catch (cause) {
        if (active) setError(formatApiError(cause, 'Không tải được bảng giá.'))
      }
    }

    void loadInitialPriceBook()

    return () => {
      active = false
    }
  }, [service])

  async function filterProducts(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await load({ search, status })
  }

  function buildFormulaInput(): PriceFormulaInput {
    const priceListAdjustments: PriceFormulaInput['price_list_adjustments'] = {}
    for (const [priceListId, adjustment] of Object.entries(formulaForm.adjustments)) {
      const value = Number(adjustment.value || 0)
      if (adjustment.mode === 'amount') priceListAdjustments[priceListId] = { type: 'amount', amount: value }
      if (adjustment.mode === 'percent') priceListAdjustments[priceListId] = { type: 'percent', percent: value }
    }

    return {
      name: formulaForm.name,
      product_filter: {
        status: 'active',
        ...(formulaForm.codeContains.trim() ? { code_contains: formulaForm.codeContains.trim() } : {}),
        ...(formulaForm.nameContains.trim() ? { name_contains: formulaForm.nameContains.trim() } : {}),
        ...(formulaForm.sellMethod ? { sell_method: formulaForm.sellMethod as SellMethod } : {}),
      },
      cost_formula:
        formulaForm.costMode === 'fixed'
          ? { type: 'fixed', amount: Number(formulaForm.costAmount || 0) }
          : {
              type: 'amount_plus_percent',
              amount: Number(formulaForm.costAmount || 0),
              percent_of_latest_purchase_cost: Number(formulaForm.costPercent || 0),
            },
      profit_formula:
        formulaForm.profitMode === 'fixed'
          ? { type: 'fixed', amount: Number(formulaForm.fixedProfit || 0) }
          : {
              type: 'tiers',
              tiers: [
                {
                  operator: formulaForm.tierOperator,
                  value: Number(formulaForm.tierValue || 0),
                  amount: Number(formulaForm.tierAmount || 0),
                },
              ],
            },
      price_list_adjustments: priceListAdjustments,
    }
  }

  async function previewFormula(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPreviewingFormula(true)
    setError(null)
    try {
      setFormulaPreview(await service.previewPriceFormula(buildFormulaInput()))
    } catch (cause) {
      setError(formatApiError(cause, 'Không xem trước được công thức.'))
    } finally {
      setPreviewingFormula(false)
    }
  }

  async function applyFormula() {
    if (formulaPreview === null) return
    setApplyingFormula(true)
    setError(null)
    try {
      await service.applyPriceFormula({
        formula: buildFormulaInput(),
        selected_items: formulaPreview.items.flatMap((item) =>
          item.computed_prices.map((price) => ({
            product_id: item.product_id,
            price_list_id: price.price_list_id,
          })),
        ),
      })
      setFormulaPreview(null)
      await load()
    } catch (cause) {
      setError(formatApiError(cause, 'Không áp dụng được công thức.'))
    } finally {
      setApplyingFormula(false)
    }
  }

  function findPreviewItem(productId: string): PriceFormulaPreviewItem | null {
    return formulaPreview?.items.find((item) => item.product_id === productId) ?? null
  }

  function findPreviewPrice(item: PriceFormulaPreviewItem | null, priceListId: string): PriceFormulaPreviewPrice | null {
    return item?.computed_prices.find((price) => price.price_list_id === priceListId) ?? null
  }

  function renderPriceListCell(product: Product, priceList: PriceList): string {
    if (formulaPreview === null) return 'Chưa xem'

    const previewItem = findPreviewItem(product.id)
    const previewPrice = findPreviewPrice(previewItem, priceList.id)
    if (previewPrice === null) return 'Không khớp'

    const computed = formatMoney(previewPrice.computed_unit_price)
    if (previewPrice.current_unit_price === null) return `Mới ${computed}`

    const current = formatMoney(previewPrice.current_unit_price)
    return `Hiện tại ${current} → ${computed}`
  }

  return (
    <main className="catalog-shell">
      <header className="catalog-header">
        <div>
          <h1>Bảng giá</h1>
          <p>Quản lý bảng giá bán và công thức cập nhật giá theo hàng hóa</p>
        </div>
        <button type="button" onClick={onOpenDashboard}>
          Trang chủ
        </button>
      </header>

      {error ? <p role="alert">{error}</p> : null}
      {state === null && error === null ? <p>Đang tải bảng giá...</p> : null}

      <section className="catalog-panel" aria-label="Quản lý bảng giá">
        <form aria-label="Lọc bảng giá" className="admin-form" onSubmit={filterProducts}>
          <label>
            Tìm
            <input value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          <label>
            Trạng thái
            <select value={status} onChange={(event) => setStatus(event.target.value as ProductStatus | 'all')}>
              <option value="active">Đang bán</option>
              <option value="inactive">Ngưng bán</option>
              <option value="all">Tất cả</option>
            </select>
          </label>
          <button type="submit">Lọc</button>
        </form>

        <div className="catalog-toolbar">
          <button type="button" onClick={() => setFormulaOpen((current) => !current)}>
            Tạo công thức cho bộ lọc này
          </button>
        </div>

        {formulaOpen ? (
          <form aria-label="Công thức bảng giá" className="catalog-formula-panel" onSubmit={previewFormula}>
            <label>
              Tên công thức
              <input
                value={formulaForm.name}
                onChange={(event) => setFormulaForm((current) => ({ ...current, name: event.target.value }))}
              />
            </label>
            <label>
              Mã hàng chứa
              <input
                value={formulaForm.codeContains}
                onChange={(event) => setFormulaForm((current) => ({ ...current, codeContains: event.target.value }))}
              />
            </label>
            <label>
              Tên hàng chứa
              <input
                value={formulaForm.nameContains}
                onChange={(event) => setFormulaForm((current) => ({ ...current, nameContains: event.target.value }))}
              />
            </label>
            <label>
              Cách bán áp dụng
              <select
                value={formulaForm.sellMethod}
                onChange={(event) => setFormulaForm((current) => ({ ...current, sellMethod: event.target.value }))}
              >
                <option value="">Tất cả</option>
                {Object.entries(sellMethodLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Kiểu chi phí
              <select
                value={formulaForm.costMode}
                onChange={(event) =>
                  setFormulaForm((current) => ({
                    ...current,
                    costMode: event.target.value as 'fixed' | 'amount_plus_percent',
                  }))
                }
              >
                <option value="fixed">Cố định</option>
                <option value="amount_plus_percent">Cộng tiền + % giá nhập</option>
              </select>
            </label>
            <label>
              Chi phí cộng thêm
              <input
                inputMode="numeric"
                value={formulaForm.costAmount}
                onChange={(event) => setFormulaForm((current) => ({ ...current, costAmount: event.target.value }))}
              />
            </label>
            <label>
              % theo giá nhập cuối
              <input
                inputMode="decimal"
                value={formulaForm.costPercent}
                onChange={(event) => setFormulaForm((current) => ({ ...current, costPercent: event.target.value }))}
                disabled={formulaForm.costMode === 'fixed'}
              />
            </label>
            <label>
              Kiểu lợi nhuận
              <select
                value={formulaForm.profitMode}
                onChange={(event) =>
                  setFormulaForm((current) => ({ ...current, profitMode: event.target.value as 'fixed' | 'tiers' }))
                }
              >
                <option value="fixed">Cố định</option>
                <option value="tiers">Theo điều kiện giá nhập</option>
              </select>
            </label>
            {formulaForm.profitMode === 'fixed' ? (
              <label>
                Lợi nhuận cố định
                <input
                  inputMode="numeric"
                  value={formulaForm.fixedProfit}
                  onChange={(event) => setFormulaForm((current) => ({ ...current, fixedProfit: event.target.value }))}
                />
              </label>
            ) : (
              <>
                <label>
                  Điều kiện lợi nhuận
                  <select
                    value={formulaForm.tierOperator}
                    onChange={(event) =>
                      setFormulaForm((current) => ({
                        ...current,
                        tierOperator: event.target.value as '<' | '<=' | '>' | '>=' | '=',
                      }))
                    }
                  >
                    <option value=">">&gt;</option>
                    <option value=">=">&gt;=</option>
                    <option value="<">&lt;</option>
                    <option value="<=">&lt;=</option>
                    <option value="=">=</option>
                  </select>
                </label>
                <label>
                  Mốc giá nhập
                  <input
                    inputMode="numeric"
                    value={formulaForm.tierValue}
                    onChange={(event) => setFormulaForm((current) => ({ ...current, tierValue: event.target.value }))}
                  />
                </label>
                <label>
                  Lợi nhuận tier
                  <input
                    inputMode="numeric"
                    value={formulaForm.tierAmount}
                    onChange={(event) => setFormulaForm((current) => ({ ...current, tierAmount: event.target.value }))}
                  />
                </label>
              </>
            )}
            {state?.priceLists.map((priceList) => (
              <div className="catalog-adjustment" key={priceList.id}>
                <label>
                  Điều chỉnh {priceList.name}
                  <select
                    value={formulaForm.adjustments[priceList.id]?.mode ?? 'none'}
                    onChange={(event) =>
                      setFormulaForm((current) => ({
                        ...current,
                        adjustments: {
                          ...current.adjustments,
                          [priceList.id]: {
                            mode: event.target.value as AdjustmentMode,
                            value: current.adjustments[priceList.id]?.value ?? '',
                          },
                        },
                      }))
                    }
                  >
                    <option value="none">Không</option>
                    <option value="amount">Cộng/trừ tiền</option>
                    <option value="percent">Cộng/trừ %</option>
                  </select>
                </label>
                <label>
                  Giá trị điều chỉnh {priceList.name}
                  <input
                    inputMode="decimal"
                    value={formulaForm.adjustments[priceList.id]?.value ?? ''}
                    onChange={(event) =>
                      setFormulaForm((current) => ({
                        ...current,
                        adjustments: {
                          ...current.adjustments,
                          [priceList.id]: {
                            mode: current.adjustments[priceList.id]?.mode ?? 'none',
                            value: event.target.value,
                          },
                        },
                      }))
                    }
                    disabled={(formulaForm.adjustments[priceList.id]?.mode ?? 'none') === 'none'}
                  />
                </label>
              </div>
            ))}
            <div className="catalog-formula-actions">
              <button disabled={previewingFormula} type="submit">
                Xem trước
              </button>
              <button disabled={formulaPreview === null || applyingFormula} type="button" onClick={() => void applyFormula()}>
                Áp dụng công thức
              </button>
            </div>
          </form>
        ) : null}

        {formulaPreview ? (
          <section className="catalog-preview" aria-label="Xem trước công thức">
            <p>{formulaPreview.affected_count} hàng hóa khớp bộ lọc</p>
            <table>
              <thead>
                <tr>
                  <th>Mã hàng</th>
                  <th>Tên hàng</th>
                  <th>Bảng giá</th>
                  <th>Giá đề xuất</th>
                  <th>Chênh lệch</th>
                </tr>
              </thead>
              <tbody>
                {formulaPreview.items.flatMap((item) =>
                  item.computed_prices.map((price) => (
                    <tr key={`${item.product_id}-${price.price_list_id}`}>
                      <td>{item.product_code}</td>
                      <td>{item.product_name}</td>
                      <td>{price.price_list_name}</td>
                      <td>{formatMoney(price.computed_unit_price)}</td>
                      <td>{price.delta === null ? 'Mới' : formatMoney(price.delta)}</td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </section>
        ) : null}

        {state ? (
          <>
            <p>{state.total} hàng hóa</p>
            <table aria-label="Lưới bảng giá">
              <thead>
                <tr>
                  <th>Mã hàng</th>
                  <th>Tên hàng</th>
                  <th>Giá nhập cuối</th>
                  <th>Chi phí</th>
                  <th>Lợi nhuận</th>
                  {state.priceLists.map((priceList) => (
                    <th key={priceList.id}>{priceList.name}</th>
                  ))}
                  <th>Cách bán</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {state.products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.code}</td>
                    <td>{product.name}</td>
                    <td>{formatMoney(product.latest_purchase_cost ?? 0)}</td>
                    <td>Chưa cấu hình</td>
                    <td>Chưa cấu hình</td>
                    {state.priceLists.map((priceList) => (
                      <td key={priceList.id}>{renderPriceListCell(product, priceList)}</td>
                    ))}
                    <td>{sellMethodLabels[product.sell_method]}</td>
                    <td>{product.status === 'active' ? 'Đang bán' : 'Ngưng bán'}</td>
                    <td>-</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : null}
      </section>
    </main>
  )
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(value)
}
