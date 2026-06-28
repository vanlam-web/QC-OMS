import { useEffect, useId, useRef, useState } from 'react'
import type { PermissionCode } from '../users/types'

export function ProfileMenu({
  displayName,
  workstationCode,
  permissions,
  onSignOut,
}: {
  displayName: string
  workstationCode: string
  permissions: PermissionCode[]
  onSignOut: () => void
}) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function keydown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    function pointerdown(event: PointerEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', keydown)
    window.addEventListener('pointerdown', pointerdown)
    return () => {
      window.removeEventListener('keydown', keydown)
      window.removeEventListener('pointerdown', pointerdown)
    }
  }, [open])

  return (
    <div ref={ref} className="profile-menu">
      <button aria-controls={id} aria-expanded={open} onClick={() => setOpen((value) => !value)} type="button">
        👤 {displayName} / {workstationCode}
      </button>
      {open ? (
        <div id={id} role="menu">
          {permissions.includes('perm.view_shift_report') ? <button role="menuitem">Báo cáo ca</button> : null}
          {permissions.includes('perm.access_admin_panel') ? <button role="menuitem">Quản trị</button> : null}
          <button role="menuitem" onClick={onSignOut} type="button">
            Đăng xuất
          </button>
        </div>
      ) : null}
    </div>
  )
}
