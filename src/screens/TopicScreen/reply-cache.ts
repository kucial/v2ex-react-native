import { TopicReply } from '@/utils/v2ex-client/types'

export function mergeTopicReplies(
  fetchedReplies: TopicReply[],
  cachedReplies: TopicReply[],
) {
  const repliesById = new Map<number, TopicReply>()

  for (const reply of cachedReplies) {
    repliesById.set(reply.id, reply)
  }
  for (const reply of fetchedReplies) {
    repliesById.set(reply.id, reply)
  }

  return Array.from(repliesById.values()).sort((a, b) => a.num - b.num)
}

export function reconcileCachedReplies(
  cachedReplies: TopicReply[],
  fetchedReplies: TopicReply[],
) {
  const fetchedIds = new Set(fetchedReplies.map((reply) => reply.id))
  const seenCachedIds = new Set<number>()

  return cachedReplies.filter((reply) => {
    if (fetchedIds.has(reply.id) || seenCachedIds.has(reply.id)) {
      return false
    }
    seenCachedIds.add(reply.id)
    return true
  })
}

export function upsertCachedReply(
  cachedReplies: TopicReply[],
  reply: TopicReply,
) {
  return [...cachedReplies.filter((item) => item.id !== reply.id), reply]
}
