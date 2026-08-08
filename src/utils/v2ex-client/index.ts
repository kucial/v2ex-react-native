import { Platform } from 'react-native'
// @ts-expect-error React Native does not ship types for this internal module.
import Networking from 'react-native/Libraries/Network/RCTNetworking.js'
import CookieManager from 'react-native-nitro-cookies'
import * as Sentry from '@sentry/react-native'
import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  RawAxiosRequestHeaders,
} from 'axios'
import { CheerioAPI } from 'cheerio'
import { stringify } from 'qs'

import { isTransportNoise } from '@/lib/sentry'
import { formatTimeAgo } from '@/utils/time'
import {
  BalanceBrief,
  CollectedTopicFeed,
  CollectionResponse,
  EntityResponse,
  HomeTabOption,
  HomeTopicFeed,
  MemberDetail,
  MemberProfile,
  MemberTopicFeed,
  NodeDetail,
  NodeExtra,
  NodeGroup,
  NodeTopicFeed,
  Notification,
  PaginatedResponse,
  PlanetFeedItem,
  PlanetInfo,
  RepliedTopicFeed,
  ReplyId,
  SearchHit,
  StatusResponse,
  TFA_Error,
  TopicDetail,
  TopicId,
  TopicReply,
  XnaFeed,
} from '@/utils/v2ex-client/types'

import ApiError from './ApiError'
import {
  BASE_URL,
  ONCP,
  REQUEST_TIMEOUT,
  USER_AGENT_ANDROID,
  USER_AGENT_IOS,
} from './constants'
import {
  base64File,
  cheerioDoc,
  memberFromImage,
  nodeDetailFromPage,
  nodeFromLink,
  notificationFromCell,
  paginationFromText,
  resolveUrl,
  topicDetailFromPage,
  topicFromLink,
  topicReplyFromCell,
  userMetaForCurrentUser,
} from './helpers'

interface CustomAxiosResponse extends AxiosResponse {
  $?: CheerioAPI
}
type EVENT =
  | 'unread_count'
  | 'current_user'
  | '2fa_enabled'
  | 'balance_brief'
  | 'should_prepare_fetch'
  | 'warn_vpn_status'
type UnreadCountValue = number

type EventValue = UnreadCountValue | TFA_Error | BalanceBrief | string
type Callback = (data?: EventValue) => void

const USER_AGENT =
  Platform.select({
    ios: USER_AGENT_IOS,
    android: USER_AGENT_ANDROID,
  }) || USER_AGENT_IOS

