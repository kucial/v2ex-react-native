import { ScrollViewProps, ViewStyle } from 'react-native'
import { SharedValue } from 'react-native-reanimated'

export type PagerState = 'idle' | 'dragging' | 'settling'

export type ProfileTab = {
  key: string
  title: string
  accessibilityLabel?: string
}

export type ProfileCoordinatorTabRenderProps = {
  tabKey: string
  tabIndex: number
  isFocused: boolean
  contentContainerStyle: ViewStyle
  listProps: {
    ref: (ref: any) => void
    onScroll: ScrollViewProps['onScroll']
    onScrollEndDrag: ScrollViewProps['onScrollEndDrag']
    onMomentumScrollBegin: ScrollViewProps['onMomentumScrollBegin']
    onMomentumScrollEnd: ScrollViewProps['onMomentumScrollEnd']
    scrollEventThrottle: number
  }
  scrollViewProps: {
    ref: (ref: any) => void
    onScroll: ScrollViewProps['onScroll']
    onScrollEndDrag: ScrollViewProps['onScrollEndDrag']
    onMomentumScrollBegin: ScrollViewProps['onMomentumScrollBegin']
    onMomentumScrollEnd: ScrollViewProps['onMomentumScrollEnd']
    scrollEventThrottle: number
    showsVerticalScrollIndicator?: boolean
  }
  pagerPosition: SharedValue<number>
  pagerState: SharedValue<PagerState>
}
