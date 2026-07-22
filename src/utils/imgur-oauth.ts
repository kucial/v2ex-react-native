import type { ImgurCredentials } from '@/containers/ImgurService/types'

const IMGUR_AUTHORIZE_URL = 'https://api.imgur.com/oauth2/authorize'
export const IMGUR_OAUTH_CALLBACK_PATH = 'imgur-oauth'

type ImgurOAuthCredentials = Omit<ImgurCredentials, 'client_id'>

export type ImgurOAuthCallbackResult =
  | {
      ok: true
      state: string
      credentials: ImgurOAuthCredentials
    }
  | {
      ok: false
      state?: string
      error: string
    }

function isImgurOAuthCallback(url: URL) {
  if (url.hostname === IMGUR_OAUTH_CALLBACK_PATH) return true

  const pathSegments = url.pathname.split('/').filter(Boolean)
  return pathSegments.at(-1) === IMGUR_OAUTH_CALLBACK_PATH
}

export function createImgurAuthorizationUrl(options: {
  clientId: string
  redirectUri: string
  state: string
}) {
  const params = new URLSearchParams({
    client_id: options.clientId,
    redirect_uri: options.redirectUri,
    response_type: 'token',
    state: options.state,
  })

  return `${IMGUR_AUTHORIZE_URL}?${params.toString()}`
}

export function parseImgurOAuthCallback(
  callbackUrl: string,
): ImgurOAuthCallbackResult | null {
  let url: URL
  try {
    url = new URL(callbackUrl)
  } catch {
    return null
  }

  if (!isImgurOAuthCallback(url)) return null

  const params = new URLSearchParams(url.search.slice(1))
  const fragmentParams = new URLSearchParams(url.hash.slice(1))
  fragmentParams.forEach((value, key) => params.set(key, value))
  const state = params.get('state') ?? undefined
  const oauthError = params.get('error')

  if (oauthError) {
    return {
      ok: false,
      state,
      error: params.get('error_description') ?? `Imgur 授权失败：${oauthError}`,
    }
  }

  const accessToken = params.get('access_token')
  if (!accessToken) {
    return {
      ok: false,
      state,
      error: 'Imgur 授权回调中没有 Access Token。',
    }
  }

  return {
    ok: true,
    state: state ?? '',
    credentials: {
      access_token: accessToken,
      account_id: params.get('account_id') ?? '',
      account_username: params.get('account_username') ?? '',
      expires_in: params.get('expires_in') ?? '',
      refresh_token: params.get('refresh_token') ?? '',
      token_type: params.get('token_type') ?? '',
    },
  }
}

export function redirectImgurOAuthSystemPath(path: string) {
  if (!parseImgurOAuthCallback(path)) return path

  return `/imgur-oauth?callbackUrl=${encodeURIComponent(path)}`
}
