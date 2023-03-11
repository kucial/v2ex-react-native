import axios, { AxiosRequestConfig } from 'axios'
import { load } from 'cheerio'
import { stringify } from 'qs'
import * as Sentry from 'sentry-expo'

import {
  CollectedTopicFeed,
  HomeTabOption,
  HomeTopicFeed,
  MemberDetail,
  MemberTopicFeed,
  NodeDetail,
  NodeExtra,
  NodeGroup,
  NodeTopicFeed,
  Notification,
  RepliedTopicFeed,
  TopicDetail,
  TopicReply,
} from '@/utils/v2ex-client/types'

import ApiError from './ApiError'
import { BASE_URL, ONCP, REQUEST_TIMEOUT, USER_AGENT } from './constants'
import {
  memberFromImage,
  nodeDetailFromPage,
  nodeFromLink,
  paginationFromText,
  topicDetailFromPage,
  topicFromLink,
  topicReplyFromCell,
  userMetaForCurrentUser,
} from './helpers'
import service from './service'
import {
  CollectionResponse,
  EntityResponse,
  PaginatedResponse,
  ReplyId,
  StatusResponse,
  TopicId,
} from './types'

type EVENT = 'unread_count' | 'current_user'
type UnreadCountValue = number
type EventValue = UnreadCountValue
type Callback = (data?: EventValue) => void
const listeners: Record<EVENT, Set<Callback>> = {
  unread_count: new Set(),
  current_user: new Set(),
}
export const subscribe = (event: EVENT, callback: Callback) => {
  listeners[event].add(callback)
  return () => {
    listeners[event].delete(callback)
  }
}
const dispatch = (event: EVENT, value?: EventValue) => {
  for (const l of listeners[event]) {
    l(value)
  }
}

const instance = axios.create({
  baseURL: BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'user-agent': USER_AGENT,
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    Expires: '0',
  },
  adapter: service.fetch,
})

// const OFFICIAL_ENDPOINTS = {
//   '/api/site/stats.json': {},
//   '/api/site/info.json': {},
//   '/api/nodes/all.json': {},
//   '/api/nodes/show.json': {},
//   '/api/topics/hot.json': {},
//   '/api/topics/latest.json': {},
//   '/api/topics/show.json': {
//     mapData: (data) => data[0],
//   },
//   '/api/replies/show.json': {},
//   '/api/members/show.json': {},
// }

instance.interceptors.response.use(
  function (res) {
    // console.log('-------------V2EX CLIENT RES--------------')
    // console.log(res.config)
    // console.log(res.data);
    // console.log('-------------V2EX CLIENT END--------------')
    // side-effect
    if (res.config?.url && /^\/(\?tab=\w+)?$/.test(res.config.url)) {
      const $ = load(res.data)
      const text = $('input.special.super.button').attr('value')
      let unread_count = 0
      if (text) {
        const match = /\d+/.exec(text)
        if (match) {
          unread_count = Number(match[0])
        }
      }
      dispatch('unread_count', unread_count)
    }

    return res
  },
  function (error) {
    Sentry.Native.captureEvent(error)
    return Promise.reject(error)
  },
)

const ajaxHeaders = {
  'X-Requested-With': 'XMLHttpRequest',
  Accept: 'application/json',
}

export const request = instance.request

export const manager = service

export async function fetchOnce(
  refresh?: boolean,
): Promise<StatusResponse<string>> {
  const { data } = await request({
    url: '/_custom_/once',
    params: { refresh },
  })
  return {
    success: true,
    message: 'Once code',
    data: `${data}`,
  }
}

// TODO: inject side effects
export async function getHomeTabs(): Promise<
  CollectionResponse<HomeTabOption>
> {
  const { data: html } = await request({
    url: '/',
  })
  const $ = load(html)
  const tabs = $('#Wrapper .content a[class^=tab]')
    .map(function (i, el) {
      return {
        label: $(el).text().trim(),
        value: ($(el).attr('href') as string).replace('/?tab=', ''),
        type: 'home',
      } as HomeTabOption
    })
    .get()

  return {
    data: tabs,
    fetchedAt: Date.now(),
  }
}

