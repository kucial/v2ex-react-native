import * as Linking from 'expo-linking'
import { router } from 'expo-router'

import { track } from '@/lib/tracking'

export function handleDeepLink(url: string) {
  if (!url) return

  // remove #hash
  const cleanUrl = url.replace(/#.*$/, '')

  const { hostname, path, queryParams } = Linking.parse(cleanUrl)

  // only allow v2ex domains
  if (hostname && !/(\.?)v2ex\.com$/.test(hostname)) {
    return
  }

  // Now manually map expo-router routes
  if (path?.startsWith('t/')) {
    const id = path.split('/')[1]
    track('nav.deep_link', { target: 'topic' })
    router.push(`/topic/${id}`)
    return
  }

  if (path?.startsWith('go/')) {
    const name = path.split('/')[1]
    track('nav.deep_link', { target: 'node' })
    router.push(`/node/${name}`)
    return
  }

  if (path?.startsWith('member/')) {
    const username = path.split('/')[1]
    track('nav.deep_link', { target: 'member' })
    router.push(`/member/${username}`)
    return
  }
}
