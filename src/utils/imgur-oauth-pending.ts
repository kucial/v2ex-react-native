import { getJSON, setJSON } from '@/utils/storage'

const PENDING_IMGUR_OAUTH_KEY = '$app$/oauth/imgur/pending'
const PENDING_IMGUR_OAUTH_MAX_AGE = 30 * 60 * 1000

export type PendingImgurOAuth = {
  clientId: string
  state: string
  autoBack: boolean
  createdAt: number
}

export function savePendingImgurOAuth(request: PendingImgurOAuth) {
  setJSON(PENDING_IMGUR_OAUTH_KEY, request)
}

export function loadPendingImgurOAuth(): PendingImgurOAuth | undefined {
  const request = getJSON(PENDING_IMGUR_OAUTH_KEY) as
    | PendingImgurOAuth
    | undefined

  if (
    !request?.clientId ||
    !request.state ||
    Date.now() - request.createdAt > PENDING_IMGUR_OAUTH_MAX_AGE
  ) {
    clearPendingImgurOAuth()
    return undefined
  }

  return request
}

export function clearPendingImgurOAuth() {
  setJSON(PENDING_IMGUR_OAUTH_KEY, undefined)
}