export async function getHomeFeeds({
  tab,
}: {
  tab: string
}): Promise<PaginatedResponse<HomeTopicFeed>> {
  const { data: html } = await request({
    url: '/',
    params: {
      tab,
    },
  })
  const $ = load(html)
  const data = $('#Wrapper .content .cell.item')
    .map(function (i, el) {
      const member = memberFromImage($(el).find('td:nth-child(1) img').first())
      const node = nodeFromLink($(el).find('td:nth-child(3) a.node').first())
      const topic = topicFromLink($(el).find('.item_title a').first())
      const last_reply_by = $(el)
        .find('td:nth-child(3) span:last-child a')
        .text()
      const last_reply_time = $(el)
        .find('td:nth-child(3) span:last-child')
        .text()
        ?.split('•')[0]
        .trim()
      return {
        ...topic,
        last_reply_by,
        last_reply_time,
        member,
        node,
      }
    })
    .get()
  return {
    data,
    pagination: {
      current: 1,
      total: 1,
    },
    fetchedAt: Date.now(),
  }
}

export async function getRecentFeeds({
  p = 1,
}: {
  p?: number
}): Promise<PaginatedResponse<HomeTopicFeed>> {
  const { data: html } = await request({
    url: '/recent',
    params: {
      p,
      d: Date.now(),
    },
  })
  const $ = load(html)
  const data = $('#Wrapper .content .cell.item')
    .map(function (i, el) {
      const member = memberFromImage($(el).find('td:nth-child(1) img').first())
      const node = nodeFromLink($(el).find('td:nth-child(3) a.node').first())
      const topic = topicFromLink($(el).find('.item_title a').first())
      const last_reply_by = $(el)
        .find('td:nth-child(3) span:last-child a')
        .text()
      const last_reply_time = $(el)
        .find('td:nth-child(3) span:last-child')
        .text()
        ?.split('•')[0]
        .trim()
      return {
        ...topic,
        last_reply_by,
        last_reply_time,
        member,
        node,
      }
    })
    .get()
  const paginationText = $(
    '#Wrapper .content .inner:last-child [align=center]',
  ).text()
  const pagination = paginationFromText(paginationText)
  return {
    data,
    pagination,
    fetchedAt: Date.now(),
  }
}

export async function getTopicDetail({
  id,
  api,
}: {
  id: TopicId
  api?: boolean
}): Promise<EntityResponse<TopicDetail>> {
  if (api) {
    const { data } = await request({
      url: '/api/topics/show.json',
      params: { id },
      adapter: null,
    })
    return {
      data: data[0],
    }
  }

  const { data: html } = await request({
    url: `/t/${id}`,
  })
  const $ = load(html)
  // if isHomePage
  if ($('#Wrapper .content a[class^=tab]').length) {
    throw new ApiError({
      code: 'RESOURCE_ERROR',
      message: '资源错误（无权限访问或已被管理员删除）',
    })
  }

  return {
    data: topicDetailFromPage($, id),
  }
}
export async function collectTopic({
  id,
  once = ONCP,
}: {
  id: TopicId
  once?: string
}): Promise<StatusResponse<TopicDetail>> {
  await request({
    url: `/favorite/topic/${id}`,
    params: {
      once,
    },
    headers: {
      referer: `${BASE_URL}/t/${id}`,
    },
  })

  const { data: html } = await request({ url: `/t/${id}` })
  const $ = load(html)

  const topic = topicDetailFromPage($, id)
  return {
    success: topic.collected,
    message: topic.collected ? '收藏成功' : '操作失败',
    data: topic,
  }
}
export async function uncollectTopic({
  id,
  once = ONCP,
}: {
  id: TopicId
  once?: string
}): Promise<StatusResponse<TopicDetail>> {
  await request({
    url: `/unfavorite/topic/${id}`,
    params: {
      once,
    },
  })

  const { data: html } = await request({
    url: `/t/${id}`,
  })

  const $ = load(html)

  const topic = topicDetailFromPage($, id)
  return {
    success: !topic.collected,
    message: !topic.collected ? '取消收藏成功' : '操作失败',
    data: topic,
  }
}
export async function thankTopic({
  id,
  once = ONCP,
}: {
  id: TopicId
  once?: string
}): Promise<StatusResponse<TopicDetail>> {
  const { data: json } = await request({
    url: `/thank/topic/${id}`,
    params: {
      once,
    },
    method: 'POST',
    headers: ajaxHeaders,
  })

  const { data: html } = await request({
    url: `/t/${id}`,
  })

  const $ = load(html)

  return {
    success: json.success,
    message: json.success ? '感谢已发送' : json.message,
    data: topicDetailFromPage($, id),
  }
}
// TODO: rename to ignore
export async function blockTopic({
  id,
  once = ONCP,
}: {
  id: TopicId
  once?: string
}): Promise<StatusResponse<Pick<TopicDetail, 'blocked'>>> {
  const { data: html } = await request({
    url: `/ignore/topic/${id}`,
    params: {
      once,
    },
  })
  const $ = load(html)
  const message = $('#Wrapper .box .message').first()?.text()
  const success = message === `已完成对 ${id} 号主题的忽略`
  return {
    success,
    message: message || '操作失败',
    data: {
      blocked: success,
    },
  }
}
export async function unblockTopic({
  id,
  once = ONCP,
}: {
  id: TopicId
  once?: string
}): Promise<StatusResponse<Pick<TopicDetail, 'blocked'>>> {
  const { data: html } = await request({
    url: `/unignore/topic/${id}`,
    params: {
      once,
    },
  })
  const $ = load(html)
  const message = $('#Wrapper .box .message').first()?.text()
  const success = message === `已撤销对 ${id} 号主题的忽略`
  return {
    success,
    message: message || '操作失败',
    data: {
      blocked: !success,
    },
  }
}

