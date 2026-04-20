import { useEffect, useRef } from 'react'
import { KeyboardAvoidingView, Platform, View } from 'react-native'
import { TrueSheet } from '@lodev09/react-native-true-sheet'

import { useTheme } from '@/containers/ThemeService'
import { cn } from '@/lib/utils'
import ReplyList from '@/screens/TopicScreen/ReplyList'
import TopicReplyForm from '@/screens/TopicScreen/TopicReplyForm'
import { useTopicSheetStore } from '@/stores/topicSheet'

const conversationDetents = [0.8]

export default function TopicSheetModal() {
  const { styles } = useTheme()
  const conversationModalRef = useRef<TrueSheet>(null)
  const userInfoModalRef = useRef<TrueSheet>(null)
  const replyModalRef = useRef<TrueSheet>(null)

  const {
    conversationOptions,
    userInfoOptions,
    replyOptions,
    showConversation,
    showUserInfo,
    showReplyForm,
    dismissReplyForm,
    dismissAll,
  } = useTopicSheetStore()

  useEffect(() => {
    if (conversationOptions) {
      conversationModalRef.current?.present()
    } else {
      conversationModalRef.current?.dismiss()
    }
  }, [conversationOptions])

  useEffect(() => {
    if (userInfoOptions) {
      userInfoModalRef.current?.present()
    } else {
      userInfoModalRef.current?.dismiss()
    }
  }, [userInfoOptions])

  useEffect(() => {
    if (replyOptions) {
      replyModalRef.current?.present()
    } else {
      replyModalRef.current?.dismiss()
    }
  }, [replyOptions])

  return (
    <>
      <TrueSheet
        ref={conversationModalRef}
        detents={conversationDetents}
        backgroundColor={styles.overlay.backgroundColor}
        scrollable
        onDidDismiss={() => {
          if (conversationOptions) {
            // Dismiss triggered externally (e.g. swipe down)
            useTopicSheetStore.setState({ conversationOptions: null })
          }
        }}
      >
        {conversationOptions && (
          <ReplyList
            className='pt-4'
            contentContainerClassName='pb-safe'
            showAvatar={conversationOptions.showAvatar}
            data={conversationOptions.data}
            pivot={conversationOptions.pivot}
            onReply={conversationOptions.onReply}
            onThank={conversationOptions.onThank}
            onShowUserInfo={conversationOptions.onShowUserInfo}
          />
        )}
      </TrueSheet>
      <TrueSheet
        ref={userInfoModalRef}
        detents={conversationDetents}
        backgroundColor={styles.overlay.backgroundColor}
        scrollable
        onDidDismiss={() => {
          if (userInfoOptions) {
            useTopicSheetStore.setState({ userInfoOptions: null })
          }
        }}
      >
        {userInfoOptions && (
          <ReplyList
            className='pt-4'
            contentContainerClassName='pb-safe'
            showAvatar={userInfoOptions.showAvatar}
            data={userInfoOptions.data}
            header={userInfoOptions.header}
            onReply={userInfoOptions.onReply}
            onThank={userInfoOptions.onThank}
          />
        )}
      </TrueSheet>
      <TrueSheet
        ref={replyModalRef}
        detents={['auto']}
        backgroundColor={styles.overlay.backgroundColor}
        grabber={false}
        onDidDismiss={() => {
          if (replyOptions) {
            dismissReplyForm()
          }
        }}
      >
        <KeyboardAvoidingView>
          <View
            className={cn(
              'pt-4 h-[220px]',
              Platform.OS === 'android' && 'pb-7',
            )}
          >
            {replyOptions && (
              <TopicReplyForm
                cacheKey={replyOptions.cacheKey}
                context={replyOptions.context}
                onSubmit={replyOptions.onSubmit}
                onInitImgurSettings={replyOptions.onInitImgurSettings}
              />
            )}
          </View>
        </KeyboardAvoidingView>
      </TrueSheet>
    </>
  )
}
