import type { CurrentUserData } from '../../lib/api/types'
import type { Workstation } from './types'

const workstationStorageKey = 'qc_oms.workstation_id'

export interface ApiRequester {
  request<T>(path: string, init?: RequestInit): Promise<T>
}

export function getWorkstationId() {
  return window.localStorage.getItem(workstationStorageKey)
}

export function setWorkstationId(id: string) {
  window.localStorage.setItem(workstationStorageKey, id)
}

export function clearWorkstationId() {
  window.localStorage.removeItem(workstationStorageKey)
}

export function createFoundationService(api: ApiRequester) {
  return {
    getMe: () => api.request<CurrentUserData>('/api/v1/me'),
    listWorkstations: () => api.request<Workstation[]>('/api/v1/workstations'),
  }
}