const listeners: Record<EVENT, Set<Callback>> = {
  unread_count: new Set(),
  current_user: new Set(),
  '2fa_enabled': new Set(),
  balance_brief: new Set(),
  should_prepare_fetch: new Set(),
  warn_vpn_status: new Set(),
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

const captureParseError = (err: unknown, $: CheerioAPI): never => {
  Sentry.addBreadcrumb({
    type: 'info',
    data: {
      body: $('body').html(),
    },
  })
  Sentry.captureException(err)
  throw new ApiError({
    code: 'UNEXPECTED_RESPONSE',
    message: '意想不到的返回结果',
  })
}

const instance = axios.create({
  baseURL: BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'user-agent': USER_AGENT,
  },
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

let n_403 = 0
let cachedOnceToken: string | undefined

instance.interceptors.request.use(async (config) => {
  const headers = config.headers

  // handle oncp
  if (config.params?.once === ONCP || config.data?.once === ONCP) {
    let once
    if (cachedOnceToken) {
      once = cachedOnceToken
      cachedOnceToken = undefined
    } else {
      const tokenRes = await fetchOnce({
        Referer: `${BASE_URL}${config.url}`,
        origin: BASE_URL,
      })
      once = tokenRes.data
    }

    if (config.params?.once === ONCP) {
      config.params.once = once
    }
    if (config.data?.once === ONCP) {
      config.data.once = once
    }
  }

  // 处理 x-www-form-urlencoded  serialize
  if (
    headers['content-type'] === 'application/x-www-form-urlencoded' &&
    typeof config.data === 'object'
  ) {
    config.data = stringify(config.data)
  }

  // if (config.params?.once || config.data?.once) {
  //   config.adapter = service.fetch
  // }
  return config
})

instance.interceptors.response.use(
  function (res: CustomAxiosResponse) {
    const responseURL: string = res.request?.responseURL
    if (responseURL) {
      Sentry.addBreadcrumb({
        type: 'info',
        message: `Response URL: ${responseURL}`,
      })
    }

    const contentType = String(res.headers['content-type'] ?? '')
    if (contentType.includes('text/html') && !/poll_once$/.test(responseURL)) {
      const $ = cheerioDoc(typeof res.data === 'string' ? res.data : '')
      res.$ = $
      // once token
      const link = $('a[href^="/settings/night/toggle?once="]')
      const onceValue = link.attr('href')?.match(/once=(\d+)$/)?.[1]
      if (onceValue) {
        cachedOnceToken = onceValue
      }

      if (
        responseURL === BASE_URL + '/2fa' &&
        res.config.url !== '/2fa' &&
        res.config.url !== '/signin' &&
        res.config.url !== '/about?init=1'
      ) {
        const once = $('form[action="/2fa"] input[name=once]').attr('value')
        const error = new ApiError({
          code: '2FA_ENABLED',
          message: '你的 V2EX 账号已经开启了两步验证，请输入验证码继续',
          data: {
            once,
          },
        })
        dispatch('2fa_enabled', error as TFA_Error)
        throw error
      }
      if (
        responseURL &&
        /\/signin\??/.test(responseURL) &&
        !res.config.url?.startsWith('/signin')
      ) {
        const message = $('.message').text()
        const error = new ApiError({
          code: 'AUTH_REQUIRED',
          message: message || '需要登录后再继续',
        })
        throw error
      }
      // https://www.v2ex.com/restricted
      if (responseURL && /\/restricted\??/.test(responseURL)) {
        const error = new ApiError({
          code: 'RESTRICTED',
          message: '访问限制',
        })
        throw error
      }

      // hometab side-effect
      if (res.config?.url && /^\/(\?tab=\w+)?$/.test(res.config.url)) {
        // current_user
        const username = $('#menu-entry img.avatar').attr('alt')
        dispatch('current_user', username)

        // notification
        const text = $('input.special.super.button').attr('value')
        let unread_count = 0
        if (text) {
          const match = /\d+/.exec(text)
          if (match) {
            unread_count = Number(match[0])
          }
        }
        dispatch('unread_count', unread_count)

        let balanceText = $('.balance_area').html()
        if (balanceText) {
          const balanceBrief = {} as BalanceBrief
          const goldImg = $('.balance_area img[src*=gold]')
          if (goldImg) {
            balanceText = balanceText.replace(
              '<img src="/static/img/gold@2x.png" height="16" alt="G" border="0">',
              'gold',
            )
          }
          const silverImg = $('.balance_area img[src*=silver]')
          if (silverImg) {
            balanceText = balanceText.replace(
              '<img src="/static/img/silver@2x.png" height="16" alt="S" border="0">',
              'silver',
            )
          }
          const bronzeImg = $('.balance_area img[src*=bronze]')
          if (bronzeImg) {
            balanceText = balanceText.replace(
              '<img src="/static/img/bronze@2x.png" height="16" alt="B" border="0">',
              'bronze',
            )
          }
          const match =
            /(?:\s?(\d+)\sgold)?(?:\s?(\d+)\ssilver)?(?:\s(\d+)\sbronze)?/.exec(
              balanceText,
            )
          if (match) {
            balanceBrief.gold = Number(match[1])
            balanceBrief.silver = Number(match[2])
            balanceBrief.bronze = Number(match[3])
          }
          dispatch('balance_brief', balanceBrief)
        }
      }
    }

    return res
  },
  function (error) {
    if (error.response?.status === 403) {
      console.log('403 url: ', error.response?.config?.url, 'count', n_403)
      n_403 += 1
      if (n_403 === 3) {
        dispatch('should_prepare_fetch')
      }
      if (n_403 === 6) {
        dispatch('warn_vpn_status')
      }
    } else {
      n_403 = 0
    }
    if (
      error.response?.status === 404 &&
      error.response.headers['content-type']?.indexOf('html') !== -1
    ) {
      const $ = cheerioDoc(error.response.data)
      throw new ApiError({
        code: 'NOT_FOUND',
        message: $('.gray.bigger').text() || '资源未找到',
      })
    }
    // Timeouts / offline / cancelled requests are environmental, not bugs.
    if (!isTransportNoise(error)) {
      Sentry.captureEvent(error)
    }
    return Promise.reject(error)
  },
)

const ajaxHeaders = {
  'X-Requested-With': 'XMLHttpRequest',
  Accept: 'application/json',
}

export const request = async (
  config: AxiosRequestConfig,
): Promise<CustomAxiosResponse> => {
  try {
    const response = await instance.request<CustomAxiosResponse>(config)
    return response
  } catch (error) {
    throw error
  }
}

export async function fetchOnce(
  headers: RawAxiosRequestHeaders = {
    Referer: BASE_URL,
    origin: BASE_URL,
  },
): Promise<StatusResponse<string>> {
  const { data } = await request({
    url: '/poll_once',
    headers,
  })
  // reset cachedOnceToken
  cachedOnceToken = undefined
  return {
    success: true,
    message: 'Once code',
    data: `${data}`,
  }
}

export async function getHomeTabs(): Promise<
  CollectionResponse<HomeTabOption>
> {
  const res = await request({
    url: '/',
  })
  const $ = res.$ || cheerioDoc(res.data)
  const tabs = $('#Wrapper .content a[class^=tab]')
    .map(function (i, el) {
      const tab = ($(el).attr('href') as string).replace(/\/(?:\?tab\=)?/, '')
      return {
        label: $(el).text().trim(),
        value: tab,
        type: tab === 'xna' ? 'xna' : 'home',
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
  const res = await request({
    url: '/',
    params: {
      tab,
    },
  })
  const $ = res.$ ?? cheerioDoc(res.data)
  const data = $('#Wrapper .content .cell.item')
    .map(function (i, el) {
      const $el = $(el)
      const $td3 = $el.find('td:nth-child(3)')
      const member = memberFromImage($el.find('td:nth-child(1) img').first())
      const node = nodeFromLink($td3.find('a.node').first())
      const topic = topicFromLink($el.find('.item_title a').first())
      const $lastChildSpan = $td3.find('span:last-child')
      const last_reply_by = $lastChildSpan.find('a').text()
      const last_reply_time = $lastChildSpan.text()?.split('•')[0].trim()
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
  const res = await request({
    url: '/recent',
    params: {
      p,
      d: Date.now(),
    },
  })
  const $ = res.$ || cheerioDoc(res.data)
  const data = $('#Wrapper .content .cell.item')
    .map(function (i, el) {
      const $el = $(el)
      const $td3 = $el.find('td:nth-child(3)')
      const member = memberFromImage($el.find('td:nth-child(1) img').first())
      const node = nodeFromLink($td3.find('a.node').first())
      const topic = topicFromLink($el.find('.item_title a').first())
      const $lastChildSpan = $td3.find('span:last-child')
      const last_reply_by = $lastChildSpan.find('a').text()
      const last_reply_time = $lastChildSpan.text()?.split('•')[0].trim()
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

export async function getXnaFeeds({
  p = 1,
}: {
  p?: number
}): Promise<PaginatedResponse<XnaFeed>> {
  const res = await request({
    url: '/xna',
    params: {
      p,
      d: Date.now(),
    },
  })
  const $ = res.$ || cheerioDoc(res.data)
  const data = $('#Wrapper .content .cell.item')
    .map(function (i, el) {
      const $el = $(el)
      const $itemTitle = $el.find('.item_title')
      const $node = $el.find('.node')
      let url = $itemTitle.find('a').attr('href')
      const title = $itemTitle.text()
      const member = memberFromImage($el.find('td:nth-child(1) img').first())
      const updated_at = $el
        .find('td:nth-child(3) span:last-child')
        .text()
        ?.split('•')[0]
        .trim()
      const source_link = $node.attr('href')
      if (url && !/^https?:\/\//.test(url) && source_link) {
        const sourceUrl = new URL(source_link)
        sourceUrl.pathname = url
        url = sourceUrl.toString()
      }
      return {
        title,
        member,
        source: {
          name: $node.text(),
          link: source_link,
        },
        url,
        updated_at,
      }
    })
    .get()
  const total = Number(
    $('#Wrapper .content .ps_container .page_normal').last().text(),
  )
  const current = Number(
    $('#Wrapper .content .ps_container .page_current').text(),
  )

  return {
    data,
    pagination: {
      total: Math.max(total, current),
      current,
    },
    fetchedAt: Date.now(),
  }
}

export async function getPlanetFeeds({
  p = 1,
}: {
  p: number
}): Promise<PaginatedResponse<PlanetFeedItem>> {
  const res = await request({
    url: '/planet',
    params: {
      p,
    },
  })
  const $ = res.$ || cheerioDoc(res.data)

  const data = $('#Wrapper .content .planet-post')
    .map(function (i, el) {
      const $img = $(el).find('.planet-post-avatar-container img')
      let avatar = $img.attr('src')
      // TODO: avatar from style. example value: `background-image: url('https://bafybeifipumqnug66mpxbjeko3234nyza7q3lisppjapdtirqp3uqyew5q.sol.build/avatar.png')`
      if (!avatar) {
        const style = $img.attr('style') || ''
        const match = style.match(
          /background-image:\s*url\(['"]?([^'"]+)['"]?\)/,
        )
        avatar = match ? match[1] : undefined
      }
      const planet = {
        avatar,
        site_address: $(el).data('siteAddress') as string,
        site_title: $(el).find('.planet-site-title').text()?.trim(),
      }
      return {
        uuid: $(el).data('postUuid') as string,
        url: resolveUrl($(el).find('.planet-post-title a').attr('href')),
        title: $(el).find('.planet-post-title').text()?.trim(),
        content: $(el)
          .find('.planet-post-content .markdown_body')
          .html()
          ?.trim(),
        expand_label: $(el)
          .find('.planet-post-content-toggle')
          .data('expandLabel') as string,
        planet,
        audio: (() => {
          const $audioContainer = $(el).find('.planet-post-audio')
          const $audio = $audioContainer.find('audio')
          const url = resolveUrl($audio.attr('src'))
          if (!url) return undefined
          return {
            url,
            title:
              $audioContainer.attr('data-title') || $audio.attr('data-title'),
            author:
              $audioContainer.attr('data-author') || $audio.attr('data-author'),
            channel:
              $audioContainer.attr('data-channel') ||
              $audio.attr('data-channel'),
          }
        })(),
        updated_at: $(el).find('.planet-post-time a').text()?.trim(),
        comment_count: Number(
          $(el)
            .find('.planet-post-footer .planet-post-footer-part')
            .eq(0)
            .text(),
        ),
        liked_count: Number(
          $(el)
            .find('.planet-post-footer .planet-post-footer-part')
            .eq(1)
            .text(),
        ),
        stats_num: Number($(el).find('.planet-post-footer .stats').text()),
      }
    })
    .get()

  const paginationText = $(
    '#Wrapper .content .ps_container:last-child [align=center]',
  ).text()
  const pagination = paginationFromText(paginationText)

  return {
    data,
    pagination,
    fetchedAt: Date.now(),
  }
}

export async function getHotTopics(): Promise<
  PaginatedResponse<HomeTopicFeed>
> {
  const { data } = await request({
    url: '/api/topics/hot.json',
  })

  const topics: HomeTopicFeed[] = (data || []).map((item: any) => ({
    ...item,
    last_reply_time:
      item.last_touched || item.last_modified || item.created
        ? formatTimeAgo(item.last_touched || item.last_modified || item.created)
        : undefined,
  }))

  return {
    data: topics,
    pagination: {
      current: 1,
      total: 1,
    },
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
    })
    return {
      data: data[0],
    }
  }

  const res = await request({
    url: `/t/${id}`,
  })
  const $ = res.$ || cheerioDoc(res.data)
  // if isHomePage
  if ($('#Wrapper .content a[class^=tab]').length) {
    throw new ApiError({
      code: 'RESOURCE_ERROR',
      message: '资源错误（无权限访问或已被管理员删除）',
    })
  }

  try {
    return {
      data: topicDetailFromPage($, id),
    }
  } catch (err) {
    return captureParseError(err, $)
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

  const res = await request({ url: `/t/${id}` })
  const $ = res.$ || cheerioDoc(res.data)

  try {
    const topic = topicDetailFromPage($, id)
    return {
      success: topic.collected,
      message: topic.collected ? '收藏成功' : '操作失败',
      data: topic,
    }
  } catch (err) {
    return captureParseError(err, $)
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

  const res = await request({
    url: `/t/${id}`,
  })
  const $ = res.$ || cheerioDoc(res.data)
  try {
    const topic = topicDetailFromPage($, id)
    return {
      success: !topic.collected,
      message: !topic.collected ? '取消收藏成功' : '操作失败',
      data: topic,
    }
  } catch (err) {
    return captureParseError(err, $)
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

  const res = await request({
    url: `/t/${id}`,
  })

  const $ = res.$ || cheerioDoc(res.data)
  try {
    return {
      success: json.success,
      message: json.success ? '感谢已发送' : json.message,
      data: topicDetailFromPage($, id),
    }
  } catch (err) {
    return captureParseError(err, $)
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
  const res = await request({
    url: `/ignore/topic/${id}`,
    params: {
      once,
    },
  })
  const $ = res.$ || cheerioDoc(res.data)
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
  const res = await request({
    url: `/unignore/topic/${id}`,
    params: {
      once,
    },
  })
  const $ = res.$ || cheerioDoc(res.data)
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
  const res = await request({
    url: `/report/topic/${id}`,
    params: { once },
  })
  const $ = res.$ || cheerioDoc(res.data)
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

export async function createTopic(data: {
  title: string
  content?: string
  node_name: string
  syntax: 'default' | 'markdown'
  once?: string
}) {
  const res = await request({
    url: `/write`,
    method: 'POST',
    data,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Referer: `${BASE_URL}/write`,
      origin: BASE_URL,
    },
  })

  const $ = res.$ || cheerioDoc(res.data)

  if (res.request?.responseURL && /\/write/.test(res.request.responseURL)) {
    const messages = $('.problem ul li')
      .map(function (_, el) {
        return $(el).text().trim()
      })
      .toArray()

    throw new ApiError({
      code: 'PROBLEMS',
      message: $('.problem').contents().first().text() || '主题创建失败',
      data: messages,
    })
  }

  if (res.request?.responseURL && /\/t\/\d+/.test(res.request.responseURL)) {
    const match = /\/t\/(\d+)/.exec(res.request.responseURL)
    if (!match) {
      throw new ApiError({
        code: 'NOT_HANDLED_RESPONSE',
        message: '无法识别新主题地址',
      })
    }
    try {
      const topic = topicDetailFromPage($, Number(match[1]))
      return {
        success: true,
        data: topic,
      }
    } catch (err) {
      return captureParseError(err, $)
    }
  }
  throw new ApiError({
    code: 'NOT_HANDLED_RESPONSE',
    message: '服务异常（未知的返回类型）',
  })
}

export async function fetchTopicEditForm(id: number) {
  const res = await request({
    url: `/edit/topic/${id}`,
    method: 'GET',
  })

  const $ = res.$ || cheerioDoc(res.data)

  if (!$('form').length) {
    throw new ApiError({
      code: 'NOT_ALLOWED',
      message: '你不能编辑这个主题',
    })
  }

  const syntaxOptions = $('select[name=syntax] option')
    .map(function (i, el) {
      return {
        value: $(el).attr('value'),
        label: $(el).text().trim(),
      }
    })
    .toArray()

  const values = {
    title: $('[name=title]').val() as string,
    content: $('[name=content]').val() as string,
    syntax: $('select[name=syntax]').val() as any,
    once: $('input[name=once]').val() as string,
  }

  return {
    data: {
      schema: {
        syntaxOptions,
      },
      values,
    },
  }
}

export async function editTopic(
  id: number,
  data: {
    title: string
    content?: string
    syntax: 0 | 1 // 0: default | 1: markdown
  },
) {
  // data: { title, content, syntax, selected_syntax, }
  const res = await request({
    url: `/edit/topic/${id}`,
    method: 'POST',
    data,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Referer: `${BASE_URL}/edit/topic/${id}`,
      origin: BASE_URL,
    },
  })

  if (
    res.request?.responseURL &&
    /\/edit\/topic\//.test(res.request.responseURL)
  ) {
    throw new ApiError({
      code: 'EDIT_NOT_ALLOWED',
      message: '你不能编辑这个主题',
    })
  }
  const $ = res.$ || cheerioDoc(res.data)
  try {
    const topic = topicDetailFromPage($, id)
    return {
      data: topic,
      fetchedAt: Date.now(),
    }
  } catch (err) {
    return captureParseError(err, $)
  }
}

export async function moveTopic(
  id: number,
  data: {
    destination: string
    memo?: string
    once?: string
  },
) {
  if (!data.once || data.once === ONCP) {
    const onceRes = await fetchOnce()
    data.once = onceRes.data
  }

  const res = await request({
    url: `/move/topic/${id}`,
    method: 'POST',
    data,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Referer: `${BASE_URL}/move/topic/${id}`,
      origin: BASE_URL,
    },
  })
  if (
    res.request?.responseURL &&
    /\/edit\/move\//.test(res.request.responseURL)
  ) {
    throw new ApiError({
      code: 'EDIT_NOT_ALLOWED',
      message: '你不能编辑这个主题',
    })
  }

  const $ = res.$ || cheerioDoc(res.data)
  try {
    const topic = topicDetailFromPage($, id)
    return {
      data: topic,
      fetchedAt: Date.now(),
    }
  } catch (err) {
    return captureParseError(err, $)
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
  const res = await request({
    url: `/append/topic/${id}`,
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    data: { content, once },
  })
  const $ = res.$ || cheerioDoc(res.data)
  try {
    return {
      success: true,
      message: '附言成功',
      data: topicDetailFromPage($, id),
    }
  } catch (err) {
    return captureParseError(err, $)
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
  id: number | string
  p?: number
}): Promise<TopicRepliesResponse> {
  const res = await request({
    url: `/t/${id}`,
    params: {
      p,
    },
  })
  const $ = res.$ || cheerioDoc(res.data)

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

  const $page = $('.page_current').parent().children().get(0)
  const $total = $('.page_current').parent().children().get(1)
  if ($page) {
    const pageText = $($page).text()
    if (pageText && /第 \d+ 页/.test(pageText)) {
      pagination.current = Number(pageText.replace(/第 (\d+) 页/, '$1'))
    }
  }

  if ($total) {
    const totalText = $($total).text()
    if (totalText && /共 \d+ 页/.test(totalText)) {
      pagination.total = Number(totalText.replace(/共 (\d+) 页/, '$1'))
    }
  }

  try {
    return {
      data,
      pagination,
      meta: {
        topic: topicDetailFromPage($, id),
      },
      fetchedAt: Date.now(),
    }
  } catch (err) {
    return captureParseError(err, $)
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
  const res = await request({
    url: `/t/${id}`,
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    data: { content, once },
  })
  const $ = res.$ || cheerioDoc(res.data)

  const problem = $('.problem ul li').text()
  if (problem) {
    throw new ApiError({
      code: 'VALIDATION_EXCEPTION',
      message: problem,
    })
  }

  try {
    const topic = topicReplyFromCell(
      $('#Wrapper .content .box div[id^=r_]').last(),
      $,
    )
    return {
      success: true,
      message: '回复成功',
      data: topic,
    }
  } catch (err) {
    return captureParseError(err, $)
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
      thanked: !!json.success,
    },
  }
}

// Nodes
export async function getNodeGroups(): Promise<CollectionResponse<NodeGroup>> {
  const res = await request({
    url: `/planes`,
  })
  const $ = res.$ || cheerioDoc(res.data)
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

export async function getNodes(): Promise<CollectionResponse<NodeDetail>> {
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
  const res = await request({
    url: `/go/${name}`,
  })

  const $ = res.$ || cheerioDoc(res.data)

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
  const res = await request({
    url: `/favorite/node/${detail.id}`,
    params: { once },
    headers: {
      referer: `${BASE_URL}/go/${name}`,
    },
  })
  const $ = res.$ || cheerioDoc(res.data)
  const success = !!$('a[href^="/unfavorite/node"]').length
  if (!success) {
    throw new ApiError({
      code: 'OPERATION_FAILED',
      message: '操作失败',
    })
  }

  return {
    success: true,
    message: '操作成功',
    data: {
      collected: true,
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
  const res = await request({
    url: `/unfavorite/node/${detail.id}`,
    params: { once },
    headers: {
      referer: `${BASE_URL}/go/${name}`,
    },
  })
  const $ = res.$ || cheerioDoc(res.data)
  const success = !!$('a[href^="/favorite/node"]').length

  if (!success) {
    throw new ApiError({
      code: 'OPERATION_FAILED',
      message: '操作失败',
    })
  }

  return {
    success: true,
    message: '操作成功',
    data: {
      collected: false,
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
  const res = await request({
    url: `/go/${name}`,
    params: { p },
  })

  const $ = res.$ || cheerioDoc(res.data)

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
  try {
    const { data: user } = await request({
      url: '/api/members/show.json',
      params: { username },
    })

    const res = await request({
      url: `/member/${username}`,
    })
    const $ = res.$ || cheerioDoc(res.data)
    user.meta = userMetaForCurrentUser($)
    return {
      data: user,
    }
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      throw new ApiError({
        code: 'NOT_FOUND',
        message: err.message,
      })
    }
    throw err
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
    if (!username) {
      throw new ApiError({
        code: 'MISSING_PARAMS',
        message: '缺少用户',
      })
    }
    userId = await getMemberId(username)
  }
  const res = await request({
    url: `/follow/${userId}`,
    params: {
      once,
    },
    headers: {
      referer: `https://v2ex.com/member/${username}`,
      accept: 'text/html',
    },
  })
  const $ = res.$ || cheerioDoc(res.data)
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
    if (!username) {
      throw new ApiError({
        code: 'MISSING_PARAMS',
        message: '缺少用户',
      })
    }
    userId = await getMemberId(username)
  }
  const { data: html } = await request({
    url: `/unfollow/${userId}`,
    params: {
      once,
    },
  })
  const $ = cheerioDoc(html)
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
    if (!username) {
      throw new ApiError({
        code: 'MISSING_PARAMS',
        message: '缺少用户',
      })
    }
    userId = await getMemberId(username)
  }
  const res = await request({
    url: `/block/${userId}`,
    params: {
      once,
    },
  })
  const $ = res.$ || cheerioDoc(res.data)
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
    if (!username) {
      throw new ApiError({
        code: 'MISSING_PARAMS',
        message: '缺少用户',
      })
    }
    userId = await getMemberId(username)
  }
  const res = await request({
    url: `/unblock/${userId}`,
    params: {
      once,
    },
  })
  const $ = res.$ || cheerioDoc(res.data)
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
  const res = await request({
    url: `/member/${username}/topics`,
    params: { p },
  })

  const $ = res.$ || cheerioDoc(res.data)
  if (
    $('#Wrapper .content .box .cell').length === 1 &&
    ($('#Wrapper .content .box .cell img').attr('src')?.indexOf('lock') ?? -1) >
      -1
  ) {
    throw new ApiError({
      code: 'MEMBER_LOCKED',
      message: $('#Wrapper .content .box .cell').first().text().trim(),
    })
  }

  const data = $('#Wrapper .content .box .cell')
    .map(function (i, el) {
      if (!$(el).find('table').length) {
        return null
      }
      const member = {
        username:
          $(el)
            .find('td:nth-child(1) strong a')
            .first()
            .attr('href')
            ?.replace('/member/', '') ?? '',
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
  const res = await request({
    url: `/member/${username}/replies`,
    params: { p },
  })

  const $ = res.$ || cheerioDoc(res.data)

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
          avatar_mini: undefined,
          avatar_large: undefined,
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
  const res = await request({
    url: '/notifications',
    params: {
      p,
    },
  })

  const $ = res.$ || cheerioDoc(res.data)
  const notifications = $('#notifications .cell')
    .map(function (i, el) {
      const notification = notificationFromCell($, el)
      if (!notification) {
        Sentry.captureMessage('UNEXPECTED_NOTIFICATION', {
          extra: {
            body: $(el).html(),
          },
        })
        return null
      }
      return notification
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
  const res = await request({
    url: '/my/topics',
    params: { p },
  })

  const $ = res.$ || cheerioDoc(res.data)
  const data = $('#Wrapper .box .cell.item')
    .map(function (i, el) {
      const member = memberFromImage($(el).find('td:nth-child(1) img'))
      if (!member.username) {
        member.username =
          $(el)
            .find('td:nth-child(1) a')
            .attr('href')
            ?.replace('/member/', '') ?? ''
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
  const res = await request({
    url: '/my/nodes',
  })

  const $ = res.$ || cheerioDoc(res.data)
  const data = $('#my-nodes .fav-node')
    .map(function (i, el) {
      const href = $(el).attr('href')
      const name = href?.replace('/go/', '') ?? ''
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
export async function getCurrentUser(
  afterLogin = false,
): Promise<EntityResponse<MemberDetail | null, { unread_count: number }>> {
  const res = await request({
    url: afterLogin ? '/about?init=1' : '/about',
  })
  const $ = res.$ || cheerioDoc(res.data)
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
  const res = await request({
    url: '/',
  })
  const $ = res.$ || cheerioDoc(res.data)
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
  const res = await request({
    url: `/mission/daily/redeem`,
    params: {
      once: data.once,
    },
  })
  const $ = res.$ || cheerioDoc(res.data)

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

export async function fetchLoginCaptcha() {
  return base64File(`${BASE_URL}/_captcha?now=${Date.now()}`, {
    'user-agent': USER_AGENT,
  })
}

export async function fetchLoginForm() {
  const res = await request({
    url: '/signin',
  })
  const $ = res.$ || cheerioDoc(res.data)
  if (
    res.request?.responseURL &&
    /\/signin\/cooldown/.test(res.request.responseURL)
  ) {
    const message = $('#Wrapper .topic_content').text().trim()
    const info = $('#Wrapper .dock_area').text().trim()
    throw new ApiError({
      code: 'cooldown',
      message,
      data: { info },
    })
  }

  const captcha = await fetchLoginCaptcha()

  const inputs = $('form[action="/signin"] input.sl')
    .map(function (_, el) {
      return $(el).attr('name')
    })
    .toArray()

  const data = {
    captcha,
    once: $('form[action="/signin"] input[name=once]').attr('value'),
    hashMap: {
      username: inputs[0],
      password: inputs[1],
      captcha: inputs[2],
    },
  }
  return {
    data,
  }
}

export async function loginWithPassword(
  values: {
    username: string
    password: string
    captcha: string
    once: string
  },
  fieldHashMap: {
    username: string
    password: string
    captcha: string
  },
): Promise<StatusResponse> {
  const data = {
    [fieldHashMap.username]: values.username,
    [fieldHashMap.password]: values.password,
    [fieldHashMap.captcha]: values.captcha,
    once: values.once,
  }

  const res = await request({
    url: '/signin',
    data,
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Referer: `${BASE_URL}/signin`,
      origin: BASE_URL,
    },
  })

  const $ = res.$ || cheerioDoc(res.data)

  const responseURL = res.request?.responseURL || ''

  if (/\/2fa/.test(responseURL)) {
    return {
      success: true,
      message: '登录成功，请完成两步验证',
      data: {
        state: '2fa',
        once: $('form[action="/2fa"] input[name=once]').attr('value'),
        message: '登录成功，请完成两步验证',
      },
    }
  } else if (/\/signin/.test(responseURL)) {
    const problems = $('.problem ul li')
      .map(function (_, el) {
        return $(el).text().trim()
      })
      .toArray()
    throw new ApiError({
      code: 'LOGIN_ERROR',
      message: '登陆失败',
      data: problems,
    })
  }

  return {
    success: true,
    message: '登陆成功',
    // data: user,
  }
}

export async function verify2faCode(data: { once: string; code: string }) {
  const res = await request({
    url: '/2fa',
    data: data,
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Referer: `${BASE_URL}/2fa`,
      origin: BASE_URL,
    },
  })

  const responseURL = res.request?.responseURL || ''

  const $ = res.$ || cheerioDoc(res.data)
  if (/\/2fa/.test(responseURL)) {
    const problems = $('.problem ul li')
      .map(function (_, el) {
        return $(el).text().trim()
      })
      .toArray()
    throw new ApiError({
      code: '2FA_VERIFY_FAILED',
      message: '两步验证登录的过程中遇到一些问题：',
      data: {
        problems,
        once: $('input[name=once]').attr('value'),
      },
    })
  }

  return {
    success: true,
    message: '验证成功',
  }
}

export async function logout(): Promise<StatusResponse> {
  await Promise.all([
    new Promise((resolve) => Networking.clearCookies(resolve)),
    CookieManager.clearAll(true),
  ])

  return {
    success: true,
    message: '你已经完全登出',
  }
}

type SettingsFormValue = string | boolean | string[] | undefined

const _settingsForm = ($: CheerioAPI) => {
  const data: Record<string, SettingsFormValue> = {}

  //text
  $(`form[action="/settings"] input[type=text]`).each((i, el) => {
    const $el = $(el)
    const name = $el.attr('name')
    if (name) {
      data[name] = $el.attr('value')
    }
  })
  // checkbox
  $(`form[action="/settings"] input[type=checkbox]`).each((i, el) => {
    const $el = $(el)
    const name = $el.attr('name')
    if (name) {
      data[name] = !!$el.is(':checked')
    }
  })
  // select
  $(`form[action="/settings"] select`).each((i, el) => {
    const $el = $(el)
    const name = $el.attr('name')
    if (name) {
      data[name] = $el.val()
    }
  })

  data.once = $('input[name=once]').attr('value')
  return data
}
export async function fetchSettingsForm() {
  const res = await request({
    url: '/settings',
  })

  const $ = res.$ || cheerioDoc(res.data)

  return {
    data: _settingsForm($),
  }
}

export async function updateSettings(data: MemberProfile & { once: string }) {
  const res = await request({
    url: `/settings`,
    method: 'POST',
    data,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Referer: `${BASE_URL}/settings`,
      origin: BASE_URL,
    },
  })

  const $ = res.$ || cheerioDoc(res.data)

  return {
    data: _settingsForm($),
  }
}

export async function fetchSocialForm() {
  const res = await request({
    url: '/settings/social',
  })

  const fields: {
    name: string
    label: string
    image?: string
  }[] = []
  const values: Record<string, string | undefined> = {}

  const $ = res.$ || cheerioDoc(res.data)
  $('form[action=/settings/social] input[type=text]').each((i, el) => {
    const name = $(el).attr('name')
    const label = $(el).prev().text()
    const image = resolveUrl($(el).prev().find('img').attr('src'))
    if (!name) {
      return
    }
    fields.push({
      name,
      label,
      image,
    })
    values[name] = $(el).attr('value')
  })
  return {
    data: {
      values,
      once: $('input[name=once]').attr('value'),
      fields,
    },
  }
}

export async function updateSocial(data: Record<string, string | undefined>) {
  const res = await request({
    url: '/settings/social',
    method: 'POST',
    data,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Referer: `${BASE_URL}/settings`,
      origin: BASE_URL,
    },
  })

  const $ = res.$ || cheerioDoc(res.data)
  const values: Record<string, string | undefined> = {}
  $('form[action=/settings/social] input[type=text]').each((i, el) => {
    const name = $(el).attr('name')
    if (name) {
      values[name] = $(el).attr('value')
    }
  })

  return {
    data: values,
  }
}

export async function fetchAvatarForm() {
  const res = await request({
    url: '/settings/avatar',
  })
  const $ = res.$ || cheerioDoc(res.data)
  const avatars = $('.avatar-list img')
    .map(function (i, el) {
      return $(el).attr('src')
    })
    .toArray()
  const once = $('input[name=once]').attr('value')
  return {
    data: {
      avatars,
      once,
    },
  }
}

export async function uploadAvatar(data: {
  avatar: {
    uri: string
    name: string
    type: string
  }
  once?: string
}) {
  const formData = new FormData()
  formData.append('avatar', data.avatar as unknown as Blob)
  if (data.once) {
    formData.append('once', data.once)
  }
  const res = await request({
    url: '/settings/avatar',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    transformRequest: (data) => data,
  })

  const $ = res.$ || cheerioDoc(res.data)

  const avatars = $('.avatar-list img')
    .map(function (i, el) {
      return $(el).attr('src')
    })
    .toArray()
  const once = $('input[name=once]').attr('value')

  return {
    data: {
      avatars,
      once,
    },
  }
}

export async function getBalanceDetail(params: { p?: number }) {
  const res = await request({
    url: '/balance',
    params,
  })
  const $ = res.$ || cheerioDoc(res.data)

  const detailTable = $('#Wrapper table').get(1)

  const data = $(detailTable)
    .find('tr')
    .map(function (i, el) {
      if (i === 0) {
        // skip header
        return null
      }

      const columns = $(el).find('td')
      const typeText = $(columns[0]).text().trim()
      const time = $(columns[0]).find('.gray').text().trim()
      const amount = $(columns[1]).text().trim()
      const balance = $(columns[2]).text().trim()
      const description = $(columns[3]).html()?.trim() ?? ''
      return {
        type: typeText.replace(time, '').trim(),
        time,
        amount: Number(amount),
        balance,
        description,
      }
    })
    .toArray()
    .filter(Boolean)
  const footerTable = $('#Wrapper table').last()
  const paginationText = $(footerTable).find('[align=center]').text()
  const pagination = paginationFromText(paginationText)
  return {
    data,
    pagination,
    fetchedAt: Date.now(),
  }
}

type SearchResponse = {
  took: number
  total: number
  hits: SearchHit[]
  timed_out: boolean
}
export async function search(params: Record<string, string | number>) {
  const data = await request({
    baseURL: 'https://www.sov2ex.com',
    url: '/api/search',
    params,
  })
  return data.data as SearchResponse
}

export async function getPlanetInfo(
  address: string,
): Promise<EntityResponse<PlanetInfo>> {
  const res = await request({
    url: `/planet/${address}`,
  })
  const $ = res.$ || cheerioDoc(res.data)
  if ($('.site-header').length) {
    const avatarBg = $('.site-header .site-avatar').attr('style')
    const match = (avatarBg || '').match(
      /background-image:\s*url\(['"]?([^'"]+)['"]?\)/,
    )
    const avatar = match ? match[1] : undefined
    const links = $('.site-header .site-address a[target="_blank"]')
      .map((i, el) => {
        return {
          text: $(el).text().trim(),
          href: $(el).attr('href'),
        }
      })
      .get()
    return {
      data: {
        avatar,
        site_title: $('.site-header .site-title').text().trim(),
        site_address: address,
        links,
      },
      fetchedAt: Date.now(),
    }
  }
  throw new ApiError({
    code: 'NOT_FOUND',
    message: '',
  })
}

export async function getPlanetSiteFeeds({
  address,
  p = 1,
}: {
  address: string
  p: number
}): Promise<PaginatedResponse<PlanetFeedItem>> {
  const res = await request({
    url: `/planet/${address}`,
    params: {
      p,
    },
  })
  const $ = res.$ || cheerioDoc(res.data)

  const data = $('#Wrapper .content .planet-post')
    .map(function (i, el) {
      const $img = $(el).find('.planet-post-avatar-container img')
      let avatar = $img.attr('src')
      if (!avatar) {
        const style = $img.attr('style') || ''
        const match = style.match(
          /background-image:\s*url\(['"]?([^'"]+)['"]?\)/,
        )
        avatar = match ? match[1] : undefined
      }
      const planet = {
        avatar,
        site_address: $(el).data('siteAddress') as string,
        site_title: $(el).find('.planet-site-title').text()?.trim(),
      }
      return {
        uuid: $(el).data('postUuid') as string,
        url: resolveUrl($(el).find('.planet-post-title a').attr('href')),
        title: $(el).find('.planet-post-title').text()?.trim(),
        content: $(el)
          .find('.planet-post-content .markdown_body')
          .html()
          ?.trim(),
        expand_label: $(el)
          .find('.planet-post-content-toggle')
          .data('expandLabel') as string,
        planet,
        audio: (() => {
          const $audioContainer = $(el).find('.planet-post-audio')
          const $audio = $audioContainer.find('audio')
          const url = resolveUrl($audio.attr('src'))
          if (!url) return undefined
          return {
            url,
            title:
              $audioContainer.attr('data-title') || $audio.attr('data-title'),
            author:
              $audioContainer.attr('data-author') || $audio.attr('data-author'),
            channel:
              $audioContainer.attr('data-channel') ||
              $audio.attr('data-channel'),
          }
        })(),
        updated_at: $(el).find('.planet-post-time a').text()?.trim(),
        comment_count: Number(
          $(el)
            .find('.planet-post-footer .planet-post-footer-part')
            .eq(0)
            .text(),
        ),
        liked_count: Number(
          $(el)
            .find('.planet-post-footer .planet-post-footer-part')
            .eq(1)
            .text(),
        ),
        stats_num: Number($(el).find('.planet-post-footer .stats').text()),
      }
    })
    .get()

  const paginationText = $(
    '#Wrapper .content .ps_container:last-child [align=center]',
  ).text()
  const pagination = paginationFromText(paginationText)

  return {
    data,
    pagination,
    fetchedAt: Date.now(),
  }
}
