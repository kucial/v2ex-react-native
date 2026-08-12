import {
  createImgurAuthorizationUrl,
  isImgurOAuthCallbackUrl,
  parseImgurOAuthCallback,
  redirectImgurOAuthSystemPath,
} from '@/utils/imgur-oauth'

describe('Imgur OAuth helpers', () => {
  it('identifies OAuth callbacks that should not be treated as copied links', () => {
    expect(isImgurOAuthCallbackUrl('r2v://imgur-oauth')).toBe(true)
    expect(
      isImgurOAuthCallbackUrl(
        'r2v://imgur-oauth#access_token=secret&state=request-state',
      ),
    ).toBe(true)
    expect(
      isImgurOAuthCallbackUrl(
        'exp://127.0.0.1:8081/--/imgur-oauth#access_token=secret',
      ),
    ).toBe(true)
    expect(isImgurOAuthCallbackUrl('https://v2ex.com/t/123')).toBe(false)
    expect(isImgurOAuthCallbackUrl('https://example.com/imgur-oauth')).toBe(
      false,
    )
    expect(isImgurOAuthCallbackUrl('not a URL')).toBe(false)
  })

  it('creates an authorization URL with callback and state', () => {
    const url = new URL(
      createImgurAuthorizationUrl({
        clientId: 'client-id',
        redirectUri: 'r2v://imgur-oauth',
        state: 'request-state',
      }),
    )

    expect(url.origin + url.pathname).toBe(
      'https://api.imgur.com/oauth2/authorize',
    )
    expect(url.searchParams.get('client_id')).toBe('client-id')
    expect(url.searchParams.get('redirect_uri')).toBe('r2v://imgur-oauth')
    expect(url.searchParams.get('response_type')).toBe('token')
    expect(url.searchParams.get('state')).toBe('request-state')
  })

  it('merges the real callback query state with fragment credentials', () => {
    expect(
      parseImgurOAuthCallback(
        'r2v://imgur-oauth?state=request-state#access_token=token&account_id=42&account_username=user&expires_in=3600&token_type=bearer&refresh_token=refresh-token',
      ),
    ).toEqual({
      ok: true,
      state: 'request-state',
      credentials: {
        access_token: 'token',
        account_id: '42',
        account_username: 'user',
        expires_in: '3600',
        refresh_token: 'refresh-token',
        token_type: 'bearer',
      },
    })
  })

  it('recognizes Expo development callback paths', () => {
    expect(
      parseImgurOAuthCallback(
        'exp://127.0.0.1:8081/--/imgur-oauth#access_token=token&state=request-state',
      ),
    ).toMatchObject({ ok: true, state: 'request-state' })
  })

  it('returns an OAuth error and ignores unrelated links', () => {
    expect(
      parseImgurOAuthCallback(
        'r2v://imgur-oauth#error=access_denied&error_description=Cancelled&state=request-state',
      ),
    ).toEqual({
      ok: false,
      state: 'request-state',
      error: 'Cancelled',
    })
    expect(parseImgurOAuthCallback('r2v://topic/123')).toBeNull()
  })

  it('rewrites native callback URLs without losing query or fragment data', () => {
    const callbackUrl =
      'r2v://imgur-oauth#access_token=token&state=request-state'
    const deniedCallbackUrl =
      'r2v://imgur-oauth?error=access_denied&state=request-state'
    const redirectedPath = redirectImgurOAuthSystemPath(callbackUrl)
    const deniedRedirectedPath = redirectImgurOAuthSystemPath(deniedCallbackUrl)

    expect(redirectImgurOAuthSystemPath('r2v://topic/123')).toBe(
      'r2v://topic/123',
    )
    expect(redirectedPath).toMatch(/^\/imgur-oauth\?callbackUrl=/)
    expect(
      new URL(redirectedPath, 'https://r2v.local').searchParams.get(
        'callbackUrl',
      ),
    ).toBe(callbackUrl)
    expect(
      new URL(deniedRedirectedPath, 'https://r2v.local').searchParams.get(
        'callbackUrl',
      ),
    ).toBe(deniedCallbackUrl)
  })
})
