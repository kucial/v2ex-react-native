import { TopicReply } from '@/utils/v2ex-client/types'

import {
  mergeTopicReplies,
  reconcileCachedReplies,
  upsertCachedReply,
} from '../reply-cache'

const reply = (id: number, num: number, content = `reply-${id}`) =>
  ({ id, num, content }) as TopicReply

describe('topic reply cache reconciliation', () => {
  it('renders each reply once and prefers the fetched version', () => {
    const cached = [reply(10, 1, 'cached'), reply(20, 100)]
    const fetched = [reply(10, 1, 'fetched'), reply(30, 101)]

    expect(mergeTopicReplies(fetched, cached)).toEqual([
      reply(10, 1, 'fetched'),
      reply(20, 100),
      reply(30, 101),
    ])
  })

  it('removes cached replies by id regardless of page-boundary numbers', () => {
    const cached = [reply(1, 1), reply(100, 100), reply(101, 101)]
    const fetched = [reply(1, 1), reply(100, 100), reply(101, 101)]

    expect(reconcileCachedReplies(cached, fetched)).toEqual([])
  })

  it('keeps replies that have not reached the fetched pages yet', () => {
    const pending = reply(101, 101)

    expect(reconcileCachedReplies([pending], [reply(100, 100)])).toEqual([
      pending,
    ])
  })

  it('upserts repeated successful submissions by id', () => {
    expect(
      upsertCachedReply([reply(10, 1, 'old')], reply(10, 1, 'new')),
    ).toEqual([reply(10, 1, 'new')])
  })
})
