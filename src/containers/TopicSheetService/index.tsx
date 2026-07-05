import { useEffect, useRef } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TrueSheet } from '@lodev09/react-native-true-sheet'

import { useTheme } from '@/containers/ThemeService'
import ReplyList from '@/screens/TopicScreen/ReplyList'
import TopicReplyForm from '@/screens/TopicScreen/TopicReplyForm'
import { useTopicSheetStore } from '@/stores/topicSheet'
import { dismissSheet, presentSheet } from '@/utils/trueSheet'

const conversationDetents = [0.8]

// Presents the sheet when options become truthy and dismisses it when they
// are cleared. Skips the dismiss on initial mount (nothing is presented yet).
function useSheetPresentation(options: unknown) {
  const modalRef = useRef<TrueSheet>(null)
  const presentedRef = useRef(false)

  useEffect(() => {
    if (options) {
      presentedRef.current = true
      presentSheet(modalRef.current)
    } else if (presentedRef.current) {
      presentedRef.current = false
      dismissSheet(modalRef.current)
    }
  }, [options])

  return modalRef
}

function ConversationSheet() {
  const { styles } = useTheme()
  const insets = useSafeAreaInsets()
  const options = useTopicSheetStore((state) => state.conversationOptions)
  const modalRef = useSheetPresentation(options)

  return (
    <TrueSheet
      ref={modalRef}
      detents={conversationDetents}
      backgroundColor={styles.overlay.backgroundColor}
      scrollable
      onDidDismiss={() => {
        useTopicSheetStore.getState().dismissAll()
      }}
    >
      {options && (
        <ReplyList
          contentContainerStyle={[
            sheetStyles.listContent,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
          showAvatar={options.showAvatar}
          data={options.data}
          pivot={options.pivot}
          onReply={options.onReply}
          onThank={options.onThank}
          onShowUserInfo={options.onShowUserInfo}
        />
      )}
    </TrueSheet>
  )
}

function UserInfoSheet() {
  const { styles } = useTheme()
  const insets = useSafeAreaInsets()
  const options = useTopicSheetStore((state) => state.userInfoOptions)
  const modalRef = useSheetPresentation(options)

  return (
    <TrueSheet
      ref={modalRef}
      detents={conversationDetents}
      backgroundColor={styles.overlay.backgroundColor}
      scrollable
      onDidDismiss={() => {
        if (useTopicSheetStore.getState().userInfoOptions) {
          useTopicSheetStore.setState({ userInfoOptions: null })
        }
      }}
    >
      {options && (
        <ReplyList
          contentContainerStyle={[
            sheetStyles.listContent,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
          showAvatar={options.showAvatar}
          data={options.data}
          header={options.header}
          onReply={options.onReply}
          onThank={options.onThank}
        />
      )}
    </TrueSheet>
  )
}

function ReplyFormSheet() {
  const { styles } = useTheme()
  const options = useTopicSheetStore((state) => state.replyOptions)
  const modalRef = useSheetPresentation(options)

  return (
    <TrueSheet
      ref={modalRef}
      detents={['auto']}
      backgroundColor={styles.overlay.backgroundColor}
      grabber={false}
      onDidDismiss={() => {
        if (useTopicSheetStore.getState().replyOptions) {
          useTopicSheetStore.getState().dismissReplyForm()
        }
      }}
    >
      <KeyboardAvoidingView>
        <View
          style={[
            sheetStyles.replyFormContainer,
            Platform.OS === 'android' && sheetStyles.pb7,
          ]}
        >
          {options && (
            <TopicReplyForm
              cacheKey={options.cacheKey}
              context={options.context}
              onSubmit={options.onSubmit}
              onInitImgurSettings={options.onInitImgurSettings}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </TrueSheet>
  )
}

export default function TopicSheetModal() {
  // Order matters: when dismissAll() clears every option in one commit, the
  // effects run in tree order and enqueue dismissals through the serial sheet
  // queue. Sheets stack as conversation < user info < reply form, so dismiss
  // top-down — dismissing an underlying sheet while one is still presented
  // above it fails natively and leaves the stack stuck.
  return (
    <>
      <ReplyFormSheet />
      <UserInfoSheet />
      <ConversationSheet />
    </>
  )
}

const sheetStyles = StyleSheet.create({
  listContent: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  replyFormContainer: {
    paddingTop: 16,
    height: 220,
  },
  pb7: {
    paddingBottom: 28,
  },
})
