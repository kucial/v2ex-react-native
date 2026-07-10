import { areFeedRowPropsEqual, areTopicRowPropsEqual } from '../memo'

describe('areFeedRowPropsEqual / areTopicRowPropsEqual', () => {
  const baseItem = {
    id: 12345,
    title: 'Hello World Topic',
    replies: 10,
    last_reply_time: '1 小时前',
    last_reply_by: 'alice',
    member: {
      username: 'bob',
      avatar_normal: 'https://example.com/avatar.png',
    },
    node: {
      name: 'react',
      title: 'React',
    },
  }

  const baseProps: HomeFeedRowProps = {
    data: baseItem,
    showAvatar: true,
    showLastReplyMember: true,
    titleStyle: 'normal',
    isLast: false,
  }

  it('returns true when props and data object contents are identical even if object references differ', () => {
    const nextProps: HomeFeedRowProps = {
      ...baseProps,
      data: {
        ...baseItem,
        member: { ...baseItem.member },
        node: { ...baseItem.node },
      },
    }

    expect(areFeedRowPropsEqual(baseProps, nextProps)).toBe(true)
    expect(areTopicRowPropsEqual(baseProps, nextProps)).toBe(true)
  })

  it('returns false when a top-level row prop changes (e.g. showAvatar or isLast)', () => {
    expect(
      areFeedRowPropsEqual(baseProps, { ...baseProps, showAvatar: false }),
    ).toBe(false)
    expect(
      areFeedRowPropsEqual(baseProps, { ...baseProps, isLast: true }),
    ).toBe(false)
  })

  it('returns false when topic data fields change (e.g. replies count or last_reply_time)', () => {
    expect(
      areFeedRowPropsEqual(baseProps, {
        ...baseProps,
        data: { ...baseItem, replies: 11 },
      }),
    ).toBe(false)

    expect(
      areFeedRowPropsEqual(baseProps, {
        ...baseProps,
        data: { ...baseItem, last_reply_time: '刚刚' },
      }),
    ).toBe(false)
  })

  it('handles undefined data cleanly without throwing', () => {
    expect(
      areFeedRowPropsEqual(
        { ...baseProps, data: undefined },
        { ...baseProps, data: undefined },
      ),
    ).toBe(true)

    expect(
      areFeedRowPropsEqual(baseProps, { ...baseProps, data: undefined }),
    ).toBe(false)
  })
})
