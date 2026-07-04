import { decode } from 'js-base64'

import { TopicReply } from '@/utils/v2ex-client/types'

export function getMaxLength(str: string, maxLength = 50) {
  if (str.length > maxLength) {
    return str.substring(0, maxLength) + '...'
  }
  return str
}

export function extractBase64Decoded(content: string) {
  const base64Regex =
    /(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})/g

  const output: Record<string, string> = {}

  const matched = content
    .match(base64Regex)
    ?.map((item) => item.trim())
    .filter((item) => !!item)
  if (!matched) {
    return null
  }

  matched.forEach((item) => {
    if (output[item]) {
      return
    }
    const decoded = decode(item).trim()
    if (/[\x00-\x1F\x7F\x80-\x9F]/.test(decoded) || /�/.test(decoded)) {
      return
    }
    if (
      (item.length === 4 || item.length === 8) &&
      !/^[\w-_]+$/.test(decoded)
    ) {
      return
    }
    output[item] = decoded
  })

  return Object.entries(output)
}

const isIntersected = (arr1: string[], set2: Set<string>): boolean => {
  return arr1.some((item) => set2.has(item))
}

export const getRelatedReplies = (
  pivot: TopicReply,
  replyList: TopicReply[],
) => {
  const list = [pivot]
  const beforePivotReplies = replyList.slice(0, pivot.num - 1)
  const afterPivotReplies = replyList.slice(pivot.num)

  const conversationUsers = new Set(pivot.members_mentioned)
  conversationUsers.add(pivot.member.username)

  /**
   * Pivot 之前的回复
   * 沿路查查中 被 mention 相关的回复，如果被 mention 的回复为 `root` 回复，则继续查找 回复作者的其他 `root` 回复
   */
  const beforeMetionInWay = new Set(pivot.members_mentioned)
  const rootReplyUsers = new Set()
  const repliedToNums = new Set(pivot.replied_to)
  if (!pivot.members_mentioned.length) {
    rootReplyUsers.add(pivot.member.username)
  }

  beforePivotReplies.reverse().forEach((r) => {
    if (repliedToNums.size) {
      if (r.num > Math.max(...repliedToNums)) {
        return
      } else if (repliedToNums.has(r.num)) {
        repliedToNums.delete(r.num)
        if (r.replied_to) {
          r.replied_to.forEach((num) => {
            repliedToNums.add(num)
          })
        } else if (r.members_mentioned.length) {
          r.members_mentioned.forEach((username) => {
            beforeMetionInWay.add(username)
            conversationUsers.add(username)
          })
        } else {
          rootReplyUsers.add(r.member.username)
        }
        list.unshift(r)
        return
      }
    }
    // 根评论用户发表的其他根评论
    if (rootReplyUsers.has(r.member.username) && !r.members_mentioned.length) {
      list.unshift(r)
      return
    }

    if (beforeMetionInWay.has(r.member.username)) {
      beforeMetionInWay.delete(r.member.username)
      if (r.members_mentioned.length) {
        r.members_mentioned.forEach((username) => {
          beforeMetionInWay.add(username)
          conversationUsers.add(username)
        })
      } else {
        rootReplyUsers.add(r.member.username)
      }
      list.unshift(r)
      return
    }
  })

  // Pivot 之后的回复
  // 1. pivot 有 members_mentioned 用户， 则只包含 pivot member 与 members_mentioned 之间回复
  // 2. pivot 没有 members_mentioned 用户，则包含后续 向 pivot member 进行的回复
  const afterMentionInWay = new Set(pivot.members_mentioned)
  const pivotIsRootReply = !pivot.members_mentioned.length
  afterPivotReplies.forEach((r) => {
    // pivot 是根评论， r 也是来自同一用户的根评论
    if (
      pivotIsRootReply &&
      !r.members_mentioned.length &&
      r.member.username === pivot.member.username
    ) {
      list.push(r)
      return
    }

    // pivot 是根评论，其他用户回复这个 pivot 用户
    if (
      pivotIsRootReply &&
      r.members_mentioned.includes(pivot.member.username)
    ) {
      afterMentionInWay.add(r.member.username)
      list.push(r)
      return
    }

    if (
      // pivot member replied to others
      (r.member.username === pivot.member.username &&
        isIntersected(r.members_mentioned, afterMentionInWay)) ||
      // others replied to pivot member
      (afterMentionInWay.has(r.member.username) &&
        r.members_mentioned.includes(pivot.member.username))
    ) {
      list.push(r)
    }
  })

  return list
}
