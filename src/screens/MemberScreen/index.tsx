import { useCallback, useState } from 'react'
import { useSharedValue } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams, useNavigation } from 'expo-router'

import {
  ProfileCoordinator,
  ProfileCoordinatorTabRenderProps,
} from '@/components/ProfileCoordinator'

import MemberReplies from './MemberReplies'
import MemberScreenHeader from './MemberScreenHeader'
import MemberTopics from './MemberTopics'

const TABS = [
  { key: 'topics', title: '主题' },
  { key: 'replies', title: '回复' },
]

export default function MemberScreen() {
  const params = useLocalSearchParams()
  const username = params.username as string
  const initialTab = params.tab as string | undefined
  const navigation = useNavigation()

  const insets = useSafeAreaInsets()
  const collapsedHeaderHeight = 44 + insets.top

  // headerScrollY is owned here and passed to both the header (for its collapse
  // animations) and to ProfileCoordinator (which drives it from the active list).
  const headerScrollY = useSharedValue(0)

  // headerHeight is measured by MemberScreenHeader via its onLayout callback and
  // forwarded to ProfileCoordinator as the expanded header height.
  const [headerHeight, setHeaderHeight] = useState(0)

  // Disable the stack swipe-back when the user is on a non-first tab so that a
  // left-edge swipe pages back to the topics tab instead of popping the screen.
  const handleTabChange = useCallback(
    ({ index }: { index: number; key: string }) => {
      navigation.setOptions({ gestureEnabled: index === 0 })
    },
    [navigation],
  )

  const header = (
    <MemberScreenHeader
      username={username}
      brief={null}
      onLayout={setHeaderHeight}
      headerHeight={headerHeight}
      headerCollapsedHeight={collapsedHeaderHeight}
      scrollY={headerScrollY}
    />
  )

  const renderScene = useCallback(
    (tabKey: string, sceneProps: ProfileCoordinatorTabRenderProps) => {
      if (tabKey === 'topics') {
        return (
          <MemberTopics
            username={username}
            isFocused={sceneProps.isFocused}
            {...sceneProps}
          />
        )
      }
      return (
        <MemberReplies
          username={username}
          isFocused={sceneProps.isFocused}
          {...sceneProps}
        />
      )
    },
    [username],
  )

  return (
    <ProfileCoordinator
      tabs={TABS}
      header={header}
      headerHeight={headerHeight}
      collapsedHeaderHeight={collapsedHeaderHeight}
      headerScrollY={headerScrollY}
      initialTabKey={initialTab}
      onTabChange={handleTabChange}
      renderScene={renderScene}
    />
  )
}
