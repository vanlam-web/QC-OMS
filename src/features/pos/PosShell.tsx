import { ConnectionStatus } from '../../components/ConnectionStatus'
import type { CurrentUserData } from '../../lib/api/types'
import { ProfileMenu } from './ProfileMenu'

export function PosShell({
  currentUser,
  connected = true,
  onSignOut,
}: {
  currentUser: CurrentUserData
  connected?: boolean
  onSignOut: () => void
}) {
  return (
    <main className="pos-shell">
      <section aria-label="K01 topbar" className="pos-topbar">
        <strong>QC-OMS POS</strong>
        <ConnectionStatus connected={connected} />
        <button disabled>Tìm kiếm</button>
        <ProfileMenu
          displayName={currentUser.user.display_name}
          workstationCode={currentUser.workstation?.code ?? 'Chưa chọn máy'}
          permissions={currentUser.permissions}
          onSignOut={onSignOut}
        />
      </section>
      <section aria-label="K02 giỏ hàng" className="pos-cart">
        <h2>Giỏ hàng</h2>
        <p>Chức năng bán hàng sẽ được mở ở giai đoạn sau.</p>
      </section>
      <section aria-label="K03 thanh toán" className="pos-payment">
        <h2>Thanh toán</h2>
        <p>Chức năng thanh toán chưa khả dụng trong Phase 0.</p>
      </section>
    </main>
  )
}
