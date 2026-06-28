import type { Workstation } from '../users/types'

export function WorkstationPage({
  workstations,
  onSelect,
}: {
  workstations: Workstation[]
  onSelect: (id: string) => Promise<void> | void
}) {
  const active = [...workstations]
    .filter((workstation) => workstation.status === 'active')
    .sort((a, b) => a.code.localeCompare(b.code))

  if (active.length === 0) {
    return (
      <main>
        <h1>Chọn máy bán hàng</h1>
        <p>Chưa có máy bán hàng khả dụng. Vui lòng liên hệ quản trị viên.</p>
      </main>
    )
  }

  return (
    <main>
      <h1>Chọn máy bán hàng</h1>
      <ul>
        {active.map((workstation) => (
          <li key={workstation.id}>
            <button type="button" onClick={() => void onSelect(workstation.id)}>
              {workstation.code} — {workstation.name}
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}
