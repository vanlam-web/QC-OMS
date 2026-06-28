export function ConnectionStatus({ connected }: { connected: boolean }) {
  return <span aria-label="connection status">{connected ? 'Đã kết nối' : 'Mất kết nối'}</span>
}
