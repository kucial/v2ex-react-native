import { useRef, useState } from 'react'
import { Dimensions, Platform, View } from 'react-native'
import {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TabView } from 'react-native-tab-view'
import { useLocalSearchParams } from 'expo-router'

import AnimatedTabBar from './AnimatedTabBar'
import MemberReplies from './MemberReplies'
import MemberScreenHeader from './MemberScreenHeader'
import MemberTopics from './MemberTopics'

export default function MemberScreen() {
  const params = useLocalSearchParams()
  const username = params.username as string
  const tab = params.tab as string
  const brief = null
  const scrollY = useSharedValue(0)
  const listOffset = useSharedValue({
    topics: null,
    replies: null,
  })
  const [headerHeight, setHeaderHeight] = useState(0)
  const [tabBarHeight, setTabBarHeight] = useState(0)

  const insets = useSafeAreaInsets()
  const headerCollapsedHeight = Platform.OS === 'ios' ? 44 + insets.top : 44 + 6

  const [routes] = useState([
    { key: 'topics', title: '主题' },
    { key: 'replies', title: '回复' },
  ])

  const listRefArr = useRef([])
  const isListGliding = useRef(false)

  const [tabIndex, setIndex] = useState(() => {
    if (tab) {
      const index = routes.findIndex((item) => item.key === tab)
      if (index > -1) {
        return index
      }
    }
    return 0
  })

  const onMomentumScrollBegin = () => {
    isListGliding.current = true
  }

  const syncScrollOffset = () => {
    const curRouteKey = routes[tabIndex].key
    listRefArr.current.forEach((item) => {
      const delta = headerHeight - headerCollapsedHeight
      if (item.key !== curRouteKey) {
        if (scrollY.value < delta && scrollY.value >= 0) {
          if (item.value) {
            item.value.scrollToOffset({
              offset: scrollY.value,
              animated: false,
            })
            listOffset[item.key] = scrollY.value
          }
        } else if (scrollY.value >= delta) {
          if (listOffset[item.key] < delta || listOffset[item.key] == null) {
            if (item.value) {
              item.value.scrollToOffset({
                offset: delta,
                animated: false,
              })
              listOffset[item.key] = delta
            }
          }
        }
      }
    })
  }

  const onMomentumScrollEnd = () => {
    isListGliding.current = false
    syncScrollOffset()
  }

  const onScrollEndDrag = () => {
    syncScrollOffset()
  }

  const onScroll = useAnimatedScrollHandler(
    {
      onScroll(e) {
        scrollY.value = e.contentOffset.y
        const route = routes[tabIndex].key
        listOffset[route] = scrollY.value
      },
    },
    [tabIndex],
  )

  const renderTabBar = (props) => (
    <>
      <MemberScreenHeader
        username={username as string}
        brief={brief}
        scrollY={scrollY}
        headerHeight={headerHeight}
        headerCollapsedHeight={headerCollapsedHeight}
        setHeaderHeight={setHeaderHeight}
      />
      <AnimatedTabBar
        headerHeight={headerHeight}
        scrollY={scrollY}
        headerCollapsedHeight={headerCollapsedHeight}
        setTabBarHeight={setTabBarHeight}
        tabCount={2}
        {...props}
      />
    </>
  )

  return (
    <View className='flex-1'>
      <TabView
        onIndexChange={setIndex}
        navigationState={{ index: tabIndex, routes }}
        renderTabBar={renderTabBar}
        renderScene={({ route }) => {
          const isFocused = route.key === routes[tabIndex].key
          const contentContainerStyle = {
            paddingTop: headerHeight + tabBarHeight,
          }
          if (route.key === 'topics') {
            return (
              <MemberTopics
                username={username}
                scrollY={scrollY}
                isFocused={isFocused}
                onMomentumScrollBegin={onMomentumScrollBegin}
                onScrollEndDrag={onScrollEndDrag}
                onScroll={onScroll}
                onMomentumScrollEnd={onMomentumScrollEnd}
                onGetRef={(ref) => {
                  if (ref) {
                    const found = listRefArr.current.find(
                      (e) => e.key === route.key,
                    )
                    if (!found) {
                      listRefArr.current.push({
                        key: route.key,
                        value: ref,
                      })
                    }
                  }
                }}
                contentContainerStyle={contentContainerStyle}
              />
            )
          }
          return (
            <MemberReplies
              username={username}
              scrollY={scrollY}
              isFocused={isFocused}
              onMomentumScrollBegin={onMomentumScrollBegin}
              onScrollEndDrag={onScrollEndDrag}
              onMomentumScrollEnd={onMomentumScrollEnd}
              onScroll={onScroll}
              contentContainerStyle={contentContainerStyle}
              onGetRef={(ref) => {
                if (ref) {
                  const found = listRefArr.current.find(
                    (e) => e.key === route.key,
                  )
                  if (!found) {
                    listRefArr.current.push({
                      key: route.key,
                      value: ref,
                    })
                  }
                }
              }}
            />
          )
        }}
        initialLayout={{
          width: Dimensions.get('window').width,
        }}
      />
    </View>
  )
}
