import CookieManager from '@react-native-cookies/cookies'
import { Cheerio, CheerioAPI, Element, load } from 'cheerio'

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
  $(`a[href^=${emailProtectionCode}]`).each(function (i, el) {
    const email = decodeEmail(
      $(el).attr('href').replace(emailProtectionCode, ''),
      0,
    )
    $(el).replaceWith(function () {
      return `<a href="mailto:${email}">${email}</a>`
    })
  })

  $('.__cf_email__').each(function (i, el) {
    const email = decodeEmail($(el).attr('data-cfemail'), 0)
    // console.log('.__cf_email__', i, email)
    $(el).replaceWith(function () {
      return `<a href="mailto:${email}">${email}</a>`
    })
  })

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
    name: $el.attr('href')!.replace(/.*\/go\//, ''),
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
  const member = memberFromImage(
    $('#Wrapper .header a[href^="/member"] img').first(),
  )
  const node = nodeFromLink($('#Wrapper .header a[href^="/go"]').first())
  const title = $('#Wrapper .header h1').text().trim()
  const content_rendered =
    $('#Wrapper .cell .topic_content').html()?.trim() || ''

  let replies = 0
  let last_reply_time
  if ($('.cell[id^=r_]').length) {
    const compos = $('.cell[id^=r_]')
      .parent()
      .children()
      .first()
      .text()
      .trim()
      .split('•')
    replies = Number(compos[0].replace('条回复', ''))
    last_reply_time = compos[1] && compos[1].trim()
  }
  const metaText = $('#Wrapper .header > small.gray').text()
  const metaMatch = /\sat\s(.*)/.exec(metaText)
  const created_time = metaMatch ? metaMatch[1].split('·')[0].trim() : ''
  const clicks = metaMatch
    ? Number(/\d+/.exec(metaMatch[1].split('·')[1])![0])
    : 0
  const subtles = $('#Wrapper .content .subtle')
    .map(function (i, el) {
      return {
        meta: $(el).find('.fade').text().trim(),
        content_rendered: $(el).find('.topic_content').html()?.trim(),
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
    blocked: $('a.tb')
      .map((i, el) => $(el).text())
      .get()
      .some((val) => val === '取消忽略'),
  }
}

export function topicReplyFromCell(
  $el: Cheerio<Element>,
  $: CheerioAPI,
): TopicReply {
  const member = memberFromImage($el.find('img.avatar').first())
  const content_rendered = $el.find('.reply_content').html()
  const members_mentioned = $el
    .find('.reply_content a[href^="/member/"]')
    .map(function (j, a) {
      return $(a).text().trim()
    })
    .get()

  const $clonedContent = $el.find('.reply_content').clone()
  $clonedContent.find('img').each(function (i, el) {
    $(el).replaceWith($(`<span>${el.attribs.src}</span>`))
  })
  // 用户链接处理
  $clonedContent.find('a[href^="/member/"]').each(function (i, el) {
    $(el).replaceWith(`[${$(el).text()}](https://v2ex.com${el.attribs.href})`)
  })
  // 自动链接处理
  $clonedContent.find('a').each(function (i, el) {
    const $el = $(el)
    if ($el.attr('href') === $el.text()) {
      $el.replaceWith($el.text())
    }
  })

  const content = getMarkdown($clonedContent.html())

  const replyInfo = $el
    .find('td:nth-child(3) span.fade.small')
    .first()
    .text()
    .trim()
  // let reply_time
  // let reply_device
  const [reply_time, reply_device] = replyInfo.split(' via ')
  const heartImg = $el
    .find('td:nth-child(3) span.small.fade img[alt="❤️"]')
    .first()
  const thanks_count = heartImg ? Number(heartImg.parent().text().trim()) : 0
  return {
    id: Number($el.attr('id').replace('r_', '')),
    content,
    content_rendered,
    member,
    reply_time,
    reply_device,
    thanks_count,
    thanked: !!$el.find('.thanked').length,
    num: Number($el.find('.no').text()),
    member_is_op: !!$el.find('.badge.op').length,
    member_is_mod: !!$el.find('.badge.mod').length,
    members_mentioned,
  }
}

export function userMetaForCurrentUser($: CheerioAPI) {
  return {
    blocked: !!$('.button[value=Unblock]').length,
    watched: !!$('.inverse[value=取消特别关注]').length,
  }
}

export function nodeDetailFromPage($: CheerioAPI, name: string) {
  const avatar_large = $('.page-content-header img').attr('src')

  const title = $('.node-breadcrumb').text().split(/\s+/).reverse()[0]
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

export function getMarkdown(html: string) {
  return html
    .replace(/<br><br>/g, '\n\n')
    .replace(/(```\w+)<br>/g, `$1\n`)
    .replace(/<br>/g, '\n\n')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
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
  const data = await fetch(url, { headers })
  const blob = await data.blob()
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(blob)
    reader.onloadend = () => {
      const base64data = reader.result
      resolve(base64data as string)
    }
  })
}