export async function reportTopic({
  id,
  once = ONCP,
}: {
  id: TopicId
  once?: string
}): Promise<StatusResponse<Pick<TopicDetail, 'reported'>>> {
  const { data: html } = await request({
    url: `/report/topic/${id}`,
    params: { once },
  })
  const $ = load(html)
  const reported = $('span.fade')
    .get()
    .some(function (el) {
      return $(el).text() === '你已对本主题进行了报告'
    })

  return {
    success: reported,
    message: reported ? `你已对 ${id} 号主题进行了报告` : '操作失败',
    data: {
      reported,
    },
  }
}

export async function appendTopic({
  id,
  once = ONCP,
  content,
}: {
  id: number
  once?: string
  content: string
}): Promise<StatusResponse<TopicDetail>> {
  let postOnce = once
  if (postOnce === ONCP) {
    const onceRes = await fetchOnce()
    postOnce = onceRes.data
  }
  const { data: html } = await request({
    url: `/append/topic/${id}`,
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    data: stringify({ content, once: postOnce }),
  })
  const $ = load(html)
  return {
    success: true,
    message: '附言成功',
    data: topicDetailFromPage($, id),
  }
}

export type TopicRepliesResponse = PaginatedResponse<
  TopicReply,
  { topic: TopicDetail }
>
export async function getTopicReplies({
  id,
  p = 1,
}: {
  id: number
  p?: number
}): Promise<TopicRepliesResponse> {
  const { data: html } = await request({
    url: `/t/${id}`,
    params: {
      p,
    },
  })
  const $ = load(html)

  // if isHomePage
  if ($('#Wrapper .content a[class^=tab]').length) {
    throw new ApiError({
      code: 'RESOURCE_ERROR',
      message: '资源错误（无访问权限或已被管理员删除）',
    })
  }

  const data = $('#Wrapper .content .box div[id^=r_]')
    .map(function (i, el) {
      return topicReplyFromCell($(el), $)
    })
    .get()

  const pagination = { current: 1, total: 1 }
  const $total = $('.page_current').parent().children().get(1)

  if ($total) {
    const totalText = $($total).text()
    if (totalText && /共 \d+ 页/.test(totalText)) {
      pagination.total = Number(totalText.replace(/共 (\d+) 页/, '$1'))
    }
  }

  return {
    data,
    pagination,
    meta: {
      topic: topicDetailFromPage($, id),
    },
    fetchedAt: Date.now(),
  }
}

