import { useCallback, useRef } from 'react'
import { ActivityIndicator, Keyboard, StyleSheet, View } from 'react-native'
import PagerView from 'react-native-pager-view'

import { useAIChatTheme } from '@/components/AIChat/theme'

import { AIChatProvider, useAIChat } from '@/containers/AIChatService'

import ChatView from './ChatView'
import RecentsView from './RecentsView'

function AIChatPager() {
  const pager = useRef<PagerView>(null)
  const { hydrated } = useAIChat()
  const { colors } = useAIChatTheme()
  const openChat = useCallback(() => pager.current?.setPage(1), [])
  const openRecents = useCallback(() => pager.current?.setPage(0), [])

  if (!hydrated) {
    return (
      <View
        style={[screenStyles.loading, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator color={colors.secondaryText} />
      </View>
    )
  }

  return (
    <PagerView
      ref={pager}
      initialPage={1}
      style={screenStyles.pager}
      overdrag
      onPageSelected={(event) => {
        if (event.nativeEvent.position === 0) Keyboard.dismiss()
      }}
    >
      <View key='recents' collapsable={false} style={screenStyles.page}>
        <RecentsView onOpenChat={openChat} />
      </View>
      <View key='chat' collapsable={false} style={screenStyles.page}>
        <ChatView onOpenRecents={openRecents} />
      </View>
    </PagerView>
  )
}

export default function AIChatScreen() {
  return (
    <AIChatProvider>
      <AIChatPager />
    </AIChatProvider>
  )
}

const screenStyles = StyleSheet.create({
  pager: { flex: 1 },
  page: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
})
