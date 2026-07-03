import type { FormEvent, ReactNode } from 'react'

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
      {kpis ? <div className="management-kpis">{kpis}</div> : null}
      <section
        aria-label={title}
        className={`management-layout${filterVisible && filter ? '' : ' management-layout-filters-hidden'}`}
      >
        {filterVisible ? filter : null}
        {!filterVisible && filterCollapsedControl ? <div className="management-filter-rail">{filterCollapsedControl}</div> : null}
        <div className="management-main">{children}</div>
      </section>
    </main>
  )
}

export function ManagementFilterSidebar({ ariaLabel, children }: { ariaLabel: string; children: ReactNode }) {
  return (
    <aside aria-label={ariaLabel} className="management-filter-sidebar">
      {children}
    </aside>
  )
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

export function ManagementSearchBar({
  searchLabel,
  searchValue,
  onSearchChange,
  onSubmit,
  actions,
  children,
}: {
  searchLabel: string
  searchValue: string
  onSearchChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  actions?: ReactNode
  children?: ReactNode
}) {
  return (
    <form aria-label={`Thanh ${searchLabel.charAt(0).toLowerCase()}${searchLabel.slice(1)}`} className="management-search-bar" role="search" onSubmit={onSubmit}>
      <label className="management-search-input">
        <span>{searchLabel}</span>
        <input value={searchValue} onChange={(event) => onSearchChange(event.target.value)} />
      </label>
      {actions ? <div className="management-search-actions">{actions}</div> : null}
      {children}
    </form>
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