type PostReplyPayload = {
  id: string | number
  once?: string
  content: string
}
export async function postReply({
  id,
  content,
  once = ONCP,
}: PostReplyPayload): Promise<StatusResponse<TopicReply>> {
  let postOnce = once
  if (postOnce === ONCP) {
    const onceRes = await fetchOnce()
    postOnce = onceRes.data
  }

  const { data: html } = await request({
    url: `/t/${id}`,
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    data: stringify({ content, once: postOnce }),
  })
  const $ = load(html)

  const problem = $('.problem ul li').text()
  if (problem) {
    throw new ApiError({
      code: 'VALIDATION_EXCEPTION',
      message: problem,
    })
  }

  const topic = topicReplyFromCell(
    $('#Wrapper .content .box div[id^=r_]').last(),
    $,
  )
  return {
    success: true,
    message: '回复成功',
    data: topic,
  }
}

export async function thankReply({
  id,
  once = ONCP,
}: {
  id: ReplyId
  once?: string
}): Promise<StatusResponse<Pick<TopicReply, 'thanked'>>> {
  const { data: json } = await request({
    url: `/thank/reply/${id}`,
    method: 'POST',
    params: {
      once,
    },
    headers: ajaxHeaders,
  })

  return {
    success: json.success,
    message: json.success ? '感谢已发送' : json.message,
    data: {
      thanked: true, // TODO: BUG: success....
    },
  }
}

// Nodes
export async function getNodeGroups(): Promise<CollectionResponse<NodeGroup>> {
  const { data: html } = await request({
    url: `/planes`,
  })
  const $ = load(html)
  const groups = $('#Wrapper .content > .box')
    .map(function (i, el) {
      const name = $(el).find('.header .fr').text()?.replace(' • ', '')
      if (!name) {
        return null
      }
      const title = $(el).find('.header').children().first().text()

      const nodes = $(el)
        .find('.inner a.item_node')
        .map(function (j, n) {
          return nodeFromLink($(n))
        })
        .get()
      return {
        title,
        name,
        nodes,
      }
    })
    .get()
    .filter(Boolean)
  return {
    data: groups,
    fetchedAt: Date.now(),
  }
}

export async function getNodes(): Promise<CollectionResponse<NodeDetail[]>> {
  const { data: json } = await request({
    url: '/api/nodes/all.json',
  })
  return {
    data: json,
  }
}

export async function getNodeDetail({
  name,
}: {
  name: string
}): Promise<EntityResponse<NodeDetail>> {
  const { data: html } = await request({
    url: `/go/${name}`,
  })

  const $ = load(html)

  return {
    data: nodeDetailFromPage($, name),
    fetchedAt: Date.now(),
  }
}

export async function collectNode({
  name,
  once = ONCP,
}: {
  name: string
  once?: string
}): Promise<StatusResponse<Pick<NodeDetail, 'collected'>>> {
  const { data: detail } = await request({
    url: `/api/nodes/show.json`,
    params: { name },
  })
  const { data: html } = await request({
    url: `/favorite/node/${detail.id}`,
    params: { once },
  })
  const $ = load(html)
  const collected = !!$('a[href^="/unfavorite/node"]').length
  return {
    success: collected,
    message: collected ? '操作成功' : '操作失败',
    data: {
      collected,
    },
  }
}
export async function uncollectNode({
  name,
  once = ONCP,
}: {
  name: string
  once?: string
}): Promise<StatusResponse<Pick<NodeDetail, 'collected'>>> {
  const { data: detail } = await request({
    url: `/api/nodes/show.json`,
    params: { name },
  })
  const { data: html } = await request({
    url: `/unfavorite/node/${detail.id}`,
    params: { once },
  })
  const $ = load(html)
  const collected = !!$('a[href^="/unfavorite/node"]').length
  return {
    success: !collected,
    message: !collected ? '操作成功' : '操作失败',
    data: {
      collected,
    },
  }
}
export async function getNodeFeeds({
  name,
  p,
}: {
  name: string
  p: number
}): Promise<
  PaginatedResponse<
    NodeTopicFeed,
    {
      node: NodeDetail
    }
  >
