import {
  ArrowRight,
  Bell,
  CreditCard,
  DollarSign,
  PackagePlus,
  ReceiptText,
  Settings,
  ShieldAlert,
  ShoppingCart,
  TrendingUp,
  UserCircle,
} from 'lucide-react'
import type { CSSProperties } from 'react'
import type { LucideIcon } from 'lucide-react'
import type { CurrentUserData } from '../../lib/api/types'
import { canOpenModule, phaseOneModules } from '../navigation/module-boundaries'

const revenuePoints = [34, 46, 42, 58, 52, 74, 68, 86, 80, 98, 92, 116]
const weekdayBars = [
  { label: 'T2', value: 42 },
  { label: 'T3', value: 58 },
  { label: 'T4', value: 51 },
  { label: 'T5', value: 76 },
  { label: 'T6', value: 68 },
  { label: 'T7', value: 92 },
  { label: 'CN', value: 64 },
]

const topProducts = [
  { label: 'Mica 3mm', value: '8,4tr', width: 92 },
  { label: 'Decal sữa', value: '6,1tr', width: 76 },
  { label: 'Formex 5mm', value: '4,8tr', width: 61 },
  { label: 'Keo dán', value: '3,2tr', width: 42 },
]

const topCustomers = [
  { label: 'Công ty Phong Cảnh', value: '12,8tr', width: 95 },
  { label: 'Khách lẻ', value: '7,5tr', width: 68 },
  { label: 'Minh Anh Ads', value: '5,9tr', width: 55 },
  { label: 'Nội thất Nam Long', value: '4,1tr', width: 43 },
]

const activities = [
  { icon: ShoppingCart, actor: 'Thu ngân', text: 'vừa bán hóa đơn', value: '1 250 000', time: '12 phút trước' },
  { icon: PackagePlus, actor: 'Kho', text: 'vừa nhập hàng', value: '3 800 000', time: '42 phút trước' },
  { icon: ReceiptText, actor: 'Thu ngân', text: 'vừa thu công nợ', value: '650 000', time: '2 giờ trước' },
]

