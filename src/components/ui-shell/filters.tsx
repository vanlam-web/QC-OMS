import type { FormEvent, ReactNode } from 'react'

export interface FilterPreset {
  id: string
  label: string
  active?: boolean
  disabled?: boolean
  title?: string
  onSelect: () => void
}

export interface ActiveFilterChip {
  id: string
  label: string
  onClear: () => void
}

export function FilterPresetBar({ presets }: { presets: FilterPreset[] }) {
  return (
    <div aria-label="Preset bộ lọc" className="filter-preset-bar">
      {presets.map((preset) => (
        <button
          aria-pressed={preset.active ? 'true' : 'false'}
          className={`button ${preset.active ? 'button-primary' : 'button-secondary'} filter-preset`}
          disabled={preset.disabled}
          key={preset.id}
          title={preset.title}
          type="button"
          onClick={preset.onSelect}
        >
          {preset.label}
        </button>
      ))}
    </div>
  )
}

export function ActiveFilterChips({ chips }: { chips: ActiveFilterChip[] }) {
  if (chips.length === 0) return <p className="active-filter-empty">Chưa có bộ lọc phụ.</p>

  return (
    <div aria-label="Bộ lọc đang áp dụng" className="active-filter-chips">
      {chips.map((chip) => (
        <button
          aria-label={`Bỏ ${chip.label.charAt(0).toLowerCase()}${chip.label.slice(1)}`}
          className="active-filter-chip"
          key={chip.id}
          type="button"
          onClick={chip.onClear}
        >
          <span>{chip.label}</span>
          <span aria-hidden="true">×</span>
        </button>
      ))}
    </div>
  )
}

export function DataToolbar({
  ariaLabel,
  searchLabel,
  searchValue,
  onSearchChange,
  onSubmit,
  onReset,
  presets,
  chips,
  children,
}: {
  ariaLabel: string
  searchLabel: string
  searchValue: string
  onSearchChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onReset: () => void
  presets: FilterPreset[]
  chips: ActiveFilterChip[]
  children: ReactNode
}) {
  return (
    <form aria-label={ariaLabel} className="data-toolbar" onSubmit={onSubmit}>
      <div className="data-toolbar-main">
        <label className="data-toolbar-search">
          {searchLabel}
          <input value={searchValue} onChange={(event) => onSearchChange(event.target.value)} />
        </label>
        <div className="data-toolbar-actions">
          <button className="button button-secondary" type="submit">
            Lọc
          </button>
          <button className="button button-ghost" type="button" onClick={onReset}>
            Đặt lại bộ lọc
          </button>
        </div>
      </div>

      <FilterPresetBar presets={presets} />

      <details className="filter-drawer" open>
        <summary>Bộ lọc nâng cao</summary>
        <div className="filter-drawer-content">{children}</div>
      </details>

      <ActiveFilterChips chips={chips} />
    </form>
  )
}
