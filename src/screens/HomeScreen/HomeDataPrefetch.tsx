import { useEffect, useState } from 'react'
import { InteractionManager } from 'react-native'

import {
  useHomeTabFeed,
  useMemberTopics,
  useNodeTopics,
  useXnaFeed,
} from '@/hooks'
import { HomeTabOption } from '@/utils/v2ex-client/types'

type Route = {
  key: string
  title: string
  tab: HomeTabOption
}

// Neighbour tabs are warmed so that swiping feels instant. Doing that during
// App Start makes them race the tab the user is actually looking at, and puts
// three near-identical `/?tab=` requests in the same window — which is what
// Sentry reports as an N+1 (V2EX-REACT-NATIVE-BM).
//
// Hold the warm-up until the first screen has settled. The gate only ever
// closes once, so swiping between tabs later still prefetches immediately.
const PREFETCH_DELAY = 1500

function usePrefetchReady() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const task = InteractionManager.runAfterInteractions(() => {
      timer = setTimeout(() => setReady(true), PREFETCH_DELAY)
    })
    return () => {
      task.cancel()
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [])

  return ready
}

export default function HomeDataPrefetch(props: {
  index: number
  routes: Route[]
}) {
  const { index, routes } = props
  const prevIndex = index - 1
  const nextIndex = index + 1
  const ready = usePrefetchReady()

  return (
    <>
      {!!routes[prevIndex] ? (
        <TabPrefetch option={routes[prevIndex].tab} enabled={ready} />
      ) : null}
      {!!routes[nextIndex] ? (
        <TabPrefetch option={routes[nextIndex].tab} enabled={ready} />
      ) : null}
    </>
  )
}

export function TabPrefetch(props: {
  option: HomeTabOption
  enabled?: boolean
}) {
  const { enabled = true } = props
  const type = props.option.type || 'home'

  if (type === 'home') {
    return <HomeTabPrefetch tab={props.option.value} enabled={enabled} />
  }
  if (type === 'node') {
    return <NodeTopicsRefetch name={props.option.value} enabled={enabled} />
  }
  if (type === 'xna') {
    return <XnaPrefetch enabled={enabled} />
  }
  if (type === 'user') {
    return (
      <MemberTopicsPrefetch username={props.option.value} enabled={enabled} />
    )
  }

  return null
}

function HomeTabPrefetch(props: { tab: string; enabled?: boolean }) {
  useHomeTabFeed(props.tab, props.enabled ?? true)
  return null
}
export function XnaPrefetch(props: { enabled?: boolean } = {}) {
  useXnaFeed(props.enabled ?? true)
  return null
}
export function MemberTopicsPrefetch(props: {
  username: string
  enabled?: boolean
}) {
  useMemberTopics(props.username, props.enabled ?? true)
  return null
}
export function NodeTopicsRefetch(props: { name: string; enabled?: boolean }) {
  useNodeTopics(props.name, props.enabled ?? true)
  return null
}
