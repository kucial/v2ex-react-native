import { BalanceBrief, MemberDetail } from '@/utils/v2ex-client/types'
export interface MemberMeta {
  unread_count: number
  balance?: BalanceBrief
}

export interface AuthState {
  error?: Error
  user: MemberDetail
  meta?: MemberMeta
  status: string
  fetchedAt?: number
}

export interface AuthService {
  user?: MemberDetail
  meta?: MemberMeta
  status: string
  fetchedAt?: number
  fetchCurrentUser: (refresh?: boolean) => Promise<MemberDetail>
  logout(): Promise<void>
  composeAuthedNavigation<T = never>(
    func: (params?: T) => void,
  ): (params?: T) => void
  getNextAction(): VoidFunction
  updateMeta: (data: MemberMeta) => void
  goToSigninSreen(): void
}
