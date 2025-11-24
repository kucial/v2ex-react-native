import { useState } from 'react'
import { Dimensions, View } from 'react-native'
import { TabView } from 'react-native-tab-view'
import { useLocalSearchParams } from 'expo-router'

import AnimatedTabBar from './AnimatedTabBar'
import { useAnimatedTabs } from './hooks'
import MemberReplies from './MemberReplies'
import MemberScreenHeader from './MemberScreenHeader'
import MemberTopics from './MemberTopics'

export default function MemberScreen() {
  const params = useLocalSearchParams()
  const username = params.username as string
  const tab = params.tab as string
  const brief = null

  const [routes] = useState([
    { key: 'topics', title: '主题' },
    { key: 'replies', title: '回复' },
  ])

  const {
    tabIndex,
    setTabIndex,
    headerHeight,
    setHeaderHeight,
    tabBarHeight,
    setTabBarHeight,
    headerCollapsedHeight,
    scrollY,
    onScroll,
    onMomentumScrollBegin,
    onMomentumScrollEnd,
    onScrollEndDrag,
    registerListRef,
    getContentContainerStyle,
    isFocused,
  } = useAnimatedTabs({
    routes,
    initialTab: tab,
  })

  const renderTabBar = (props) => (
    <>
      <MemberScreenHeader
        username={username}
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
        tabCount={routes.length}
        {...props}
      />
    </>
  )

  return (
    <View className='flex-1'>
      <TabView
        onIndexChange={setTabIndex}
        navigationState={{ index: tabIndex, routes }}
        renderTabBar={renderTabBar}
        renderScene={({ route }) => {
          const contentContainerStyle = getContentContainerStyle()
          const focused = isFocused(route.key)

          if (route.key === 'topics') {
            return (
              <MemberTopics
                username={username}
                scrollY={scrollY}
                isFocused={focused}
                onMomentumScrollBegin={onMomentumScrollBegin}
                onScrollEndDrag={onScrollEndDrag}
                onScroll={onScroll}
                onMomentumScrollEnd={onMomentumScrollEnd}
                onGetRef={registerListRef(route.key)}
                contentContainerStyle={contentContainerStyle}
              />
            )
          }

          return (
            <MemberReplies
              username={username}
              scrollY={scrollY}
              isFocused={focused}
              onMomentumScrollBegin={onMomentumScrollBegin}
              onScrollEndDrag={onScrollEndDrag}
              onMomentumScrollEnd={onMomentumScrollEnd}
              onScroll={onScroll}
              contentContainerStyle={contentContainerStyle}
              onGetRef={registerListRef(route.key)}
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