> {
  const { data: html } = await request({
    url: `/go/${name}`,
    params: { p },
  })

  const $ = load(html)

  const data = $('#Wrapper .content > .box:nth-child(2) .cell')
    .map(function (i, el) {
      if (!$(el).find('table').length) {
        return null
      }
      const topic = topicFromLink($(el).find('.topic-link').first())
      const member = memberFromImage($(el).find('img.avatar').first())
      const metaText = $(el).find('td:nth-child(3) .small').text()
      const characterMatch = /(\d+)/.exec(metaText.split('•')[1] || '')
      const clickMatch = /(\d+)/.exec(metaText.split('•')[2] || '')
      const last_reply_by = $(el).find('td:nth-child(3) .small strong').text()
      return {
        ...topic,
        last_reply_by,
        characters: characterMatch ? Number(characterMatch[1]) : undefined,
        clicks: clickMatch ? Number(clickMatch[1]) : undefined,
        member,
      }
    })
    .get()
    .filter(Boolean)

  const paginationText = $(
    '#Wrapper .content .inner:last-child [align=center]',
  ).text()
  const pagination = paginationFromText(paginationText)

  return {
    data,
    pagination,
    meta: {
      node: nodeDetailFromPage($, name),
    },
    fetchedAt: Date.now(),
  }
}

// 用户
export async function getMemberDetail({
  username,
}: {
  username: string
}): Promise<EntityResponse<MemberDetail>> {
  const { data: user } = await request({
    url: '/api/members/show.json',
    params: { username },
  })

  const { data: html } = await request({
    url: `/member/${username}`,
  })
  const $ = load(html)
  user.meta = userMetaForCurrentUser($)
  return {
    data: user,
  }
}

async function getMemberId(username: string) {
  const { data: user } = await request({
    url: '/api/members/show.json',
    params: { username },
  })
  return user.id
}

export async function watchMember({
  id,
  username,
  once = ONCP,
}: {
  id?: number
  username?: string
  once?: string
}): Promise<StatusResponse<Pick<MemberDetail, 'meta'>>> {
  let userId = id
  if (!userId) {
    userId = await getMemberId(username)
  }
  const { data: html } = await request({
    url: `/follow/${userId}`,
    params: {
      once,
    },
  })
  const $ = load(html)
  const meta = userMetaForCurrentUser($)
  return {
    success: meta.watched,
    message: meta.watched ? '操作成功' : '操作失败',
    data: {
      meta,
    },
  }
}
export async function unwatchMember({
  id,
  username,
  once = ONCP,
}: {
  id?: number
  username?: string
  once?: string
}): Promise<StatusResponse<Pick<MemberDetail, 'meta'>>> {
  let userId = id
  if (!userId) {
    userId = await getMemberId(username)
  }
  const { data: html } = await request({
    url: `/unfollow/${userId}`,
    params: {
      once,
    },
  })
  const $ = load(html)
  const meta = userMetaForCurrentUser($)
  return {
    success: !meta.watched,
    message: !meta.watched ? '操作成功' : '操作失败',
    data: {
      meta,
    },
  }
}
export async function blockMember({
  id,
  username,
  once = ONCP,
}: {
  id?: number
  username?: string
  once?: string
}): Promise<StatusResponse<Pick<MemberDetail, 'meta'>>> {
  let userId = id
  if (!userId) {
    userId = await getMemberId(username)
  }
  const { data: html } = await request({
    url: `/block/${userId}`,
    params: {
      once,
    },
  })
  const $ = load(html)
  const meta = userMetaForCurrentUser($)
  return {
    success: meta.blocked,
    message: meta.blocked ? '操作成功' : '操作失败',
    data: {
      meta,
    },
  }
}
export async function unblockMember({
  id,
  username,
  once = ONCP,
}: {
  id?: number
  username?: string
  once?: string
}): Promise<StatusResponse<Pick<MemberDetail, 'meta'>>> {
  let userId = id
  if (!userId) {
    userId = await getMemberId(username)
  }
  const { data: html } = await request({
    url: `/unblock/${userId}`,
    params: {
      once,
    },
  })
  const $ = load(html)
  const meta = userMetaForCurrentUser($)
  return {
    success: !meta.blocked,
    message: !meta.blocked ? '操作成功' : '操作失败',
    data: {
      meta,
    },
  }
}

