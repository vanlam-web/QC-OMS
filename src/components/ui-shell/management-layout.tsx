import type { FormEvent, ReactNode } from 'react'
import { Plus } from 'lucide-react'

export function ManagementPage({
  title,
  actions,
  kpis,
  filter,
  filterVisible = true,
  filterCollapsedControl,
  children,
}: {
  title: string
  actions?: ReactNode
  kpis?: ReactNode
  filter?: ReactNode
  filterVisible?: boolean
  filterCollapsedControl?: ReactNode
  children: ReactNode
}) {
  return (
    <main className="management-page">
      <header className="management-page-header">
        <h1>{title}</h1>
        {actions ? <div className="management-page-actions">{actions}</div> : null}
      </header>
      <section
        aria-label={title}
        className={`management-layout${filterVisible && (filter || kpis) ? '' : ' management-layout-filters-hidden'}`}
      >
        {filterVisible && (filter || kpis) ? (
          <div className="management-filter-column">
            {kpis ? <div className="management-kpis">{kpis}</div> : null}
            {filter}
          </div>
        ) : null}
        {!filterVisible && filterCollapsedControl ? <div className="management-filter-rail">{filterCollapsedControl}</div> : null}
        <div className="management-main">{children}</div>
      </section>
    </main>
  )
}

export function ManagementFilterSidebar({
  ariaLabel,
  actions,
  children,
}: {
  ariaLabel: string
  title?: string
  activeSummary?: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <aside aria-label={ariaLabel} className="management-filter-sidebar">
      {children}
      {actions ? <ManagementFilterActionBar>{actions}</ManagementFilterActionBar> : null}
    </aside>
  )
}

export function ManagementFilterActionBar({ children }: { children: ReactNode }) {
  return <div className="management-filter-actions">{children}</div>
}

export function ManagementFilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="management-filter-group">
      <h2>{title}</h2>
      <div className="management-filter-options">{children}</div>
    </section>
  )
}

export function ManagementListSurface({ ariaLabel, children }: { ariaLabel: string; children: ReactNode }) {
  return (
    <section aria-label={ariaLabel} className="management-list-surface">
      {children}
    </section>
  )
}

export function ManagementActionIconButton({
  ariaLabel,
  title = ariaLabel,
  variant = 'secondary',
  children,
  onClick,
}: {
  ariaLabel: string
  title?: string
  variant?: 'primary' | 'secondary'
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button
      aria-label={ariaLabel}
      className={`management-action-icon button button-${variant}`}
      title={title}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export function ManagementCompactCreateAction({
  ariaLabel,
  title = ariaLabel,
  onClick,
}: {
  ariaLabel: string
  title?: string
  onClick: () => void
}) {
  return (
    <button
      aria-label={ariaLabel}
      className="management-compact-create-action"
      title={title}
      type="button"
      onClick={onClick}
    >
      <Plus aria-hidden="true" size={18} strokeWidth={2} />
    </button>
  )
}

export function ManagementCompactToolbar({
  ariaLabel,
  children,
  onSubmit,
}: {
  ariaLabel: string
  children: ReactNode
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <form aria-label={ariaLabel} className="management-compact-toolbar" role="search" onSubmit={onSubmit}>
      {children}
    </form>
  )
}

export function ManagementCompactSearch({
  label,
  placeholder,
  value,
  leadingIcon,
  trailingAction,
  onChange,
}: {
  label: string
  placeholder?: string
  value: string
  leadingIcon?: ReactNode
  trailingAction?: ReactNode
  onChange: (value: string) => void
}) {
  return (
    <div className="management-compact-search">
      {leadingIcon ? <span className="management-compact-search-leading">{leadingIcon}</span> : null}
      <input
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {trailingAction ? <span className="management-compact-search-trailing">{trailingAction}</span> : null}
    </div>
  )
}

export function ManagementTableViewport({ children }: { children: ReactNode }) {
  return <div className="management-table-viewport">{children}</div>
}

export function ManagementPagination({ ariaLabel, children }: { ariaLabel: string; children: ReactNode }) {
  return (
    <nav aria-label={ariaLabel} className="management-pagination">
      {children}
    </nav>
  )
}

export function ManagementTableFooter({
  ariaLabel,
  entityLabel,
  page,
  pageSize,
  total,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
}: {
  ariaLabel: string
  entityLabel: string
  page: number
  pageSize: number
  total: number
  canGoPrevious: boolean
  canGoNext: boolean
  onPrevious: () => void
  onNext: () => void
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, total)

  return (
    <nav aria-label={ariaLabel} className="management-table-footer">
      <span>{rangeStart}-{rangeEnd} / {total} {entityLabel}</span>
      <span>Trang {page} / {totalPages}</span>
      <div className="management-table-footer-actions">
        <button className="button button-secondary" disabled={!canGoPrevious} type="button" onClick={onPrevious}>
          Trang trước
        </button>
        <button className="button button-secondary" disabled={!canGoNext} type="button" onClick={onNext}>
          Trang sau
        </button>
      </div>
    </nav>
  )
}

export function ManagementRowActionButton({
  ariaLabel,
  title = ariaLabel,
  children,
  disabled,
  onClick,
}: {
  ariaLabel: string
  title?: string
  children: ReactNode
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <button
      aria-label={ariaLabel}
      className="management-row-action button button-secondary"
      disabled={disabled}
      title={title}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export function ManagementDetailRow({
  colSpan,
  label,
  rowClassName = '',
  detailClassName = '',
  children,
}: {
  colSpan: number
  label: string
  rowClassName?: string
  detailClassName?: string
  children: ReactNode
}) {
  return (
    <tr className={`management-detail-row${rowClassName ? ` ${rowClassName}` : ''}`}>
      <td colSpan={colSpan}>
        <section aria-label={label} className={`management-inline-detail${detailClassName ? ` ${detailClassName}` : ''}`} role="region">
          {children}
        </section>
      </td>
    </tr>
  )
}
