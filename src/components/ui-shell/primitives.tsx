import type { ReactNode } from 'react'

type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

const moneyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

export function StatusChip({ children, tone = 'neutral' }: { children: ReactNode; tone?: Tone }) {
  return <span className={`status-chip status-chip-${tone}`}>{children}</span>
}

export function MoneyText({ value }: { value: number }) {
  return <span className="money-text">{moneyFormatter.format(value)}</span>
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="empty-state">{children}</div>
}

export function MetricGrid({ ariaLabel, children }: { ariaLabel: string; children: ReactNode }) {
  return (
    <section aria-label={ariaLabel} className="metric-grid">
      {children}
    </section>
  )
}

export function MetricCard({
  label,
  value,
  hint,
  tone = 'neutral',
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  tone?: Tone
}) {
  return (
    <article className={`metric-card metric-card-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {hint ? <small>{hint}</small> : null}
    </article>
  )
}
