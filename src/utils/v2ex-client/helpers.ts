import CookieManager from 'react-native-nitro-cookies'
import { Cheerio, CheerioAPI, Element, load } from 'cheerio'
import { fromUint8Array } from 'js-base64'

import {
  MemberBasic,
  NodeBasic,
  TopicBasic,
  TopicReply,
} from '@/utils/v2ex-client/types'

import { BASE_URL } from './constants'

export const resolveUrl = (url?: string) => {
  if (!url) {
    return url
  }
  if (url.startsWith('/')) {
    return `${BASE_URL}${url}`
  }
  return url
}

function decodeEmail(encodedEmail: string, delta: number) {
  const getDec = (text: string, index: number) => {
    const hexStr = text.substr(index, 2)
    return parseInt(hexStr, 16)
  }
  let output = ''
  for (
    let a = getDec(encodedEmail, delta), i = delta + 2;
    i < encodedEmail.length;
    i += 2
  ) {
    const l = getDec(encodedEmail, i) ^ a
    output += String.fromCharCode(l)
  }
  output = decodeURIComponent(escape(output))
  return output
}

export function cheerioDoc(html: string) {
  const $ = load(html)

  // decode href hash
  const emailProtectionCode = '/cdn-cgi/l/email-protection#'
  if (html.includes(emailProtectionCode)) {
    $(`a[href^=${emailProtectionCode}]`).each(function (i, el) {
      const href = $(el).attr('href')
      if (!href) {
        return
      }
      const email = decodeEmail(href.replace(emailProtectionCode, ''), 0)
      $(el).replaceWith(function () {
        return `<a href="mailto:${email}">${email}</a>`
      })
    })
  }

  if (html.includes('__cf_email__') || html.includes('data-cfemail')) {
    $('.__cf_email__').each(function (i, el) {
      const encodedEmail = $(el).attr('data-cfemail')
      if (!encodedEmail) {
        return
      }
      const email = decodeEmail(encodedEmail, 0)
      // console.log('.__cf_email__', i, email)
      $(el).replaceWith(function () {
        return `<a href="mailto:${email}">${email}</a>`
      })
    })
  }

  // handle code block
  if (html.includes('language-')) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const hljsMod = require('highlight.js')
    const hljs = hljsMod.default || hljsMod
    $('pre code[class^=language]').each(function (i, el) {
      const $el = $(el)
      $el.replaceWith(function () {
        const className = $el.attr('class')
        if (!className) {
          return $.html($el)
        }
        const language = className.replace('language-', '')
        let highlighted
        if (language && hljs.listLanguages().includes(language)) {
          highlighted = hljs.highlight($el.text(), { language }).value
        } else {
          highlighted = hljs.highlightAuto($el.text()).value
        }

        return `<code class="hljs">${highlighted}</code>`
      })
    })
  }

  return $
}

export function topicFromLink($el: Cheerio<Element>): TopicBasic {
  const [id, replies] = $el.attr('href')!.match(/\d+/g)!.map(Number)
  return {
    id,
    title: $el.text(),
    replies,
  }
}

