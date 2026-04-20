import { ReactElement } from 'react'
import { create } from 'zustand'

import { ReplyContext, UserInfoContext } from '@/screens/TopicScreen/types'
import { TopicReply } from '@/utils/v2ex-client/types'

export type ConversationSheetOptions = {
  data: TopicReply[]
  pivot: TopicReply
  showAvatar?: boolean
  onReply: (reply: TopicReply) => void
  onThank: (reply: TopicReply) => void
  onShowUserInfo?: (context: UserInfoContext) => void
}

export type UserInfoSheetOptions = {
  data: TopicReply[]
  header?: ReactElement
  showAvatar?: boolean
  onReply: (reply: TopicReply) => void
  onThank: (reply: TopicReply) => void
}

export type ReplyFormSheetOptions = {
  cacheKey: string
  context: ReplyContext
  onSubmit: (values: { content: string }) => Promise<void>
  onInitImgurSettings: () => void
}

type TopicSheetState = {
  conversationOptions: ConversationSheetOptions | null
  userInfoOptions: UserInfoSheetOptions | null
  replyOptions: ReplyFormSheetOptions | null
  showConversation: (options: ConversationSheetOptions) => void
  showUserInfo: (options: UserInfoSheetOptions) => void
  showReplyForm: (options: ReplyFormSheetOptions) => void
  dismissReplyForm: () => void
  dismissAll: () => void
}

export const useTopicSheetStore = create<TopicSheetState>((set) => ({
  conversationOptions: null,
  userInfoOptions: null,
  replyOptions: null,
  showConversation: (options) => set({ conversationOptions: options }),
  showUserInfo: (options) => set({ userInfoOptions: options }),
  showReplyForm: (options) => set({ replyOptions: options }),
  dismissReplyForm: () => set({ replyOptions: null }),
  dismissAll: () =>
    set({
      conversationOptions: null,
      userInfoOptions: null,
      replyOptions: null,
    }),
}))
