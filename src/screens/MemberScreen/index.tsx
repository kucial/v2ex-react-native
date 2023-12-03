import { useRef, useState } from 'react'
import { Dimensions, Platform, StatusBar, View } from 'react-native'
import {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated'
import { TabView } from 'react-native-tab-view'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import Constants from 'expo-constants'

import AnimatedTabBar from './AnimatedTabBar'
import MemberReplies from './MemberReplies'
import MemberScreenHeader from './MemberScreenHeader'
import MemberTopics from './MemberTopics'

type MemberScreenProps = NativeStackScreenProps<AppStackParamList, 'member'>

const headerCollapsedHeight =
  Platform.OS === 'android' ? 44 + 6 : 44 + Constants.statusBarHeight

export default function MemberScreen({ route }: MemberScreenProps) {
  const { username, tab } = route.params
  const scrollY = useSharedValue(0)
  const [headerHeight, setHeaderHeight] = useState(0)
  const [tabBarHeight, setTabBarHeight] = useState(0)

  const [routes] = useState([
    { key: 'topics', title: '主题' },
    { key: 'replies', title: '回复' },
  ])

  const listRefArr = useRef([])
  const listOffset = useRef({})
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
      if (item.key !== curRouteKey) {
        if (scrollY.value < headerHeight && scrollY.value >= 0) {
          if (item.value) {
            item.value.scrollToOffset({
              offset: scrollY.value,
              animated: false,
            })
            listOffset.current[item.key] = scrollY.value
          }
        } else if (scrollY.value >= headerHeight) {
          if (
            listOffset.current[item.key] < headerHeight ||
            listOffset.current[item.key] == null
          ) {
            if (item.value) {
              item.value.scrollToOffset({
                offset: headerHeight,
                animated: false,
              })
              listOffset.current[item.key] = headerHeight
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
        listOffset.current[route] = scrollY.value
      },
    },
    [tabIndex],
  )

  const renderTabBar = (props) => (
    <>
      <MemberScreenHeader
        username={username}
        brief={route.params.brief}
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
        {...props}
      />
    </>
  )

  return (
    <View className="flex-1">
      {Platform.OS === 'ios' && (
        <StatusBar translucent backgroundColor="transparent" />
      )}
      <TabView
        onIndexChange={setIndex}
        navigationState={{ index: tabIndex, routes }}
        renderTabBar={renderTabBar}
        renderScene={({ route }) => {
          const isFocused = route.key === routes[tabIndex].key
          const contentContainerStyle = {
            paddingTop: headerHeight + tabBarHeight,
          }
          if (route.key == 'topics') {
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
          height: 0,
          width: Dimensions.get('window').width,
        }}
      />
    </View>
  )
}
