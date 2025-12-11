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

export default function HomeDataPrefetch(props: {
  index: number
  routes: Route[]
}) {
  const { index, routes } = props
  const prevIndex = index - 1
  const nextIndex = index + 1

  return (
    <>
      {!!routes[prevIndex] ? (
        <TabPrefetch option={routes[prevIndex].tab} />
      ) : null}
      {!!routes[nextIndex] ? (
        <TabPrefetch option={routes[nextIndex].tab} />
      ) : null}
    </>
  )
}

export function TabPrefetch(props: { option: HomeTabOption }) {
  const type = props.option.type || 'home'

  if (type === 'home') {
    return <HomeTabPrefetch tab={props.option.value} />
  }
  if (type === 'node') {
    return <NodeTopicsRefetch name={props.option.value} />
  }
  if (type === 'xna') {
    return <XnaPrefetch />
  }
  if (type === 'user') {
    return <MemberTopicsPrefetch username={props.option.value} />
  }

  return null
}

function HomeTabPrefetch(props: { tab: string }) {
  useHomeTabFeed(props.tab, true)
  return null
}
export function XnaPrefetch() {
  useXnaFeed(true)
  return null
}
export function MemberTopicsPrefetch(props: { username: string }) {
  useMemberTopics(props.username, true)
  return null
}
export function NodeTopicsRefetch(props: { name: string }) {
  useNodeTopics(props.name, true)
  return null
}