export async function getMemberTopics({
  username,
  p = 1,
}: {
  username: string
  p: number
}): Promise<PaginatedResponse<MemberTopicFeed>> {
  const { data: html } = await request({
    url: `/member/${username}/topics`,
    params: { p },
  })

  const $ = load(html)
  if (
    $('#Wrapper .content .box .cell').length == 1 &&
    $('#Wrapper .content .box .cell img').attr('src')?.indexOf('lock') > -1
  ) {
    throw new ApiError({
      code: 'member_locked',
      message: $('#Wrapper .content .box .cell').first().text().trim(),
    })
  }

  const data = $('#Wrapper .content .box .cell')
    .map(function (i, el) {
      if (!$(el).find('table').length) {
        return null
      }
      const member = {
        username: $(el)
          .find('td:nth-child(1) strong a')
          .first()
          .attr('href')
          .replace('/member/', ''),
        avatar_normal: undefined,
      }
      const node = nodeFromLink($(el).find('td:nth-child(1) .node'))
      const topic = topicFromLink($(el).find('.topic-link'))
      const last_reply_time = $(el)
        .find('td:nth-child(1) span:last-child')
        .text()
        .split('•')[0]
        .trim()
      const last_reply_by = $(el)
        .find('td:nth-child(1) span:last-child a')
        .text()

      return {
        ...topic,
        last_reply_by,
        last_reply_time,
        node,
        member,
      }
    })
    .get()
    .filter(Boolean)

  const paginationText = $(
    '#Wrapper .content .inner:last-child [align=center]',
  ).text()
  const pagination = paginationFromText(paginationText)

  return {
    data,
    pagination,
  }
}

export async function getMemberReplies({
  username,
  p = 1,
}: {
  username: string
  p: number
}): Promise<PaginatedResponse<RepliedTopicFeed>> {
  const { data: html } = await request({
    url: `/member/${username}/replies`,
    params: { p },
  })

  const $ = load(html)

  const data = $('#Wrapper .content .box .dock_area')
    .map(function (i, el) {
      const topic = topicFromLink($(el).find('table td span.gray a'))
      const headerText = $(el).find('table td span.gray').text().trim()
      const topic_member = headerText.replace(/回复了\s+(.*?)\s+.*/, '$1')
      const reply_time = $(el).find('table td span.fade').text()
      const content_rendered = $(el).next().html()
      return {
        ...topic,
        member: {
          username: topic_member,
          avatar_normal: undefined,
        },
        reply_time,
        reply_content_rendered: content_rendered,
      }
    })
    .get()

  const paginationText = $(
    '#Wrapper .content .inner:last-child [align=center]',
  ).text()
  const pagination = paginationFromText(paginationText)

  return {
    data,
    pagination,
    fetchedAt: Date.now(),
  }
}

export async function getMyNotifications({
  p = 1,
}: {
  p?: number
}): Promise<PaginatedResponse<Notification>> {
  const { data: html } = await request({
    url: '/notifications',
    params: {
      p,
    },
  })

  const $ = load(html)
  const notifications = $('#notifications .cell')
    .map(function (i, el) {
      const $memberImage = $(el).find('img.avatar').first()
      if (!$memberImage) {
        return null
      }
      const member = memberFromImage($memberImage)
      const $topicLink = $(el).find('a[href^="/t/"]').first()
      const topic = topicFromLink($topicLink)
      const text = $(el).find('[valign=middle] .fade').text()
      let action: Notification['action'] = 'reply'
      if (/收藏了你发布的主题/.test(text)) {
        action = 'collect'
      } else if (/感谢了你发布的主题/.test(text)) {
        action = 'thank'
      } else if (/感谢了你在主题/.test(text)) {
        action = 'thank_reply'
      }
      return {
        id: $(el).attr('id'),
        member,
        topic,
        action,
        content_rendered: $(el).find('.payload').html()?.trim(),
        time: $(el).find('.snow').text(),
      }
    })
    .get()
    .filter(Boolean)

  const paginationText = $(
    '#Wrapper .content .inner:last-child [align=center]',
  ).text()
  const pagination = paginationFromText(paginationText)

  return {
    data: notifications,
    pagination,
    fetchedAt: Date.now(),
  }
}