export function nodeFromLink($el: Cheerio<Element>): NodeBasic {
  return {
    title: $el.text().trim(),
    name: $el.attr('href')?.replace(/.*\/go\//, '') || '--',
  }
}

type AvatarSize = 'mini' | 'normal' | 'large'
const gravatarSizes = {
  mini: 24,
  normal: 48,
  large: 73,
}
function mapAvatarSize(url: string, size: AvatarSize) {
  if (!url) {
    return url
  }
  if (/gravatar/.test(url)) {
    return url.replace(/s=(?:24|48|73)/, `s=${gravatarSizes[size]}`)
  }
  return url.replace(/_(?:mini|normal|large)\./, `_${size}.`)
}

export function memberFromImage($el: Cheerio<Element>): MemberBasic {
  const avatarUrl = resolveUrl($el.attr('src')) as string

  return {
    username: $el.attr('alt') as string,
    avatar_normal: mapAvatarSize(avatarUrl, 'normal'),
    avatar_large: mapAvatarSize(avatarUrl, 'large'),
    avatar_mini: mapAvatarSize(avatarUrl, 'mini'),
  }
}

export function paginationFromText(str: string) {
  const [current, total] = str.split('/')
  return {
    current: Number(current),
    total: Number(total),
  }
}

export function topicDetailFromPage($: CheerioAPI, id: string | number) {
  const $header = $('#Wrapper .header')
  const member = memberFromImage($header.find('a[href^="/member"] img').first())
  const node = nodeFromLink($header.find('a[href^="/go"]').first())
  const title = $header.find('h1').text().trim()
  const content_rendered =
    $('#Wrapper .cell .topic_content').html()?.trim() || ''

  let replies = 0
  let last_reply_time
  const $firstReplyCell = $('.cell[id^=r_]').first()
  if ($firstReplyCell.length) {
    const compos = $firstReplyCell
      .parent()
      .children()
      .first()
      .text()
      .trim()
      .split('•')
    replies = Number(compos[0].replace('条回复', ''))
    last_reply_time = compos[1] && compos[1].trim()
  }
  const metaText = $header.find('small.gray').text()
  const metaMatch = /\sat\s(.*)/.exec(metaText)
  const created_time = metaMatch ? metaMatch[1].split('·')[0].trim() : ''
  const clicks = metaMatch
    ? Number(/\d+/.exec(metaMatch[1].split('·')[1] ?? '')?.[0] ?? 0)
    : 0
  const subtles = $('#Wrapper .content .subtle')
    .map(function (i, el) {
      const $subtle = $(el)
      return {
        meta: $subtle.find('.fade').text().trim(),
        content_rendered: $subtle.find('.topic_content').html()?.trim(),
      }
    })
    .get()
  return {
    id: Number(id),
    title,
    content_rendered,
    replies,
    last_reply_time,
    created_time,
    clicks,
    node,
    member,
    subtles,
    collected: !!$('a.op[href^="/unfavorite"]').length,
    thanked: !!$('#topic_thank .topic_thanked').length,
    canAppend: !!$('a[href^="/append/topic"]').length,
    canMove: !!$('a[href^="/move/topic"]').length,
    canEdit: !!$('a[href^="/edit/topic"]').length,
    blocked: $('a.tb')
      .map((i, el) => $(el).text())
      .get()
      .some((val) => val === '取消忽略'),
  }
}

const REPLIED_TO_REGEX = /(?<=<\/a>\s#)\d+/gm
const BR_DOUBLE_REGEX = /<br><br>/g
const CODE_BR_REGEX = /(```\w+)<br>/g
const BR_SINGLE_REGEX = /<br>/g
const LT_REGEX = /&lt;/g
const GT_REGEX = /&gt;/g

const getRepliedTo = (replyContent: string) => {
  const matches = replyContent.match(REPLIED_TO_REGEX)
  return matches ? matches.map((val) => Number(val)) : null
}

export function topicReplyFromCell(
  $el: Cheerio<Element>,
  $: CheerioAPI,
): TopicReply {
  const member = memberFromImage($el.find('img.avatar').first())
  const $replyContent = $el.find('.reply_content')
  const content_rendered = $replyContent.html() ?? ''
  const members_mentioned: string[] = []
  $replyContent.find('a[href^="/member/"]').each(function (_, a) {
    members_mentioned.push($(a).text().trim())
  })

  const $clonedContent = $replyContent.clone()
  $clonedContent.find('img').each(function (i, el) {
    $(el).replaceWith(`<span>${el.attribs?.src ?? ''}</span>`)
  })
  $clonedContent.find('a').each(function (i, el) {
    const $a = $(el)
    const href = $a.attr('href')
    const text = $a.text()
    if (href?.startsWith('/member/')) {
      $a.replaceWith(`[${text}](https://v2ex.com${href})`)
    } else if (href === text) {
      $a.replaceWith(text)
    }
  })

  const content = getMarkdown($clonedContent.html())

  const $td3 = $el.find('td:nth-child(3)')
  const replyInfo = $td3.find('span.fade.small').first().text().trim()
  const [reply_time, reply_device] = replyInfo.split(' via ')
  const heartImg = $td3.find('img[alt="❤️"]').first()
  const thanks_count = heartImg.length
    ? Number(heartImg.parent().text().trim())
    : 0

  const replied_to = getRepliedTo(content_rendered)

  let member_is_op = false
  let member_is_mod = false
  let member_is_pro = false
  $el.find('.badge').each(function (_, b) {
    const className = b.attribs?.class ?? ''
    if (className.includes('op')) member_is_op = true
    if (className.includes('mod')) member_is_mod = true
    if (className.includes('pro')) member_is_pro = true
  })

  return {
    id: Number($el.attr('id')?.replace('r_', '') ?? 0),
    content,
    content_rendered,
    member,
    reply_time,
    reply_device,
    thanks_count,
    thanked: !!$el.find('.thanked').length,
    num: Number($el.find('.no').text()),
    member_is_op,
    member_is_mod,
    member_is_pro,
    members_mentioned,
    replied_to,
  }
}

export function userMetaForCurrentUser($: CheerioAPI) {
  return {
    blocked: !!$('.button[value=Unblock]').length,
    watched: !!$('.inverse[value=取消关注]').length,
  }
}

export function nodeDetailFromPage($: CheerioAPI, name: string) {
  const avatar_large = $('.page-content-header img').attr('src')

  const title = $('.node-breadcrumb').text().split(/\s+/).reverse()[0] ?? name
  const header = $('.intro').html()
  const topics = Number($('.topic-count strong').text()) || 0
  const collected = !!$('a[href^="/unfavorite/node"]').length
  return {
    name,
    title,
    header,
    topics,
    avatar_large,
    collected,
  }
}

export function getMarkdown(html?: string | null) {
  return (html ?? '')
    .replace(BR_DOUBLE_REGEX, '\n\n')
    .replace(CODE_BR_REGEX, `$1\n`)
    .replace(BR_SINGLE_REGEX, '\n\n')
    .replace(LT_REGEX, '<')
    .replace(GT_REGEX, '>')
}

export async function getCookieHeader() {
  const cookies = await CookieManager.get(BASE_URL)
  const cookieHeaderString = Object.keys(cookies)
    .map((key) => `${key}=${cookies[key].value}`)
    .join('; ')
  return cookieHeaderString
}

export async function base64File(
  url: string,
  headers?: HeadersInit,
): Promise<string> {
  // Read as ArrayBuffer and encode manually — response.blob() + FileReader
  // fails on React Native ("Creating blobs from 'ArrayBuffer' ... are not
  // supported").
  const res = await fetch(url, { headers })
  const contentType =
    res.headers.get('content-type')?.split(';')[0] || 'application/octet-stream'
  const buffer = await res.arrayBuffer()
  return `data:${contentType};base64,${fromUint8Array(new Uint8Array(buffer))}`
}
