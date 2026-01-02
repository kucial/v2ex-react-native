import {
  createContext,
  ReactElement,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'
import { KeyboardAvoidingView, Platform, View } from 'react-native'
import { TrueSheet } from '@lodev09/react-native-true-sheet'

import { useTheme } from '@/containers/ThemeService'
import { cn } from '@/lib/utils'
import ReplyList from '@/screens/TopicScreen/ReplyList'
import TopicReplyForm from '@/screens/TopicScreen/TopicReplyForm'
import { ReplyContext, UserInfoContext } from '@/screens/TopicScreen/types'
import { TopicReply } from '@/utils/v2ex-client/types'

type ConversationSheetOptions = {
  data: TopicReply[]
  pivot: TopicReply
  showAvatar?: boolean
  onReply: (reply: TopicReply) => void
  onThank: (reply: TopicReply) => void
  onShowUserInfo?: (context: UserInfoContext) => void
}

type UserInfoSheetOptions = {
  data: TopicReply[]
  header?: ReactElement
  showAvatar?: boolean
  onReply: (reply: TopicReply) => void
  onThank: (reply: TopicReply) => void
}

type ReplyFormSheetOptions = {
  cacheKey: string
  context: ReplyContext
  onSubmit: (values: { content: string }) => Promise<void>
  onInitImgurSettings: () => void
}

type TopicSheetService = {
  showConversation: (options: ConversationSheetOptions) => void
  showUserInfo: (options: UserInfoSheetOptions) => void
  showReplyForm: (options: ReplyFormSheetOptions) => void
  dismissReplyForm: () => void
  dismissAll: () => void
}

const TopicSheetContext = createContext<TopicSheetService>(null)

const conversationDetents = [0.8]

export default function TopicSheetServiceProvider(props: {
  children: ReactElement
}) {
  const { styles } = useTheme()
  const conversationModalRef = useRef<TrueSheet>(null)
  const userInfoModalRef = useRef<TrueSheet>(null)
  const replyModalRef = useRef<TrueSheet>(null)
  const [conversationOptions, setConversationOptions] =
    useState<ConversationSheetOptions>(null)
  const [userInfoOptions, setUserInfoOptions] =
    useState<UserInfoSheetOptions>(null)
  const [replyOptions, setReplyOptions] = useState<ReplyFormSheetOptions>(null)

  const showConversation = useCallback((options: ConversationSheetOptions) => {
    setConversationOptions(options)
    conversationModalRef.current?.present()
  }, [])

  const showUserInfo = useCallback((options: UserInfoSheetOptions) => {
    setUserInfoOptions(options)
    userInfoModalRef.current?.present()
  }, [])

  const showReplyForm = useCallback((options: ReplyFormSheetOptions) => {
    setReplyOptions(options)
    replyModalRef.current?.present()
  }, [])

  const dismissReplyForm = useCallback(() => {
    replyModalRef.current?.dismiss()
    setReplyOptions(null)
  }, [])

  const dismissAll = useCallback(() => {
    conversationModalRef.current?.dismiss()
    userInfoModalRef.current?.dismiss()
    replyModalRef.current?.dismiss()
    setConversationOptions(null)
    setUserInfoOptions(null)
    setReplyOptions(null)
  }, [])

  const value = useMemo(
    () => ({
      showConversation,
      showUserInfo,
      showReplyForm,
      dismissReplyForm,
      dismissAll,
    }),
    [
      showConversation,
      showUserInfo,
      showReplyForm,
      dismissReplyForm,
      dismissAll,
    ],
  )

  return (
    <TopicSheetContext.Provider value={value}>
      {props.children}
      <TrueSheet
        ref={conversationModalRef}
        detents={conversationDetents}
        backgroundColor={styles.overlay.backgroundColor}
        scrollable
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
    </TopicSheetContext.Provider>
  )
}

export const useTopicSheetService = () => useContext(TopicSheetContext)
