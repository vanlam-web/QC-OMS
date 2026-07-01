import { useEffect, useState } from 'react'
import { formatApiError } from '../../lib/api/error-message'
import type { ProductionQueueService } from '../production-queue/production-queue-service'
import type { ProductionQueueDraftPayload, ProductionQueueItem } from '../production-queue/types'

export function ProductionQueuePanel({
  service,
  onAddToDraft,
}: {
  service: ProductionQueueService
  onAddToDraft: (payload: ProductionQueueDraftPayload) => Promise<void> | void
}) {
  const [items, setItems] = useState<ProductionQueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadQueue() {
      setLoading(true)
      setError(null)
      try {
        const response = await service.listQueue()
        if (active) setItems(response.items)
      } catch (cause) {
        if (active) setError(formatApiError(cause, 'Không tải được hàng đợi máy sản xuất.'))
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadQueue()

    return () => {
      active = false
    }
  }, [service])

  async function addItem(item: ProductionQueueItem) {
    setBusyId(item.id)
    setError(null)
    try {
      const payload = await service.addToDraft(item.id)
      await onAddToDraft(payload)
      setItems((current) => current.filter((currentItem) => currentItem.id !== item.id))
    } catch (cause) {
      setError(formatApiError(cause, 'Không thêm được file máy sản xuất vào nháp.'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section aria-label="K02-D hàng đợi máy sản xuất" className="production-queue-panel">
      <header>
        <h2>Hàng đợi máy sản xuất</h2>
        <span>{items.length}</span>
      </header>

      {loading ? <p>Đang tải hàng đợi...</p> : null}
      {error ? <p role="alert">{error}</p> : null}
      {!loading && items.length === 0 ? <p>Chưa có file mới từ máy sản xuất.</p> : null}

      {items.length > 0 ? (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <div>
                <strong>{item.raw_file_name}</strong>
                <span>
                  {item.production_machine.code} - {item.production_machine.name}
                </span>
              </div>
              <button
                aria-label={`Thêm ${item.raw_file_name} vào nháp`}
                disabled={busyId === item.id || item.parse_status !== 'ok'}
                type="button"
                onClick={() => void addItem(item)}
              >
                +
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
