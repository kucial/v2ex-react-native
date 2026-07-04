import { ReactElement, useCallback, useMemo } from 'react'
import { StyleProp, useWindowDimensions, ViewStyle } from 'react-native'
import { FlashList } from '@shopify/flash-list'

import { useMaxContainerWidth } from '@/containers/AppSettingsService'
import { TopicReply } from '@/utils/v2ex-client/types'

import ReplyRow from './ReplyRow'
import { UserInfoContext } from './types'

type ReplyListProps = {
  data: TopicReply[]
  pivot?: TopicReply
  header?: ReactElement
  showAvatar?: boolean
  onReply: (reply: TopicReply) => void
  onThank: (reply: TopicReply) => void
  onShowUserInfo?: (context: UserInfoContext) => void
  style?: StyleProp<ViewStyle>
  contentContainerStyle?: StyleProp<ViewStyle>
}

export default function ReplyList({
  data,
  pivot,
  onReply,
  onThank,
  onShowUserInfo,
  showAvatar,
  header,
  style,
  contentContainerStyle,
}: ReplyListProps) {
  const { width } = useWindowDimensions()
  const maxContainerWidth = useMaxContainerWidth()
  const contentWidth = useMemo(
    () => Math.min(maxContainerWidth, width) - 24 - 8 - 8 - 16,
    [maxContainerWidth, width],
  )

  const extraData = useMemo(() => ({ pivot }), [pivot])

  const renderItem = useCallback(
    ({
      item: reply,
      extraData: extra,
    }: {
      item: TopicReply
      extraData?: any
    }) => (
      <ReplyRow
        showAvatar={showAvatar}
        isPivot={reply.id === extra?.pivot?.id}
        data={reply}
        contentWidth={contentWidth}
        onReply={onReply}
        onThank={onThank}
        onShowUserInfo={onShowUserInfo}
      />
    ),
    [showAvatar, contentWidth, onReply, onThank, onShowUserInfo],
  )

  const keyExtractor = useCallback((item: TopicReply) => String(item.id), [])

  return (
    <FlashList
      data={data}
      style={style}
      contentContainerStyle={contentContainerStyle}
      extraData={extraData}
      nestedScrollEnabled
      ListHeaderComponent={header}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
    />
  )
}