export async function getMyCollectedTopics({
  p,
}: {
  p?: number
}): Promise<PaginatedResponse<CollectedTopicFeed>> {
  const { data: html } = await request({
    url: '/my/topics',
    params: { p },
  })

  const $ = load(html)
  const data = $('#Wrapper .box .cell.item')
    .map(function (i, el) {
      const member = memberFromImage($(el).find('td:nth-child(1) img'))
      if (!member.username) {
        member.username = $(el)
          .find('td:nth-child(1) a')
          .attr('href')
          .replace('/member/', '')
      }
      const topic = topicFromLink($(el).find('.item_title a'))
      const node = nodeFromLink($(el).find('td:nth-child(3) a.node'))
      const last_reply_time = $(el)
        .find('.topic_info span[title]')
        .text()
        .trim()
      const last_reply_by = $(el)
        .find('.topic_info strong:last-child a')
        .text()
        .trim()
      const votes = Number($(el).find('.votes').text().trim()) || 0
      return {
        ...topic,
        last_reply_time,
        last_reply_by,
        votes,
        member,
        node,
      }
    })
    .get()

  const total = Number($('.page_input').attr('max')) || 1
  const current = Number($('a.page_current').text()) || 1
  return {
    data,
    pagination: {
      total,
      current,
    },
  }
}
export async function getMyCollectedNodes(): Promise<
  CollectionResponse<NodeExtra>
> {
  const { data: html } = await request({
    url: '/my/nodes',
  })

  const $ = load(html)
  const data = $('#my-nodes .fav-node')
    .map(function (i, el) {
      const name = $(el).find('img').attr('alt')
      const avatar_large = $(el).find('img').attr('src')
      const title = $(el).find('.fav-node-name').text()
      const topics = Number($(el).find('.fade').text()) || 0
      return {
        name,
        title,
        avatar_large,
        topics,
      }
    })
    .get()
  return {
    data,
  }
}
export async function getCurrentUser(): Promise<
  EntityResponse<MemberDetail, { unread_count: number }>
> {
  const { data: html } = await request({
    url: '/',
  })
  const $ = load(html)
  const username = $('#menu-entry img.avatar').attr('alt')
  if (!username) {
    return {
      data: null,
      meta: null,
    }
  }
  const { data: user } = await request({
    url: '/api/members/show.json',
    params: { username },
  })

  const text = $('input.special.super.button').attr('value')
  let unread_count = 0
  if (text) {
    const match = /\d+/.exec(text)
    if (match) {
      unread_count = Number(match[0])
    }
  }

  return {
    data: user,
    meta: {
      unread_count,
    },
  }
}
export async function getNotificationCount(): Promise<StatusResponse<number>> {
  const { data: html } = await request({
    url: '/',
  })
  const $ = load(html)
  const text = $('input.special.super.button').first().val()
  console.log('getNotificationCount=====', text)
  const match = text && /\d+/.exec(text as string)
  return {
    success: true,
    message: '未读消息数',
    data: match ? Number(match[0]) : 0,
  }
}

export async function dailySignin(
  data: { once?: string } = { once: ONCP },
): Promise<StatusResponse> {
  const { data: html } = await request({
    url: `/mission/daily/redeem`,
    params: {
      once: data.once,
    },
  })
  const $ = load(html)

  const btnText = $('input.super.normal.button').attr('value')
  const error = !!$('.message').length
  const signed = btnText === '查看我的账户余额'

  if (signed && error) {
    throw new ApiError({
      code: 'DAILY_SIGNED',
      message: '今日登录奖励已领取',
    })
  }

  if (error) {
    throw new ApiError({
      code: 'PAGE_ERROR',
      message: $('.message').text(),
    })
  }

  return {
    success: true,
    message: '签到成功',
  }
}

// TODO: MIX FETCHER-WEBVIEW AND V2EX-CLIENT-WEBVIEW
export function login(): Promise<StatusResponse> {}

export async function logout({
  once = ONCP,
}: {
  once?: string
}): Promise<StatusResponse> {
  const { data: html } = await request({
    url: `/signout`,
    params: {
      once,
    },
  })
  const $ = load(html)
  const success = !$('a[href^="/signout"]').length

  // 重置 webview
  service.reload()

  return {
    success,
    message: '你已经完全登出',
  }
}

export async function fetch<T = any>(config: AxiosRequestConfig) {
  const { data } = await request<never, { data: T }>(config)
  return data
}