function wavePath(points: number[]) {
  const max = Math.max(...points)
  const min = Math.min(...points)
  const width = 640
  const height = 160
  const step = width / (points.length - 1)
  return points
    .map((point, index) => {
      const x = index * step
      const y = height - ((point - min) / (max - min || 1)) * 118 - 22
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}

export function DashboardPage({
  currentUser,
  onOpenPos,
  onOpenAdmin,
  onOpenPriceBook,
  onOpenSalesDocuments,
  onOpenSuppliers,
  onOpenPurchaseReceipts,
  onSignOut,
  showSignOut = true,
}: {
  currentUser: CurrentUserData
  onOpenPos: () => void
  onOpenAdmin: () => void
  onOpenPriceBook: () => void
  onOpenSalesDocuments: () => void
  onOpenSuppliers: () => void
  onOpenPurchaseReceipts: () => void
  onSignOut: () => void
  showSignOut?: boolean
}) {
  const canAdmin = currentUser.permissions.includes('perm.access_admin_panel')

  function openModule(moduleId: string) {
    if (moduleId === 'pos') onOpenPos()
    if (moduleId === 'price-book') onOpenPriceBook()
    if (moduleId === 'sales-documents') onOpenSalesDocuments()
    if (moduleId === 'suppliers') onOpenSuppliers()
    if (moduleId === 'purchase-receipts') onOpenPurchaseReceipts()
  }

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <h1>QC-OMS</h1>
          <p>{currentUser.user.display_name}</p>
        </div>
        <nav aria-label="Điều hướng tổng quan" className="dashboard-nav">
          <span aria-current="page">Tổng quan</span>
          <span>Hàng hóa</span>
          <span>Mua hàng</span>
          <span>Đơn hàng</span>
          <span>Khách hàng</span>
          <span>Sổ quỹ</span>
          <span>Phân tích</span>
        </nav>
        <div className="dashboard-header-actions">
          <button aria-label="Thông báo" className="dashboard-icon-button" type="button">
            <Bell aria-hidden="true" size={18} />
          </button>
          <button aria-label="Cài đặt" className="dashboard-icon-button" type="button">
            <Settings aria-hidden="true" size={18} />
          </button>
          <button aria-label="Tài khoản" className="dashboard-icon-button" type="button">
            <UserCircle aria-hidden="true" size={19} />
          </button>
          <button className="dashboard-sale-button" type="button" onClick={onOpenPos}>
            <ShoppingCart aria-hidden="true" size={18} />
            Bán hàng
          </button>
          {showSignOut ? (
            <button className="dashboard-signout-button" type="button" onClick={onSignOut}>
              Đăng xuất
            </button>
          ) : null}
        </div>
      </header>

      <section className="dashboard-grid">
        <div className="dashboard-main-column">
          <section aria-label="Kết quả bán hàng hôm nay" className="dashboard-card dashboard-kpi-card">
            <header>
              <div>
                <span>Hôm nay</span>
                <h2>Kết quả bán hàng</h2>
              </div>
              <small>Cập nhật theo ca làm việc hiện tại</small>
            </header>
            <div className="dashboard-kpi-grid">
              <article>
                <DollarSign aria-hidden="true" size={20} />
                <span>Doanh thu</span>
                <strong>18 450 000</strong>
                <small>12 hóa đơn</small>
              </article>
              <article>
                <ReceiptText aria-hidden="true" size={20} />
                <span>Trả hàng</span>
                <strong>650 000</strong>
                <small>1 phiếu trả</small>
              </article>
              <article>
                <TrendingUp aria-hidden="true" size={20} />
                <span>Doanh thu thuần</span>
                <strong>17 800 000</strong>
                <small>+8,6% so với kỳ trước</small>
              </article>
            </div>
          </section>

          <section aria-label="Biểu đồ doanh thu thuần" className="dashboard-card dashboard-chart-card">
            <header>
              <div>
                <span>Doanh thu thuần</span>
                <h2>118 600 000</h2>
              </div>
              <select aria-label="Mốc thời gian doanh thu" defaultValue="month">
                <option value="today">Hôm nay</option>
                <option value="week">Tuần này</option>
                <option value="month">Tháng này</option>
              </select>
            </header>
            <div className="dashboard-chart-tabs" role="tablist" aria-label="Kiểu xem doanh thu">
              <button aria-selected="true" role="tab" type="button">Theo ngày</button>
              <button aria-selected="false" role="tab" type="button">Theo giờ</button>
              <button aria-selected="false" role="tab" type="button">Theo thứ</button>
            </div>
            <div className="dashboard-wave-chart">
              <svg aria-label="Sóng doanh thu thuần" role="img" viewBox="0 0 640 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="dashboardWaveStroke" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#0f8f7d" />
                    <stop offset="55%" stopColor="#ef8f35" />
                    <stop offset="100%" stopColor="#4f73c9" />
                  </linearGradient>
                  <linearGradient id="dashboardWaveFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#0f8f7d" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#0f8f7d" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={`${wavePath(revenuePoints)} L 640 180 L 0 180 Z`} fill="url(#dashboardWaveFill)" />
                <path d={wavePath(revenuePoints)} fill="none" stroke="url(#dashboardWaveStroke)" strokeLinecap="round" strokeWidth="5" />
              </svg>
              <div className="dashboard-bar-strip" aria-hidden="true">
                {weekdayBars.map((bar) => (
                  <span key={bar.label} style={{ '--dashboard-bar-height': `${bar.value}%` } as CSSProperties}>
                    <i />
                    <em>{bar.label}</em>
                  </span>
                ))}
              </div>
            </div>
          </section>

          <div className="dashboard-split-grid">
            <RankCard title="Top hàng bán chạy" items={topProducts} />
            <RankCard title="Top khách mua nhiều nhất" items={topCustomers} />
          </div>
        </div>

        <aside className="dashboard-side-column" aria-label="Thông tin phụ">
          <section className="dashboard-card dashboard-utility-card" aria-label="Tiện ích">
            <UtilityRow icon={CreditCard} title="Thanh toán" description="Cài đặt QR và phương thức thu tiền" />
            <UtilityRow icon={TrendingUp} title="Vay vốn" description="Theo dõi hạn mức và đề xuất vốn" />
          </section>

          <section className="dashboard-card dashboard-security-card" aria-label="Cảnh báo bảo mật">
            <ShieldAlert aria-hidden="true" size={22} />
            <div>
              <h2>2 đăng nhập cần kiểm tra</h2>
              <p>Hoạt động lạ từ thiết bị chưa ghi nhận.</p>
            </div>
            <ArrowRight aria-hidden="true" size={18} />
          </section>

          <section aria-label="Hoạt động gần đây" className="dashboard-card dashboard-activity-card">
            <header>
              <h2>Hoạt động gần đây</h2>
              <span>Realtime</span>
            </header>
            <ol>
              {activities.map((activity) => {
                const Icon = activity.icon
                return (
                  <li key={`${activity.actor}-${activity.time}`}>
                    <Icon aria-hidden="true" size={17} />
                    <p>
                      <strong>{activity.actor}</strong> {activity.text} <b>{activity.value}</b>
                      <small>{activity.time}</small>
                    </p>
                  </li>
                )
              })}
            </ol>
          </section>
        </aside>
      </section>

      <section aria-label="Module hệ thống" className="module-grid dashboard-module-grid">
        {phaseOneModules.map((module) => {
          const enabled = canOpenModule(currentUser, module)
          const implemented =
            module.id === 'pos' ||
            module.id === 'price-book' ||
            module.id === 'sales-documents' ||
            module.id === 'suppliers' ||
            module.id === 'purchase-receipts'
          return (
            <button
              disabled={!enabled || !implemented}
              key={module.id}
              type="button"
              onClick={() => openModule(module.id)}
            >
              {module.label}
            </button>
          )
        })}
        <button disabled={!canAdmin} type="button" onClick={onOpenAdmin}>
          Quản trị
        </button>
      </section>
    </main>
  )
}

function RankCard({ title, items }: { title: string; items: Array<{ label: string; value: string; width: number }> }) {
  return (
    <section aria-label={title} className="dashboard-card dashboard-rank-card">
      <header>
        <h2>{title}</h2>
        <select aria-label={`${title} thời gian`} defaultValue="month">
          <option value="month">Tháng này</option>
          <option value="yesterday">Hôm qua</option>
        </select>
      </header>
      <ol>
        {items.map((item, index) => (
          <li key={item.label}>
            <span>{index + 1}</span>
            <div>
              <strong>{item.label}</strong>
              <i style={{ '--dashboard-rank-width': `${item.width}%` } as CSSProperties} />
            </div>
            <em>{item.value}</em>
          </li>
        ))}
      </ol>
    </section>
  )
}

function UtilityRow({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <button className="dashboard-utility-row" type="button">
      <Icon aria-hidden="true" size={18} />
      <span>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
      <ArrowRight aria-hidden="true" size={16} />
    </button>
  )
}
